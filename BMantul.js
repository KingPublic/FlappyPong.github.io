// BMantul.js

// 0: Initial Screen
// 1: Game Screen
// 2: Game-over Screen

var ballX, ballY;               // Koordinat bola
var ballSize = 20;              // Ukuran bola
var ballColor;                  // Warna bola
var gravity = 1;                // Nilai gravitasi awal
var ballSpeedVert = 0;          // Kecepatan bola vertikal
var airFriction = 0.0001;       // Gesekan udara
var friction = 0.1;             // Gesekan permukaan

var racketColor;                // Warna raket
var racketWidth = 100;
var racketHeight = 10;
var racketBounceRate = 20;

var wallSpeed = 5;
var wallInterval = 1000;
var lastAddTime = 0;
var minGapHeight = 200;
var maxGapHeight = 300;
var wallWidth = 80;
var wallColors;

// [gapWallX, gapWallY, gapWallWidth, gapWallHeight, scored]
var walls = [];
var score = 0;
var wallRadius = 50;

var maxHealth = 100;
var health = 100;
var healthDecrease = 1;
var healthBarWidth = 60;

var ballSpeedHorizon = 10;

var gameScreen = 0;

function setup() {
  createCanvas(500, 500);

  // color() harus dipanggil di dalam setup (sesuai instruksi dosen)
  ballColor   = color(0);
  racketColor = color(0);
  wallColors  = color(255, 0, 255); // warna dinding yang sudah kamu ubah

  ballX = width / 4;
  ballY = height / 5;
}

function draw() {
  if (gameScreen === 0) {
    initScreen();
  } else if (gameScreen === 1) {
    gamePlayScreen();
  } else if (gameScreen === 2) {
    gameOverScreen();
  }
}

function gameOver() {
  gameScreen = 2;
}

// ========== SCREEN CONTENTS ==========

function initScreen() {
  background(0);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(20);
  text("Klik untuk memulai", width / 2, height / 2);
}

function gamePlayScreen() {
  background(255);
  drawBall();
  applyGravity();
  keepInScreen();
  drawRacket();
  watchRacketBounce();
  applyHorizontalSpeed();
  wallAdder();
  wallHandler();
  drawHealthBar();
  printScore();
}

function gameOverScreen() {
  background(0);
  textAlign(CENTER, CENTER);
  fill(255);
  textSize(30);
  text("Game Over", width / 2, height / 2 - 20);
  textSize(15);
  text("Click to Restart", width / 2, height / 2 + 10);
  printScore();
}

// ========== INPUTS ==========

function mousePressed() {
  if (gameScreen === 0) {
    startGame();
  } else if (gameScreen === 2) {
    restart();
  }
}

function startGame() {
  gameScreen = 1;
}

function restart() {
  score = 0;
  health = maxHealth;
  ballX = width / 4;
  ballY = height / 5;
  lastAddTime = 0;
  walls = [];      // sama seperti walls.clear()
  gameScreen = 0;
}

// ========== BALL PHYSICS ==========

function drawBall() {
  fill(ballColor);
  ellipse(ballX, ballY, ballSize, ballSize);
}

function applyGravity() {
  ballSpeedVert += gravity;
  ballY += ballSpeedVert;
  ballSpeedVert -= ballSpeedVert * airFriction;
}

