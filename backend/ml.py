import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier

sc = StandardScaler()
lr = RandomForestClassifier()
ml_df = pd.DataFrame(columns=["id", "game_state", "next_move", "winner"])

def prepare_data():
    sc = StandardScaler()
    lr = RandomForestClassifier()
    ml_df = pd.DataFrame(columns=["id", "game_state", "next_move", "winner"])
    df = pd.read_csv("data.csv")
    df["moves"] = df["moves"].apply(lambda x: list(map(int, x.split(","))))    

    id = 0
    weights = []
    for _,d in df.iterrows():        
        A = np.zeros(shape=(6,7))         
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
                    weight = 1
                elif i == n-2:
                    weight = 1
                elif i == n-3:
                    weight = 1
            game_state = A.copy()             
            next_move = col
            for row in range(5,-1,-1):
                if A[row][col] == 0:
                    A[row][col] = turn
                    break            
            game_state = game_state * -turn
            
            game_state = game_state.flatten().tolist()
            ml_df.loc[len(ml_df)] = {"id": id, "game_state": game_state, "next_move": next_move, "winner": winner_view}
            turn = -turn
            id += 1     
            weights.append(weight)   
    ml_df.to_csv("ml.csv", index=False)
    return ml_df, weights
    

def train():
    ml_df, weights = prepare_data()
    X = np.array(ml_df["game_state"].tolist())    
    X = sc.fit_transform(X)
    y = np.array(ml_df["next_move"])    
    lr.fit(X,y, sample_weight=weights)
    print(len(X))



def predict(X):
    X = sc.transform([X])    
    return lr.predict_proba(X)[0]

    