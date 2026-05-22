const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("score");

const nextCanvas = document.getElementById("next");
const nextCtx = nextCanvas.getContext("2d");

const COLS = 10;
const ROWS = 20;
const BLOCK = 30;

let score = 0;
let flashRows = [];
let shakeTime = 0;

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
let nextPiece = createPiece();

function drawBlock(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);

  ctx.strokeStyle = "#222";
  ctx.strokeRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
}

function drawBoard() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  let shakeX = 0;
  let shakeY = 0;

  if (shakeTime > 0) {
    shakeX = Math.random() * 6 - 3;
    shakeY = Math.random() * 6 - 3;
    shakeTime--;
  }

  ctx.save();
  ctx.translate(shakeX, shakeY);

  for (let y = 0; y < ROWS; y++) {
    for (let x = 0; x < COLS; x++) {
      const value = board[y][x];

      if (value) {
        drawBlock(x, y, colors[value]);
      }

      if (flashRows.includes(y)) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.45)";
        ctx.fillRect(x * BLOCK, y * BLOCK, BLOCK, BLOCK);
      }
    }
  }

  ctx.restore();
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

function drawNextPiece() {
  nextCtx.clearRect(0, 0, nextCanvas.width, nextCanvas.height);

  const matrix = nextPiece.matrix;
  const size = 25;

  const offsetX = (nextCanvas.width - matrix[0].length * size) / 2;
  const offsetY = (nextCanvas.height - matrix.length * size) / 2;

  matrix.forEach((row, y) => {
    row.forEach((value, x) => {
      if (value) {
        nextCtx.fillStyle = colors[value];
        nextCtx.fillRect(
          offsetX + x * size,
          offsetY + y * size,
          size,
          size
        );

        nextCtx.strokeStyle = "#222";
        nextCtx.strokeRect(
          offsetX + x * size,
          offsetY + y * size,
          size,
          size
        );
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
  flashRows = [];

  for (let y = ROWS - 1; y >= 0; y--) {
    if (board[y].every(value => value !== 0)) {
      flashRows.push(y);
    }
  }

  if (flashRows.length > 0) {
    shakeTime = 12;

    setTimeout(() => {
      for (let y = ROWS - 1; y >= 0; y--) {
        if (board[y].every(value => value !== 0)) {
          board.splice(y, 1);
          board.unshift(Array(COLS).fill(0));
          lines++;
          y++;
        }
      }

      score += lines * 100;
      scoreElement.textContent = score;
      flashRows = [];
    }, 120);
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
    shakeTime = 4;
    clearLines();

    piece = nextPiece;
    nextPiece = createPiece();

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
  drawNextPiece();
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

// ===== スマホ/PC両対応ボタン操作 =====
function bindButton(id, action) {
  const button = document.getElementById(id);

  button.addEventListener("touchstart", event => {
    event.preventDefault();
    action();
    draw();
  });

  button.addEventListener("mousedown", event => {
    event.preventDefault();
    action();
    draw();
  });
}

bindButton("leftBtn", () => move(-1));
bindButton("rightBtn", () => move(1));
bindButton("downBtn", () => moveDown());
bindButton("rotateBtn", () => rotatePiece());

// ===== クラシック風BGM =====
let audioCtx;
let bgmStarted = false;

const melody = [
  659, 494, 523, 587, 523, 494, 440, 440,
  523, 659, 587, 523, 494, 494, 523, 587,
  659, 523, 440, 440
];

let melodyIndex = 0;

function playTone(freq, duration) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "square";
  osc.frequency.value = freq;

  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + duration
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + duration);
}

function startBGM() {
  if (bgmStarted) return;

  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  bgmStarted = true;

  setInterval(() => {
    const freq = melody[melodyIndex];
    playTone(freq, 0.18);

    melodyIndex++;

    if (melodyIndex >= melody.length) {
      melodyIndex = 0;
    }
  }, 220);
}

bindButton("musicBtn", () => startBGM());