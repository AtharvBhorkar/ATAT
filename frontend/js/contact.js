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
                // Change button state
                const originalBtnHtml = submitBtn.innerHTML;
                submitBtn.innerHTML = '<span>Sending...</span>';
                submitBtn.disabled = true;

                // Simulate network request
                setTimeout(() => {
                    formSuccess.classList.add('show');
                    contactForm.reset();
                    
                    // Reset button
                    submitBtn.innerHTML = originalBtnHtml;
                    submitBtn.disabled = false;
                    
                    // Hide success message after 5 seconds
                    setTimeout(() => {
                        formSuccess.classList.remove('show');
                    }, 5000);
                }, 1000);
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