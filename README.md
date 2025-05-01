# 🛡️ XGBoost Credit Card Fraud Detection System

A complete end-to-end system for detecting credit card fraud using the XGBoost machine learning algorithm. This project includes data preprocessing, model training and evaluation, backend API integration with Flask, and Dockerized deployment for scalable use in production environments.

## 📊 Project Overview

This project uses credit card transaction data to detect fraudulent activities in real time. It was trained on the [Kaggle Credit Card Fraud Detection Dataset](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) and provides a RESTful API to serve predictions via a lightweight Flask application, fully containerized with Docker.

## ⚙️ Features

- XGBoost model trained on imbalanced dataset
- SMOTE/ADASYN/class-weight support for imbalance handling
- REST API for prediction with JSON and CSV support
- Containerized with Docker for easy deployment
- Ready for real-time integration with payment systems

## 🧪 Step-by-Step Pipeline

### 1. Data Preparation

- Download and load the Kaggle Credit Card Fraud dataset.
- Normalize features like `Amount` and `Time` using `RobustScaler`.
- Optionally use time-based features and apply sampling methods (SMOTE, ADASYN) or class weights.

```python
from sklearn.preprocessing import RobustScaler

rob_scaler = RobustScaler()
df['scaled_amount'] = rob_scaler.fit_transform(df['Amount'].values.reshape(-1, 1))
df['scaled_time'] = rob_scaler.fit_transform(df['Time'].values.reshape(-1, 1))
df.drop(['Time', 'Amount'], axis=1, inplace=True)
```

### 2. Model Building with XGBoost

- Split the dataset using `train_test_split` with stratification
- Calculate class weights or use sampling
- Train the model with the `binary:logistic` objective and monitor AUC-PR

```python
import xgboost as xgb
from sklearn.model_selection import train_test_split

X = df.drop('Class', axis=1)
y = df['Class']
X_train, X_test, y_train, y_test = train_test_split(X, y, stratify=y, test_size=0.2)

# Create DMatrix
dtrain = xgb.DMatrix(X_train, label=y_train)
dtest = xgb.DMatrix(X_test, label=y_test)

params = {
  'objective': 'binary:logistic',
  'eval_metric': 'aucpr',
  'eta': 0.01,
  'max_depth': 5,
  'subsample': 0.8,
  'colsample_bytree': 0.8,
  'scale_pos_weight': len(y_train[y_train==0]) / len(y_train[y_train==1]),
  'seed': 42
}

model = xgb.train(params, dtrain, num_boost_round=1000,
                  evals=[(dtrain, 'train'), (dtest, 'test')],
                  early_stopping_rounds=50)
```

### 3. Model Evaluation

- Confusion Matrix
- Classification Report
- ROC AUC / Precision-Recall AUC

```python
from sklearn.metrics import classification_report, confusion_matrix, roc_auc_score, average_precision_score

y_pred = model.predict(dtest)
y_pred_class = (y_pred > 0.5).astype(int)

print(confusion_matrix(y_test, y_pred_class))
print(classification_report(y_test, y_pred_class))
print("ROC AUC:", roc_auc_score(y_test, y_pred))
print("PR AUC:", average_precision_score(y_test, y_pred))
```

### 4. Hyperparameter Tuning (Optional)

Use Optuna or GridSearchCV for fine-tuning:

```python
import optuna

def objective(trial):
    params = {
        'max_depth': trial.suggest_int('max_depth', 3, 10),
        'learning_rate': trial.suggest_loguniform('learning_rate', 0.01, 0.3),
        'subsample': trial.suggest_uniform('subsample', 0.6, 1.0),
        'colsample_bytree': trial.suggest_uniform('colsample_bytree', 0.6, 1.0),
        'gamma': trial.suggest_loguniform('gamma', 1e-8, 1.0),
        'min_child_weight': trial.suggest_int('min_child_weight', 1, 10),
        'scale_pos_weight': trial.suggest_uniform('scale_pos_weight', 1, 10)
    }

    cv_results = xgb.cv(params, dtrain, num_boost_round=1000, nfold=5,
                        metrics={'aucpr'}, early_stopping_rounds=50, seed=42)
    return cv_results['test-aucpr-mean'].iloc[-1]

study = optuna.create_study(direction='maximize')
study.optimize(objective, n_trials=50)
```

