# Cassandra Inference Backend

Lightweight FastAPI service for MRI classification and Grad-CAM generation.

## Endpoints

- `GET /health`
- `POST /predict` (multipart form with `file`)

Response shape from `/predict`:

```json
{
  "tumorClass": "glioma",
  "confidence": 0.94,
  "probabilities": {
    "glioma": 0.94,
    "meningioma": 0.02,
    "notumor": 0.01,
    "pituitary": 0.03
  },
  "heatmapDataUrl": "data:image/png;base64,..."
}
```

## Run

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Environment Variables

- `MODEL_PATH` (default: `../models/cassandra_v1.pth`)
- `CORS_ORIGINS` (comma-separated, default includes localhost:3000)
- `MAX_UPLOAD_BYTES` (default: `10485760`)

