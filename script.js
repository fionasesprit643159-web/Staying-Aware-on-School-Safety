const button = document.querySelector('#greet-button');
const message = document.querySelector('#message');

button.addEventListener('click', () => {
  message.textContent = 'Nice to meet you. Keep building!';
  button.textContent = 'Hello again!';
});
