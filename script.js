const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const startBtn = document.getElementById("startBtn");
const resetBtn = document.getElementById("resetBtn");
const leftScoreEl = document.getElementById("leftScore");
const rightScoreEl = document.getElementById("rightScore");

const paddleWidth = 14;
const paddleHeight = 110;
const paddleSpeed = 7;
const ballRadius = 9;

const keys = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false,
};

const leftPaddle = {
  x: 30,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: "#f8fafc",
};

const rightPaddle = {
  x: canvas.width - 30 - paddleWidth,
  y: canvas.height / 2 - paddleHeight / 2,
  width: paddleWidth,
  height: paddleHeight,
  color: "#f8fafc",
};

const ball = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: ballRadius,
  vx: 0,
  vy: 0,
  color: "#fbbf24",
};

let leftScore = 0;
let rightScore = 0;
let gameRunning = false;
let pointerY = canvas.height / 2;

function updateHud() {
  leftScoreEl.textContent = String(leftScore);
  rightScoreEl.textContent = String(rightScore);
}

function resetBall(direction = Math.random() < 0.5 ? -1 : 1) {
  ball.x = canvas.width / 2;
  ball.y = canvas.height / 2;

  const angle = (Math.random() * 1.2) - 0.6;
  const speed = 5.2;

  ball.vx = speed * direction;
  ball.vy = speed * angle * 1.7;
}

function startGame() {
  if (!gameRunning) {
    gameRunning = true;
    startBtn.textContent = "Pause";
    if (ball.vx === 0 && ball.vy === 0) {
      resetBall(Math.random() < 0.5 ? -1 : 1);
    }
  } else {
    gameRunning = false;
    startBtn.textContent = "Resume";
  }
}

function resetGame() {
  leftScore = 0;
  rightScore = 0;
  updateHud();
  leftPaddle.y = canvas.height / 2 - paddleHeight / 2;
  rightPaddle.y = canvas.height / 2 - paddleHeight / 2;
  resetBall(Math.random() < 0.5 ? -1 : 1);
  gameRunning = false;
  startBtn.textContent = "Start";
}

window.addEventListener("keydown", (event) => {
  if (event.key in keys) {
    keys[event.key] = true;
  }

  if (event.key === " " && !event.repeat) {
    event.preventDefault();
    startGame();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.key in keys) {
    keys[event.key] = false;
  }
});

canvas.addEventListener("mousemove", (event) => {
  const rect = canvas.getBoundingClientRect();
  const scaleY = canvas.height / rect.height;
  pointerY = (event.clientY - rect.top) * scaleY;
});

startBtn.addEventListener("click", startGame);
resetBtn.addEventListener("click", resetGame);

function moveLeftPaddle() {
  const mouseTarget = pointerY - leftPaddle.height / 2;
  const mouseInfluence = (mouseTarget - leftPaddle.y) * 0.22;

  leftPaddle.y += mouseInfluence;

  if (keys.w) leftPaddle.y -= paddleSpeed;
  if (keys.s) leftPaddle.y += paddleSpeed;

  leftPaddle.y = Math.max(0, Math.min(canvas.height - leftPaddle.height, leftPaddle.y));
}

function moveRightPaddle() {
  const targetY = ball.y - rightPaddle.height / 2;
  const diff = targetY - rightPaddle.y;
  const maxStep = 4.8;

  rightPaddle.y += Math.max(-maxStep, Math.min(maxStep, diff * 0.12));
  rightPaddle.y = Math.max(0, Math.min(canvas.height - rightPaddle.height, rightPaddle.y));
}

function handleWallCollision() {
  if (ball.y - ball.radius <= 0) {
    ball.y = ball.radius;
    ball.vy *= -1;
  }

  if (ball.y + ball.radius >= canvas.height) {
    ball.y = canvas.height - ball.radius;
    ball.vy *= -1;
  }
}

function handlePaddleCollision() {
  const leftHit =
    ball.x - ball.radius <= leftPaddle.x + leftPaddle.width &&
    ball.x + ball.radius >= leftPaddle.x &&
    ball.y >= leftPaddle.y &&
    ball.y <= leftPaddle.y + leftPaddle.height &&
    ball.vx < 0;

  if (leftHit) {
    const relativeIntersect =
      (ball.y - (leftPaddle.y + leftPaddle.height / 2)) / (leftPaddle.height / 2);

    ball.x = leftPaddle.x + leftPaddle.width + ball.radius;
    ball.vx = Math.abs(ball.vx) * 1.06;
    ball.vy = relativeIntersect * 6.5;
  }

  const rightHit =
    ball.x + ball.radius >= rightPaddle.x &&
    ball.x - ball.radius <= rightPaddle.x + rightPaddle.width &&
    ball.y >= rightPaddle.y &&
    ball.y <= rightPaddle.y + rightPaddle.height &&
    ball.vx > 0;

  if (rightHit) {
    const relativeIntersect =
      (ball.y - (rightPaddle.y + rightPaddle.height / 2)) / (rightPaddle.height / 2);

    ball.x = rightPaddle.x - ball.radius;
    ball.vx = -Math.abs(ball.vx) * 1.06;
    ball.vy = relativeIntersect * 6.5;
  }
}

function handleScoring() {
  if (ball.x + ball.radius < 0) {
    rightScore += 1;
    updateHud();
    resetBall(1);
  }

  if (ball.x - ball.radius > canvas.width) {
    leftScore += 1;
    updateHud();
    resetBall(-1);
  }
}

function update() {
  if (!gameRunning) return;

  moveLeftPaddle();
  moveRightPaddle();

  ball.x += ball.vx;
  ball.y += ball.vy;

  handleWallCollision();
  handlePaddleCollision();
  handleScoring();
}

function drawCenterLine() {
  ctx.strokeStyle = "rgba(255,255,255,0.18)";
  ctx.lineWidth = 2;
  ctx.setLineDash([14, 16]);
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0);
  ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.stroke();
  ctx.setLineDash([]);
}

function drawPaddle(paddle) {
  ctx.fillStyle = paddle.color;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBall() {
  ctx.beginPath();
  ctx.fillStyle = ball.color;
  ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
  ctx.fill();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#0b1120";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCenterLine();
  drawPaddle(leftPaddle);
  drawPaddle(rightPaddle);
  drawBall();
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

updateHud();
resetGame();
gameLoop();
