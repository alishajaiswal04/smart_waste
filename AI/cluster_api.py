from fastapi import FastAPI, Body
import pandas as pd
from sklearn.cluster import DBSCAN

app = FastAPI()

@app.post("/cluster")
def cluster_bins(bins: list = Body(...)):

    # Convert incoming bins to dataframe
    df = pd.DataFrame(bins)

    if df.empty:
        return {"clusters": [], "cluster_waste": {}}

    # Ensure required columns exist
    if "latitude" not in df.columns or "longitude" not in df.columns:
        return {"error": "Missing latitude or longitude"}

    if "waste_weight_kg" not in df.columns:
        df["waste_weight_kg"] = 0

    # Coordinates for clustering
    coords = df[['latitude','longitude']]

    # Run DBSCAN
    model = DBSCAN(eps=0.002, min_samples=3)
    clusters = model.fit_predict(coords)

    df["cluster"] = clusters

    # Replace NaN to avoid JSON errors
    df = df.fillna(0)

    # Calculate waste per cluster
    cluster_waste = df.groupby("cluster")["waste_weight_kg"].sum()

    return {
        "clusters": df.to_dict(orient="records"),
        "cluster_waste": cluster_waste.to_dict()
    }