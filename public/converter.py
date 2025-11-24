import pandas as pd

df = pd.read_csv("Epileptic Seizure Recognition.csv")

subset = df.sample(n=11500, random_state=42)

subset.to_json("eeg_subset_50.json", orient="records")
