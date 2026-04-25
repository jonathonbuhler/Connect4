import pandas as pd

df = pd.read_csv("backend/data.csv")
print(len(df))
df = df.drop_duplicates()
df.to_csv("backend/data.csv", index=False)
print(len(df))

