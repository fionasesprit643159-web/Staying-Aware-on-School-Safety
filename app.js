

// Interactions for the start page will be added here.
const startButton = document.querySelector('#start-button');
if (startButton) {
  startButton.addEventListener('click', () => {
    window.location.href = 'second-page.html';
  });
}

// Interactions for the info button will be added here.
const infoButton = document.querySelector('#info-button');
if (infoButton) {
  infoButton.addEventListener('click', () => {
    window.location.href = 'information-page.html';
  });
}

// Interactions for the back button will be added here.
const backButton = document.querySelector('#back-button');
if (backButton) {
  backButton.addEventListener('click', () => {
  window.location.href = 'first-page.html';
});
}