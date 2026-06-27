// ===== FAQ ACCORDION =====
const faqItems = document.querySelectorAll('.faq-item');

function closeAllFaqs() {
  faqItems.forEach(i => {
    i.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
    i.querySelector('.faq-a').classList.remove('open');
  });
}

faqItems.forEach(item => {
  const btn = item.querySelector('.faq-q');
  const ans = item.querySelector('.faq-a');

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    closeAllFaqs();
    if (!isOpen) {
      btn.setAttribute('aria-expanded', 'true');
      ans.classList.add('open');
    }
  });
});

// Kahi bhi click karo toh FAQ band ho jaye
document.addEventListener('click', () => {
  closeAllFaqs();
});

// ===== TOC ACTIVE LINK ON SCROLL =====
const tocLinks = document.querySelectorAll('.toc-link');
const sections = document.querySelectorAll('.policy-section');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      tocLinks.forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === id) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

sections.forEach(sec => sectionObserver.observe(sec));

// ===== TOC SMOOTH SCROLL =====
tocLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ===== CANCEL FORM SUBMIT =====
const cancelForm = document.getElementById('cancelForm');
const cfSuccess = document.getElementById('cfSuccess');

if (cancelForm) {
  cancelForm.addEventListener('submit', (e) => {
    e.preventDefault();
    cfSuccess.style.display = 'block';
    cancelForm.reset();
    setTimeout(() => { cfSuccess.style.display = 'none'; }, 5000);
  });
}

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.opacity = '1';
      e.target.style.transform = 'translateY(0)';
      revealObserver.unobserve(e.target);
    }
  });
}, { threshold: 0.08 });

document.querySelectorAll(
  '.refund-card, .special-col, .rs-card, .step-item, .faq-item, .contact-card'
).forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(22px)';
  el.style.transition = 'opacity 0.55s ease, transform 0.55s ease';
  revealObserver.observe(el);
});


// ===== PILL NAV ACTIVE ON SCROLL =====
const pills = document.querySelectorAll('.toc-pill');

// Click par active
pills.forEach(pill => {
  pill.addEventListener('click', () => {
    pills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
  });
});

// Scroll par active — lekin sirf tab jab koi section visible ho
const sectionObserver2 = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      pills.forEach(p => p.classList.remove('active'));
      const matchingPill = document.querySelector(`.toc-pill[href="#${id}"]`);
      if (matchingPill) matchingPill.classList.add('active');
    }
  });
}, { threshold: 0.3, rootMargin: '-10% 0px -60% 0px' });

sections.forEach(sec => sectionObserver2.observe(sec));