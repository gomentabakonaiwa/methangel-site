/* ---------- DATA ---------- */
/* ======= CONFIG ======= */
const FRAME_SRC = 'assets/img/product_tab(1).png';  // << use your exact frame filename
const SHOWROOM_ID = 'showroom';

/* Example products — each one is INDEPENDENT */
const PRODUCTS = [
  {
    id: 'p-angelic-veil',
    title: 'Angelic Veil Tee',
    price: '£48',
    images: ['assets/img/example1a.jpg','assets/img/example1b.jpg'],
    sizes: ['S','M','L','XL']
  },
  {
    id: 'p-glass-relic',
    title: 'Glass Relic',
    price: '£120',
    images: ['assets/img/example2a.jpg','assets/img/example2b.jpg']
  },
  {
    id: 'p-altar-cap',
    title: 'Altar Cap',
    price: '£32',
    images: ['assets/img/example3a.jpg']
  },
  // add more real items…
];

/* ======= GRID / PAGER ======= */
const grid = document.getElementById('tabGrid');
const dotsWrap = document.getElementById('pagerDots');
const leftBtn = document.getElementById('arrowLeft');
const rightBtn = document.getElementById('arrowRight');

const ROWS_VISIBLE = 4;   // 2 columns x 4 rows = 8 visible
const COLS_VISIBLE = 2;
const COL_SIZE = ROWS_VISIBLE;
const TOTAL_COLS = Math.max(1, Math.ceil(PRODUCTS.length / ROWS_VISIBLE));
let colIndex = 0;

function renderGrid(){
  grid.innerHTML = '';
  const startCol = colIndex;
  const endCol = Math.min(startCol + COLS_VISIBLE, TOTAL_COLS);

  for (let c = startCol; c < endCol; c++){
    for (let r = 0; r < ROWS_VISIBLE; r++){
      const idx = c*COL_SIZE + r;
      const item = PRODUCTS[idx];
      if (!item) continue;

      const el = document.createElement('article');
      el.className = 'product-tab';
      el.dataset.id = item.id;
      el.innerHTML = `
        <img class="frame" src="${FRAME_SRC}" alt="">
        <div class="tab__content" title="${item.title}">
          <!-- inner preview area (leave black for now or drop a thumb) -->
        </div>
        <button class="tab__orb" aria-label="Details"></button>
      `;

      // each tile has its OWN handlers
      el.querySelector('.tab__content').addEventListener('click', () => openProduct(item));
      el.querySelector('.tab__orb').addEventListener('click', (e) => {
        e.stopPropagation();
        openProduct(item, { showDetails:true });
      });

      grid.appendChild(el);
    }
  }
  renderDots();
}

function renderDots(){
  dotsWrap.innerHTML = '';
  for (let i = 0; i < TOTAL_COLS; i++){
    const d = document.createElement('div');
    const active = (i >= colIndex && i < colIndex + COLS_VISIBLE);
    d.className = 'dot' + (active ? ' active' : '');
    dotsWrap.appendChild(d);
  }
}

leftBtn.addEventListener('click', () => {
  if (colIndex > 0){ colIndex--; renderGrid(); }
});
rightBtn.addEventListener('click', () => {
  if (colIndex < TOTAL_COLS - COLS_VISIBLE){ colIndex++; renderGrid(); }
});

/* ======= MODAL / SHOWROOM / PRODUCT ======= */
const modal = document.getElementById('modal');
const modalClose = modal.querySelector('.modal__close');
const detailsCard = modal.querySelector('.details-card');
const viewport = modal.querySelector('.modal__viewport');
const basketCount = document.getElementById('basket-count');
let basketNum = 0;

function openModal(){ modal.setAttribute('aria-hidden','false'); }
function closeModal(){ modal.setAttribute('aria-hidden','true'); detailsCard.hidden = true; }
modalClose.addEventListener('click', closeModal);
modal.querySelector('.modal__backdrop').addEventListener('click', closeModal);

