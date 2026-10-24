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
    if (door.closest(".stall")?.classList.contains("is-locked")) return;

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
  if (door.currentTarget.classList.contains("is-barricaded")) {
    const status = document.querySelector("#timer-status");
    if (status) status.textContent = "A trash can is blocking the door";
    return;
  }

  const isOpen = door.currentTarget.classList.toggle("is-open");
  door.currentTarget.closest(".bathroom")?.classList.toggle("entrance-open", isOpen);
  door.currentTarget.setAttribute("aria-expanded", String(isOpen));
  door.currentTarget.setAttribute(
    "aria-label",
    isOpen ? "Close bathroom door" : "Open bathroom door",
  );
});

const stallDoors = [...document.querySelectorAll(".stall-door")];
const stallLocks = [...document.querySelectorAll(".stall-lock")];
const mainDoor = document.querySelector(".main-door");

stallLocks.forEach((lock) => {
  lock.addEventListener("click", () => {
    const stall = lock.closest(".stall");
    const door = stall?.querySelector(".stall-door");
    if (!stall || !door) return;

    const isLocked = lock.classList.toggle("is-locked");
    stall.classList.toggle("is-locked", isLocked);
    lock.setAttribute("aria-pressed", String(isLocked));
    lock.setAttribute("aria-label", isLocked ? "Unlock stall door" : "Lock stall door");
    if (isLocked) {
      door.classList.remove("is-open");
      stall.classList.remove("door-open");
      door.setAttribute("aria-expanded", "false");
      door.setAttribute("aria-label", "Stall door locked");
    } else {
      door.setAttribute("aria-label", "Open stall door");
    }
  });
});

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
const bathroom = document.querySelector(".bathroom");
const trashCans = [...document.querySelectorAll(".trash-can")];
const checklistPanel = document.querySelector("#checklist-panel");
const checklistProgress = document.querySelector("#checklist-progress");
const checklistPrompt = document.querySelector("#checklist-prompt");
const checklistAnswers = document.querySelector("#checklist-answers");
const checklistResponse = document.querySelector("#checklist-response");
const checklistNext = document.querySelector("#checklist-next");

if (
  checklistPanel && checklistProgress && checklistPrompt &&
  checklistAnswers && checklistResponse && checklistNext
) {
  const baseQuestions = [
    { prompt: "DID YOU LOCK THE DOOR?" },
    {
      prompt: "DID YOU BARRICADE THE DOOR?",
      detail: "If it is safe and possible, use a heavy trash can or another sturdy object to block the door.",
    },
    { prompt: "DID YOU HIDE IN AN INNER STALL?" },
    { prompt: "DID YOU LOCK THE STALL DOOR?" },
    {
      prompt: "ARE YOU HIDDEN FROM VIEW?",
      detail: "If climbing onto the toilet helps you stay out of sight, you may do so, but be careful to avoid falling or getting injured.",
    },
    {
      prompt: "DID YOU MAINTAIN SILENCE?",
      detail: "Silence your phone, including vibration, and stay quiet.",
    },
    {
      prompt: "ARE YOU PREPARED TO FIGHT ONLY AS A LAST RESORT?",
      detail: "Fight only if your life is in immediate danger and you cannot safely run or hide.",
    },
  ];
  let questions = [];
  let questionIndex = 0;
  let selectedAnswer = "";

  const showQuestion = () => {
    const question = questions[questionIndex];
    checklistProgress.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
    checklistPrompt.textContent = question.prompt;
    checklistResponse.hidden = true;
    checklistResponse.textContent = "";
    checklistNext.hidden = true;
    checklistNext.textContent = questionIndex === questions.length - 1 ? "Finish" : "Next";
    checklistAnswers.hidden = false;
    checklistPanel.querySelector("[data-answer='yes']")?.focus();
  };

  checklistAnswers.addEventListener("click", (event) => {
    const answerButton = event.target.closest("[data-answer]");
    if (!answerButton) return;

    selectedAnswer = answerButton.dataset.answer;
    const answer = selectedAnswer === "yes" ? "Yes" : "No";
    const detail = questions[questionIndex].detail;
    checklistResponse.textContent = detail ? `Recorded: ${answer}. ${detail}` : `Recorded: ${answer}.`;
    checklistResponse.hidden = false;
    checklistAnswers.hidden = true;
    checklistNext.hidden = false;
    checklistNext.focus();
  });

  checklistNext.addEventListener("click", () => {
    if (questionIndex < questions.length - 1) {
      questionIndex += 1;
      selectedAnswer = "";
      showQuestion();
      return;
    }

    window.location.href = "end-page.html";
  });

  window.startBathroomChecklist = () => {
    questions = [...baseQuestions];
    questionIndex = 0;
    selectedAnswer = "";
    const bathroomMap = document.querySelector(".bathroom");
    if (bathroomMap) bathroomMap.inert = true;
    document.querySelectorAll(".toilet-control, .stall-door, .stall-lock, .main-door, .trash-can")
      .forEach((control) => {
        control.disabled = true;
        control.setAttribute("aria-disabled", "true");
      });
    checklistPanel.hidden = false;
    checklistPanel.classList.add("is-open");
    showQuestion();
  };
}

