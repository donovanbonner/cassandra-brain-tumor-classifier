# Cassandra Brain Tumor Classifier

NeuroScan AI is a brain tumor MRI classification system with:
- a Next.js frontend (`web/`)
- a FastAPI inference backend (`backend/`)
- a retrieval-grounded chat assistant for result explanation (`web/src/app/api/chat/route.ts`)
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
- Mistral API key (required for chat assistant responses)

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
- `MISTRAL_API_KEY=...` (required for `/api/chat`; chat will error if missing)

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

## Chat Assistant

- The `/app` result view includes a retrieval-grounded chat assistant for follow-up questions.
- Chat is implemented in `web/src/app/api/chat/route.ts` and `web/src/lib/rag.ts`.
- Responses are educational only (not medical advice) and limited to tumor/MRI/result topics.

## Notes

- Current model: **Cassandra v1** (`models/cassandra_v1.pth`)
- Class mapping in backend and frontend is aligned to training order:
  - `glioma`, `meningioma`, `notumor`, `pituitary`
