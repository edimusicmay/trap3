const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const BASE_WIDTH = 600;
const BASE_HEIGHT = 800;
const baseLaneWidth = 150;
const noteWidth = 50;
const noteHeight = 20;
const noteSpeed = 5;
const hitboxTopBase = 595;
const hitboxHeight = 40;
const bufferHeight = hitboxHeight;

const keyBindings = { 'a': 0, 's': 1, 'd': 2, 'f': 3 };
const laneColors = ['#ff0000', '#00ff00', '#00bfff', '#800080'];
const white = '#FFFF00'; // all text yellow now

const offsetMs = 0;
let notes = [];
let currentNoteIndex = 0;
let score = 0;
let feedbackText = ["", "", "", ""];
let feedbackTimers = [0, 0, 0, 0];
let scoreChangeText = "";
let scoreChangeTimer = 0;
let flashScreenRed = false;
let flashTimer = 0;
let keyPressed = [false, false, false, false];
let startTime = null;
let music;
let lastNoteTime = 0;
let gameEnded = false;

let isLoading = false;
let loadingAnimationId = null;

// Stats
let perfectCount = 0;
let earlyCount = 0;
let lateCount = 0;
let missedCount = 0;

// Starfield
const stars = Array.from({ length: 100 }, () => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  radius: Math.random() * 1.5 + 0.5
}));

function drawStars(deltaTime) {
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  stars.forEach(star => {
    star.y += 0.3 * deltaTime;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  });
}

// Glow helpers
function setGlow(color) {
  ctx.shadowBlur = 20;
  ctx.shadowColor = color;
}

function clearGlow() {
  ctx.shadowBlur = 0;
}

function setSpaceFont(sizePx) {
  ctx.font = `bold ${sizePx}px Arial, sans-serif`;
  ctx.fillStyle = white;
  ctx.textAlign = 'center';
}

let spawnEvents = [];
fetch('notes.json')
  .then(response => response.json())
  .then(data => {
    spawnEvents = data;
    if (spawnEvents.length > 0) {
      lastNoteTime = spawnEvents[spawnEvents.length - 1].time;
    }
    setupStartButton();
  });

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function setupStartButton() {
  const startButton = document.createElement('button');
  startButton.textContent = 'Start Game';
  startButton.style.position = 'absolute';
  startButton.style.top = '50%';
  startButton.style.left = '50%';
  startButton.style.transform = 'translate(-50%, -50%)';
  startButton.style.fontSize = '24px';
  startButton.style.padding = '10px 20px';
  startButton.style.color = '#FFFF00';
  startButton.style.backgroundColor = 'black';
  startButton.style.border = '2px solid #FFFF00';
  startButton.style.zIndex = '10';
  startButton.style.fontWeight = 'bold';
  document.body.appendChild(startButton);

  startButton.addEventListener('click', () => {
    isLoading = true;
    startLoadingScreen();
    document.body.removeChild(startButton);
    startGame();
  });
}
let lastTimestamp = null;

function startGame(startButton) {
  music = new Audio();
  music.src = 'assets/Three_And_A_Half-Its_A_Trap_MASTER_07.04.25.wav';

  music.addEventListener('canplaythrough', () => {
    if (startButton) document.body.removeChild(startButton);
    isLoading = false;
    cancelAnimationFrame(loadingAnimationId);
    music.play();
    startTime = performance.now();
    requestAnimationFrame(gameLoop);
  }, { once: true });
}


function startLoadingScreen() {
    function drawLoading() {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSpaceFont(48);
        ctx.fillText('Loading...', canvas.width / 2, canvas.height / 2);
        loadingAnimationId = requestAnimationFrame(drawLoading);
    }
    drawLoading();
}

function fadeOutAndEnd() {
  let fadeDuration = 2000;
  let fadeStart = performance.now();

  function fadeStep(now) {
    let progress = (now - fadeStart) / fadeDuration;
    if (progress < 1) {
      music.volume = Math.max(0, 1 - progress);
      requestAnimationFrame(fadeStep);
    } else {
      music.volume = 0;
      showGameOverScreen();
    }
  }

  requestAnimationFrame(fadeStep);
}

function showGameOverScreen() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const scaleX = canvas.width / BASE_WIDTH;
  const scaleY = canvas.height / BASE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  ctx.fillStyle = white;
  ctx.font = `bold ${48 * scale}px Arial, sans-serif`;
  ctx.textAlign = 'center';
  ctx.fillText('Game Over', canvas.width / 2, 150 * scale);

  ctx.font = `bold ${28 * scale}px Arial, sans-serif`;
  ctx.fillText(`Perfect: ${perfectCount}`, canvas.width / 2, 300 * scale);
  ctx.fillText(`Early: ${earlyCount}`, canvas.width / 2, 350 * scale);
  ctx.fillText(`Late: ${lateCount}`, canvas.width / 2, 400 * scale);
  ctx.fillText(`Missed: ${missedCount}`, canvas.width / 2, 450 * scale);

  const playAgainButton = document.createElement('button');
  playAgainButton.textContent = 'Play Again?';
  playAgainButton.style.position = 'absolute';
  playAgainButton.style.top = '520px';
  playAgainButton.style.left = 'calc(50% - 70px)';
  playAgainButton.style.fontSize = '24px';
  playAgainButton.style.padding = '10px 20px';
  playAgainButton.style.color = '#FFFF00';
  playAgainButton.style.backgroundColor = 'black';
  playAgainButton.style.border = '2px solid #FFFF00';
  playAgainButton.style.zIndex = '10';
  playAgainButton.style.fontWeight = 'bold';
  document.body.appendChild(playAgainButton);

  playAgainButton.addEventListener('click', () => {
    location.reload();
  });
}