if (bathroom && mainDoor && trashCans.length) {
  const dragSpeed = 1;

  const moveTrashCan = (can, left, top) => {
    const maxLeft = bathroom.clientWidth - can.offsetWidth;
    const maxTop = bathroom.clientHeight - can.offsetHeight;
    can.style.right = "auto";
    can.style.bottom = "auto";
    can.style.left = `${Math.max(0, Math.min(left, maxLeft))}px`;
    can.style.top = `${Math.max(0, Math.min(top, maxTop))}px`;
  };

  const updateBarricade = () => {
    const doorRect = mainDoor.getBoundingClientRect();
    const barricaded = trashCans.some((can) => {
      const canRect = can.getBoundingClientRect();
      return canRect.right > doorRect.left && canRect.left < doorRect.right &&
        canRect.bottom > doorRect.top && canRect.top < doorRect.bottom;
    });
    const wasBarricaded = mainDoor.classList.contains("is-barricaded");
    mainDoor.classList.toggle("is-barricaded", barricaded);
    mainDoor.setAttribute("aria-disabled", String(barricaded));
    mainDoor.setAttribute(
      "aria-label",
      barricaded
        ? "Bathroom door barricaded by a trash can"
        : mainDoor.classList.contains("is-open") ? "Close bathroom door" : "Open bathroom door",
    );
    if (timerStatus && barricaded !== wasBarricaded) {
      timerStatus.textContent = barricaded ? "Trash can barricading the door" : "Doors unlocked";
    }
  };

  trashCans.forEach((can) => {
    can.addEventListener("pointerdown", (event) => {
      if (can.disabled || !event.isPrimary) return;
      event.preventDefault();
      const left = can.offsetLeft;
      const top = can.offsetTop;
      can.dataset.dragLastX = String(event.clientX);
      can.dataset.dragLastY = String(event.clientY);
      can.classList.add("is-dragging");
      can.setPointerCapture(event.pointerId);
      moveTrashCan(can, left, top);
    });

    can.addEventListener("pointermove", (event) => {
      if (!can.classList.contains("is-dragging")) return;
      const deltaX = event.clientX - Number(can.dataset.dragLastX);
      const deltaY = event.clientY - Number(can.dataset.dragLastY);
      const left = can.offsetLeft + deltaX * dragSpeed;
      const top = can.offsetTop + deltaY * dragSpeed;
      moveTrashCan(can, left, top);
      can.dataset.dragLastX = String(event.clientX);
      can.dataset.dragLastY = String(event.clientY);
    });

    can.addEventListener("dragstart", (event) => event.preventDefault());

    const finishDrag = () => {
      if (!can.classList.contains("is-dragging")) return;
      can.classList.remove("is-dragging");
      updateBarricade();
    };
    can.addEventListener("pointerup", finishDrag);
    can.addEventListener("pointercancel", finishDrag);

    can.addEventListener("keydown", (event) => {
      const steps = { ArrowLeft: [-14, 0], ArrowRight: [14, 0], ArrowUp: [0, -14], ArrowDown: [0, 14] };
      const step = steps[event.key];
      if (!step || can.disabled) return;
      event.preventDefault();
      moveTrashCan(can, can.offsetLeft + step[0], can.offsetTop + step[1]);
      updateBarricade();
    });
  });
}

if (timerPanel && timerReadout && timerStatus) {
  const popDelay = 5_000 + Math.floor(Math.random() * 15_001);

  window.setTimeout(() => {
    const durations = [20, 30, 45];
    const duration = durations[Math.floor(Math.random() * durations.length)];
    const endTime = Date.now() + duration * 1000;

    timerPanel.hidden = false;
    trashCans.forEach((can) => {
      can.disabled = false;
      can.setAttribute("aria-label", `${can.getAttribute("aria-label")} Trash cans are now movable.`);
    });
    stallDoors.forEach((door) => {
      door.disabled = false;
      door.setAttribute("aria-label", "Close stall door");
    });
    stallLocks.forEach((lock) => {
      lock.disabled = false;
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
        window.startBathroomChecklist?.();
      }
    };

    updateTimer();
    countdown = window.setInterval(updateTimer, 250);
  }, popDelay);
}
