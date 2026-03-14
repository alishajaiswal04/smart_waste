from fastapi import FastAPI, Body
import pandas as pd
from sklearn.cluster import DBSCAN

app = FastAPI()

@app.post("/cluster")
def cluster_bins(bins: list = Body(...)):

    df = pd.DataFrame(bins)

    coords = df[['latitude','longitude']]

    model = DBSCAN(eps=0.002, min_samples=3)

    clusters = model.fit_predict(coords)

    df["cluster"] = clusters
    # Replace NaN values to avoid JSON serialization errors
    df = df.fillna(0)

    cluster_waste = df.groupby("cluster")["waste_weight_kg"].sum()

    return {
        "clusters": df.to_dict(orient="records"),
        "cluster_waste": cluster_waste.to_dict()
    }