function gameLoop(timestamp) {
  if (!lastTimestamp) lastTimestamp = timestamp;
  let deltaTime = (timestamp - lastTimestamp) / 16.6667;
  lastTimestamp = timestamp;

  let elapsed = timestamp - startTime + offsetMs;

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.scale(canvas.width / BASE_WIDTH, canvas.height / BASE_HEIGHT);

  drawStars(deltaTime);

  ctx.fillStyle = flashScreenRed ? 'red' : 'rgba(0, 0, 0, 0)';
  ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

  let laneWidth = BASE_WIDTH / 4;
  let lanes = [0, laneWidth, laneWidth * 2, laneWidth * 3];
  let hitboxTop = hitboxTopBase;

  while (currentNoteIndex < spawnEvents.length && elapsed >= spawnEvents[currentNoteIndex].time) {
    let event = spawnEvents[currentNoteIndex];
    notes.push({
      lane: event.lane,
      x: lanes[event.lane] + (laneWidth - noteWidth) / 2,
      y: -noteHeight,
      hit: false,
      judged: false
    });
    currentNoteIndex++;
  }

  notes.forEach(note => {
    note.y += noteSpeed * deltaTime;
    setGlow(laneColors[note.lane]);
    ctx.fillStyle = note.hit ? white : laneColors[note.lane];
    ctx.fillRect(note.x, note.y, noteWidth, noteHeight);
    clearGlow();
  });

  notes.forEach(note => {
    if (!note.hit && !note.judged && note.y > hitboxTop + hitboxHeight + bufferHeight) {
      missedCount++;
      note.judged = true;
    }
  });

  for (let i = 0; i < 4; i++) {
    let laneX = lanes[i];
    ctx.fillStyle = keyPressed[i] ? white : 'rgba(0,0,0,0)';
    ctx.fillRect(laneX, hitboxTop, laneWidth, hitboxHeight);

    setGlow(laneColors[i]);
    ctx.strokeStyle = laneColors[i];
    ctx.lineWidth = 4;
    ctx.strokeRect(laneX, hitboxTop, laneWidth, hitboxHeight);
    clearGlow();

    setSpaceFont(30);
    ctx.fillStyle = white;
    ctx.fillText('ASDF'[i], laneX + laneWidth / 2, hitboxTop + hitboxHeight / 1.5);

    if (feedbackText[i]) {
      setSpaceFont(24);
      ctx.fillText(feedbackText[i], laneX + laneWidth / 2, hitboxTop - 20);
    }
  }

  let now = performance.now();
  for (let i = 0; i < 4; i++) {
    if (feedbackTimers[i] && now - feedbackTimers[i] > 800) {
      feedbackText[i] = "";
    }
  }

  if (flashScreenRed && now - flashTimer > 100) {
    flashScreenRed = false;
  }

  document.getElementById('score').textContent = "Score: " + score;

  if (scoreChangeText) {
    setSpaceFont(24);
    ctx.fillText(scoreChangeText, 50, 80);
    if (now - scoreChangeTimer > 800) {
      scoreChangeText = "";
    }
  }

  if (!gameEnded && elapsed > lastNoteTime + 5000) {
    gameEnded = true;
    fadeOutAndEnd();
  }

  if (!gameEnded) {
    requestAnimationFrame(gameLoop);
  }
}

// Inputs (keyboard + touch)
document.addEventListener('keydown', (e) => {
  let key = e.key.toLowerCase();
  if (keyBindings.hasOwnProperty(key)) {
    let lane = keyBindings[key];
    keyPressed[lane] = true;
    let hit = false;
    for (let note of notes) {
      if (note.lane === lane && !note.hit) {
        if (note.y >= hitboxTopBase && note.y <= hitboxTopBase + hitboxHeight) {
          note.hit = true; perfectCount++; score += 10; feedbackText[lane] = "PERFECT"; scoreChangeText = "+10"; scoreChangeTimer = performance.now(); hit = true; break;
        } else if (note.y >= hitboxTopBase - bufferHeight && note.y < hitboxTopBase) {
          note.hit = true; earlyCount++; score += 5; feedbackText[lane] = "EARLY"; scoreChangeText = "+5"; scoreChangeTimer = performance.now(); hit = true; break;
        } else if (note.y > hitboxTopBase + hitboxHeight && note.y <= hitboxTopBase + hitboxHeight + bufferHeight) {
          note.hit = true; lateCount++; score += 5; feedbackText[lane] = "LATE"; scoreChangeText = "+5"; scoreChangeTimer = performance.now(); hit = true; break;
        }
      }
    }
    if (!hit) {
      flashScreenRed = true; flashTimer = performance.now(); score -= 5; scoreChangeText = "-5"; scoreChangeTimer = performance.now();
    }
    feedbackTimers[lane] = performance.now();
  }
});

document.addEventListener('keyup', (e) => {
  let key = e.key.toLowerCase();
  if (keyBindings.hasOwnProperty(key)) {
    keyPressed[keyBindings[key]] = false;
  }
});

canvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  for (let touch of e.touches) {
    const touchX = touch.clientX;
    const laneWidth = canvas.width / 4;
    const lane = Math.floor(touchX / laneWidth);
    if (lane >= 0 && lane < 4) {
      const key = 'asdf'[lane];
      const event = new KeyboardEvent('keydown', { key: key });
      document.dispatchEvent(event);
    }
  }
}, { passive: false });

canvas.addEventListener('touchend', (e) => {
  e.preventDefault();
  for (let lane = 0; lane < 4; lane++) {
    const key = 'asdf'[lane];
    const event = new KeyboardEvent('keyup', { key: key });
    document.dispatchEvent(event);
  }
}, { passive: false });
