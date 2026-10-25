const viewport = document.querySelector('#map-viewport');
const map = document.querySelector('.site-plan');
const zoomLevel = document.querySelector('#zoom-level');
const zoomInButton = document.querySelector('#zoom-in');
const zoomOutButton = document.querySelector('#zoom-out');
const resetButton = document.querySelector('#reset-view');
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const view = { zoom: MIN_ZOOM, x: 0, y: 0 };
let dragStart = null;

function clampPan() {
  const maxX = viewport.clientWidth * (view.zoom - 1) / 2;
  const maxY = viewport.clientHeight * (view.zoom - 1) / 2;
  view.x = Math.max(-maxX, Math.min(maxX, view.x));
  view.y = Math.max(-maxY, Math.min(maxY, view.y));
}

function renderView() {
  clampPan();
  map.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
  zoomLevel.value = `${Math.round(view.zoom * 100)}%`;
  zoomLevel.textContent = zoomLevel.value;
  zoomInButton.disabled = view.zoom >= MAX_ZOOM;
  zoomOutButton.disabled = view.zoom <= MIN_ZOOM;
  viewport.classList.toggle('can-pan', view.zoom > MIN_ZOOM);
}

function changeZoom(amount) {
  view.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, view.zoom + amount));
  if (view.zoom === MIN_ZOOM) {
    view.x = 0;
    view.y = 0;
  }
  renderView();
}

zoomInButton.addEventListener('click', () => changeZoom(ZOOM_STEP));
zoomOutButton.addEventListener('click', () => changeZoom(-ZOOM_STEP));
resetButton.addEventListener('click', () => {
  view.zoom = MIN_ZOOM;
  view.x = 0;
  view.y = 0;
  renderView();
});

viewport.addEventListener('pointerdown', (event) => {
  if (event.target.closest('button, .map-item, dialog') || view.zoom <= MIN_ZOOM || event.button !== 0) return;
  dragStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: view.x, panY: view.y };
  viewport.setPointerCapture(event.pointerId);
  viewport.classList.add('is-dragging');
});

viewport.addEventListener('pointermove', (event) => {
  if (!dragStart || event.pointerId !== dragStart.pointerId) return;
  view.x = dragStart.panX + event.clientX - dragStart.x;
  view.y = dragStart.panY + event.clientY - dragStart.y;
  renderView();
});

function stopDragging(event) {
  if (!dragStart || event.pointerId !== dragStart.pointerId) return;
  dragStart = null;
  viewport.classList.remove('is-dragging');
}

viewport.addEventListener('pointerup', stopDragging);
viewport.addEventListener('pointercancel', stopDragging);
viewport.addEventListener('wheel', (event) => {
  event.preventDefault();
  changeZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
}, { passive: false });

window.addEventListener('resize', renderView);
renderView();


const trashcans = [...document.querySelectorAll('.trashcan')];
const sitePlan = document.querySelector('.site-plan');

function countGateBlockers(gate) {
  const planBounds = sitePlan.getBoundingClientRect();
  const zoom = view.zoom;
  return trashcans.filter((trashcan) => {
    const bounds = trashcan.getBoundingClientRect();
    const centerX = (bounds.left + bounds.width / 2 - planBounds.left) / zoom;
    const centerY = (bounds.top + bounds.height / 2 - planBounds.top) / zoom;
    const onGateSide = gate.classList.contains('gate-left')
      ? centerX <= planBounds.width / zoom * 0.07
      : centerX >= planBounds.width / zoom * 0.93;
    return onGateSide && Math.abs(centerY - planBounds.height / zoom * 0.505) <= planBounds.height / zoom * 0.16;
  }).length;
}

function isGateBlocked(gate) {
  return countGateBlockers(gate) > 0;
}

function updateGateBlockers() {
  document.querySelectorAll('.gate').forEach((gate) => {
    const blocked = isGateBlocked(gate);
    gate.classList.toggle('is-blocked', blocked);
    gate.setAttribute('aria-label', blocked ? `${gate.classList.contains('gate-left') ? 'Left' : 'Right'} gate blocked by a trash can` : `${gate.classList.contains('is-open') ? 'Close' : 'Open'} ${gate.classList.contains('gate-left') ? 'left' : 'right'} gate`);
    if (blocked && gate.classList.contains('is-open')) setGateOpen(gate, false);
  });
}

