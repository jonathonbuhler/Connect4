//The Algorithm's name is Devin
const board = document.getElementById("gameboard");
const slots = document.getElementsByClassName("cells")[0];
const placeButton = document.getElementById("place");
const resetButton = document.getElementById("reset");
const trainButton = document.getElementById("train");
const colors = ["red", "yellow"];
let winner = 0;
let selectedCol = null;
let turn = 1;
let playedFirst = null;
let moves = [];

A = [
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0],
];

for (let row = 0; row < 6; row++) {
  for (let col = 0; col < 7; col++) {
    const div = document.createElement("div");
    div.className = "cell";
    div.dataset.row = row;
    div.dataset.col = col;

    slots.appendChild(div);
  }
}

function reset() {
  // fetch("http://localhost:8000/ml/train");
  A = [
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
  ];

  let cells = document.getElementsByClassName("cell");
  for (let i = 0; i < cells.length; i++) {
    cells[i].style.backgroundColor = "transparent";
  }
  playedFirst = null;
  moves = [];
  winner = 0;
}

document.addEventListener("click", (e) => {
  const cell = e.target;

  document
    .querySelectorAll(".highlight")
    .forEach((el) => el.classList.remove("highlight"));
  selectedCol = null;

  if (cell.className !== "cell") {
    return;
  }

  selectedCol = parseInt(cell.dataset.col);

  document
    .querySelectorAll(`[data-col='${cell.dataset.col}']`)
    .forEach((el) => el.classList.add("highlight"));
});

trainButton.onclick = async function () {
  for (let i = 0; i < 10000; i++) {
    let next_move = await getNextMove();
    while (winner == 0 && A.flat().includes(0)) {
      next_move = await getNextMove();
      place(next_move);
      next_move = getNextMove();
      place(next_move);
    }
    reset();
  }
};

placeButton.onclick = async function () {
  if (turn == -1 || selectedCol == null) {
    return;
  }

  const col = selectedCol;
  place(col);
  const next_col = await getNextMove();
  place(next_col);
};

function place(col) {
  if (winner != 0) return;
  let row = -1;
  for (let r = 5; r >= 0; r--) {
    if (A[r][col] === 0) {
      row = r;
      break;
    }
  }
  if (row === -1) return;
  if (playedFirst === null) playedFirst = turn;
  moves.push(col);
  const cell = document.querySelectorAll(
    `[data-col='${col}'][data-row='${row}']`,
  )[0];

  if (turn == 1) {
    cell.style.backgroundColor = colors[0];
  } else {
    cell.style.backgroundColor = colors[1];
  }

  A[row][col] = turn;
  if (checkWinner(A, row, col, turn)) {
    winner = turn;
    fetch("http://localhost:8000/ml/add-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        played_first: playedFirst,
        moves: moves,
        winner: winner,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Saved game:", data);
      })
      .catch((err) => console.error("Error saving game:", err));
  }

  turn = -turn;
  selectedCol = null;
}

function checkWinner(A, row, col, player) {
  const dir = [
    [1, 0],
    [0, 1],
    [1, 1],
    [1, -1],
  ];
  for (let i = 0; i < dir.length; i++) {
    let count = 1;
    const dr = dir[i][0];
    const dc = dir[i][1];
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && c >= 0 && r < 6 && c < 7 && A[r][c] == player) {
      count++;
      r += dr;
      c += dc;
    }
    r = row - dr;
    c = col - dc;
    while (r >= 0 && c >= 0 && r < 6 && c < 7 && A[r][c] == player) {
      count++;
      r -= dr;
      c -= dc;
    }
    if (count >= 4) {
      return true;
    }
  }

  return false;
}

async function getNextMove() {
  const res = await fetch("http://localhost:8000/ml/next-move", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      game_state: A.flat(),
    }),
  });
  const data = await res.json();
  return data.next_move;
}

resetButton.addEventListener("click", async () => {
  reset();
  if (turn == -1) {
    next_move = await getNextMove();
    place(next_move);
  }
});