// showroom (full-bleed on click)
document.querySelector('.tab--showroom .tab__content').addEventListener('click', () => {
  viewport.textContent = 'SHOWROOM — FULLSCREEN';
  detailsCard.hidden = true;
  openModal();
});
document.querySelector('.tab--showroom .tab__orb').addEventListener('click', (e) => {
  e.stopPropagation();
  viewport.textContent = 'SHOWROOM — FULLSCREEN';
  detailsCard.hidden = false; // shows white spec card for showroom too (for now)
  openModal();
});

// open product: its OWN images, name, price, sizes/options
function openProduct(item, opts = {}){
  let imgIndex = 0;
  viewport.textContent = '';
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;gap:10px';

  const big = document.createElement('div');
  big.className = 'modal__big';
  big.style.cssText = 'background:#000;color:#fff;display:grid;place-items:center;height:48vh';
  big.textContent = item.images?.length ? `${item.title} — view 1/${item.images.length}` : item.title;
  wrap.appendChild(big);

  const ctrls = document.createElement('div');
  ctrls.style.cssText = 'display:flex;justify-content:center;gap:12px';
  const prev = document.createElement('button'); prev.textContent = '‹'; prev.className = 'btn';
  const next = document.createElement('button'); next.textContent = '›'; next.className = 'btn';
  ctrls.appendChild(prev); ctrls.appendChild(next);
  wrap.appendChild(ctrls);

  function updateBig(){
    big.textContent = item.images?.length
      ? `${item.title} — view ${imgIndex+1}/${item.images.length}`
      : item.title;
  }
  prev.onclick = () => { if (!item.images?.length) return; imgIndex = (imgIndex - 1 + item.images.length) % item.images.length; updateBig(); };
  next.onclick = () => { if (!item.images?.length) return; imgIndex = (imgIndex + 1) % item.images.length; updateBig(); };

  viewport.appendChild(wrap);

  // fill details card with THIS item’s info
  const card = detailsCard;
  card.querySelector('h3').textContent = item.title;
  card.querySelector('p').textContent  = item.price ? `Price: ${item.price}` : '—';
  const sizeSel = card.querySelector('select');
  sizeSel.innerHTML = '<option>—</option>' + (item.sizes || []).map(s => `<option>${s}</option>`).join('');
  card.hidden = !opts.showDetails;

  // buy / add
  card.querySelector('.btn.buy').onclick = () => { /* later: checkout flow */ card.hidden = true; closeModal(); };
  card.querySelector('.btn.add').onclick = () => { basketNum += 1; basketCount.textContent = String(basketNum); card.hidden = true; closeModal(); };

  openModal();
}

/* ======= PLAYER (unchanged) ======= */
const tracks = ['assets/audio/track1.mp3','assets/audio/track2.mp3'].filter(Boolean);
const audio = document.getElementById('playerAudio');
let tIndex = 0;
function loadTrack(){ if (tracks.length) audio.src = tracks[tIndex]; }
function pulse(which){
  const sel = which === 'prev' ? '.orb-glow--prev' : which === 'next' ? '.orb-glow--next' : '.orb-glow--toggle';
  const el = document.querySelector(sel);
  el.classList.add('is-on'); setTimeout(()=>el.classList.remove('is-on'), 220);
}
document.querySelector('.player__hit--prev').addEventListener('click', () => {
  if (tracks.length){ tIndex = (tIndex - 1 + tracks.length) % tracks.length; loadTrack(); audio.play().catch(()=>{}); }
  pulse('prev');
});
document.querySelector('.player__hit--toggle').addEventListener('click', () => {
  if (audio.paused){ audio.play().catch(()=>{}); } else { audio.pause(); }
  pulse('toggle');
});
document.querySelector('.player__hit--next').addEventListener('click', () => {
  if (tracks.length){ tIndex = (tIndex + 1) % tracks.length; loadTrack(); audio.play().catch(()=>{}); }
  pulse('next');
});
loadTrack();

/* ======= INIT ======= */
renderGrid();