trashcans.forEach((trashcan) => {
  trashcan.addEventListener('pointerdown', (event) => {
    event.preventDefault();
    event.stopPropagation();
    trashcan.setPointerCapture(event.pointerId);
    trashcan.classList.add('is-dragging');
    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = trashcan.offsetLeft;
    const startTop = trashcan.offsetTop;
    const planWidth = sitePlan.clientWidth;
    const planHeight = sitePlan.clientHeight;
    const moveCan = (moveEvent) => {
      const width = trashcan.offsetWidth;
      const height = trashcan.offsetHeight;
      trashcan.style.right = 'auto';
      trashcan.style.left = `${Math.max(0, Math.min(planWidth - width, startLeft + (moveEvent.clientX - startX) / view.zoom))}px`;
      trashcan.style.top = `${Math.max(0, Math.min(planHeight - height, startTop + (moveEvent.clientY - startY) / view.zoom))}px`;
      updateGateBlockers();
    };
    const finishMove = () => {
      trashcan.classList.remove('is-dragging');
      trashcan.removeEventListener('pointermove', moveCan);
      trashcan.removeEventListener('pointerup', finishMove);
      trashcan.removeEventListener('pointercancel', finishMove);
      updateGateBlockers();
    };
    trashcan.addEventListener('pointermove', moveCan);
    trashcan.addEventListener('pointerup', finishMove);
    trashcan.addEventListener('pointercancel', finishMove);
  });
});

function setGateOpen(gate, isOpen) {
  if (isOpen && isGateBlocked(gate)) return;
  const side = gate.classList.contains('gate-left') ? 'left' : 'right';
  gate.classList.toggle('is-open', isOpen);
  gate.setAttribute('aria-expanded', String(isOpen));
  gate.setAttribute('aria-label', `${isOpen ? 'Close' : 'Open'} ${side} gate`);
  document.querySelector(`.gate-action-${side}`).hidden = !isOpen;
}

document.querySelectorAll('.gate').forEach((gate) => {
  gate.addEventListener('click', () => setGateOpen(gate, !gate.classList.contains('is-open')));
});
updateGateBlockers();

const exitConfirmation = document.querySelector('#exit-confirmation');

document.querySelectorAll('.gate-action').forEach((action) => {
  action.addEventListener('click', () => {
    const side = action.classList.contains('gate-action-left') ? 'left' : 'right';
    const gate = document.querySelector(`.gate-${side}`);
    setGateOpen(gate, false);
    exitConfirmation.showModal();
  });
});

document.querySelector('#exit-confirmation-close').addEventListener('click', () => {
  exitConfirmation.close();
});

let activeHiddenItem = null;

document.querySelectorAll('.tree, .table').forEach((item) => {
  const kind = item.classList.contains('tree') ? 'tree' : 'table';
  item.classList.add('map-item');
  item.tabIndex = 0;
  item.addEventListener('click', (event) => {
    if (event.target.closest('.map-item-action')) return;
    if (item.classList.contains('is-hidden')) item.classList.add('show-unhide');
  });
  item.addEventListener('focus', () => {
    if (item.classList.contains('is-hidden')) item.classList.add('show-unhide');
  });
  item.addEventListener('pointerenter', (event) => {
    if (event.pointerType === 'mouse') item.classList.add('is-hovered');
  });
  item.addEventListener('pointerleave', () => item.classList.remove('is-hovered'));

  const hideButton = document.createElement('button');
  hideButton.type = 'button';
  hideButton.className = 'map-item-action';
  hideButton.textContent = 'Hide';
  hideButton.setAttribute('aria-label', `Hide ${kind}`);
  hideButton.addEventListener('click', () => {
    if (activeHiddenItem === item) {
      activeHiddenItem = null;
    } else {
      activeHiddenItem = item;
    }

    document.querySelectorAll('.map-item').forEach((mapItem) => {
      const isHidden = mapItem === activeHiddenItem;
      const action = mapItem.querySelector('.map-item-action');
      const itemKind = mapItem.classList.contains('tree') ? 'tree' : 'table';
      mapItem.classList.toggle('is-hidden', isHidden);
      mapItem.classList.remove('show-unhide');
      const actionLabel = isHidden ? 'Unhide' : 'Hide';
      action.textContent = actionLabel;
      action.setAttribute('aria-label', `${actionLabel} ${itemKind}`);
    });
  });
  item.append(hideButton);
});

