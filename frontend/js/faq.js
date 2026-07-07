// Executing directly since script is at the bottom of the body
    
    // --- 1. Navbar Scroll Effect ---
    const navbar = document.querySelector('.premium-nav');
    if(navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    // --- 2. Intersection Observer for Scroll Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                observer.unobserve(entry.target); // Run once
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });

    // --- 3. Accordion Logic ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    accordionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            // Check if this header is currently active
            const isActive = header.classList.contains('active');

            // If it was active, close it
            if (isActive) {
                header.classList.remove('active');
                header.parentElement.classList.remove('active');
                const content = header.nextElementSibling;
                content.style.maxHeight = null;
            } else {
                // If it wasn't active, open it
                header.classList.add('active');
                header.parentElement.classList.add('active');
                const content = header.nextElementSibling;
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // --- 4. Sidebar Scrollspy ---
    const sections = document.querySelectorAll('.faq-group');
    const navLinks = document.querySelectorAll('.faq-nav a');
    
    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                if (scrollY >= sectionTop - 150) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href').includes(current) && current !== '') {
                    link.classList.add('active');
                }
            });
        });
    }

    // --- 5. Search Filtering ---
    const searchInput = document.getElementById('faqSearch');
    if (searchInput) {
        searchInput.addEventListener('input', function(e) {
            const term = e.target.value.toLowerCase();
            const faqItems = document.querySelectorAll('.accordion-item');
            
            faqItems.forEach(item => {
                const text = item.textContent.toLowerCase();
                if (text.includes(term)) {
                    item.style.display = 'block';
                } else {
                    item.style.display = 'none';
                }
            });
        });
    }
// End of script

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