// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('in-view');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -20px 0px' });

document.querySelectorAll(
  '.behind-title, .behind-desc, .cta-box-content, .behind-card'
).forEach(el => revealObserver.observe(el));

// ===== FILTER =====
const filterBtns = document.querySelectorAll('.filter-btn');
const allItems = document.querySelectorAll('.gallery-item');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    allItems.forEach(item => {
      const cat = item.dataset.category;
      item.style.display = (filter === 'all' || cat === filter) ? '' : 'none';
    });

    shownCount = INITIAL_COUNT;
    applyLoadMore();
  });
});

// ===== LOAD MORE / SHOW LESS =====
const INITIAL_COUNT = 14;
const LOAD_STEP = 10;
let shownCount = INITIAL_COUNT;
const loadMoreBtn = document.getElementById('loadMoreBtn');
const showLessBtn = document.getElementById('showLessBtn');

function getVisibleItems() {
  return Array.from(allItems).filter(item => item.style.display !== 'none');
}

function applyLoadMore() {
  const visible = getVisibleItems();
  visible.forEach((item, i) => {
    if (i < shownCount) {
      item.classList.remove('hidden');
      revealObserver.observe(item);
    } else {
      item.classList.add('hidden');
    }
  });
  loadMoreBtn.style.display = shownCount < visible.length ? 'inline-block' : 'none';
  showLessBtn.style.display = shownCount > INITIAL_COUNT ? 'inline-block' : 'none';
}

loadMoreBtn.addEventListener('click', () => { shownCount += LOAD_STEP; applyLoadMore(); });
showLessBtn.addEventListener('click', () => {
  shownCount = INITIAL_COUNT;
  applyLoadMore();
  document.getElementById('gallery').scrollIntoView({ behavior: 'smooth' });
});

applyLoadMore();

// ===== LIGHTBOX =====
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lbImg');
const lbCaption = document.getElementById('lbCaption');
const lbClose = document.getElementById('lbClose');
const lbPrev = document.getElementById('lbPrev');
const lbNext = document.getElementById('lbNext');
const lbLoader = document.getElementById('lbLoader');
const lbBackdrop = document.getElementById('lightboxBackdrop');

let lbItems = [];
let lbIndex = 0;

function buildLbItems() {
  lbItems = [];
  document.querySelectorAll('.gallery-item:not(.hidden) .gallery-card').forEach(card => {
    const img = card.querySelector('img');
    const title = card.querySelector('.card-title');
    lbItems.push({
      src: img.src.replace('w=700', 'w=1400').replace('w=1000', 'w=1400'),
      title: title ? title.textContent : ''
    });
  });
}

function openLb(index) {
  buildLbItems();
  lbIndex = index;
  showLbImg(lbIndex);
  lightbox.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLb() {
  lightbox.classList.remove('open');
  document.body.style.overflow = '';
}

function showLbImg(index) {
  lbLoader.classList.add('loading');
  lbImg.style.opacity = '0';
  const item = lbItems[index];
  lbImg.onload = () => { lbLoader.classList.remove('loading'); lbImg.style.opacity = '1'; };
  lbImg.src = item.src;
  lbCaption.textContent = item.title;
}

document.querySelectorAll('.gallery-card').forEach((card, i) => {
  card.addEventListener('click', () => openLb(i));
});

lbClose.addEventListener('click', closeLb);
lbBackdrop.addEventListener('click', closeLb);
lbPrev.addEventListener('click', e => { e.stopPropagation(); lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; showLbImg(lbIndex); });
lbNext.addEventListener('click', e => { e.stopPropagation(); lbIndex = (lbIndex + 1) % lbItems.length; showLbImg(lbIndex); });

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('open')) return;
  if (e.key === 'Escape') closeLb();
  if (e.key === 'ArrowLeft') { lbIndex = (lbIndex - 1 + lbItems.length) % lbItems.length; showLbImg(lbIndex); }
  if (e.key === 'ArrowRight') { lbIndex = (lbIndex + 1) % lbItems.length; showLbImg(lbIndex); }
});

// ===== BEHIND CARDS STAGGERED REVEAL =====
const behindCards = document.querySelectorAll('.behind-card');
const behindObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, idx) => {
    if (entry.isIntersecting) {
      setTimeout(() => {
        entry.target.classList.add('in-view');
      }, idx * 100);
      behindObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

behindCards.forEach(card => behindObserver.observe(card));

// == BEHIND THE JOURNEY ==//


const revealEls = document.querySelectorAll('.behind-title, .behind-desc');
const revObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('in-view');
      revObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => revObs.observe(el));