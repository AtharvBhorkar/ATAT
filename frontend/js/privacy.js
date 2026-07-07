document.addEventListener('DOMContentLoaded', () => {
    // Intersection Observer for fade animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });

    // Accordion Logic
    const accordions = document.querySelectorAll('.accordion-header');

    accordions.forEach(acc => {
        acc.addEventListener('click', function () {
            // Close all others
            accordions.forEach(other => {
                if (other !== this) {
                    other.classList.remove('active');
                    other.nextElementSibling.style.maxHeight = null;
                    other.querySelector('.fa-chevron-down').style.transform = 'rotate(0deg)';
                }
            });

            // Toggle current
            this.classList.toggle('active');
            const content = this.nextElementSibling;
            const icon = this.querySelector('.fa-chevron-down');

            if (this.classList.contains('active')) {
                content.style.maxHeight = content.scrollHeight + "px";
                icon.style.transform = 'rotate(180deg)';
            } else {
                content.style.maxHeight = null;
                icon.style.transform = 'rotate(0deg)';
            }
        });
    });
});

{
    /* ------- PREMIUM ANIMATIONS ------- */
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
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { hamburger.classList.remove('open'); navLinks.classList.remove('open'); }));
        // Close on outside click
        document.addEventListener('click', e => { if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) { hamburger.classList.remove('open'); navLinks.classList.remove('open'); } });
    }
}
