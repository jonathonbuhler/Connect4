const board = document.getElementById("gameboard");
const slots = document.getElementsByClassName("cells")[0];
const placeButton = document.getElementById("place");
var colors = ["red", "yellow"];
var selectedCol = null;
var turn = 1;
playedFirst = null;

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

placeButton.onclick = function () {
  if (selectedCol === null) {
    return;
  }

  col = selectedCol;

  let row = -1;
  for (let r = 5; r >= 0; r--) {
    if (A[r][col] === 0) {
      row = r;
      break;
    }
  }
  if (row === -1) return;

  const cell = document.querySelectorAll(
    `[data-col='${col}'][data-row='${row}']`
  )[0];

  A[row][col] = turn;
  if (checkWinner(A, row, col, turn)) {
    console.log("WINNER");
  }

  if (turn == 1) {
    cell.style.backgroundColor = colors[0];
    turn = -1;
  } else {
    cell.style.backgroundColor = colors[1];
    turn = 1;
  }

  selectedCol = null;
  console.log(A);
};

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
