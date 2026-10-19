const deskArea = document.querySelector('.desks');
const desks = [...document.querySelectorAll('.desk')];
const room = document.querySelector('.room');
const doorZone = document.querySelector('.door-zone');
const doorZoneCounter = document.querySelector('.door-zone-counter');
const roomTimer = document.querySelector('.room-timer');
const appShell = document.querySelector('.app-shell');
const timerQuestion = document.querySelector('.timer-question');
const timerQuestionTitle = document.querySelector('#timer-question-title');
const answerButtons = document.querySelectorAll('.answer-buttons button');
let layoutIsFrozen = false;
let safetyQuestionIndex = 0;
const answerLog = [];
window.answerLog = answerLog;
sessionStorage.removeItem('Answer log');

const safetyQuestions = [
  'Did you close the door?',
  'Did you turn off the lights?',
  'Did you block the door?',
  'Did you turn off the TV/projecter?',
  'Did you hide in a cabinet?',
];

function recordAnswer(answer) {
  answerLog.push({
    question: safetyQuestions[safetyQuestionIndex],
    answer,
  });
  sessionStorage.setItem('Answer log', JSON.stringify(answerLog));
}

answerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    recordAnswer(button.dataset.answer);

    if (safetyQuestionIndex === safetyQuestions.length - 1) {
      window.location.href = '../end-page2.html';
      return;
    }

    safetyQuestionIndex += 1;
    timerQuestionTitle.textContent = safetyQuestions[safetyQuestionIndex];
  });
});

const startingTimes = [30, 60, 120];
let secondsRemaining = startingTimes[Math.floor(Math.random() * startingTimes.length)];

function updateTimer() {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = String(secondsRemaining % 60).padStart(2, '0');
  roomTimer.textContent = `Timer: ${minutes}:${seconds}`;
  room.classList.toggle('timer-warning', secondsRemaining > 0 && secondsRemaining <= 10);
}

updateTimer();
function finishTimer() {
  window.clearInterval(timerInterval);
  room.classList.remove('timer-warning');
  appShell.classList.add('timer-complete');
  timerQuestion.setAttribute('aria-hidden', 'false');
}

const timerInterval = window.setInterval(() => {
  if (secondsRemaining === 0) {
    finishTimer();
    return;
  }

  secondsRemaining -= 1;
  updateTimer();
  if (secondsRemaining === 0) finishTimer();
}, 1000);

function updateDoorZoneCounter() {
  const zone = doorZone.getBoundingClientRect();
  const chairsInZone = desks.filter((desk) => {
    const bounds = desk.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    return centerX >= zone.left && centerX <= zone.right && centerY >= zone.top && centerY <= zone.bottom;
  }).length;

  doorZoneCounter.textContent = `Chairs: ${chairsInZone}`;
}

function freezeDeskLayout() {
  if (layoutIsFrozen) return;

  const area = deskArea.getBoundingClientRect();
  const positions = desks.map((desk) => {
    const bounds = desk.getBoundingClientRect();
    return { desk, left: bounds.left - area.left, top: bounds.top - area.top };
  });

  positions.forEach(({ desk, left, top }) => {
    desk.classList.add('is-positioned');
    desk.style.left = `${left}px`;
    desk.style.top = `${top}px`;
  });
  layoutIsFrozen = true;
}

desks.forEach((desk) => {
  desk.addEventListener('pointerdown', (event) => {
    freezeDeskLayout();
    desk.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = desk.offsetLeft;
    const startTop = desk.offsetTop;

    const moveDesk = (moveEvent) => {
      const roomBounds = room.getBoundingClientRect();
      const areaBounds = deskArea.getBoundingClientRect();
      const minLeft = roomBounds.left - areaBounds.left;
      const minTop = roomBounds.top - areaBounds.top;
      const maxLeft = roomBounds.right - areaBounds.left - desk.offsetWidth;
      const maxTop = roomBounds.bottom - areaBounds.top - desk.offsetHeight;
      const left = Math.min(maxLeft, Math.max(minLeft, startLeft + moveEvent.clientX - startX));
      const top = Math.min(maxTop, Math.max(minTop, startTop + moveEvent.clientY - startY));
      desk.style.left = `${left}px`;
      desk.style.top = `${top}px`;
      updateDoorZoneCounter();
    };

    desk.addEventListener('pointermove', moveDesk);
    desk.addEventListener('pointerup', () => desk.removeEventListener('pointermove', moveDesk), { once: true });
    desk.addEventListener('pointercancel', () => desk.removeEventListener('pointermove', moveDesk), { once: true });
  });
});

window.addEventListener('resize', updateDoorZoneCounter);
window.addEventListener('load', updateDoorZoneCounter);

const cabinets = document.querySelectorAll('.cabinet');

function resetCabinets() {
  cabinets.forEach((cabinet) => {
    const number = cabinet.querySelector('.cabinet-name').textContent.trim();
    cabinet.classList.remove('is-open');
    cabinet.setAttribute('aria-expanded', 'false');
    cabinet.setAttribute('aria-label', `Open ${number.toLowerCase()} doors`);
  });
}

resetCabinets();
window.addEventListener('pageshow', resetCabinets);

cabinets.forEach((cabinet) => {
  cabinet.addEventListener('click', (event) => {
    const prompt = event.target.closest('.cabinet-prompt');
    if (prompt) {
      cabinet.classList.add('is-hidden');
      prompt.setAttribute('aria-pressed', 'true');
      return;
    }

    const isOpen = cabinet.classList.toggle('is-open');
    const number = cabinet.querySelector('.cabinet-name').textContent.trim();
    cabinet.setAttribute('aria-expanded', String(isOpen));
    cabinet.setAttribute('aria-label', `${isOpen ? 'Close' : 'Open'} ${number.toLowerCase()} doors`);
  });
});

const door = document.querySelector('.door');

door.addEventListener('click', () => {
  const isClosed = door.classList.toggle('is-closed');
  door.setAttribute('aria-pressed', String(isClosed));
  door.setAttribute('aria-label', isClosed ? 'Open door' : 'Close door');
});

const doorLock = document.querySelector('.door-lock');

doorLock.addEventListener('click', () => {
  const isLocked = doorLock.getAttribute('aria-pressed') !== 'true';
  doorLock.setAttribute('aria-pressed', String(isLocked));
  doorLock.setAttribute('aria-label', isLocked ? 'Unlock door' : 'Lock door');
});

const projectorComputer = document.querySelector('.projector-computer');

projectorComputer.addEventListener('click', () => {
  const projectorIsOn = room.classList.toggle('projector-off') === false;
  projectorComputer.setAttribute('aria-pressed', String(projectorIsOn));
  projectorComputer.setAttribute('aria-label', projectorIsOn ? 'Turn projector off' : 'Turn projector on');
});

const lightSwitch = document.querySelector('.light-switch');

lightSwitch.addEventListener('click', () => {
  const lightsAreOn = !room.classList.toggle('lights-off');
  lightSwitch.setAttribute('aria-pressed', String(lightsAreOn));
  lightSwitch.setAttribute('aria-label', lightsAreOn ? 'Turn lights off' : 'Turn lights on');
});
