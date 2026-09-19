const button = document.querySelector("#greet-button");
const message = document.querySelector("#message");

button.addEventListener("click", () => {
  message.textContent = "Hello from your new web app!";
  button.textContent = "Hello!";
});
