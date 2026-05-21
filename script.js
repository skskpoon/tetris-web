const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

let score = 0;

const colors = [
  null,
  "cyan",
  "yellow",
  "purple",
  "blue",
  "orange",
  "green",
  "red"
];

const shapes = [
  [
    [1, 1, 1, 1]
  ],
  [
    [2, 2],
    [2, 2]
  ],
  [
    [0, 3, 0],
    [3, 3, 3]
  ],
  [
    [4, 0, 0],
    [4, 4, 4]
  ],
  [
    [0, 0, 5],
    [5, 5, 5]
  ],
  [
    [6, 6, 0],
    [0, 6, 6]
  ],
  [
    [0, 7, 7],
    [7, 7, 0]
  ]
];

const board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

function createPiece() {
  const shape = shapes[Math.floor(Math.random() * shapes.length)];
  return {
    matrix: shape,
    x: 3,
    y: 0
  };
}

let piece = createPiece();

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);

  ctx.strokeStyle = "#222";
  ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const value = board[y][x];
      if (value) {
        drawBlock(x, y, colors[value]);
      }
    }
  }
}

function drawPiece() {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        drawBlock(piece.x + x, piece.y + y, colors[value]);
      }
    });
  });
}

function collide() {
  for (let y = 0; y < piece.matrix.length; y++) {
    for (let x = 0; x < piece.matrix[y].length; x++) {
      if (piece.matrix[y][x]) {
        const newX = piece.x + x;
        const newY = piece.y + y;

        if (
          newX < 0 ||
          newX >= COLS ||
          newY >= ROWS ||
          board[newY]?.[newX]
        ) {
          return true;
        }
      }
    }
  }

  return false;
}

function merge() {
  piece.matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        board[piece.y + y][piece.x + x] = value;
      }
    });
  });
}

function clearLines() {
  let lines = 0;

  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(value => value !== 0)) {
      board.splice(y, 1);
      board.unshift(Array(COLS).fill(0));
      lines++;
      y++;
    }
  }

  if (lines > 0) {
    score += lines * 100;
    scoreElement.textContent = score;
  }
}

function rotate(matrix) {
  return matrix[0].map((_, i) => matrix.map(row => row[i]).reverse());
}

function moveDown() {
  piece.y++;

  if (collide()) {
    piece.y--;
    merge();
    clearLines();
    piece = createPiece();

    if (collide()) {
      alert("GAME OVER");
      location.reload();
    }
  }
}

function move(dir) {
  piece.x += dir;

  if (collide()) {
    piece.x -= dir;
  }
}

function rotatePiece() {
  const oldMatrix = piece.matrix;
  piece.matrix = rotate(piece.matrix);

  if (collide()) {
    piece.matrix = oldMatrix;
  }
}

document.addEventListener("keydown", event => {
  if (event.key === "ArrowLeft") {
    move(-1);
  } else if (event.key === "ArrowRight") {
    move(1);
  } else if (event.key === "ArrowDown") {
    moveDown();
  } else if (event.key === "ArrowUp") {
    rotatePiece();
  }

  draw();
});

function draw() {
  drawBoard();
  drawPiece();
}

let dropCounter = 0;
let lastTime = 0;

function update(time = 0) {
  const deltaTime = time - lastTime;
  lastTime = time;

  dropCounter += deltaTime;

  if (dropCounter > 700) {
    moveDown();
    dropCounter = 0;
  }

  draw();
  requestAnimationFrame(update);
}

update();
document.getElementById("leftBtn").addEventListener("click", () => {
  move(-1);
  draw();
});

document.getElementById("rightBtn").addEventListener("click", () => {
  move(1);
  draw();
});

document.getElementById("downBtn").addEventListener("click", () => {
  moveDown();
  draw();
});

document.getElementById("rotateBtn").addEventListener("click", () => {
  rotatePiece();
  draw();
});