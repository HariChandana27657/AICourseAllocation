"""
Machine Learning router
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from ml_engine import ml_engine

router = APIRouter()

@router.post("/train")
async def train_models(db: Session = Depends(get_db)):
    try:
        training_data = ml_engine.generate_training_data(db)
        if training_data.empty:
            return {"error": "No training data available"}
        
        results = ml_engine.train_models(training_data)
        return {"message": "Models trained successfully", "results": results}
    except Exception as e:
        return {"error": str(e)}

@router.get("/status")
async def ml_status():
    return {
        "status": "operational",
        "models_available": ["Random Forest", "XGBoost", "Neural Network"],
        "model_loaded": ml_engine.best_model is not None
    }
