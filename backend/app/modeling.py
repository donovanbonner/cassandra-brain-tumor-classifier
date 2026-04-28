from __future__ import annotations

import base64
from io import BytesIO
from pathlib import Path
from threading import Lock

import numpy as np
from PIL import Image
import torch
import torch.nn as nn
from torchvision import models, transforms


CLASS_NAMES = ["glioma", "meningioma", "notumor", "pituitary"]
IMG_SIZE = 224


class GradCAM:
    def __init__(self, model: nn.Module, target_layer: nn.Module):
        self.model = model
        self.activations: torch.Tensor | None = None
        self.gradients: torch.Tensor | None = None
        self._fwd_handle = target_layer.register_forward_hook(self._save_activation)
        self._bwd_handle = target_layer.register_full_backward_hook(self._save_gradient)

    def _save_activation(self, _module, _inputs, output):
        self.activations = output.detach()

    def _save_gradient(self, _module, _grad_input, grad_output):
        self.gradients = grad_output[0].detach()

    def generate(
        self,
        input_tensor: torch.Tensor,
        target_class: int,
    ) -> np.ndarray:
        self.model.zero_grad(set_to_none=True)
        input_tensor = input_tensor.clone().requires_grad_(True)
        logits = self.model(input_tensor)
        score = logits[0, target_class]
        score.backward()

        if self.activations is None or self.gradients is None:
            raise RuntimeError("Grad-CAM hooks did not capture tensors.")

        alpha = self.gradients.mean(dim=(2, 3), keepdim=True)
        cam = (alpha * self.activations).sum(dim=1, keepdim=True)
        cam = torch.relu(cam)
        cam = torch.nn.functional.interpolate(
            cam,
            size=(IMG_SIZE, IMG_SIZE),
            mode="bilinear",
            align_corners=False,
        )

        heatmap = cam[0, 0].detach().cpu().numpy()
        heatmap -= heatmap.min()
        max_value = float(heatmap.max())
        if max_value > 0:
            heatmap /= max_value
        return heatmap


def build_cassandra(num_classes: int = 4) -> nn.Module:
    cassandra = models.efficientnet_b0(weights=None)
    num_features = cassandra.classifier[1].in_features
    cassandra.classifier = nn.Sequential(
        nn.Dropout(p=0.4),
        nn.Linear(num_features, 512),
        nn.ReLU(),
        nn.Dropout(p=0.3),
        nn.Linear(512, 128),
        nn.ReLU(),
        nn.Dropout(p=0.2),
        nn.Linear(128, num_classes),
    )
    return cassandra


class CassandraInferenceService:
    def __init__(self, model_path: Path):
        self.model_path = model_path
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.transform = transforms.Compose(
            [
                transforms.Resize((IMG_SIZE, IMG_SIZE)),
                transforms.ToTensor(),
                transforms.Normalize(
                    mean=[0.485, 0.456, 0.406],
                    std=[0.229, 0.224, 0.225],
                ),
            ]
        )
        self._lock = Lock()

        self.model = build_cassandra(num_classes=len(CLASS_NAMES))
        state = torch.load(model_path, map_location=self.device)
        if isinstance(state, dict) and "model_state_dict" in state:
            state = state["model_state_dict"]
        elif isinstance(state, dict) and "state_dict" in state:
            state = state["state_dict"]
        self.model.load_state_dict(state)
        self.model.to(self.device)
        self.model.eval()

        self.gradcam = GradCAM(self.model, target_layer=self.model.features[-1])

    def predict(self, image_bytes: bytes) -> dict:
        pil = Image.open(BytesIO(image_bytes)).convert("RGB")
        display_img = pil.resize((IMG_SIZE, IMG_SIZE))
        input_tensor = self.transform(pil).unsqueeze(0).to(self.device)

        with self._lock:
            with torch.no_grad():
                logits = self.model(input_tensor)
                probs = torch.softmax(logits, dim=1)[0]
                pred_index = int(torch.argmax(probs).item())

            heatmap = self.gradcam.generate(input_tensor, target_class=pred_index)

        probabilities = {
            class_name: float(probs[index].item())
            for index, class_name in enumerate(CLASS_NAMES)
        }
        heatmap_data_url = make_heatmap_data_url(heatmap)

        return {
            "tumorClass": CLASS_NAMES[pred_index],
            "confidence": probabilities[CLASS_NAMES[pred_index]],
            "probabilities": probabilities,
            "heatmapDataUrl": heatmap_data_url,
        }


def make_heatmap_data_url(heatmap: np.ndarray) -> str:
    colored = apply_jet_colormap(heatmap)
    image = Image.fromarray((colored * 255).astype(np.uint8), mode="RGB")
    buf = BytesIO()
    image.save(buf, format="PNG")
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:image/png;base64,{encoded}"


def apply_jet_colormap(gray: np.ndarray) -> np.ndarray:
    x = np.clip(gray, 0.0, 1.0)
    r = np.clip(1.5 - np.abs(4.0 * x - 3.0), 0.0, 1.0)
    g = np.clip(1.5 - np.abs(4.0 * x - 2.0), 0.0, 1.0)
    b = np.clip(1.5 - np.abs(4.0 * x - 1.0), 0.0, 1.0)
    return np.stack([r, g, b], axis=-1)

