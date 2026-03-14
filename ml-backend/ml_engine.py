"""
Machine Learning Engine for Course Allocation
Implements multiple ML models and prediction pipeline
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.neural_network import MLPClassifier
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report
import joblib
import os
from datetime import datetime
from typing import Dict, List, Tuple
import xgboost as xgb

class MLAllocationEngine:
    """
    Machine Learning engine for intelligent course allocation
    """
    
    def __init__(self, model_path="./models"):
        self.model_path = model_path
        self.models = {}
        self.scaler = StandardScaler()
        self.best_model = None
        self.best_model_name = None
        self.feature_names = [
            'gpa', 'semester', 'department_match', 'prerequisites_met',
            'preference_rank', 'seat_availability', 'course_popularity',
            'course_difficulty', 'student_credits_completed'
        ]
        
        # Create models directory
        os.makedirs(model_path, exist_ok=True)
    
    def prepare_features(self, data: pd.DataFrame) -> Tuple[np.ndarray, np.ndarray]:
        """
        Prepare features for ML model
        """
        # Feature engineering
        X = data[self.feature_names].values
        y = data['allocated'].values
        
        return X, y
    
    def train_models(self, training_data: pd.DataFrame) -> Dict:
        """
        Train multiple ML models and compare performance
        """
        print("🤖 Starting ML model training...")
        
        # Prepare data
        X, y = self.prepare_features(training_data)
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.2, random_state=42, stratify=y
        )
        
        # Scale features
        X_train_scaled = self.scaler.fit_transform(X_train)
        X_test_scaled = self.scaler.transform(X_test)
        
        # Save scaler
        joblib.dump(self.scaler, os.path.join(self.model_path, 'scaler.pkl'))
        
        # Define models
        models_to_train = {
            'Random Forest': RandomForestClassifier(
                n_estimators=100,
                max_depth=10,
                min_samples_split=5,
                random_state=42,
                n_jobs=-1
            ),
            'Gradient Boosting': GradientBoostingClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            ),
            'XGBoost': xgb.XGBClassifier(
                n_estimators=100,
                learning_rate=0.1,
                max_depth=5,
                random_state=42
            ),
            'Decision Tree': DecisionTreeClassifier(
                max_depth=10,
                min_samples_split=5,
                random_state=42
            ),
            'Logistic Regression': LogisticRegression(
                max_iter=1000,
                random_state=42
            ),
            'Neural Network': MLPClassifier(
                hidden_layer_sizes=(64, 32, 16),
                activation='relu',
                max_iter=500,
                random_state=42
            )
        }
        
        results = {}
        best_score = 0
        
        # Train and evaluate each model
        for name, model in models_to_train.items():
            print(f"\n📊 Training {name}...")
            
            # Train model
            model.fit(X_train_scaled, y_train)
            
            # Predictions
            y_pred = model.predict(X_test_scaled)
            
            # Metrics
            accuracy = accuracy_score(y_test, y_pred)
            precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
            recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
            f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)
            
            # Cross-validation
            cv_scores = cross_val_score(model, X_train_scaled, y_train, cv=5)
            
            results[name] = {
                'model': model,
                'accuracy': accuracy,
                'precision': precision,
                'recall': recall,
                'f1_score': f1,
                'cv_mean': cv_scores.mean(),
                'cv_std': cv_scores.std()
            }
            
            print(f"  ✓ Accuracy: {accuracy:.4f}")
            print(f"  ✓ Precision: {precision:.4f}")
            print(f"  ✓ Recall: {recall:.4f}")
            print(f"  ✓ F1-Score: {f1:.4f}")
            print(f"  ✓ CV Score: {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
            
            # Save model
            model_filename = f"{name.lower().replace(' ', '_')}.pkl"
            joblib.dump(model, os.path.join(self.model_path, model_filename))
            
            # Track best model
            if f1 > best_score:
                best_score = f1
                self.best_model = model
                self.best_model_name = name
        
        print(f"\n🏆 Best Model: {self.best_model_name} (F1-Score: {best_score:.4f})")
        
        # Save best model separately
        joblib.dump(self.best_model, os.path.join(self.model_path, 'best_model.pkl'))
        
        return results
    
    def load_model(self, model_name: str = 'best_model'):
        """
        Load a trained model
        """
        model_path = os.path.join(self.model_path, f'{model_name}.pkl')
        scaler_path = os.path.join(self.model_path, 'scaler.pkl')
        
        if os.path.exists(model_path) and os.path.exists(scaler_path):
            self.best_model = joblib.load(model_path)
            self.scaler = joblib.load(scaler_path)
            print(f"✓ Model loaded: {model_name}")
            return True
        else:
            print(f"⚠️ Model not found: {model_name}")
            return False
    
    def predict_allocation(self, student_features: Dict, course_features: Dict) -> Dict:
        """
        Predict if a student should be allocated to a course
        """
        if self.best_model is None:
            raise ValueError("No model loaded. Please train or load a model first.")
        
        # Prepare features
        features = np.array([[
            student_features.get('gpa', 0),
            student_features.get('semester', 1),
            1 if student_features.get('department') == course_features.get('department') else 0,
            student_features.get('prerequisites_met', 0),
            student_features.get('preference_rank', 5),
            course_features.get('seat_availability', 0),
            course_features.get('popularity_score', 0),
            course_features.get('difficulty_level', 1),
            student_features.get('credits_completed', 0)
        ]])
        
        # Scale features
        features_scaled = self.scaler.transform(features)
        
        # Predict
        prediction = self.best_model.predict(features_scaled)[0]
        probability = self.best_model.predict_proba(features_scaled)[0]
        
        return {
            'allocated': bool(prediction),
            'confidence': float(max(probability)),
            'probability_allocated': float(probability[1]) if len(probability) > 1 else float(probability[0])
        }
    
    def predict_batch(self, students_courses: List[Dict]) -> List[Dict]:
        """
        Batch prediction for multiple student-course pairs
        """
        predictions = []
        
        for item in students_courses:
            try:
                pred = self.predict_allocation(
                    item['student_features'],
                    item['course_features']
                )
                predictions.append({
                    'student_id': item.get('student_id'),
                    'course_id': item.get('course_id'),
                    **pred
                })
            except Exception as e:
                print(f"Error predicting for student {item.get('student_id')}: {e}")
                predictions.append({
                    'student_id': item.get('student_id'),
                    'course_id': item.get('course_id'),
                    'allocated': False,
                    'confidence': 0.0,
                    'error': str(e)
                })
        
        return predictions
    
    def get_feature_importance(self) -> Dict:
        """
        Get feature importance from the model
        """
        if self.best_model is None or not hasattr(self.best_model, 'feature_importances_'):
            return {}
        
        importance = self.best_model.feature_importances_
        return dict(zip(self.feature_names, importance.tolist()))
    
    def generate_training_data(self, db_session) -> pd.DataFrame:
        """
        Generate training data from database
        """
        from database import TrainingData
        
        # Query training data
        training_records = db_session.query(TrainingData).all()
        
        if not training_records:
            print("⚠️  No training data found in database")
            return pd.DataFrame()
        
        # Convert to DataFrame
        data = []
        for record in training_records:
            data.append({
                'gpa': record.gpa,
                'semester': record.semester,
                'department_match': record.department_match,
                'prerequisites_met': record.prerequisites_met,
                'preference_rank': record.preference_rank,
                'seat_availability': record.seat_availability,
                'course_popularity': record.course_popularity,
                'course_difficulty': 1,  # Default
                'student_credits_completed': 0,  # Default
                'allocated': record.allocated
            })
        
        df = pd.DataFrame(data)
        print(f"✓ Generated training data: {len(df)} samples")
        return df

# Global ML engine instance
ml_engine = MLAllocationEngine()
