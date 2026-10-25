["BuildA", "BuildB", "BuildF", "BuildG"].forEach((buildingId) => {
    document.getElementById(buildingId).addEventListener("click", () => {
        window.location.href = "classroom-layout.html";
    });
});

document.getElementById("BuildE").addEventListener("click", () => {
    window.location.href = "bathroom-layout.html";
});

["BuildC", "BuildD"].forEach((buildingId) => {
    document.getElementById(buildingId).addEventListener("click", () => {
        window.location.href = "outdoor-layout.html";
    });
});
