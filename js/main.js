/* ============================================================
   MAIN.JS — Navbar interactions + scroll reveal
   ============================================================ */

(function () {
  'use strict';

  /* ── Elements ── */
  const navbar     = document.getElementById('navbar');
  const hamburger  = document.getElementById('navHamburger');
  const mobileMenu = document.getElementById('navMobile');
  const navLinks   = document.querySelectorAll('.navbar__link, .navbar__mobile-link');

  /* ── Hero Video Audio Toggle ── */
  const heroVideo = document.getElementById('heroVideo');
  const heroLoader = document.getElementById('heroLoader');
  const heroMuteBtn = document.getElementById('heroMuteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const unmuteIcon = document.getElementById('unmuteIcon');

  if (heroVideo && heroMuteBtn) {
    // Start muted so browser autoplay is allowed immediately.
    heroVideo.defaultMuted = true;
    heroVideo.muted = true;
    heroVideo.volume = 1;
    updateMuteButtonUI(true);

    // Start the hero video automatically. Do not attach any global
    // pointer/keyboard handler, so clicking other controls (including
    // CrimBot) cannot accidentally start the video.
    const initialPlay = heroVideo.play();
    if (initialPlay && typeof initialPlay.catch === 'function') {
      initialPlay.catch(function () {});
    }

    // The volume button is the only control that changes the video's audio.
    heroMuteBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      const isMuted = heroVideo.muted;
      heroVideo.muted = !isMuted;
      updateMuteButtonUI(!isMuted);
      heroVideo.play().catch(function() {});
    });

    function updateMuteButtonUI(isMuted) {
      if (isMuted) {
        muteIcon.style.display = 'block';
        unmuteIcon.style.display = 'none';
        heroMuteBtn.setAttribute('aria-label', 'Unmute video');
      } else {
        muteIcon.style.display = 'none';
        unmuteIcon.style.display = 'block';
        heroMuteBtn.setAttribute('aria-label', 'Mute video');
      }
    }

  }

  if (heroVideo && heroLoader) {
    const loaderShownAt = performance.now();
    let loaderDismissed = false;

    function dismissHeroLoader() {
      if (loaderDismissed) return;
      loaderDismissed = true;
      const minimumDisplay = 900;
      const remaining = Math.max(0, minimumDisplay - (performance.now() - loaderShownAt));

      window.setTimeout(function () {
        heroLoader.classList.add('is-hidden');
        heroLoader.setAttribute('aria-hidden', 'true');
      }, remaining);
    }

    if (heroVideo.readyState >= 3) {
      dismissHeroLoader();
    } else {
      heroVideo.addEventListener('canplay', dismissHeroLoader, { once: true });
      heroVideo.addEventListener('loadeddata', dismissHeroLoader, { once: true });
    }

    // Never leave the banner covered if the video is delayed or unavailable.
    window.setTimeout(dismissHeroLoader, 8000);
  }


  /* Lazy-load non-hero background videos near the viewport. */
  const lazyBackgroundVideos = document.querySelectorAll(
    '.rare-presence__video, .rare-presence__video_mobile, ' +
    '.art-deco-section__video, .art-deco-section__video_mobile'
  );

  function hydrateBackgroundVideo(video) {
    const sources = video.querySelectorAll('source[data-src]');
    sources.forEach(function (source) {
      if (!source.getAttribute('src')) source.setAttribute('src', source.getAttribute('data-src'));
    });
    if (sources.length) video.load();
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    const playback = video.play();
    if (playback && typeof playback.catch === 'function') playback.catch(function () {});
  }

  if (lazyBackgroundVideos.length && 'IntersectionObserver' in window) {
    const lazyVideoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && getComputedStyle(entry.target).display !== 'none') {
          hydrateBackgroundVideo(entry.target);
          lazyVideoObserver.unobserve(entry.target);
        }
      });
    }, { rootMargin: '500px 0px' });
    lazyBackgroundVideos.forEach(function (video) { lazyVideoObserver.observe(video); });
  }

  /* ── Navbar: darken on scroll ── */
  function handleScroll() {
    navbar.classList.toggle('is-scrolled', window.scrollY > 10);
  }
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  /* ── Hamburger toggle ── */
  hamburger.addEventListener('click', function () {
    const isOpen = hamburger.classList.toggle('is-open');
    mobileMenu.classList.toggle('is-open', isOpen);
    hamburger.setAttribute('aria-expanded', String(isOpen));
    mobileMenu.setAttribute('aria-hidden', String(!isOpen));
  });

  /* ── Smooth scroll + active state + mobile close ── */
  navLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();

      /* Close mobile menu */
      hamburger.classList.remove('is-open');
      mobileMenu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');

      /* Update active state on desktop links */
      document.querySelectorAll('.navbar__link').forEach(function (l) {
        l.classList.remove('is-active');
      });
      var desktop = document.querySelector('.navbar__link[href="' + href + '"]');
      if (desktop) desktop.classList.add('is-active');

      /* Scroll to target offset by navbar height */
      var target = document.querySelector(href);
      if (!target) return;
      var navH = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-height'), 10) || 72;
      var top = target.getBoundingClientRect().top + window.scrollY - navH;
      window.scrollTo({ top: top, behavior: 'smooth' });
    });
  });

  /* ── Generic scroll-reveal for future sections ── */
  var revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    revealEls.forEach(function (el) { observer.observe(el); });
  }



  /* ── Location Accordion (Dedicated Nested Panels) ── */
  const accItems = document.querySelectorAll('.gravity__acc-item');

  accItems.forEach(function (item) {
    const trigger = item.querySelector('.gravity__acc-trigger');
    const panel = item.querySelector('.gravity__acc-panel');

    const activateItem = function () {
      // Deactivate all other items
      accItems.forEach(function (otherItem) {
        if (otherItem !== item) {
          otherItem.classList.remove('is-open');
          otherItem.querySelector('.gravity__acc-trigger').setAttribute('aria-expanded', 'false');
          const otherPanel = otherItem.querySelector('.gravity__acc-panel');
          if (otherPanel) {
            otherPanel.style.maxHeight = null;
          }
        }
      });

      // Activate current item
      item.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');

      // Open panel
      if (panel) {
        panel.style.maxHeight = panel.scrollHeight + 'px';
      }
    };

    const deactivateAll = function () {
      accItems.forEach(function (anyItem) {
        anyItem.classList.remove('is-open');
        anyItem.querySelector('.gravity__acc-trigger').setAttribute('aria-expanded', 'false');
        const anyPanel = anyItem.querySelector('.gravity__acc-panel');
        if (anyPanel) {
          anyPanel.style.maxHeight = null;
        }
      });
    };

    trigger.addEventListener('click', function (e) {
      e.stopPropagation();
      if (item.classList.contains('is-open')) {
        deactivateAll();
      } else {
        activateItem();
      }
    });

    trigger.addEventListener('mouseenter', activateItem);
  });

  if (window.matchMedia('(max-width: 480px)').matches) {
    const mobileDefaultItem = document.querySelector('.gravity__acc-item[data-target="retail"]');
    if (mobileDefaultItem) {
      const mobileDefaultTrigger = mobileDefaultItem.querySelector('.gravity__acc-trigger');
      const mobileDefaultPanel = mobileDefaultItem.querySelector('.gravity__acc-panel');
      mobileDefaultItem.classList.add('is-open');
      mobileDefaultTrigger.setAttribute('aria-expanded', 'true');
      if (mobileDefaultPanel) {
        mobileDefaultPanel.style.maxHeight = mobileDefaultPanel.scrollHeight + 'px';
      }
    }
  }

  // Close accordion when mouse leaves the accordion container
  const accordionContainer = document.querySelector('.gravity__accordion');
  if (accordionContainer) {
    accordionContainer.addEventListener('mouseleave', function () {
      accItems.forEach(function (anyItem) {
        anyItem.classList.remove('is-open');
        anyItem.querySelector('.gravity__acc-trigger').setAttribute('aria-expanded', 'false');
        const panel = anyItem.querySelector('.gravity__acc-panel');
        if (panel) {
          panel.style.maxHeight = null;
        }
      });
    });
  }

  /* ── Gallery Centered Slider (Interior & Exterior Setup) ── */
  function setupGallerySlider(containerEl) {
    if (!containerEl) return;
    const slider = containerEl.querySelector('.gallery__slider');
    if (!slider) return;
    
    const originalSlides = Array.from(slider.querySelectorAll('.gallery__slide'));
    const numOriginals = originalSlides.length;
    const clonesToPrepare = 3;

    // Clone end slides and prepend them
    for (let i = numOriginals - 1; i >= numOriginals - clonesToPrepare; i--) {
      const clone = originalSlides[i].cloneNode(true);
      clone.classList.add('is-clone');
      slider.insertBefore(clone, slider.firstChild);
    }

    // Clone start slides and append them
    for (let i = 0; i < clonesToPrepare; i++) {
      const clone = originalSlides[i].cloneNode(true);
      clone.classList.add('is-clone');
      slider.appendChild(clone);
    }

    // Query all slides now (original + clones)
    const slides = slider.querySelectorAll('.gallery__slide');
    const prevBtn = containerEl.querySelector('.gallery__nav-btn--prev');
    const nextBtn = containerEl.querySelector('.gallery__nav-btn--next');
    let activeIdx = originalSlides.findIndex(function (slide) {
      return slide.classList.contains('is-active');
    });
    if (activeIdx === -1) activeIdx = 2; // fallback to 2
    let currentIndex = clonesToPrepare + activeIdx;
    if (currentIndex >= slides.length) {
      currentIndex = clonesToPrepare;
    }
    let isTransitioning = false;
    let transitionFallback = null;

    // Mouse drag state variables
    let isDragging = false;
    let dragStartX = 0;
    let dragStartTranslation = 0;
    let dragHasMoved = false;

    function goToSlide(index, animate = true) {
      currentIndex = index;

      if (!animate) {
        slider.style.transition = 'none';
      } else {
        slider.style.transition = '';
        isTransitioning = true;
        clearTimeout(transitionFallback);
        transitionFallback = setTimeout(function () {
          isTransitioning = false;
        }, 600);
      }

      slides.forEach(function (slide, idx) {
        slide.classList.toggle('is-active', idx === currentIndex);
      });

      const activeSlide = slides[currentIndex];
      if (activeSlide) {
        const slideWidth = activeSlide.offsetWidth;
        const containerWidth = containerEl.offsetWidth;
        const gap = window.innerWidth <= 768 ? 16 : 32;
        const translation = (containerWidth / 2) - (currentIndex * (slideWidth + gap) + (slideWidth / 2));

        slider.style.transform = `translateX(${translation}px)`;
      }

      if (!animate) {
        slider.offsetHeight; // force reflow
      }
    }

    slider.addEventListener('transitionend', function (e) {
      if (e.target !== slider || e.propertyName !== 'transform') return;
      clearTimeout(transitionFallback);
      isTransitioning = false;
      if (currentIndex >= clonesToPrepare + numOriginals) {
        goToSlide(clonesToPrepare, false);
      } else if (currentIndex < clonesToPrepare) {
        goToSlide(clonesToPrepare + numOriginals - 1, false);
      }
    });

    if (prevBtn && nextBtn) {
      prevBtn.addEventListener('click', function () {
        if (isTransitioning) return;
        goToSlide(currentIndex - 1);
      });
      nextBtn.addEventListener('click', function () {
        if (isTransitioning) return;
        goToSlide(currentIndex + 1);
      });
    }

    slides.forEach(function (slide, idx) {
      slide.addEventListener('click', function (e) {
        if (dragHasMoved) {
          e.preventDefault();
          return;
        }
        if (isTransitioning) return;
        if (currentIndex !== idx) {
          goToSlide(idx);
        }
      });
    });

    window.addEventListener('resize', function () {
      goToSlide(currentIndex, false);
    });

    // Helper to get current translateX value of slider
    function getTranslationX() {
      const style = window.getComputedStyle(slider);
      const transform = style.transform || style.webkitTransform;
      if (transform && transform !== 'none') {
        const matrix = transform.split('(')[1].split(')')[0].split(',');
        if (matrix.length === 6) {
          return parseFloat(matrix[4]);
        } else if (matrix.length === 16) {
          return parseFloat(matrix[12]);
        }
      }
      return 0;
    }

    // Mouse drag scroll support
    containerEl.addEventListener('dragstart', function (e) {
      e.preventDefault();
    });

    containerEl.addEventListener('mousedown', function (e) {
      if (isTransitioning) return;
      if (e.button !== 0) return; // Only allow left-click drag
      
      isDragging = true;
      dragStartX = e.clientX;
      dragStartTranslation = getTranslationX();
      dragHasMoved = false;
      
      slider.style.transition = 'none';
      containerEl.style.cursor = 'grabbing';
      document.body.style.cursor = 'grabbing';
      document.body.style.userSelect = 'none';
      document.body.style.webkitUserSelect = 'none';
    });

    window.addEventListener('mousemove', function (e) {
      if (!isDragging) return;
      const diffX = e.clientX - dragStartX;
      if (Math.abs(diffX) > 5) {
        dragHasMoved = true;
      }
      const newTranslation = dragStartTranslation + diffX;
      slider.style.transform = `translateX(${newTranslation}px)`;
    });

    const stopDrag = function (e) {
      if (!isDragging) return;
      isDragging = false;
      containerEl.style.cursor = 'grab';
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      slider.style.transition = '';
      
      const endX = e ? e.clientX : dragStartX;
      const diffX = endX - dragStartX;
      
      if (dragHasMoved && Math.abs(diffX) > 50) {
        if (diffX < 0) {
          goToSlide(currentIndex + 1);
        } else {
          goToSlide(currentIndex - 1);
        }
      } else if (dragHasMoved) {
        goToSlide(currentIndex);
      }

      setTimeout(function () {
        dragHasMoved = false;
      }, 50);
    };

    window.addEventListener('mouseup', stopDrag);
    containerEl.addEventListener('mouseleave', stopDrag);

    // One-finger touch drag support while preserving vertical page scrolling.
    // The track follows the finger so a swipe feels responsive before release.
    let touchStartX = 0;
    let touchStartY = 0;
    let touchCurrentX = 0;
    let touchStartTranslation = 0;
    let touchDirection = null;
    let isTouchDragging = false;

    containerEl.addEventListener('touchstart', function (e) {
      if (isTransitioning || e.touches.length !== 1) return;

      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      touchCurrentX = touchStartX;
      touchStartTranslation = getTranslationX();
      touchDirection = null;
      isTouchDragging = true;
    }, { passive: true });

    containerEl.addEventListener('touchmove', function (e) {
      if (!isTouchDragging || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const diffX = touch.clientX - touchStartX;
      const diffY = touch.clientY - touchStartY;
      touchCurrentX = touch.clientX;

      // Wait for a deliberate gesture, then lock it to one axis.
      if (!touchDirection && (Math.abs(diffX) > 6 || Math.abs(diffY) > 6)) {
        touchDirection = Math.abs(diffX) > Math.abs(diffY) ? 'horizontal' : 'vertical';
      }

      if (touchDirection !== 'horizontal') return;

      e.preventDefault();
      dragHasMoved = true;
      slider.style.transition = 'none';
      slider.style.transform = `translateX(${touchStartTranslation + diffX}px)`;
    }, { passive: false });

    const finishTouchDrag = function () {
      if (!isTouchDragging) return;
      isTouchDragging = false;
      slider.style.transition = '';

      const diffX = touchCurrentX - touchStartX;
      if (touchDirection === 'horizontal' && Math.abs(diffX) > 40) {
        goToSlide(currentIndex + (diffX < 0 ? 1 : -1));
      } else if (touchDirection === 'horizontal') {
        goToSlide(currentIndex);
      }

      touchDirection = null;
      setTimeout(function () {
        dragHasMoved = false;
      }, 50);
    };

    containerEl.addEventListener('touchend', finishTouchDrag, { passive: true });
    containerEl.addEventListener('touchcancel', finishTouchDrag, { passive: true });

    // Mouse wheel and trackpad scrolling move the gallery horizontally.
    let wheelTimeout = null;
    let accumulatedWheelDelta = 0;
    const WHEEL_THRESHOLD = 50;

    containerEl.addEventListener('wheel', function (e) {
      const wheelDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(wheelDelta) < 2) return;

      e.preventDefault();
      if (isTransitioning) return;

      accumulatedWheelDelta += wheelDelta;

      clearTimeout(wheelTimeout);
      wheelTimeout = setTimeout(function () {
        accumulatedWheelDelta = 0;
      }, 150);

      if (Math.abs(accumulatedWheelDelta) >= WHEEL_THRESHOLD) {
        goToSlide(currentIndex + (accumulatedWheelDelta > 0 ? 1 : -1));
        accumulatedWheelDelta = 0;
      }
    }, { passive: false });

    containerEl.setAttribute('tabindex', '0');
    containerEl.addEventListener('keydown', function (e) {
      if (isTransitioning) return;
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToSlide(currentIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToSlide(currentIndex + 1);
      }
    });

    // snap back if mouse leaves browser tab
    document.addEventListener('mouseleave', function () {
      if (isDragging) {
        stopDrag();
      }
    });

    // snap back if window loses focus
    window.addEventListener('blur', function () {
      if (isDragging) {
        stopDrag();
      }
    });

    setTimeout(function () {
      goToSlide(currentIndex, false);
    }, 100);
  }

  // Initialize both sliders
  const interiorContainer = document.getElementById('interiorSliderContainer');
  const exteriorContainer = document.getElementById('exteriorSliderContainer');
  setupGallerySlider(interiorContainer);
  setupGallerySlider(exteriorContainer);

  // ── Gallery Switch and Slider Section Sync ──
  const gallerySwitch = document.getElementById('gallerySwitch');
  const labelInterior = document.getElementById('labelInterior');
  const labelExterior = document.getElementById('labelExterior');
  const slidersSection = document.getElementById('gallery-sliders-container');
  const interiorGroup = document.getElementById('interiorGroup');
  const exteriorGroup = document.getElementById('exteriorGroup');

  if (gallerySwitch && slidersSection && interiorGroup && exteriorGroup) {
    const setGalleryMode = function (state, shouldScroll) {
      if (state === 'interior') {
        gallerySwitch.setAttribute('data-state', 'interior');
        labelInterior.classList.add('is-active');
        labelExterior.classList.remove('is-active');
        
        slidersSection.classList.add('is-visible');
        interiorGroup.style.display = 'block';
        exteriorGroup.style.display = 'none';
      } else if (state === 'exterior') {
        gallerySwitch.setAttribute('data-state', 'exterior');
        labelExterior.classList.add('is-active');
        labelInterior.classList.remove('is-active');
        
        slidersSection.classList.add('is-visible');
        interiorGroup.style.display = 'none';
        exteriorGroup.style.display = 'block';
      } else {
        // middle state
        gallerySwitch.setAttribute('data-state', 'middle');
        labelInterior.classList.remove('is-active');
        labelExterior.classList.remove('is-active');
        
        slidersSection.classList.remove('is-visible');
      }

      // Re-trigger layout alignment resize events for active sliders
      setTimeout(function() {
        window.dispatchEvent(new Event('resize'));
      }, 50);

      // Smooth scroll to the sliders section when selecting interior or exterior
      if (shouldScroll && (state === 'interior' || state === 'exterior')) {
        setTimeout(function() {
          const navH = parseInt(window.getComputedStyle(document.documentElement).getPropertyValue('--nav-height'), 10) || 78;
          const top = slidersSection.getBoundingClientRect().top + window.scrollY - navH;
          window.scrollTo({ top: top, behavior: 'smooth' });
        }, 150);
      }
    };

    const switchZoneLeft = document.getElementById('switchZoneLeft');
    const switchZoneRight = document.getElementById('switchZoneRight');

    // Drag-and-slide variables for the gallery switch ball
    let isDragging = false;
    let hasDragged = false;
    let startX = 0;
    let startTranslate = 33;
    let currentTranslate = 33;
    let isClickBlocked = false;

    const ball = gallerySwitch.querySelector('.gallery__switch-ball');

    const handleDragStart = function (clientX) {
      isDragging = true;
      hasDragged = false;
      startX = clientX;
      gallerySwitch.classList.add('is-dragging');
      document.body.classList.add('is-dragging');

      const isMobile = window.innerWidth <= 480;
      const maxT = isMobile ? 42 : 66;
      const midT = isMobile ? 21 : 33;

      const state = gallerySwitch.getAttribute('data-state') || 'middle';
      if (state === 'interior') startTranslate = 0;
      else if (state === 'exterior') startTranslate = maxT;
      else startTranslate = midT;

      currentTranslate = startTranslate;

      if (ball) {
        ball.style.transition = 'none';
      }
    };

    const handleDragMove = function (clientX) {
      if (!isDragging) return;
      const deltaX = clientX - startX;
      if (Math.abs(deltaX) > 4) {
        hasDragged = true;
      }
      const isMobile = window.innerWidth <= 480;
      const maxT = isMobile ? 42 : 66;

      currentTranslate = startTranslate + deltaX;
      currentTranslate = Math.max(0, Math.min(maxT, currentTranslate));

      if (ball) {
        ball.style.transform = `translateX(${currentTranslate}px)`;
      }
    };

    const handleDragEnd = function () {
      // Defensively strip dragging classes first so the cursor always resets
      gallerySwitch.classList.remove('is-dragging');
      document.body.classList.remove('is-dragging');

      if (!isDragging) return;
      isDragging = false;

      if (ball) {
        ball.style.transition = '';
        ball.style.transform = '';
      }

      if (hasDragged) {
        isClickBlocked = true;
        setTimeout(function () {
          isClickBlocked = false;
        }, 50);

        const isMobile = window.innerWidth <= 480;
        const maxT = isMobile ? 42 : 66;

        let targetState = 'middle';
        if (currentTranslate < maxT / 4) {
          targetState = 'interior';
        } else if (currentTranslate > 3 * maxT / 4) {
          targetState = 'exterior';
        } else {
          targetState = 'middle';
        }
        setGalleryMode(targetState, true);
      }
    };

    // Attach mouse event listeners to gallerySwitch
    gallerySwitch.addEventListener('mousedown', function (e) {
      if (e.button !== 0) return; // Only track left clicks
      e.preventDefault(); // Prevents selection
      handleDragStart(e.clientX);
    });

    // Attach touch event listeners to gallerySwitch
    gallerySwitch.addEventListener('touchstart', function (e) {
      if (e.touches && e.touches.length > 0) {
        handleDragStart(e.touches[0].clientX);
      }
    }, { passive: true });

    // Track move and end on window
    window.addEventListener('mousemove', function (e) {
      handleDragMove(e.clientX);
    });

    window.addEventListener('touchmove', function (e) {
      if (isDragging) {
        if (e.touches && e.touches.length > 0) {
          handleDragMove(e.touches[0].clientX);
        }
        e.preventDefault(); // Prevents page scrolling during drag
      }
    }, { passive: false });

    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchend', handleDragEnd);

    if (switchZoneLeft && switchZoneRight) {
      switchZoneLeft.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isClickBlocked) return;
        const currentState = gallerySwitch.getAttribute('data-state') || 'middle';
        if (currentState === 'interior') {
          setGalleryMode('middle', true);
        } else {
          setGalleryMode('interior', true);
        }
      });

      switchZoneRight.addEventListener('click', function (e) {
        e.stopPropagation();
        if (isClickBlocked) return;
        const currentState = gallerySwitch.getAttribute('data-state') || 'middle';
        if (currentState === 'exterior') {
          setGalleryMode('middle', true);
        } else {
          setGalleryMode('exterior', true);
        }
      });
    }

    gallerySwitch.addEventListener('click', function (e) {
      if (isClickBlocked) return;
      if (e.target === gallerySwitch) {
        const rect = gallerySwitch.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const currentState = gallerySwitch.getAttribute('data-state') || 'middle';
        if (clickX < rect.width / 2) {
          if (currentState === 'interior') setGalleryMode('middle', true);
          else setGalleryMode('interior', true);
        } else {
          if (currentState === 'exterior') setGalleryMode('middle', true);
          else setGalleryMode('exterior', true);
        }
      }
    });

    gallerySwitch.addEventListener('keydown', function (e) {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        const currentState = gallerySwitch.getAttribute('data-state') || 'middle';
        if (currentState === 'middle') {
          setGalleryMode('interior', true);
        } else if (currentState === 'interior') {
          setGalleryMode('exterior', true);
        } else {
          setGalleryMode('middle', true);
        }
      }
    });

    labelInterior.addEventListener('click', function () {
      setGalleryMode('interior', true);
    });

    labelExterior.addEventListener('click', function () {
      setGalleryMode('exterior', true);
    });

    // Default to middle, but sync state and auto-scroll if redirected from gallery page with hash
    const isFromGalleryRedirect = window.location.hash === '#gallery';
    const savedState = isFromGalleryRedirect ? (localStorage.getItem('gallery_state') || 'middle') : 'middle';
    setGalleryMode(savedState, isFromGalleryRedirect);
  }

  // ── Form Submissions (AJAX / Nodemailer integration) ──
  const previewForm = document.querySelector('.contact__form');
  const inquiryForm = document.querySelector('.inquiry__form');

  function handleFormSubmit(form, formType) {
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      // Submit Button Loading state
      const submitBtn = form.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.textContent = formType === 'private-preview' ? 'SUBMITTING...' : 'SENDING...';
      submitBtn.disabled = true;

      // Extract Form Data
      const formData = new FormData(form);
      const data = {
        formType: formType,
        fullname: formData.get('fullname'),
        phone: formData.get('phone'),
        email: formData.get('email')
      };

      if (formType === 'private-preview') {
        const checkboxes = form.querySelectorAll('input[name="explore"]:checked');
        data.explore = Array.from(checkboxes).map(cb => cb.value);
      } else {
        data.message = formData.get('message');
      }

      // Send post request (fallback to submit.php on server, use Node api on localhost)
      const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      const endpoint = 'submit.php';

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      .then(response => response.json())
      .then(resData => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        
        if (resData.success) {
          showFormSuccessModal(data.fullname);
          form.reset();
        } else {
          alert('Something went wrong. Please check your credentials or configuration.');
        }
      })
      .catch(err => {
        console.error('Submission error:', err);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        alert('Failed to connect to the server. Please run "npm start" on the project server.');
      });
    });
  }

  function showFormSuccessModal(name) {
    const overlay = document.createElement('div');
    overlay.className = 'form-success-overlay';
    overlay.innerHTML = `
      <div class="form-success-card">
        <h3 class="form-success-title">Thank You, <br><span class="form-success-name">${name}</span></h3>
        <div class="form-success-divider">&#9672;</div>
        <p class="form-success-message">
          Your request has been received. A confirmation email has been sent to your inbox. Our relationship team will connect with you shortly to curate your personalized Crimson experience.
        </p>
        <button class="form-success-btn">CLOSE</button>
      </div>
    `;
    document.body.appendChild(overlay);

    setTimeout(() => { overlay.classList.add('is-active'); }, 10);

    overlay.querySelector('.form-success-btn').addEventListener('click', () => {
      overlay.classList.remove('is-active');
      setTimeout(() => { overlay.remove(); }, 400);
    });
  }

  handleFormSubmit(previewForm, 'private-preview');
  handleFormSubmit(inquiryForm, 'inquiry');

  /* ── Stories in Motion Carousel ── */
  const storiesTrack = document.querySelector('.stories__carousel-track');
  const storiesViewport = document.querySelector('.stories__carousel-viewport');
  const storiesPrevBtn = document.querySelector('.stories__nav-btn--prev');
  const storiesNextBtn = document.querySelector('.stories__nav-btn--next');

  if (storiesTrack && storiesViewport) {
    const originalStoriesSlides = Array.from(storiesTrack.querySelectorAll('.stories__slide'));
    const totalStoriesSlides = originalStoriesSlides.length;
    const storyThumbnails = originalStoriesSlides.map(function (slide, index) {
      slide.dataset.originalIndex = index;
      const container = slide.querySelector('.stories__slide-image-container');
      return container ? container.innerHTML : '';
    });

    // Edge clones allow the last-to-first and first-to-last moves to remain animated.
    if (totalStoriesSlides > 1) {
      const firstClone = originalStoriesSlides[0].cloneNode(true);
      const lastClone = originalStoriesSlides[totalStoriesSlides - 1].cloneNode(true);
      firstClone.classList.add('is-clone');
      lastClone.classList.add('is-clone');
      firstClone.setAttribute('aria-hidden', 'true');
      lastClone.setAttribute('aria-hidden', 'true');
      storiesTrack.insertBefore(lastClone, originalStoriesSlides[0]);
      storiesTrack.appendChild(firstClone);
    }

    const storiesSlides = Array.from(storiesTrack.querySelectorAll('.stories__slide'));
    let storyTrackIndex = totalStoriesSlides > 1 ? 1 : 0;
    let isStoryAnimating = false;
    let storyDragStartX = 0;
    let storyDragX = 0;
    let isStoryDragging = false;
    let storyDragMoved = false;

    function resetStoryVideos() {
      storiesSlides.forEach(function (slide) {
        const container = slide.querySelector('.stories__slide-image-container');
        const originalIndex = Number(slide.dataset.originalIndex);
        if (container && container.querySelector('iframe') && storyThumbnails[originalIndex]) {
          container.innerHTML = storyThumbnails[originalIndex];
        }
      });
    }

    function positionStoryTrack(animate) {
      storiesTrack.style.transition = animate
        ? 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
        : 'none';
      storiesTrack.style.transform = `translateX(-${storyTrackIndex * 100}%)`;
      if (!animate) {
        storiesTrack.offsetHeight;
        storiesTrack.style.transition = '';
      }
    }

    function goToStory(index) {
      if (isStoryAnimating || totalStoriesSlides < 2) return;
      resetStoryVideos();
      storyTrackIndex = index;
      isStoryAnimating = true;
      positionStoryTrack(true);
    }

    storiesTrack.addEventListener('transitionend', function (e) {
      if (e.propertyName !== 'transform') return;
      isStoryAnimating = false;
      if (storyTrackIndex === 0) {
        storyTrackIndex = totalStoriesSlides;
        positionStoryTrack(false);
      } else if (storyTrackIndex === totalStoriesSlides + 1) {
        storyTrackIndex = 1;
        positionStoryTrack(false);
      }
    });

    storiesSlides.forEach(function (slide) {
      slide.addEventListener('click', function (e) {
        if (storyDragMoved || slide.classList.contains('is-clone')) return;
        const container = slide.querySelector('.stories__slide-image-container');
        if (!container || container.querySelector('iframe')) return;
        const videoId = slide.getAttribute('data-video-id');
        if (!videoId) return;
        e.preventDefault();
        container.innerHTML = `
          <iframe
            src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            class="stories__video-iframe"
          ></iframe>
        `;
      });
    });

    if (storiesPrevBtn) {
      storiesPrevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        goToStory(storyTrackIndex - 1);
      });
    }

    if (storiesNextBtn) {
      storiesNextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        goToStory(storyTrackIndex + 1);
      });
    }

    storiesViewport.setAttribute('tabindex', '0');
    storiesViewport.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goToStory(storyTrackIndex - 1);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goToStory(storyTrackIndex + 1);
      }
    });

    storiesViewport.addEventListener('pointerdown', function (e) {
      if (isStoryAnimating || e.button !== 0 || e.target.closest('iframe')) return;
      isStoryDragging = true;
      storyDragMoved = false;
      storyDragStartX = e.clientX;
      storyDragX = e.clientX;
      storiesTrack.style.transition = 'none';
      storiesViewport.classList.add('is-dragging');
      storiesViewport.setPointerCapture(e.pointerId);
    });

    storiesViewport.addEventListener('pointermove', function (e) {
      if (!isStoryDragging) return;
      storyDragX = e.clientX;
      const difference = storyDragX - storyDragStartX;
      if (Math.abs(difference) > 6) storyDragMoved = true;
      const baseTranslation = -storyTrackIndex * storiesViewport.offsetWidth;
      storiesTrack.style.transform = `translateX(${baseTranslation + difference}px)`;
    });

    function finishStoryDrag(e) {
      if (!isStoryDragging) return;
      isStoryDragging = false;
      storiesViewport.classList.remove('is-dragging');
      const difference = storyDragX - storyDragStartX;
      storiesTrack.style.transition = '';

      if (Math.abs(difference) > Math.min(70, storiesViewport.offsetWidth * 0.16)) {
        goToStory(storyTrackIndex + (difference < 0 ? 1 : -1));
      } else if (Math.abs(difference) > 1) {
        isStoryAnimating = true;
        positionStoryTrack(true);
      } else {
        isStoryAnimating = false;
        positionStoryTrack(false);
      }

      if (e && storiesViewport.hasPointerCapture(e.pointerId)) {
        storiesViewport.releasePointerCapture(e.pointerId);
      }
      setTimeout(function () { storyDragMoved = false; }, 100);
    }

    storiesViewport.addEventListener('pointerup', finishStoryDrag);
    storiesViewport.addEventListener('pointercancel', finishStoryDrag);

    let storiesWheelTotal = 0;
    let storiesWheelTimer = null;
    storiesViewport.addEventListener('wheel', function (e) {
      const wheelDelta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(wheelDelta) < 2) return;

      e.preventDefault();
      if (isStoryAnimating) return;

      storiesWheelTotal += wheelDelta;
      clearTimeout(storiesWheelTimer);
      storiesWheelTimer = setTimeout(function () { storiesWheelTotal = 0; }, 150);
      if (Math.abs(storiesWheelTotal) >= 50) {
        goToStory(storyTrackIndex + (storiesWheelTotal > 0 ? 1 : -1));
        storiesWheelTotal = 0;
      }
    }, { passive: false });

    positionStoryTrack(false);
  }

})();
