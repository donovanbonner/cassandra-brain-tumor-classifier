---
title: NeuroScan Inference
emoji: 🧠
colorFrom: pink
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
license: cc-by-4.0
short_description: Brain tumor MRI classifier (EfficientNet-B0) + Grad-CAM
---

# NeuroScan Inference

FastAPI service that runs the **Cassandra v1** brain tumor classifier
(EfficientNet-B0, 4 classes) and returns a prediction plus a Grad-CAM heatmap.

This Space is the inference backend for the [NeuroScan AI](https://github.com/donovanbonner/cassandra-brain-tumor-classifier)
class project (CS3270, Spring 2026 — Bonner & El Akaya).

## Endpoints

- `GET /health` — liveness + model load state
- `POST /predict` — multipart `file` (image), returns:

```json
{
  "tumorClass": "glioma",
  "confidence": 0.94,
  "probabilities": { "glioma": 0.94, "meningioma": 0.02, "notumor": 0.01, "pituitary": 0.03 },
  "heatmapDataUrl": "data:image/png;base64,..."
}
```

## Disclaimer

Educational class project, not a medical device. Results are not for clinical use.
