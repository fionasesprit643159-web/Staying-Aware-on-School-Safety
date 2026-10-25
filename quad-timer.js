const timer = document.querySelector('.quad-timer');
const timerValue = document.querySelector('#timer-value');
const mapViewport = document.querySelector('#map-viewport');
let secondsRemaining = 20;
let timeUpEventSent = false;
const DROP_QUESTION_DELAY_MS = 5000;

function renderTime() {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  timer.classList.toggle('is-alert', secondsRemaining <= 10);
  timer.setAttribute('aria-label', secondsRemaining > 0 ? `${secondsRemaining} seconds remaining` : 'Time is up');
  if (secondsRemaining <= 0) {
    mapViewport.classList.add('is-time-up');
    if (!timeUpEventSent) {
      timeUpEventSent = true;
      window.setTimeout(() => window.dispatchEvent(new Event('quad:timer-ended')), 0);
    }
  }
}

renderTime();
window.setTimeout(() => window.dispatchEvent(new Event('quad:drop-question')), DROP_QUESTION_DELAY_MS);
const timerInterval = window.setInterval(() => {
  if (secondsRemaining <= 0) {
    window.clearInterval(timerInterval);
    return;
  }

  secondsRemaining -= 1;
  renderTime();
}, 1000);
