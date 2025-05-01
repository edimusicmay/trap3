function setupStartButton() {
  const startButton = document.createElement('button');
  startButton.textContent = 'Start Game';
  startButton.style.position = 'absolute';
  startButton.style.left = '50%';
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

  Promise.all([
    document.fonts.load("64px StarJHol"),
    document.fonts.load("32px StarJedi")
  ]).then(() => {
    drawStartScreen();
    const scaleX = canvas.width / BASE_WIDTH;
    const scaleY = canvas.height / BASE_HEIGHT;
    const scale = Math.min(scaleX, scaleY);
    const yellowBottom = 340 * scale + 28 * scale;
    const whiteTop = 600 * scale;
    const buttonTop = (yellowBottom + whiteTop) / 2;
    requestAnimationFrame(() => {
      const buttonHeight = startButton.offsetHeight;
      startButton.style.top = `${buttonTop - buttonHeight / 2}px`;
    });
  });
}

function drawStartScreen() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawStars(1);

  const scaleX = canvas.width / BASE_WIDTH;
  const scaleY = canvas.height / BASE_HEIGHT;
  const scale = Math.min(scaleX, scaleY);

  ctx.fillStyle = yellow;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  ctx.font = `${64 * scale}px StarJHol`;
  ctx.fillText("iT'S A TRAP", canvas.width / 2, 100 * scale);

  ctx.font = `bold ${36 * scale}px StarJedi`;
  ctx.fillText("(Game)", canvas.width / 2, 180 * scale);

  ctx.font = `bold ${28 * scale}px StarJedi`;
  ctx.fillText("By Three and a Half", canvas.width / 2, 220 * scale);
  ctx.fillText("Featuring Dave Sear", canvas.width / 2, 260 * scale);
  ctx.fillText("Produced by Mono Elkin", canvas.width / 2, 300 * scale);
  ctx.fillText("Mastered by Minus Burger", canvas.width / 2, 340 * scale);

  ctx.fillStyle = white;
  setSpaceFont(16 * scale);
  ctx.fillText("Highest score uploaded to insta story wins free merch!", canvas.width / 2, 600 * scale);
  ctx.fillText("If audio and game seems out of sync refresh once.", canvas.width / 2, 630 * scale);
  ctx.fillText("If any other issues occur please contact us.", canvas.width / 2, 660 * scale);
}