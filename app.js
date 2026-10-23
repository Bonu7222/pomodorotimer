const WORK_TIME = 25 * 60;
const BREAK_TIME = 5 * 60;

const canvas = document.getElementById('plantCanvas');
const ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;

const ui = {
  sessions: document.getElementById('sessions'),
  modeLabel: document.getElementById('modeLabel'),
  timeDisplay: document.getElementById('timeDisplay'),
  primaryBtn: document.getElementById('primaryBtn'),
  resetBtn: document.getElementById('resetBtn')
};

let timeLeft = WORK_TIME;
let totalTime = WORK_TIME;
let isRunning = false;
let isBreak = false;
let timerId = null;
let audioCtx = null;

let sessionsCount = parseInt(localStorage.getItem('zenFocusSessions') || '0', 10);
let lastSessionDate = localStorage.getItem('zenFocusDate');

const today = new Date().toDateString();
if (lastSessionDate !== today) {
  sessionsCount = 0;
  localStorage.setItem('zenFocusDate', today);
  localStorage.setItem('zenFocusSessions', '0');
}
ui.sessions.textContent = sessionsCount;

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
}

function playChime() {
  if (!audioCtx) return;
  const now = audioCtx.currentTime;
  
  [440, 554.37, 659.25].forEach((freq, index) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    
    const startTime = now + index * 0.15;
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.5);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(startTime);
    osc.stop(startTime + 1.5);
  });
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function updateDisplay() {
  ui.timeDisplay.textContent = formatTime(timeLeft);
  
  if (isBreak) {
    ui.modeLabel.textContent = 'Break';
    ui.modeLabel.classList.add('break');
  } else {
    ui.modeLabel.textContent = 'Work';
    ui.modeLabel.classList.remove('break');
  }
}

function drawPlant(growth, bloom) {
  ctx.clearRect(0, 0, 64, 64);
  
  ctx.fillStyle = '#1a1510';
  ctx.fillRect(0, 56, 64, 8);
  
  ctx.fillStyle = '#2b261f';
  ctx.fillRect(0, 60, 64, 4);

  if (growth <= 0) {
    ctx.fillStyle = '#3a6146';
    ctx.fillRect(30, 58, 4, 2);
    return;
  }

  const stemHeight = Math.floor(growth * 36);
  const startY = 58;
  const endY = startY - stemHeight;
  const cx = 32;

  ctx.fillStyle = '#4a7c59';
  ctx.fillRect(cx - 1, endY, 2, stemHeight);

  const leafPositions = [0.25, 0.45, 0.65, 0.85];
  leafPositions.forEach((pos, i) => {
    if (growth > pos) {
      const leafY = startY - Math.floor(stemHeight * pos);
      const dir = i % 2 === 0 ? -1 : 1;
      const leafSize = Math.floor(growth * 4) + 2;
      
      ctx.fillStyle = '#5a9169';
      for (let l = 0; l < leafSize; l++) {
        ctx.fillRect(cx + (dir * l), leafY - Math.floor(l / 2), 1, 1);
      }
    }
  });

  if (bloom) {
    const topX = cx;
    const topY = endY - 2;
    const r = 4;
    
    for (let y = -r; y <= r; y++) {
      for (let x = -r; x <= r; x++) {
        if (x*x + y*y <= r*r) {
          if (Math.abs(x) + Math.abs(y) <= r + 1) {
            ctx.fillStyle = '#e27d60';
            ctx.fillRect(topX + x, topY + y, 1, 1);
          }
        }
      }
    }
    ctx.fillStyle = '#ffd4dd';
    ctx.fillRect(topX - 1, topY - 1, 2, 2);
  }
}

function tick() {
  if (timeLeft > 0) {
    timeLeft--;
    updateDisplay();
    
    const growth = (totalTime - timeLeft) / totalTime;
    drawPlant(growth, false);
  } else {
    switchMode();
  }
}

function switchMode() {
  playChime();
  
  if (!isBreak) {
    isBreak = true;
    totalTime = BREAK_TIME;
    timeLeft = BREAK_TIME;
    
    sessionsCount++;
    ui.sessions.textContent = sessionsCount;
    localStorage.setItem('zenFocusSessions', sessionsCount.toString());
    
    drawPlant(1, true);
  } else {
    isBreak = false;
    totalTime = WORK_TIME;
    timeLeft = WORK_TIME;
    
    drawPlant(0, false);
  }
  
  updateDisplay();
  updatePrimaryBtn();
  
  if (isRunning) {
    clearInterval(timerId);
    timerId = setInterval(tick, 1000);
  }
}

function updatePrimaryBtn() {
  ui.primaryBtn.textContent = isRunning ? 'Pause' : 'Start';
}

function toggleTimer() {
  if (timeLeft <= 0) return;
  
  if (!isRunning) {
    initAudio();
    isRunning = true;
    timerId = setInterval(tick, 1000);
  } else {
    isRunning = false;
    clearInterval(timerId);
  }
  updatePrimaryBtn();
}

function resetTimer() {
  isRunning = false;
  clearInterval(timerId);
  isBreak = false;
  totalTime = WORK_TIME;
  timeLeft = WORK_TIME;
  
  updateDisplay();
  updatePrimaryBtn();
  drawPlant(0, false);
}

ui.primaryBtn.addEventListener('click', toggleTimer);
ui.resetBtn.addEventListener('click', resetTimer);

updateDisplay();
drawPlant(0, false);