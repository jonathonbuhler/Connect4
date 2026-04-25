from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pandas as pd
import ml
import numpy as np
import rules

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Game(BaseModel):
    played_first: int
    moves: list[int]
    winner: int

class State(BaseModel):
    game_state: list[int]

@app.on_event("startup")
async def startup():
    ml.train()

@app.post("/ml/add-game")
async def ml_add_game(game: Game):
    edf = pd.read_csv("data.csv")
    id = edf["id"].max() + 1
    row = game.model_dump()
    row["moves"] = ",".join(map(str, row["moves"]))
    row["id"] = id
    df = pd.DataFrame([row])
    df = df.set_index("id")
    df.to_csv("data.csv", mode="a", index=True, header=False)

    return {"message": "success"}

@app.post("/ml/next-move")
async def ml_next_move(state: State):
    probs = ml.predict(state.game_state)
    A = np.array(state.game_state).reshape(6,7)
    valid = [c for c in range(7) if A[0][c] == 0]    
    for col in valid:
        B = A.copy()        
        if rules.check_winner(B,col,-1):
            return {"next_move": int(col)}
    for col in valid:
        B = A.copy()        
        if rules.check_winner(B,col,1):
            return {"next_move": int(col)}
    valid_probs = [(c, probs[c]) for c in valid]
    cols = np.array([c for c, _ in valid_probs])
    p = np.array([p for _, p in valid_probs])
    p = p + 1e-8
    p = p / np.sum(p)

    next_move = np.random.choice(cols, p=p)
    return {"next_move": int(next_move)}

@app.get("/ml/train")
def ml_train():
    ml.train()
    return {"message": "success"}