const buildingButtons = document.querySelectorAll(".building-button");
const buildingA = document.getElementById("BuildA");
const buildingB = document.getElementById("BuildB");
const buildingC = document.getElementById("BuildC");
const buildingE = document.getElementById("BuildE");

buildingA.addEventListener("click", () => {
    window.location.href = "classroom-layout.html";
});

buildingB.addEventListener("click", () => {
    window.location.href = "classroom-layout.html";
});

buildingC.addEventListener("click", () => {
    window.location.href = "outdoor-layout.html";
});

buildingE.addEventListener("click", () => {
    window.location.href = "bathroom-layout.html";
});

buildingButtons.forEach((button) => {
    button.addEventListener("click", () => {
        // Building destinations can be assigned here as pages are added.
    });
});
