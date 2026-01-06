const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const center = canvas.width / 2;

let originalNames = [];
let activeNames = [];
let lastWinnerIndex = null;
let winnersHistory = [];

let angle = 0;
let spinning = false;
let startTime = null;
const duration = 3500;
let startAngle = 0;
let finalAngle = 0;

/* =====================
   FONDO NEÓN ONDULADO
===================== */
let waveOffset = 0;

function drawNeonWaves() {
  ctx.fillStyle = "#000";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = `hsla(${180 + i * 30}, 100%, 60%, 0.7)`;
    ctx.shadowColor = ctx.strokeStyle;
    ctx.shadowBlur = 20;

    for (let x = 0; x <= canvas.width; x += 10) {
      const y =
        center +
        Math.sin((x + waveOffset + i * 50) * 0.02) * (20 + i * 6);
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  waveOffset += 2;
  ctx.shadowBlur = 0;
}

/* =====================
   RANDOM CRIPTO
===================== */
function secureRandomIndex(max) {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] % max;
}

/* =====================
   FLECHA
===================== */
function drawArrow() {
  ctx.save();
  ctx.fillStyle = '#fff';
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 15;
  ctx.beginPath();
  ctx.moveTo(canvas.width - 10, center);
  ctx.lineTo(canvas.width - 40, center - 15);
  ctx.lineTo(canvas.width - 40, center + 15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/* =====================
   RULETA
===================== */
function drawWheel() {
  drawNeonWaves();

  const slice = (Math.PI * 2) / activeNames.length;

  for (let i = 0; i < activeNames.length; i++) {
    const start = angle + i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, center - 10, start, end);
    ctx.fillStyle = `hsla(${i * 360 / activeNames.length}, 90%, 55%, 0.85)`;
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    ctx.fillText(activeNames[i], center - 20, 5);
    ctx.restore();
  }

  drawArrow();
}

/* =====================
   ANIMACIÓN
===================== */
function animate(timestamp) {
  if (!spinning) return;
  if (!startTime) startTime = timestamp;

  const progress = Math.min((timestamp - startTime) / duration, 1);
  const easeOut = 1 - Math.pow(1 - progress, 3);

  angle = startAngle + easeOut * (finalAngle - startAngle);
  drawWheel();

  if (progress < 1) {
    requestAnimationFrame(animate);
  } else {
    spinning = false;
    startTime = null;
    const winner = activeNames[lastWinnerIndex];
    document.getElementById('winner').textContent = `Ganador: ${winner}`;
    winnersHistory.push(winner);
    renderWinners();
  }
}

/* =====================
   HISTORIAL
===================== */
function renderWinners() {
  const list = document.getElementById('winnersList');
  list.innerHTML = '';
  winnersHistory.forEach(w => {
    const li = document.createElement('li');
    li.textContent = w;
    list.appendChild(li);
  });
}

/* =====================
   BOTÓN
===================== */
document.getElementById('spinBtn').addEventListener('click', () => {
  if (spinning) return;

  const text = document.getElementById('names').value.trim();

  if (!text) return;

  if (activeNames.length === 0) {
    originalNames = text.split('\n').map(n => n.trim()).filter(Boolean);
    activeNames = [...originalNames];
  }

  if (lastWinnerIndex !== null) {
    activeNames.splice(lastWinnerIndex, 1);
    lastWinnerIndex = null;
  }

  if (activeNames.length < 2) return;

  const slice = (Math.PI * 2) / activeNames.length;
  lastWinnerIndex = secureRandomIndex(activeNames.length);

  const target =
    (Math.PI * 2) -
    (lastWinnerIndex * slice + slice / 2);

  startAngle = angle;
  finalAngle = target + 5 * Math.PI * 2;

  spinning = true;
  requestAnimationFrame(animate);
});

/* =====================
   LOOP DE FONDO
===================== */
function idleLoop() {
  if (!spinning) drawNeonWaves();
  requestAnimationFrame(idleLoop);
}

idleLoop();

