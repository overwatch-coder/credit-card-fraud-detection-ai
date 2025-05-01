import os
import uuid
import json
import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import calendar

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])

# Load model
model_dict = joblib.load("fraud_detection_model.pkl")

model1 = model_dict['stage1']
model2 = model_dict['stage2']
threshold = model_dict['threshold']
features = model_dict['features']

# Storage folders
UPLOAD_FOLDER = "csv_uploads"
STATS_FILE = "stats.json"
CACHE_FOLDER = "cache"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(CACHE_FOLDER, exist_ok=True)

# Expected features
expected_features = [
    "V1", "V2", "V3", "V4", "V5", "V6", "V7", "V8", "V9", "V10", "V11",
    "V12", "V13", "V14", "V15", "V16", "V17", "V18", "V19", "V20", "V21",
    "V22", "V23", "V24", "V25", "V26", "V27", "V28", "Amount", "V1_V2_Interaction", "V3_Amount_Ratio", "Hour"
]

# Utils for stats


def predict_fraud(input_features):
    input_array = np.array(input_features).reshape(1, -1)

    # Stage 1: Get probability of fraud (class 1)
    y_proba = model1.predict_proba(input_array)[:, 1]

    # Stage 2: Final classification
    if y_proba >= threshold:  # If above threshold, use model2 for final decision
        y_pred = model2.predict(input_array)
    else:  # Below threshold is definitely not fraud
        y_pred = np.array([0])

    probabilities = model1.predict_proba(input_array)[0]

    return {
        "prediction": int(y_pred[0]),
        "is_fraud": int(y_pred[0]) == 1,
        "probabilities": {
            "non_fraud": round(float(probabilities[0]), 6),
            "fraud": round(float(probabilities[1]), 6)
        }
    }


def load_stats():
    if not os.path.isfile(STATS_FILE):
        with open(STATS_FILE, 'w') as f:
            json.dump({
                "total_transactions": 0,
                "total_frauds": 0,
                "fraud_rate": 0.0,
                "total_amount": 0.0,
                "amount_saved": 0.0,
                "monthly_fraud": {},
                "monthly_legit": {},
                "fraud_bin_0": 0,
                "fraud_bin_1": 0,
                "fraud_bin_2": 0,
                "fraud_bin_3": 0
            }, f)
    with open(STATS_FILE, 'r') as f:
        return json.load(f)


def save_stats(stats):
    stats["fraud_rate"] = round(
        stats["total_frauds"] / stats["total_transactions"] * 100, 2
    ) if stats["total_transactions"] > 0 else 0.0
    with open(STATS_FILE, 'w') as f:
        json.dump(stats, f)


def get_month_name():
    return calendar.month_abbr[pd.Timestamp.now().month]


def init_monthly(stats):
    for key in ["monthly_fraud", "monthly_legit"]:
        if key not in stats:
            stats[key] = {}


