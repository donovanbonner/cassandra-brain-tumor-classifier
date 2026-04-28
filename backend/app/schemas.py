from __future__ import annotations

from pydantic import BaseModel, Field


class PredictionResponse(BaseModel):
    tumor_class: str = Field(alias="tumorClass")
    confidence: float
    probabilities: dict[str, float]
    heatmap_data_url: str = Field(alias="heatmapDataUrl")

    model_config = {
        "populate_by_name": True,
    }


class HealthResponse(BaseModel):
    status: str
    model_loaded: bool = Field(alias="modelLoaded")
    model_path: str = Field(alias="modelPath")

    model_config = {
        "populate_by_name": True,
    }

