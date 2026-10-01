const timer = document.querySelector('.quad-timer');
const timerValue = document.querySelector('#timer-value');
const mapViewport = document.querySelector('#map-viewport');
let secondsRemaining = Math.floor(Math.random() * 31) + 30;

function renderTime() {
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  timerValue.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  timer.classList.toggle('is-alert', secondsRemaining <= 10);
  timer.setAttribute('aria-label', secondsRemaining > 0 ? `${secondsRemaining} seconds remaining` : 'Time is up');
  if (secondsRemaining <= 0) mapViewport.classList.add('is-time-up');
}

renderTime();
const timerInterval = window.setInterval(() => {
  if (secondsRemaining <= 0) {
    window.clearInterval(timerInterval);
    return;
  }

  secondsRemaining -= 1;
  renderTime();
}, 1000);
