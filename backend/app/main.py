from __future__ import annotations

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .config import ALLOWED_ORIGINS, MAX_UPLOAD_BYTES, MODEL_PATH
from .modeling import CassandraInferenceService
from .schemas import HealthResponse, PredictionResponse


app = FastAPI(title="Cassandra Brain Tumor Inference API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

inference_service: CassandraInferenceService | None = None


@app.on_event("startup")
def _startup() -> None:
    global inference_service
    if not MODEL_PATH.exists():
        raise RuntimeError(f"Model weights were not found at: {MODEL_PATH}")
    inference_service = CassandraInferenceService(model_path=MODEL_PATH)


@app.get("/health", response_model=HealthResponse)
def health() -> HealthResponse:
    return HealthResponse(
        status="ok",
        modelLoaded=inference_service is not None,
        modelPath=str(MODEL_PATH),
    )


@app.post("/predict", response_model=PredictionResponse)
async def predict(file: UploadFile = File(...)) -> PredictionResponse:
    if inference_service is None:
        raise HTTPException(status_code=503, detail="Model is not loaded yet.")

    content_type = file.content_type or ""
    if not content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Upload must be an image file.")

    payload = await file.read()
    if not payload:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")
    if len(payload) > MAX_UPLOAD_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"Image exceeds max size of {MAX_UPLOAD_BYTES} bytes.",
        )

    try:
        result = inference_service.predict(payload)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Inference failed: {exc}") from exc

    return PredictionResponse(**result)

