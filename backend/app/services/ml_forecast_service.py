import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta, timezone
from app.core.tamil_nadu_districts import TAMIL_NADU_DISTRICTS

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

# Baseline distribution frequencies in South India / Tamil Nadu
BLOOD_GROUP_WEIGHTS = {
    "O+": 0.38,
    "B+": 0.32,
    "A+": 0.21,
    "AB+": 0.06,
    "O-": 0.015,
    "B-": 0.008,
    "A-": 0.005,
    "AB-": 0.002
}

class BloodDemandForecaster:
    def __init__(self):
        self.model = RandomForestRegressor(n_estimators=60, random_state=42)
        self.is_trained = False
        self._train_model()

    def _generate_training_data(self) -> pd.DataFrame:
        """Generates realistic historical demand observations over 180 days across districts."""
        np.random.seed(42)
        records = []
        base_date = datetime.now(timezone.utc) - timedelta(days=180)

        top_districts = ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore"]
        district_pop_map = {d["name_en"]: d.get("population", 2000000) for d in TAMIL_NADU_DISTRICTS}

        for day_offset in range(180):
            current_date = base_date + timedelta(days=day_offset)
            day_of_week = current_date.weekday()
            is_weekend = 1 if day_of_week >= 5 else 0
            month = current_date.month

            for dist_name in top_districts:
                pop_factor = district_pop_map.get(dist_name, 1500000) / 1000000.0

                for bg, weight in BLOOD_GROUP_WEIGHTS.items():
                    # Base daily demand in units
                    base_demand = weight * 45.0 * pop_factor
                    # Weekend surge in trauma/emergency
                    weekend_mult = 1.15 if is_weekend else 1.0
                    noise = np.random.normal(0, 1.5)
                    actual_units = max(1, int(base_demand * weekend_mult + noise))

                    records.append({
                        "day_of_week": day_of_week,
                        "is_weekend": is_weekend,
                        "month": month,
                        "pop_factor": pop_factor,
                        "bg_index": BLOOD_GROUPS.index(bg),
                        "demand_units": actual_units
                    })

        return pd.DataFrame(records)

    def _train_model(self):
        df = self._generate_training_data()
        X = df[["day_of_week", "is_weekend", "month", "pop_factor", "bg_index"]]
        y = df["demand_units"]
        self.model.fit(X, y)
        self.is_trained = True

    def forecast_7_days(self, district: Optional[str] = "All Districts") -> Dict[str, Any]:
        """
        Generates 7-day predictive demand forecast for each blood group.
        Labels predictions clearly as machine learning estimates.
        """
        if not self.is_trained:
            self._train_model()

        today = datetime.now(timezone.utc)
        forecast_days = [today + timedelta(days=i) for i in range(1, 8)]
        day_labels = [d.strftime("%a %d %b") for d in forecast_days]

        # Calculate district population factor
        pop_factor = 2.5
        if district and district != "All Districts":
            matched = next((d for d in TAMIL_NADU_DISTRICTS if d["name_en"].lower() == district.lower()), None)
            if matched:
                pop_factor = matched.get("population", 2000000) / 1000000.0

        group_forecasts = []
        overall_high_risk = []

        for bg in BLOOD_GROUPS:
            bg_idx = BLOOD_GROUPS.index(bg)
            daily_preds = []

            for d in forecast_days:
                features = np.array([[
                    d.weekday(),
                    1 if d.weekday() >= 5 else 0,
                    d.month,
                    pop_factor,
                    bg_idx
                ]])
                pred = self.model.predict(features)[0]
                daily_preds.append(max(1, int(round(pred))))

            total_7d = sum(daily_preds)

            # Determine risk tier based on blood group demand & rarity
            if bg in ["O+", "B+"]:
                status = "High Demand"
                urgency_color = "red"
            elif bg in ["A+", "AB+"]:
                status = "Moderate Demand"
                urgency_color = "amber"
            elif bg in ["O-", "B-", "A-", "AB-"]:
                status = "Attention Required (Rare Group)"
                urgency_color = "purple"
                overall_high_risk.append(bg)
            else:
                status = "Stable"
                urgency_color = "emerald"

            group_forecasts.append({
                "blood_group": bg,
                "total_7d_units": total_7d,
                "avg_daily_units": round(total_7d / 7.0, 1),
                "status": status,
                "urgency_color": urgency_color,
                "daily_breakdown": [
                    {"day": day_labels[i], "units": daily_preds[i]} for i in range(7)
                ]
            })

        return {
            "disclaimer": "ML prediction estimate — not a clinical or medical clearance decision.",
            "district": district or "All Tamil Nadu",
            "generated_at": today.isoformat(),
            "forecast_period": f"{day_labels[0]} – {day_labels[-1]}",
            "critical_attention_groups": overall_high_risk,
            "group_forecasts": group_forecasts
        }

# Global singleton
forecaster = BloodDemandForecaster()
