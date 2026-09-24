const deskArea = document.querySelector('.desks');
const desks = [...document.querySelectorAll('.desk')];
let layoutIsFrozen = false;

function freezeDeskLayout() {
  if (layoutIsFrozen) return;

  const area = deskArea.getBoundingClientRect();
  const positions = desks.map((desk) => {
    const bounds = desk.getBoundingClientRect();
    return { desk, left: bounds.left - area.left, top: bounds.top - area.top };
  });

  positions.forEach(({ desk, left, top }) => {
    desk.classList.add('is-positioned');
    desk.style.left = `${left}px`;
    desk.style.top = `${top}px`;
  });
  layoutIsFrozen = true;
}

desks.forEach((desk) => {
  desk.addEventListener('pointerdown', (event) => {
    freezeDeskLayout();
    desk.setPointerCapture(event.pointerId);

    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = desk.offsetLeft;
    const startTop = desk.offsetTop;

    const moveDesk = (moveEvent) => {
      const maxLeft = deskArea.clientWidth - desk.offsetWidth;
      const maxTop = deskArea.clientHeight - desk.offsetHeight;
      const left = Math.min(maxLeft, Math.max(0, startLeft + moveEvent.clientX - startX));
      const top = Math.min(maxTop, Math.max(0, startTop + moveEvent.clientY - startY));
      desk.style.left = `${left}px`;
      desk.style.top = `${top}px`;
    };

    desk.addEventListener('pointermove', moveDesk);
    desk.addEventListener('pointerup', () => desk.removeEventListener('pointermove', moveDesk), { once: true });
    desk.addEventListener('pointercancel', () => desk.removeEventListener('pointermove', moveDesk), { once: true });
  });
});

document.querySelectorAll('.cabinet').forEach((cabinet) => {
  cabinet.addEventListener('click', () => {
    const isOpen = cabinet.classList.toggle('is-open');
    const number = cabinet.textContent.trim();
    cabinet.setAttribute('aria-expanded', String(isOpen));
    cabinet.setAttribute('aria-label', `${isOpen ? 'Close' : 'Open'} ${number.toLowerCase()}`);
  });
});

const door = document.querySelector('.door');

door.addEventListener('click', () => {
  const isClosed = door.classList.toggle('is-closed');
  door.setAttribute('aria-pressed', String(isClosed));
  door.setAttribute('aria-label', isClosed ? 'Open door' : 'Close door');
});
