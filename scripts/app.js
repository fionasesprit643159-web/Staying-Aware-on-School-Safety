

// Interactions for the start page will be added here.
const startButton = document.querySelector('#start-button');
if (startButton) {
  startButton.addEventListener('click', () => {
    window.location.href = 'pages/map-selector.html';
  });
}

// Interactions for the info button will be added here.
const infoButton = document.querySelector('#info-button');
if (infoButton) {
  infoButton.addEventListener('click', () => {
    window.location.href = 'pages/information.html';
  });
}

// Interactions for the back button will be added here.
const backButton = document.querySelector('#back-button');
if (backButton) {
  backButton.addEventListener('click', () => {
  window.location.href = '../index.html';
});
}
