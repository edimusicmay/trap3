function setupStartButton() {
  const startButton = document.createElement('button');
  startButton.textContent = 'Start Game';
  startButton.style.position = 'absolute';
  startButton.style.left = '50%';
  startButton.style.top = '460px'; // Now centered between yellow and white text
  startButton.style.transform = 'translateX(-50%)';
  startButton.style.fontSize = '24px';
  startButton.style.padding = '10px 20px';
  startButton.style.color = '#FFFF00';
  startButton.style.backgroundColor = 'black';
  startButton.style.border = '2px solid #FFFF00';
  startButton.style.zIndex = '10';
  startButton.style.fontWeight = 'bold';
  document.body.appendChild(startButton);

  startButton.addEventListener('click', () => {
    document.body.removeChild(startButton);
    startGame();
  });

  drawStartScreen();
}

function drawStartScreen() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStars(1);

  const scaleX = canvas.width / BASE_WIDTH;
  const scaleY = canvas.height / BASE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  ctx.fillStyle = yellow;
  setSpaceFont(36 * scale);
  ctx.fillText("It's a Trap (Game)", canvas.width / 2, 120 * scale);
  ctx.fillText("By Three and a Half", canvas.width / 2, 170 * scale);
  ctx.fillText("Featuring Dave Sear", canvas.width / 2, 220 * scale);
  ctx.fillText("Produced by Mono Elkin", canvas.width / 2, 270 * scale);
  ctx.fillText("Mastered by Minus Burger", canvas.width / 2, 320 * scale);

  ctx.fillStyle = white;
  setSpaceFont(16 * scale);
  ctx.fillText("Highest score uploaded to insta story wins free merch!", canvas.width / 2, 600 * scale);
  ctx.fillText("If audio and game seems out of sync refresh once.", canvas.width / 2, 630 * scale);
  ctx.fillText("If any other issues occur please contact us.", canvas.width / 2, 660 * scale);
}