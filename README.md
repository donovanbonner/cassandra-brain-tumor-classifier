# Cassandra Brain Tumor Classifier

NeuroScan AI is a brain tumor MRI classification system with:
- a Next.js frontend (`web/`)
- a FastAPI inference backend (`backend/`)
- model artifacts and research notebooks (`models/`, `notebooks/`)

## Project Structure

```text
cassandra-brain-tumor-classifier/
├── backend/        # FastAPI API: /health and /predict
├── web/            # Next.js app (landing + /app diagnostic flow)
├── models/         # Trained model weights (cassandra_v1.pth)
└── notebooks/      # Training + Grad-CAM notebooks
```

## Prerequisites

- Python 3.9+
- Node.js 20+ (or current LTS)
- npm

## Quickstart

Run backend and frontend in separate terminals.

### 1) Start Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Health check:

```bash
curl http://127.0.0.1:8000/health
```

### 2) Start Frontend

```bash
cd web
cp .env.example .env.local
npm install
npm run dev -- --hostname 127.0.0.1 --port 3000
```

Open:

- `http://127.0.0.1:3000` (landing page)
- `http://127.0.0.1:3000/app` (diagnostic app)

## Environment Variables

`web/.env.local`:

- `NEXT_PUBLIC_INFERENCE_URL=http://127.0.0.1:8000`
- `MISTRAL_API_KEY=` (reserved for chat assistant work)

`backend` optional env vars:

- `MODEL_PATH` (default: `models/cassandra_v1.pth`)
- `CORS_ORIGINS` (comma-separated allowed origins)
- `MAX_UPLOAD_BYTES` (default: 10MB)

## API Contract

### `GET /health`
- Returns backend status + model load state.

### `POST /predict`
- Multipart form field: `file` (image)
- Response:
  - `tumorClass`
  - `confidence`
  - `probabilities`
  - `heatmapDataUrl`

## For Chat Assistant Integration (LangChain + Mistral)

Recommended next steps:

1. Add chat endpoint(s) in `backend/app/main.py` (for example `/chat`).
2. Create a dedicated service module (for example `backend/app/chat.py`) for:
   - prompt templates
   - retrieval logic from a knowledge base built on verified sources
   - Mistral invocation
3. Integrate the chatbot UI in the **Result stage** (`/app`) so follow-up Q&A appears next to diagnosis outputs.
4. Keep frontend API calls in `web/src/lib/` and avoid embedding secrets client-side.
5. Store all private keys server-side (backend env), not in browser-exposed vars.
6. Reuse the same CORS and health-check patterns already used by inference.

## Notes

- Current model: **Cassandra v1** (`models/cassandra_v1.pth`)
- Class mapping in backend and frontend is aligned to training order:
  - `glioma`, `meningioma`, `notumor`, `pituitary`
