import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from tensorflow.keras import layers
from sklearn.preprocessing import StandardScaler

model = keras.Sequential([
    layers.Input(shape=(42,)),
    layers.Dense(128, activation="relu"),
    layers.Dense(128, activation="relu"),
    layers.Dense(7, activation="softmax")
])
sc = StandardScaler()
ml_df = pd.DataFrame(columns=["id", "game_state", "next_move", "winner"])


def prepare_data():    
    df = pd.read_csv("data.csv")
    df["moves"] = df["moves"].apply(lambda x: list(map(int, x.split(","))))    
    df = df[df["id"] < 500]
    rows = []
    weights = []

    for _, d in df.iterrows():        
        A = np.zeros((6,7))         
        turn = d["played_first"]
        winner = d["winner"]
        moves = d["moves"]
        n = len(moves)

        for i, col in enumerate(moves):
            weight = 1
            winner_view = 1

            if turn == winner:
                winner_view = -1
                if i == n-1:
                    weight = 5
                elif i == n-2:
                    weight = 3
                elif i == n-3:
                    weight = 2

            game_state = A.copy()

            for row in range(5, -1, -1):
                if A[row][col] == 0:
                    A[row][col] = turn
                    break

            game_state = (game_state * -turn).flatten().tolist()

            rows.append({
                "id": id,
                "game_state": game_state,
                "next_move": col,
                "winner": winner_view
            })

            weights.append(weight)
            turn = -turn
    ml_df = pd.DataFrame(rows)
    return ml_df, weights
        
    

def train():
    global sc, ml_df
    ml_df, weights = prepare_data()
    sc = StandardScaler()
    model = keras.Sequential([
        layers.Input(shape=(42,)),
        layers.Dense(128, activation="relu"),
        layers.Dense(128, activation="relu"),
        layers.Dense(7, activation="softmax")
    ])

    X = np.array(ml_df["game_state"].tolist())    
    X = sc.fit_transform(X)
    y = np.array(ml_df["next_move"])    
    model.compile(
        optimizer="adam",
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"]
    )
    model.fit(X,y,sample_weight=np.array(weights), epochs=100, batch_size=512, verbose=1)
    print(len(X))



def predict(X):
    X = sc.transform([X])    
    return model.predict(X, verbose=0)[0]

    