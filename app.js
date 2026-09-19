const greetingButton = document.querySelector("#greeting-button");
const greeting = document.querySelector("#greeting");

greetingButton.addEventListener("click", () => {
  greeting.textContent = "Hello to you, too!";
});