const dropQuestion = document.querySelector('#drop-question');
const dropQuestionTitle = document.querySelector('#drop-question-title');
const questionProgress = document.querySelector('#question-progress');
const answerActions = document.querySelector('#answer-actions');
const answerConfirmation = document.querySelector('#answer-confirmation');
const answerConfirmationActions = document.querySelector('#answer-confirmation-actions');
const answerButtons = [document.querySelector('#answer-no'), document.querySelector('#answer-yes')];
const changeAnswerButton = document.querySelector('#change-answer');
const confirmAnswerButton = document.querySelector('#confirm-answer');
const dropBelongingsButton = document.querySelector('#answer-yes');
const dropNoButton = document.querySelector('#answer-no');
const droppedBackpack = document.querySelector('#dropped-backpack');
const questions = [
  'DID YOU LEAVE YOUR BELONGINGS BEHIND?',
  'DID YOU USE A SAFE EXIT AWAY FROM THE THREAT?',
  'IF YOU COULD NOT SAFELY EXIT, DID YOU HIDE IN A SECURE PLACE OUT OF SIGHT?',
  'DID YOU LOCK OR BLOCK THE ENTRY AND SILENCE YOUR PHONE?',
  'IF MET WITH THE SHOOTER\nDID YOU FIGHT?',
  "ONCE SAFE, DID YOU CONTACT 911 WHEN ABLE AND FOLLOW OFFICERS' INSTRUCTIONS WITH YOUR HANDS VISIBLE?"
];
let questionIndex = 0;
let selectedAnswer = null;
const recordedAnswers = [];
let dialogMode = null;
let timerEndedPending = false;
let dropQuestionPending = false;

dropBelongingsButton.addEventListener('click', () => {
  if (dialogMode !== 'drop') return;
  droppedBackpack.setAttribute('aria-hidden', 'false');
  droppedBackpack.classList.add('is-dropped');
  dropQuestion.close();
});

dropNoButton.addEventListener('click', () => {
  if (dialogMode === 'drop') dropQuestion.close();
});

function showCurrentQuestion() {
  dropQuestionTitle.textContent = questions[questionIndex];
  questionProgress.textContent = `QUESTION ${questionIndex + 1} OF ${questions.length}`;
  questionProgress.hidden = false;
  answerActions.hidden = false;
  answerConfirmation.hidden = true;
  answerConfirmationActions.hidden = true;
  selectedAnswer = null;
}

answerButtons.forEach((button) => {
  button.addEventListener('click', () => {
    if (dialogMode !== 'timer-end') return;
    selectedAnswer = button.textContent.trim();
    answerActions.hidden = true;
    answerConfirmation.textContent = `You answered “${selectedAnswer}.” Do you want to confirm this answer?`;
    answerConfirmation.hidden = false;
    answerConfirmationActions.hidden = false;
  });
});

changeAnswerButton.addEventListener('click', () => {
  if (dialogMode !== 'timer-end') return;
  answerConfirmation.hidden = true;
  answerConfirmationActions.hidden = true;
  answerActions.hidden = false;
  selectedAnswer = null;
});

confirmAnswerButton.addEventListener('click', () => {
  if (dialogMode !== 'timer-end' || !selectedAnswer) return;
  recordedAnswers[questionIndex] = selectedAnswer;
  questionIndex += 1;
  if (questionIndex >= questions.length) {
    window.location.href = 'end-page.html';
    return;
  }
  showCurrentQuestion();
});

function openTimerEndQuestions() {
  dialogMode = 'timer-end';
  questionIndex = 0;
  showCurrentQuestion();
  dropQuestion.show();
}

