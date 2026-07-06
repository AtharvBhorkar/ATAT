/* nav js*/

document.addEventListener('DOMContentLoaded', () => {

 
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    
    const mobileOnlyItems = navLinks.querySelectorAll('.mobile-only');
    if (mobileOnlyItems.length === 0) {
      const signInLi = document.createElement('li');
      signInLi.className = 'mobile-only';
      signInLi.innerHTML = '<a href="login.html" class="nav-btn-signin">Sign In</a>';

      const bookLi = document.createElement('li');
      bookLi.className = 'mobile-only';
      bookLi.innerHTML = '<a href="booking.html" class="nav-btn-book">Book a Ride</a>';

      navLinks.appendChild(signInLi);
      navLinks.appendChild(bookLi);
    }

    hamburger.addEventListener('click', () => {
      const open = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', open);
      hamburger.setAttribute('aria-expanded', open);
    });

  
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      })
    );

  
    document.addEventListener('click', e => {
      if (navbar && !navbar.contains(e.target)) {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      }
    });
  }

}); 

// counter animation
function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const suffix = el.dataset.suffix || '';
  const decimal = parseInt(el.dataset.decimal) || 0;
  const duration = 1800;
  const steps = 60;
  const increment = target / steps;
  let current = 0;
  let count = 0;

  const hasStar = el.querySelector('.stat-star');
  if (hasStar) el.innerHTML = '<span class="stat-star">★</span>';

  const timer = setInterval(() => {
    count++;
    current += increment;
    if (count >= steps) {
      current = target;
      clearInterval(timer);
    }
    const display = decimal > 0 ? current.toFixed(decimal) : Math.floor(current).toLocaleString('en-IN');
    if (hasStar || el.dataset.decimal) {
      el.innerHTML = display + suffix + '<span class="stat-star">★</span>';
    } else {
      el.textContent = display + suffix;
    }
  }, duration / steps);
}

const statsBar = document.querySelector('.stats-bar');
const statNums = document.querySelectorAll('.stat-num[data-target]');
let statsAnimated = false;

const statsObserver = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !statsAnimated) {
    statsAnimated = true;
    statNums.forEach(el => animateCounter(el));
  }
}, { threshold: 0.3 });

statsObserver.observe(statsBar);

// FILTER 
const filterBtns = document.querySelectorAll('.filter-btn');
const allCards = document.querySelectorAll('.review-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;

    allCards.forEach(card => {
      const cat = card.dataset.category;
      const rating = card.dataset.rating;

      let show = false;
      if (filter === 'all') {
        show = true;
      } else if (filter === '5') {
        show = rating === '5';
      } else {
        show = cat === filter;
      }

      card.style.display = show ? '' : 'none';
    });

    shownCount = INITIAL_COUNT;
    applyShowMore();
  });
});

//  SHOW MORE / LESS 
const INITIAL_COUNT = 6;
const LOAD_STEP = 3;
let shownCount = INITIAL_COUNT;

const showMoreBtn = document.getElementById('showMoreBtn');
const showLessBtn = document.getElementById('showLessBtn');

function getVisibleCards() {
  return Array.from(allCards).filter(c => c.style.display !== 'none');
}

function applyShowMore() {
  const visible = getVisibleCards();
  visible.forEach((card, i) => {
    if (i < shownCount) {
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
  showMoreBtn.style.display = shownCount < visible.length ? 'inline-block' : 'none';
  showLessBtn.style.display = shownCount > INITIAL_COUNT ? 'inline-block' : 'none';
}

showMoreBtn.addEventListener('click', () => {
  shownCount += LOAD_STEP;
  applyShowMore();
});

showLessBtn.addEventListener('click', () => {
  shownCount = INITIAL_COUNT;
  applyShowMore();
  document.querySelector('.reviews-section').scrollIntoView({ behavior: 'smooth' });
});

applyShowMore();

// STAR PICKER 
const stars = document.querySelectorAll('.star');
const ratingVal = document.getElementById('ratingVal');

stars.forEach(star => {
  star.addEventListener('mouseenter', () => {
    const val = parseInt(star.dataset.val);
    stars.forEach((s, i) => s.classList.toggle('active', i < val));
  });

  star.addEventListener('click', () => {
    const val = parseInt(star.dataset.val);
    ratingVal.value = val;
    stars.forEach((s, i) => s.classList.toggle('active', i < val));
  });
});

document.querySelector('.star-picker').addEventListener('mouseleave', () => {
  const selected = parseInt(ratingVal.value);
  stars.forEach((s, i) => s.classList.toggle('active', i < selected));
});

// FILE UPLOAD 
document.getElementById('photoUpload').addEventListener('change', function () {
  const name = this.files[0] ? this.files[0].name : 'No file chosen';
  document.getElementById('fileName').textContent = name;
});

//  FORM SUBMIT 
document.getElementById('reviewForm').addEventListener('submit', function (e) {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  success.style.display = 'block';
  this.reset();
  ratingVal.value = 0;
  stars.forEach(s => s.classList.remove('active'));
  document.getElementById('fileName').textContent = 'No file chosen';
  setTimeout(() => (success.style.display = 'none'), 4000);
});

//  SCROLL REVEAL 
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.review-card, .platform-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(30px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  revealObserver.observe(el);
});