def add_derived_features(df):
    df["Hour"] = (df["Time"] // 3600) % 24
    df["Transaction_Day"] = (df["Time"] // (3600 * 24)) % 7
    df["Log_Amount"] = np.log1p(df["Amount"])
    df["Amount_Class"] = pd.cut(
        df["Amount"], bins=[-1, 10, 100, 1000, float("inf")],
        labels=[0, 1, 2, 3]
    ).astype(int)
    df["Day"] = df["Transaction_Day"]
    return df


def cache_key(upload_id, page, limit):
    return os.path.join(CACHE_FOLDER, f"{upload_id}_page{page}_limit{limit}.json")


@app.route("/health")
def health():
    return "OK"


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        features = np.array(data['features']).reshape(1, -1)

        result = predict_fraud(features)
        prediction = result["prediction"]

        # Update stats
        stats = load_stats()
        init_monthly(stats)
        month = get_month_name()
        amount = data.get("amount", 0)

        stats["total_transactions"] += 1
        stats["total_amount"] += amount
        if prediction == 1:
            stats["total_frauds"] += 1
            stats["amount_saved"] += amount
            stats["monthly_fraud"][month] = stats["monthly_fraud"].get(
                month, 0) + 1
        else:
            stats["monthly_legit"][month] = stats["monthly_legit"].get(
                month, 0) + 1
        save_stats(stats)

        return jsonify({
            "success": True,
            "data": result
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/upload-csv", methods=["POST"])
def upload_csv():
    try:
        if "file" not in request.files:
            return jsonify({"success": False, "error": "CSV file not provided"}), 400

        file = request.files["file"]
        df = pd.read_csv(file)

        upload_id = str(uuid.uuid4())
        path = os.path.join(UPLOAD_FOLDER, f"{upload_id}.csv")
        df.to_csv(path, index=False)

        return jsonify({"success": True, "upload_id": upload_id, "total_rows": len(df)})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/predict-csv", methods=["GET"])
def predict_csv():
    try:
        upload_id = request.args.get("upload_id")
        page = int(request.args.get("page", 1))
        limit = int(request.args.get("limit", 20))

        if not upload_id:
            return jsonify({"success": False, "error": "Missing upload_id"}), 400

        file_path = os.path.join(UPLOAD_FOLDER, f"{upload_id}.csv")
        if not os.path.isfile(file_path):
            return jsonify({"success": False, "error": "Upload not found"}), 404

        cache_path = cache_key(upload_id, page, limit)
        if os.path.isfile(cache_path):
            with open(cache_path, "r") as f:
                return jsonify(json.load(f))

        total_rows = sum(1 for _ in open(file_path)) - 1
        start = (page - 1) * limit
        end = start + limit

        if start >= total_rows:
            return jsonify({"success": False, "error": "Page out of range"}), 400

        df = pd.read_csv(file_path, skiprows=range(1, start + 1), nrows=limit)
        if (np.size(df, 1) != len(expected_features)):
            df = add_derived_features(df)
            df = df[expected_features]
        else:
            df = df[expected_features]

        predictions = []
        fraud_count = 0
        results = []

        for i, row in df.iterrows():
            row_values = row.values.tolist()
            result = predict_fraud(row_values)
            predictions.append(result["prediction"])
            if result["is_fraud"]:
                fraud_count += 1
            results.append({"index": start + i, **result})

        # Stats update
        stats = load_stats()
        init_monthly(stats)
        month = get_month_name()
        legit_count = len(df) - fraud_count

        df["is_fraud"] = predictions
        stats["total_transactions"] += len(df)
        stats["total_frauds"] += fraud_count
        stats["total_amount"] += df["Amount"].sum()
        stats["amount_saved"] += df[df["is_fraud"] == 1]["Amount"].sum()
        stats["monthly_fraud"][month] = stats["monthly_fraud"].get(
            month, 0) + fraud_count
        stats["monthly_legit"][month] = stats["monthly_legit"].get(
            month, 0) + legit_count

        bins = pd.cut(df["Amount"], bins=[-1, 10, 100, 1000,
                      float("inf")], labels=[0, 1, 2, 3])
        fraud_bins = bins[df["is_fraud"] == 1].value_counts().to_dict()
        for bin_index, count in fraud_bins.items():
            stats[f"fraud_bin_{bin_index}"] = stats.get(
                f"fraud_bin_{bin_index}", 0) + int(count)

        save_stats(stats)

        response = {
            "success": True,
            "page": page,
            "limit": limit,
            "total_rows": total_rows,
            "predictions": results
        }

        with open(cache_path, "w") as f:
            json.dump(response, f)

        return jsonify(response)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/delete-upload", methods=["DELETE"])
def delete_upload():
    try:
        upload_id = request.args.get("upload_id")
        if not upload_id:
            return jsonify({"success": False, "error": "Missing upload_id"}), 400

        file_path = os.path.join(UPLOAD_FOLDER, f"{upload_id}.csv")
        if not os.path.isfile(file_path):
            return jsonify({"success": False, "error": "File not found"}), 404

        os.remove(file_path)
        return jsonify({"success": True, "message": f"File {upload_id}.csv deleted successfully"})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 400


@app.route("/stats", methods=["GET"])
def get_stats():
    try:
        stats = load_stats()
        return jsonify({"success": True, "data": stats})
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/fraud-distribution", methods=["GET"])
def fraud_distribution():
    try:
        stats = load_stats()
        return jsonify({
            "success": True,
            "data": {
                "bins": {
                    "$0-$10": stats.get("fraud_bin_0", 0),
                    "$10-$100": stats.get("fraud_bin_1", 0),
                    "$100-$1000": stats.get("fraud_bin_2", 0),
                    "$1000+": stats.get("fraud_bin_3", 0),
                }
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/monthly-overview", methods=["GET"])
def monthly_overview():
    try:
        stats = load_stats()
        months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

        fraud_counts = [stats.get("monthly_fraud", {}).get(m, 0)
                        for m in months]
        legit_counts = [stats.get("monthly_legit", {}).get(m, 0)
                        for m in months]

        return jsonify({
            "success": True,
            "data": {
                "months": months,
                "fraud": fraud_counts,
                "legit": legit_counts
            }
        })
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True)
