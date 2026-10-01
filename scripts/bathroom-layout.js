document.querySelectorAll(".toilet-control").forEach((toilet) => {
  toilet.addEventListener("click", () => {
    const isClosed = toilet.classList.toggle("is-closed");
    toilet.setAttribute("aria-pressed", String(isClosed));
    toilet.setAttribute(
      "aria-label",
      isClosed ? "Open toilet lid" : "Close toilet lid",
    );
  });
});

document.querySelectorAll(".stall-door").forEach((door) => {
  door.addEventListener("click", () => {
    const isOpen = door.classList.toggle("is-open");
    door.closest(".stall")?.classList.toggle("door-open", isOpen);
    door.setAttribute("aria-expanded", String(isOpen));
    door.setAttribute(
      "aria-label",
      isOpen ? "Close stall door" : "Open stall door",
    );
  });
});

document.querySelector(".main-door")?.addEventListener("click", (door) => {
  const isOpen = door.currentTarget.classList.toggle("is-open");
  door.currentTarget.closest(".bathroom")?.classList.toggle("entrance-open", isOpen);
  door.currentTarget.setAttribute("aria-expanded", String(isOpen));
  door.currentTarget.setAttribute(
    "aria-label",
    isOpen ? "Close bathroom door" : "Open bathroom door",
  );
});

const stallDoors = [...document.querySelectorAll(".stall-door")];
const mainDoor = document.querySelector(".main-door");

stallDoors.forEach((door) => {
  door.classList.add("is-open");
  door.closest(".stall")?.classList.add("door-open");
  door.disabled = true;
  door.setAttribute("aria-expanded", "true");
  door.setAttribute("aria-label", "Stall door open; waiting for timer");
});

if (mainDoor) {
  mainDoor.classList.add("is-open");
  mainDoor.closest(".bathroom")?.classList.add("entrance-open");
  mainDoor.disabled = true;
  mainDoor.setAttribute("aria-expanded", "true");
  mainDoor.setAttribute("aria-label", "Bathroom door open; waiting for timer");
}

const timerPanel = document.querySelector("#simulation-timer");
const timerReadout = document.querySelector("#timer-readout");
const timerStatus = document.querySelector("#timer-status");

if (timerPanel && timerReadout && timerStatus) {
  const popDelay = 5_000 + Math.floor(Math.random() * 15_001);

  window.setTimeout(() => {
    const durations = [30, 45, 60];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const endTime = Date.now() + duration * 1000;

    timerPanel.hidden = false;
    stallDoors.forEach((door) => {
      door.disabled = false;
      door.setAttribute("aria-label", "Close stall door");
    });
    if (mainDoor) {
      mainDoor.disabled = false;
      mainDoor.setAttribute("aria-label", "Close bathroom door");
    }
    timerStatus.textContent = "Doors unlocked";
    let countdown;

    const updateTimer = () => {
      const secondsLeft = Math.max(0, Math.ceil((endTime - Date.now()) / 1000));
      const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
      const seconds = String(secondsLeft % 60).padStart(2, "0");
      timerReadout.value = `${minutes}:${seconds}`;
      timerReadout.textContent = `${minutes}:${seconds}`;

      if (secondsLeft === 0) {
        window.clearInterval(countdown);
        timerPanel.classList.add("is-finished");
        timerStatus.textContent = "Time is up";
      }
    };

    updateTimer();
    countdown = window.setInterval(updateTimer, 250);
  }, popDelay);
}
