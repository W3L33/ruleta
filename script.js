// =====================
// VARIABLES GLOBALES
// =====================
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

// =====================
// RANDOM CRIPTOGRÁFICO
// =====================
function secureRandomIndex(max) {
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return array[0] % max;
}

// =====================
// FLECHA
// =====================
function drawArrow() {
  const inside = center * 0.2;
  ctx.save();
  ctx.fillStyle = '#000';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 6;
  ctx.beginPath();
  ctx.moveTo(center + (center - inside), center);
  ctx.lineTo(canvas.width - 10, center - 15);
  ctx.lineTo(canvas.width - 10, center + 15);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// =====================
// RULETA BASE
// =====================
function drawBaseWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(center, center, center - 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ddd';
  ctx.fill();
  ctx.strokeStyle = '#555';
  ctx.lineWidth = 3;
  ctx.stroke();
  drawArrow();
}

// =====================
// HISTORIAL
// =====================
function renderWinners() {
  const list = document.getElementById('winnersList');
  list.innerHTML = '';
  winnersHistory.forEach(name => {
    const li = document.createElement('li');
    li.textContent = name;
    list.appendChild(li);
  });
}

// =====================
// RULETA
// =====================
function drawWheel() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const slice = (Math.PI * 2) / activeNames.length;

  for (let i = 0; i < activeNames.length; i++) {
    const start = angle + i * slice;
    const end = start + slice;

    ctx.beginPath();
    ctx.moveTo(center, center);
    ctx.arc(center, center, center - 10, start, end);
    ctx.fillStyle = `hsl(${i * 360 / activeNames.length}, 80%, 60%)`;
    ctx.fill();

    ctx.save();
    ctx.translate(center, center);
    ctx.rotate(start + slice / 2);
    ctx.fillStyle = '#fff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'right';
    ctx.fillText(activeNames[i], center - 20, 5);
    ctx.restore();
  }
  drawArrow();
}

// =====================
// ANIMACIÓN
// =====================
function animate(timestamp) {
  if (!spinning) return;
  if (!startTime) startTime = timestamp;

  const elapsed = timestamp - startTime;
  const progress = Math.min(elapsed / duration, 1);
  const easeOut = 1 - Math.pow(1 - progress, 3);

  angle = startAngle + easeOut * (finalAngle - startAngle);
  drawWheel();

  if (progress < 1) {
    requestAnimationFrame(animate);
  } else {
    spinning = false;
    startTime = null;

    const winnerName = activeNames[lastWinnerIndex];
    document.getElementById('winner').textContent = `Ganador: ${winnerName}`;

    winnersHistory.push(winnerName);
    renderWinners();
  }
}

// =====================
// BOTÓN
// =====================
document.getElementById('spinBtn').addEventListener('click', () => {
  if (spinning) return;

  const text = document.getElementById('names').value.trim();

  if (text === '') {
    originalNames = [];
    activeNames = [];
    lastWinnerIndex = null;
    winnersHistory = [];
    document.getElementById('winner').textContent = '';
    renderWinners();
    drawBaseWheel();
    return;
  }

  if (activeNames.length === 0) {
    originalNames = text.split('\n').map(n => n.trim()).filter(Boolean);
    activeNames = [...originalNames];
  }

  if (lastWinnerIndex !== null) {
    activeNames.splice(lastWinnerIndex, 1);
    lastWinnerIndex = null;
  }

  if (activeNames.length < 2) {
    alert('Se necesitan al menos dos nombres');
    drawBaseWheel();
    return;
  }

  const slice = (Math.PI * 2) / activeNames.length;
  lastWinnerIndex = secureRandomIndex(activeNames.length);

  const offsetArray = new Uint32Array(1);
  crypto.getRandomValues(offsetArray);
  const intraOffset = (offsetArray[0] / 0xffffffff - 0.5) * slice * 0.8;

  const targetAngle =
    (Math.PI * 2) - (lastWinnerIndex * slice + slice / 2 + intraOffset);

  startAngle = angle % (Math.PI * 2);
  finalAngle = targetAngle + 5 * Math.PI * 2;

  document.getElementById('winner').textContent = '';
  spinning = true;
  requestAnimationFrame(animate);
});

// =====================
// VISIBILIDAD
// =====================
document.addEventListener('visibilitychange', () => {
  if (document.hidden && spinning) {
    spinning = false;
    startTime = null;
  }
});

// =====================
// INICIO
// =====================
drawBaseWheel();