## 🚀 Deployment

### 1. Save the Trained Model

```python
import joblib
joblib.dump(model, 'xgb_fraud_detection_model.pkl')
```

### 2. Build REST API with Flask

```python
# app.py
from flask import Flask, request, jsonify
import joblib
import numpy as np

app = Flask(__name__)
model = joblib.load('xgb_fraud_detection_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    features = np.array(data['features']).reshape(1, -1)
    prediction = model.predict(features)
    return jsonify({'fraud_probability': float(prediction[0])})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
```

### 3. Containerize with Docker

```dockerfile
# Dockerfile
FROM python:3.8-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
```

### 4. Run with Docker

```bash
docker build -t fraud-detector .
docker run -p 5000:5000 fraud-detector
```

## ☁️ Deployment Options

- **Cloud**: AWS (EC2, SageMaker), GCP (Cloud Run), Azure ML
- **Serverless**: AWS Lambda + API Gateway, GCP Cloud Functions
- **Real-time**: Kafka Consumer, integrate with payment gateways

## 🧩 Monitoring & Maintenance

- Set up model drift tracking and alerts
- A/B testing new model versions
- CI/CD pipelines for automatic retraining
- Collect and retrain on false positives/negatives

## 📁 File Structure

```
.
├── backend
│   ├── .venv
│   ├── app.py
│   ├── cache
│   ├── csv_uploads
│   ├── fraud_detection_model.pkl
│   ├── requirements.txt
│   ├── stats.json
│   ├── creditcard.csv
│   ├── creditcard_with_predictions.csv
│   └── Dockerfile
├── frontend
│   ├── Dockerfile
│   ├── app
│   ├── components
│   ├── next-env.d.ts
│   ├── package.json
│   ├── public
│   └── tsconfig.json
├── nginx
│   ├── default.conf
├── docker-compose.yml
├── README.md
├── .gitignore
└── LICENSE
```

## 📬 API Usage

### POST `/predict`

#### Request

```json
{
  "features": [0.1, -1.2, 0.5, ..., 0.9]
}
```

#### Response

```json
{
  "data": {
    "is_fraud": true,
    "prediction": 1, // 1 for fraud, 0 for non-fraud
    "probabilities": {
      "fraud": 0.999,
      "non_fraud": 0.001
    }
  }
}
```

### POST `/predict-csv`

#### Request multipart/form-data

Upload a CSV file with features in the same order as the training dataset.

```csv
feature1,feature2,feature3,...,featureN
0.1,-1.2,0.5,...,0.9
```

#### Response

```json
{
  "data": {
    "is_fraud": true,
    "prediction": 1, // 1 for fraud, 0 for non-fraud
    "probabilities": {
      "fraud": 0.999,
      "non_fraud": 0.001
    }
  }
}
```

### GET `/stats`

#### Response

```json
{
  "data": {
    "total_transactions": 160,
    "total_frauds": 2,
    "fraud_rate": 1.25,
    "total_amount": 75.45,
    "amount_saved": 2.25,
    "monthly_fraud": { "May": 2 },
    "monthly_legit": { "May": 158 },
    "fraud_bin_0": 2,
    "fraud_bin_1": 0,
    "fraud_bin_2": 0,
    "fraud_bin_3": 0
  }
}
```

## 👥 Author

- **Aboagye Asare Bright** – UM6P Master's Student In International Management, Data Science & Analytics
- Special thanks to:
  - **Nyamadi Mawumenyo Atsu** – Full Stack Web Developer

## 📜 License

Apache License 2.0, see [LICENSE](LICENSE) for more details.
