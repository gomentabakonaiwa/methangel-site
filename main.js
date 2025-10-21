/* ---------- DATA ---------- */
const PRODUCTS = Array.from({ length: 20 }).map((_, i) => ({
  id: `prod-${i+1}`,
  title: `Object #${i+1}`,
  images: [`placeholder-${i+1}-1`, `placeholder-${i+1}-2`], // swap to real images later
}));

/* ---------- GRID / PAGER (2 cols visible; unlimited columns) ---------- */
const grid = document.getElementById('tabGrid');
const dotsWrap = document.getElementById('pagerDots');
const leftBtn = document.getElementById('arrowLeft');
const rightBtn = document.getElementById('arrowRight');

const ROWS_VISIBLE = 4; // two columns x four rows = 8 visible
const COLS_VISIBLE = 2;
const COL_SIZE = ROWS_VISIBLE;
const TOTAL_COLS = Math.ceil(PRODUCTS.length / ROWS_VISIBLE);
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
        <img class="frame" src="assets/img/frame_tab.png" alt="">
        <div class="tab__content" title="${item.title}"></div>
        <button class="tab__orb" aria-label="Details"></button>
      `;

      // click tile -> expand
      el.querySelector('.tab__content').addEventListener('click', () => openProduct(item));
      // small orb -> details card
      el.querySelector('.tab__orb').addEventListener('click', (e) => { e.stopPropagation(); openProduct(item, {showDetails:true}); });
      grid.appendChild(el);
    }
  }
  renderDots();
}
function renderDots(){
  dotsWrap.innerHTML = '';
  for (let i = 0; i < TOTAL_COLS; i++){
    const d = document.createElement('div');
    d.className = 'dot' + (i >= colIndex && i < colIndex + COLS_VISIBLE ? ' active':'');
    dotsWrap.appendChild(d);
  }
}
leftBtn.addEventListener('click', () => {
  if (colIndex > 0){ colIndex--; renderGrid(); }
});
rightBtn.addEventListener('click', () => {
  if (colIndex < TOTAL_COLS - COLS_VISIBLE){ colIndex++; renderGrid(); }
});

/* ---------- SHOWROOM ---------- */
const modal = document.getElementById('modal');
const modalClose = modal.querySelector('.modal__close');
const detailsCard = modal.querySelector('.details-card');
const viewport = modal.querySelector('.modal__viewport');

function openModal(){ modal.setAttribute('aria-hidden','false'); }
function closeModal(){ modal.setAttribute('aria-hidden','true'); detailsCard.hidden = true; }
modalClose.addEventListener('click', closeModal);
modal.querySelector('.modal__backdrop').addEventListener('click', closeModal);

document.querySelector('.tab--showroom .tab__content').addEventListener('click', () => {
  viewport.textContent = 'SHOWROOM — FULLSCREEN';
  openModal();
});
document.querySelector('.tab--showroom .tab__orb').addEventListener('click', (e) => {
  e.stopPropagation();
  viewport.textContent = 'SHOWROOM — FULLSCREEN';
  detailsCard.hidden = false;
  openModal();
});

/* ---------- PRODUCT EXPAND + DETAILS ---------- */
function openProduct(item, opts = {}){
  let imgIndex = 0;
  viewport.textContent = ''; // replace placeholder
  // simple in-modal gallery frame
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:grid;place-items:center;gap:8px;width:100%;height:100%';
  const big = document.createElement('div');
  big.style.cssText = 'width:100%;height:100%;display:grid;place-items:center;color:#fff;background:#000;';
  big.textContent = `${item.title} — view ${imgIndex+1}/${item.images.length}`;
  wrap.appendChild(big);
  // arrows inside modal
  const ctrls = document.createElement('div');
  ctrls.style.cssText = 'display:flex;gap:12px;justify-content:center';
  const prev = document.createElement('button'); prev.textContent = '‹'; prev.className='btn';
  const next = document.createElement('button'); next.textContent = '›'; next.className='btn';
  ctrls.appendChild(prev); ctrls.appendChild(next);
  wrap.appendChild(ctrlls);
  viewport.appendChild(wrap);

  function update(){ big.textContent = `${item.title} — view ${imgIndex+1}/${item.images.length}`; }
  prev.onclick = () => { imgIndex = (imgIndex - 1 + item.images.length) % item.images.length; update(); };
  next.onclick = () => { imgIndex = (imgIndex + 1) % item.images.length; update(); };

  detailsCard.hidden = !opts.showDetails;
  openModal();

  // buy / add
  modal.querySelector('.btn.buy').onclick = () => { /* checkout later */ detailsCard.hidden = true; closeModal(); };
  modal.querySelector('.btn.add').onclick = () => { addToBasket(1); detailsCard.hidden = true; closeModal(); };
}

/* ---------- BASKET COUNT ---------- */
const basketCount = document.getElementById('basket-count');
let basketNum = 0;
function addToBasket(n=1){ basketNum += n; basketCount.textContent = String(basketNum); }

/* ---------- MUSIC (single sprite + hit areas) ---------- */
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

/* ---------- INIT ---------- */
renderGrid();