function openDropQuestion() {
  dialogMode = 'drop';
  questionProgress.hidden = true;
  answerActions.hidden = false;
  answerConfirmation.hidden = true;
  answerConfirmationActions.hidden = true;
  dropQuestionTitle.textContent = 'Your belongings are slowing you down. Do you want to drop them?';
  dropQuestion.show();
}

dropQuestion.addEventListener('close', () => {
  const closedMode = dialogMode;
  dialogMode = null;
  if (closedMode === 'drop' && timerEndedPending) {
    timerEndedPending = false;
    openTimerEndQuestions();
  } else if (dropQuestionPending) {
    dropQuestionPending = false;
    openDropQuestion();
  }
});

window.addEventListener('quad:drop-question', () => {
  if (dropQuestion.open) {
    dropQuestionPending = true;
    return;
  }
  openDropQuestion();
});

window.addEventListener('quad:timer-ended', () => {
  if (dropQuestion.open) {
    timerEndedPending = true;
    if (dialogMode === 'drop') dropQuestion.close();
    return;
  }
  openTimerEndQuestions();
});

const quadRunner = document.querySelector('#quad-runner');
const gateWarnings = [
  { gate: document.querySelector('.gate-left'), warning: document.querySelector('#left-gate-warning') },
  { gate: document.querySelector('.gate-right'), warning: document.querySelector('#right-gate-warning') }
];
const fightStatus = document.querySelector('#fight-status');
let shooterStarted = false;
let simulationEnded = false;
const gatesCurrentlyNear = new Set();
const gateCloseTimers = new Map();

function clearShooterFromMap() {
  simulationEnded = true;
  quadRunner.classList.remove('is-running');
  quadRunner.classList.add('is-gone');
  gateWarnings.forEach(({ warning }) => { warning.hidden = true; });
  gateCloseTimers.forEach((timerId) => window.clearTimeout(timerId));
  gateCloseTimers.clear();
}

document.querySelectorAll('.fight-action').forEach((button) => {
  button.addEventListener('click', () => {
    if (!shooterStarted || simulationEnded) return;
    clearShooterFromMap();
    fightStatus.hidden = false;
  });
});

function updateGateWarnings() {
  if (!shooterStarted || simulationEnded) {
    gateWarnings.forEach(({ warning }) => { warning.hidden = true; });
    return;
  }

  const runnerBounds = quadRunner.getBoundingClientRect();
  const runnerX = runnerBounds.left + runnerBounds.width / 2;
  const runnerY = runnerBounds.top + runnerBounds.height / 2;
  const warningDistance = Math.max(90, runnerBounds.height * 2.1);

  gateWarnings.forEach(({ gate, warning }) => {
    const gateBounds = gate.getBoundingClientRect();
    const gateX = gateBounds.left + gateBounds.width / 2;
    const gateY = gateBounds.top + gateBounds.height / 2;
    const distance = Math.hypot(runnerX - gateX, runnerY - gateY);
    const isNear = distance <= warningDistance;
    warning.hidden = !isNear;
    if (isNear) {
      window.clearTimeout(gateCloseTimers.get(gate));
      gateCloseTimers.delete(gate);
      if (!gatesCurrentlyNear.has(gate)) setGateOpen(gate, true);
      gatesCurrentlyNear.add(gate);
    } else if (gatesCurrentlyNear.has(gate)) {
      gatesCurrentlyNear.delete(gate);
      gateCloseTimers.set(gate, window.setTimeout(() => {
        setGateOpen(gate, false);
        gateCloseTimers.delete(gate);
      }, 600));
    }
  });
}

window.setTimeout(() => {
  if (simulationEnded) return;
  const gateHasTwoBlockers = gateWarnings.some(({ gate }) => countGateBlockers(gate) >= 2);
  if (gateHasTwoBlockers) return;

  shooterStarted = true;
  quadRunner.classList.add('is-running');
  updateGateWarnings();
}, 10000);

window.addEventListener('quad:timer-ended', () => {
  clearShooterFromMap();
});

window.setInterval(updateGateWarnings, 120);
updateGateWarnings();
