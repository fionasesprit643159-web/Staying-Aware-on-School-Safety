const viewport = document.querySelector('#map-viewport');
const map = document.querySelector('.site-plan');
const zoomLevel = document.querySelector('#zoom-level');
const zoomInButton = document.querySelector('#zoom-in');
const zoomOutButton = document.querySelector('#zoom-out');
const resetButton = document.querySelector('#reset-view');
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const view = { zoom: MIN_ZOOM, x: 0, y: 0 };
let dragStart = null;

function clampPan() {
  const maxX = viewport.clientWidth * (view.zoom - 1) / 2;
  const maxY = viewport.clientHeight * (view.zoom - 1) / 2;
  view.x = Math.max(-maxX, Math.min(maxX, view.x));
  view.y = Math.max(-maxY, Math.min(maxY, view.y));
}

function renderView() {
  clampPan();
  map.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
  zoomLevel.value = `${Math.round(view.zoom * 100)}%`;
  zoomLevel.textContent = zoomLevel.value;
  zoomInButton.disabled = view.zoom >= MAX_ZOOM;
  zoomOutButton.disabled = view.zoom <= MIN_ZOOM;
  viewport.classList.toggle('can-pan', view.zoom > MIN_ZOOM);
}

function changeZoom(amount) {
  view.zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, view.zoom + amount));
  if (view.zoom === MIN_ZOOM) {
    view.x = 0;
    view.y = 0;
  }
  renderView();
}

zoomInButton.addEventListener('click', () => changeZoom(ZOOM_STEP));
zoomOutButton.addEventListener('click', () => changeZoom(-ZOOM_STEP));
resetButton.addEventListener('click', () => {
  view.zoom = MIN_ZOOM;
  view.x = 0;
  view.y = 0;
  renderView();
});

viewport.addEventListener('pointerdown', (event) => {
  if (event.target.closest('.gate') || view.zoom <= MIN_ZOOM || event.button !== 0) return;
  dragStart = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, panX: view.x, panY: view.y };
  viewport.setPointerCapture(event.pointerId);
  viewport.classList.add('is-dragging');
});

viewport.addEventListener('pointermove', (event) => {
  if (!dragStart || event.pointerId !== dragStart.pointerId) return;
  view.x = dragStart.panX + event.clientX - dragStart.x;
  view.y = dragStart.panY + event.clientY - dragStart.y;
  renderView();
});

function stopDragging(event) {
  if (!dragStart || event.pointerId !== dragStart.pointerId) return;
  dragStart = null;
  viewport.classList.remove('is-dragging');
}

viewport.addEventListener('pointerup', stopDragging);
viewport.addEventListener('pointercancel', stopDragging);
viewport.addEventListener('wheel', (event) => {
  event.preventDefault();
  changeZoom(event.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP);
}, { passive: false });

window.addEventListener('resize', renderView);
renderView();


document.querySelectorAll('.gate').forEach((gate) => {
  gate.addEventListener('click', () => {
    const isOpen = gate.classList.toggle('is-open');
    gate.setAttribute('aria-expanded', String(isOpen));
    const side = gate.classList.contains('gate-left') ? 'left' : 'right';
    gate.setAttribute('aria-label', `${isOpen ? 'Close' : 'Open'} ${side} gate`);
  });
});