function makeBounceBottom(surface) {
  ballY = surface - ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function makeBounceTop(surface) {
  ballY = surface + ballSize / 2;
  ballSpeedVert *= -1;
  ballSpeedVert -= ballSpeedVert * friction;
}

function keepInScreen() {
  // bawah
  if (ballY + ballSize / 2 > height) {
    makeBounceBottom(height);
  }
  // atas
  if (ballY - ballSize / 2 < 0) {
    makeBounceTop(0);
  }
  // kiri
  if (ballX - ballSize / 2 < 0) {
    makeBounceLeft(0);
  }
  // kanan
  if (ballX + ballSize / 2 > width) {
    makeBounceRight(width);
  }
}

function applyHorizontalSpeed() {
  ballX += ballSpeedHorizon;
  ballSpeedHorizon -= ballSpeedHorizon * airFriction;
}

function makeBounceLeft(surface) {
  ballX = surface + ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

function makeBounceRight(surface) {
  ballX = surface - ballSize / 2;
  ballSpeedHorizon *= -1;
  ballSpeedHorizon -= ballSpeedHorizon * friction;
}

// ========== RACKET ==========

function drawRacket() {
  fill(racketColor);
  rectMode(CENTER);
  rect(mouseX, mouseY, racketWidth, racketHeight);
}

function watchRacketBounce() {
  var overhead = mouseY - pmouseY;

  if (
    ballX + ballSize / 2 > mouseX - racketWidth / 2 &&
    ballX - ballSize / 2 < mouseX + racketWidth / 2
  ) {
    if (dist(ballX, ballY, ballX, mouseY) <= ballSize / 2 + Math.abs(overhead)) {
      makeBounceBottom(mouseY);

      // raket gerak naik
      if (overhead < 0) {
        ballY += overhead;
        ballSpeedVert += overhead;
      }

      ballSpeedHorizon = (ballX - mouseX) / 5;
    }
  }
}

// ========== WALLS ==========

function wallAdder() {
  if (millis() - lastAddTime > wallInterval) {
    var randHeight = round(random(minGapHeight, maxGapHeight));
    var randY = round(random(0, height - randHeight));

    // [gapWallX, gapWallY, gapWallWidth, gapWallHeight, scored]
    var randWall = [width, randY, wallWidth, randHeight, 0];
    walls.push(randWall);
    lastAddTime = millis();
  }
}

function wallHandler() {
  // loop mundur supaya aman kalau ada splice
  for (var i = walls.length - 1; i >= 0; i--) {
    wallRemover(i);
    wallMover(i);
    wallDrawer(i);
    watchWallCollision(i);
  }
}

function wallDrawer(index) {
  var wall = walls[index];

  var gapWallX = wall[0];
  var gapWallY = wall[1];
  var gapWallWidth = wall[2];
  var gapWallHeight = wall[3];

  rectMode(CORNER);
  fill(wallColors);

  // dinding atas
  rect(gapWallX, 0, gapWallWidth, gapWallY, 0, 0, wallRadius, wallRadius);

  // dinding bawah
  rect(
    gapWallX,
    gapWallY + gapWallHeight,
    gapWallWidth,
    height - (gapWallY + gapWallHeight),
    wallRadius,
    wallRadius,
    0,
    0
  );
}

function wallMover(index) {
  var wall = walls[index];
  wall[0] -= wallSpeed;
}

function wallRemover(index) {
  var wall = walls[index];
  if (wall[0] + wall[2] <= 0) {
    walls.splice(index, 1);   // sama seperti walls.remove(index)
  }
}

function watchWallCollision(index) {
  var wall = walls[index];

  var gapWallX = wall[0];
  var gapWallY = wall[1];
  var gapWallWidth = wall[2];
  var gapWallHeight = wall[3];
  var wallScored = wall[4];

  var wallTopX = gapWallX;
  var wallTopY = 0;
  var wallTopWidth = gapWallWidth;
  var wallTopHeight = gapWallY;

  var wallBottomX = gapWallX;
  var wallBottomY = gapWallY + gapWallHeight;
  var wallBottomWidth = gapWallWidth;
  var wallBottomHeight = height - (gapWallY + gapWallHeight);

  // tabrak dinding atas
  if (
    ballX + ballSize / 2 > wallTopX &&
    ballX - ballSize / 2 < wallTopX + wallTopWidth &&
    ballY + ballSize / 2 > wallTopY &&
    ballY - ballSize / 2 < wallTopY + wallTopHeight
  ) {
    decreaseHealth();
  }

  // tabrak dinding bawah
  if (
    ballX + ballSize / 2 > wallBottomX &&
    ballX - ballSize / 2 < wallBottomX + wallBottomWidth &&
    ballY + ballSize / 2 > wallBottomY &&
    ballY - ballSize / 2 < wallBottomY + wallBottomHeight
  ) {
    decreaseHealth();
  }

  // skor: bola berhasil lewat gap dan tembok ini belum pernah diberi skor
  if (ballX > gapWallX + gapWallWidth / 2 && wallScored === 0) {
    wallScored = 1;
    wall[4] = 1;
    addScore();
  }
}

// ========== HEALTH & SCORE ==========

function drawHealthBar() {
  noStroke();
  rectMode(CORNER);
  fill(236, 240, 241);
  rect(ballX - healthBarWidth / 2, ballY - 30, healthBarWidth, 5);

  if (health > 60) {
    fill(46, 204, 113);
  } else if (health > 30) {
    fill(230, 126, 34);
  } else {
    fill(231, 76, 60);
  }

  rect(
    ballX - healthBarWidth / 2,
    ballY - 30,
    healthBarWidth * (health / maxHealth),
    5
  );
}

function decreaseHealth() {
  health -= healthDecrease;
  if (health <= 0) {
    gameOver();
  }
}

function addScore() {      // dulu score(), sekarang addScore() (sesuai slide)
  score++;
}

function printScore() {
  textAlign(CENTER, CENTER);
  if (gameScreen === 1) {
    fill(0);
    textSize(30);
    text(score, width / 2, 30);
  } else if (gameScreen === 2) {
    fill(255);
    textSize(30);
    text("Score: " + score, width / 2, height / 2 + 80);
  }
}
