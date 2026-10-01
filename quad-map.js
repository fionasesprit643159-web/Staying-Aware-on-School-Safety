const viewport = document.querySelector('#map-viewport');
const map = document.querySelector('.site-plan');
const zoomLevel = document.querySelector('#zoom-level');
const zoomInButton = document.querySelector('#zoom-in');
const zoomOutButton = document.querySelector('#zoom-out');
const resetButton = document.querySelector('#reset-view');
const tablesArea = document.querySelector('.tables');
const grounds = document.querySelector('.grounds');
const tables = [...document.querySelectorAll('.table')];
const MIN_ZOOM = 1;
const MAX_ZOOM = 3;
const ZOOM_STEP = 0.25;
const view = { zoom: MIN_ZOOM, x: 0, y: 0 };
let dragStart = null;
let tableLayoutFrozen = false;

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
  if (event.target.closest('.table') || view.zoom <= MIN_ZOOM || event.button !== 0) return;
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

function freezeTableLayout() {
  if (tableLayoutFrozen) return;

  const groundsBounds = grounds.getBoundingClientRect();
  const positions = tables.map((table) => {
    const bounds = table.getBoundingClientRect();
    return {
      table,
      left: (bounds.left - groundsBounds.left) / view.zoom,
      top: (bounds.top - groundsBounds.top) / view.zoom,
      width: bounds.width / view.zoom,
      height: bounds.height / view.zoom,
    };
  });

  tablesArea.classList.add('is-positioned');
  positions.forEach(({ table, left, top, width, height }) => {
    table.classList.add('is-positioned');
    table.style.left = `${left}px`;
    table.style.top = `${top}px`;
    table.style.width = `${width}px`;
    table.style.height = `${height}px`;
  });
  tableLayoutFrozen = true;
}

tables.forEach((table) => {
  table.addEventListener('pointerdown', (event) => {
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();
    freezeTableLayout();
    table.setPointerCapture(event.pointerId);
    table.classList.add('is-dragging');

    const startX = event.clientX;
    const startY = event.clientY;
    const startLeft = Number.parseFloat(table.style.left);
    const startTop = Number.parseFloat(table.style.top);

    const moveTable = (moveEvent) => {
      const maxLeft = tablesArea.clientWidth - table.offsetWidth;
      const maxTop = tablesArea.clientHeight - table.offsetHeight;
      const left = startLeft + (moveEvent.clientX - startX) / view.zoom;
      const top = startTop + (moveEvent.clientY - startY) / view.zoom;
      table.style.left = `${Math.max(0, Math.min(maxLeft, left))}px`;
      table.style.top = `${Math.max(0, Math.min(maxTop, top))}px`;
    };

    const stopMovingTable = () => {
      table.removeEventListener('pointermove', moveTable);
      table.classList.remove('is-dragging');
    };

    table.addEventListener('pointermove', moveTable);
    table.addEventListener('pointerup', stopMovingTable, { once: true });
    table.addEventListener('pointercancel', stopMovingTable, { once: true });
  });
});

