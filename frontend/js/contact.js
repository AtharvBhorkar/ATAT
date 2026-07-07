// Executing directly since script is at the bottom of the body
    
    // Navbar logic is now handled in the HTML inline script

    // --- 1. Intersection Observer for Scroll Animations ---
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

    // Observe all elements with .fade-up
    document.querySelectorAll('.fade-up').forEach(el => {
        observer.observe(el);
    });

    // --- 2. Form Validation & Submission ---
    const contactForm = document.getElementById('contactForm');
    const formSuccess = document.getElementById('formSuccess');
    const submitBtn = document.querySelector('.submit-btn');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent actual submission for demo
            
            let isValid = true;
            
            // Get inputs
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const msgInput = document.getElementById('message');
            
            // Regex for email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // Reset errors
            document.querySelectorAll('.input-group').forEach(group => {
                group.classList.remove('error');
            });
            formSuccess.classList.remove('show');

            // Validate Name
            if (nameInput.value.trim() === '') {
                nameInput.parentElement.classList.add('error');
                isValid = false;
            }

            // Validate Email
            if (emailInput.value.trim() === '' || !emailRegex.test(emailInput.value)) {
                emailInput.parentElement.classList.add('error');
                isValid = false;
            }

            // Validate Message
            if (msgInput.value.trim() === '') {
                msgInput.parentElement.classList.add('error');
                isValid = false;
            }

            // If valid, show success and clear form
            if (isValid) {
                const originalBtnHtml = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span>Sending...</span>';
                submitBtn.disabled = true;

                const payload = {
                    name: nameInput.value.trim(),
                    email: emailInput.value.trim(),
                    message: msgInput.value.trim()
                };

                fetch('/api/contacts', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            formSuccess.classList.add('show');
                            contactForm.reset();
                            
                            setTimeout(() => {
                                formSuccess.classList.remove('show');
                            }, 5000);
                        } else {
                            alert('Failed to send message: ' + data.message);
                        }
                    })
                    .catch(err => {
                        console.error('Contact submission error:', err);
                        alert('A network error occurred. Please try again.');
                    })
                    .finally(() => {
                        submitBtn.innerHTML = originalBtnHtml;
                        submitBtn.disabled = false;
                    });
            }
        });
        
        // Remove error state on input
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                input.parentElement.classList.remove('error');
            });
        });
    }

    // --- 3. FAQ Accordion ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        question.addEventListener('click', () => {
            // Close other items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            // Toggle current item
            item.classList.toggle('active');
        });
    });
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