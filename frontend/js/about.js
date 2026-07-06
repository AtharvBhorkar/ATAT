/* ============================================================
   about.js — ATAT Aman Tour and Travels | About Page Scripts
   ============================================================ */

/* ------- INTERSECTION OBSERVER FOR SCROLL ANIMATIONS ------- */
const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px"
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');

            // Counter animation logic
            if (entry.target.classList.contains('stat-card')) {
                const counter = entry.target.querySelector('.counter');
                if (counter && !counter.classList.contains('counted')) {
                    const target = parseFloat(counter.getAttribute('data-target'));
                    const suffix = counter.innerText.replace(/[0-9.]/g, '');
                    animateValue(counter, 0, target, 2000, suffix);
                    counter.classList.add('counted');
                }
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-up, .slide-in-left, .slide-in-right, .stat-card').forEach(el => {
    observer.observe(el);
});

/* ------- COUNTER ANIMATION ------- */
function animateValue(obj, start, end, duration, suffix) {
    let startTimestamp = null;
    const isDecimal = !Number.isInteger(end);
    const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        // Ease out quad
        const easeProgress = progress * (2 - progress);
        const current = easeProgress * (end - start) + start;
        obj.innerHTML = (isDecimal ? current.toFixed(1) : Math.floor(current)) + suffix;
        if (progress < 1) {
            window.requestAnimationFrame(step);
        }
    };
    window.requestAnimationFrame(step);
}

/* ------- PREMIUM SCROLL ANIMATIONS ------- */
{
    const premiumSections = document.querySelectorAll('section, .section, .hero, .footer-col');
    premiumSections.forEach(sec => {
        sec.classList.add('premium-reveal');
        sec.querySelectorAll('h1, h2, h3, p, .card, .stat-card').forEach(el => el.classList.add('premium-item'));
    });
    const premiumObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                premiumObs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });
    premiumSections.forEach(sec => premiumObs.observe(sec));
}

/* ------- NAVBAR SCROLL ------- */
const navbar = document.getElementById('navbar');
const onScroll = () => { if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 40); };
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ------- HAMBURGER MENU ------- */
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
        const open = hamburger.classList.toggle('open');
        navLinks.classList.toggle('open', open);
        hamburger.setAttribute('aria-expanded', open);
    });
    // Close on link click
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
    }));
    // Close on outside click
    document.addEventListener('click', e => {
        if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        }
    });
}
