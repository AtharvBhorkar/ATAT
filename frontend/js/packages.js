/* ═══════════════════════════════════════════════════════════════
   VOYAGO — packages.js
   Handles: Filter tabs, search filtering, animated counters,
   load more, scroll effects, parallax, and mobile navigation.
   ═══════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─────────────────────────────────────────
     1. NAVIGATION & SCROLL EFFECTS
     ───────────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  const onScroll = () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Mobile Menu Toggle
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      navLinks.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
    });

    // Close when links clicked
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        navLinks.classList.remove('open');
        hamburger.setAttribute('aria-expanded', false);
      });
    });
  }

  // Parallax Hero Background
  const heroBg = document.getElementById('pkHeroBg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const depth = window.scrollY * 0.3;
      heroBg.style.transform = `translateY(${depth}px) scale(1.05)`;
    }, { passive: true });
  }


  /* ─────────────────────────────────────────
     2. ANIMATED STAT COUNTERS
     ───────────────────────────────────────── */
  function animateCounter(el, target, suffix = '', duration = 1500) {
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }

  // Observer to start stats counter when visible
  const statsSection = document.querySelector('.stats-bar-section');
  if (statsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(document.getElementById('statPackages'), 50, '+');
          animateCounter(document.getElementById('statDests'), 120, '+');
          animateCounter(document.getElementById('statTrips'), 15000, '+');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    observer.observe(statsSection);
  }


  /* ─────────────────────────────────────────
     3. PACKAGES STATED DATA & LOAD MORE
     ───────────────────────────────────────── */
  const cards = Array.from(document.querySelectorAll('.package-card'));
  const loadMoreBtn = document.getElementById('loadMoreBtn');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  const noResultsState = document.getElementById('noResultsState');
  const searchQueryWord = document.getElementById('searchQueryWord');
  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  
  // Tab Elements
  const tabs = document.querySelectorAll('#pkgTabs .tab-btn');
  const searchInput = document.getElementById('pkgSearchInput');

  // Filter Pills Elements
  const activeFilterPills = document.getElementById('activeFilterPills');
  const pillsContainer = document.getElementById('pillsContainer');
  const clearAllFiltersBtn = document.getElementById('clearAllFiltersBtn');

  // Page State variables
  let currentCategory = 'all';
  let searchQuery = '';
  let itemsLimit = 8;

  // Read URL parameters for automatic category filter
  const urlParams = new URLSearchParams(window.location.search);
  const initialType = urlParams.get('type'); // e.g. "pilgrimage", "corporate", "hill", "weekend"
  if (initialType) {
    const matchedTab = Array.from(tabs).find(tab => tab.dataset.filter === initialType.toLowerCase());
    if (matchedTab) {
      tabs.forEach(t => t.classList.remove('active'));
      matchedTab.classList.add('active');
      currentCategory = initialType.toLowerCase();
    }
  }

  // Apply filters and layout updates
  function updatePackagesGrid() {
    let visibleCount = 0;
    let totalMatching = 0;

    cards.forEach(card => {
      const cardCategory = card.dataset.category;
      const cardTitle = card.querySelector('h3').textContent.toLowerCase();
      const cardDesc = card.querySelector('p').textContent.toLowerCase();
      
      const categoryMatches = (currentCategory === 'all' || cardCategory === currentCategory);
      const searchMatches = (!searchQuery || cardTitle.includes(searchQuery) || cardDesc.includes(searchQuery));

      if (categoryMatches && searchMatches) {
        totalMatching++;
        
        // Handle pagination/limit in "All" view with no search queries
        if (currentCategory === 'all' && !searchQuery) {
          if (visibleCount < itemsLimit) {
            card.style.display = 'flex';
            visibleCount++;
          } else {
            card.style.display = 'none';
          }
        } else {
          // If filtering or searching, show all matches immediately
          card.style.display = 'flex';
          visibleCount++;
        }
      } else {
        card.style.display = 'none';
      }
    });

    // Toggle No Results View
    if (totalMatching === 0) {
      noResultsState.style.display = 'block';
      searchQueryWord.textContent = searchQuery || currentCategory;
      loadMoreWrap.style.display = 'none';
    } else {
      noResultsState.style.display = 'none';
      
      // Load More button visibility
      if (currentCategory === 'all' && !searchQuery && totalMatching > itemsLimit) {
        loadMoreWrap.style.display = 'block';
      } else {
        loadMoreWrap.style.display = 'none';
      }
    }

    updateFilterPills();
  }

  // Handle Load More
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      itemsLimit = 12; // expand limit to show remaining packages
      updatePackagesGrid();
      
      // Stagger reveal animation for new elements
      const newlyVisible = cards.filter(card => card.style.display === 'flex' && !card.classList.contains('revealed'));
      newlyVisible.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('revealed');
        }, index * 80);
      });
    });
  }

  // Handle Tab Switch
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentCategory = tab.dataset.filter;
      updatePackagesGrid();
      
      // Apply immediate animations
      const activeCards = cards.filter(card => card.style.display === 'flex');
      activeCards.forEach((c, idx) => {
        c.classList.remove('revealed');
        void c.offsetWidth; // trigger reflow
        setTimeout(() => c.classList.add('revealed'), idx * 50);
      });
    });
  });

  // Handle Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      updatePackagesGrid();
    });
  }

  // Manage Filter Pills UI
  function updateFilterPills() {
    pillsContainer.innerHTML = '';
    let hasPills = false;

    if (currentCategory !== 'all') {
      const activeTabLabel = Array.from(tabs).find(t => t.dataset.filter === currentCategory).textContent;
      createPill(activeTabLabel, () => {
        const allTab = Array.from(tabs).find(t => t.dataset.filter === 'all');
        allTab.click();
      });
      hasPills = true;
    }

    if (searchQuery) {
      createPill(`Search: "${searchQuery}"`, () => {
        searchInput.value = '';
        searchQuery = '';
        updatePackagesGrid();
      });
      hasPills = true;
    }

    activeFilterPills.style.display = hasPills ? 'flex' : 'none';
  }

  function createPill(text, onRemove) {
    const pill = document.createElement('div');
    pill.className = 'filter-pill';
    pill.innerHTML = `<span>${text}</span>`;
    
    const removeBtn = document.createElement('button');
    removeBtn.className = 'filter-pill-close';
    removeBtn.innerHTML = '&times;';
    removeBtn.addEventListener('click', onRemove);
    
    pill.appendChild(removeBtn);
    pillsContainer.appendChild(pill);
  }

  // Reset Filters Functionality
  function resetAll() {
    searchInput.value = '';
    searchQuery = '';
    tabs.forEach(t => t.classList.remove('active'));
    const allTab = Array.from(tabs).find(t => t.dataset.filter === 'all');
    allTab.classList.add('active');
    currentCategory = 'all';
    itemsLimit = 8;
    updatePackagesGrid();
  }

  if (clearAllFiltersBtn) clearAllFiltersBtn.addEventListener('click', resetAll);
  if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetAll);

  // Initialize view
  updatePackagesGrid();


  /* ─────────────────────────────────────────
     4. SCROLL REVEAL ANIMATIONS
     ───────────────────────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || 0;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  // Initial trigger for observable reveals
  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

});
