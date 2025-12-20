// Ultra-Modern Animations System
// Inspired by Jesko Jets, Telkom-OT, Hut8, Takahama Museum, and Ollivere
// Advanced scroll-triggered animations, morphing elements, and micro-interactions

class ModernAnimations {
    constructor() {
        this.isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.scrollPosition = 0;
        this.ticking = false;
        this.mousePosition = { x: 0, y: 0 };
        
        this.init();
        this.setupAdvancedScrollAnimations();
        this.setupMorphingAnimations();
        this.setupMagneticInteractions();
        this.setupFluidTransitions();
        this.setupParticleSystem();
        this.setupModalHandlers();
        this.fixButtonFunctionality();
    }

    init() {
        // Enhanced page loading with stagger effect
        document.body.style.opacity = '0';
        document.body.style.transform = 'scale(0.98)';
        
        window.addEventListener('load', () => {
            setTimeout(() => {
                document.body.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                document.body.style.opacity = '1';
                document.body.style.transform = 'scale(1)';
                
                // Stagger animation for initial elements
                this.staggerRevealElements();
            }, 100);
        });

        // Advanced intersection observer with multiple thresholds
        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const delay = parseInt(entry.target.dataset.delay) || 0;
                        setTimeout(() => {
                            entry.target.classList.add('visible');
                            this.triggerElementAnimation(entry.target);
                        }, delay * 100);
                    }
                });
            },
            {
                threshold: [0, 0.1, 0.5, 1],
                rootMargin: '0px 0px -100px 0px'
            }
        );

        // Mouse tracking for magnetic effects
        document.addEventListener('mousemove', (e) => {
            this.mousePosition = { x: e.clientX, y: e.clientY };
            this.updateMagneticElements();
        });

        this.setupSmoothScroll();
        this.trackScrollPerformance();
        this.fixButtonFunctionality();
    }

    staggerRevealElements() {
        const elements = document.querySelectorAll('.fade-up, .slide-in, .scale-up');
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.style.transform = 'translateY(0) scale(1)';
                el.style.opacity = '1';
            }, index * 100);
        });
    }

    setupAdvancedScrollAnimations() {
        // Multi-layer parallax system
        window.addEventListener('scroll', () => {
            if (!this.ticking) {
                requestAnimationFrame(() => {
                    this.updateScrollAnimations();
                    this.ticking = false;
                });
                this.ticking = true;
            }
        });

        // Observe elements with multiple animation types
        const animatedElements = document.querySelectorAll(`
            .fade-up, .fade-in, .slide-in-left, .slide-in-right, 
            .scale-up, .rotate-in, .blur-in, .stagger-children,
            .parallax-element, .morphing-shape, .floating-element
        `);
        
        animatedElements.forEach(el => {
            this.observer.observe(el);
        });

        // Setup morphing background shapes
        this.initMorphingShapes();
    }

    updateScrollAnimations() {
        const scrolled = window.pageYOffset;
        const windowHeight = window.innerHeight;
        
        // Multi-layer parallax
        this.updateParallaxLayers(scrolled);
        
        // Morphing navigation background
        this.updateNavigationBackground(scrolled);
        
        // Floating shapes animation
        this.updateFloatingShapes(scrolled);
        
        // Progress-based animations
        this.updateProgressAnimations(scrolled, windowHeight);
        
        this.scrollPosition = scrolled;
    }

    updateParallaxLayers(scrolled) {
        // Hero background layers with different speeds
        const heroLayers = [
            { selector: '.hero-bg', speed: 0.5 },
            { selector: '.floating-shapes', speed: 0.3 },
            { selector: '.hero-gradient', speed: 0.8 }
        ];

        heroLayers.forEach(layer => {
            const element = document.querySelector(layer.selector);
            if (element) {
                const yPos = -(scrolled * layer.speed);
                element.style.transform = `translate3d(0, ${yPos}px, 0)`;
            }
        });

        // Parallax cards and elements
        const parallaxElements = document.querySelectorAll('.parallax-element');
        parallaxElements.forEach(el => {
            const speed = parseFloat(el.dataset.speed) || 0.1;
            const yPos = -(scrolled * speed);
            el.style.transform = `translate3d(0, ${yPos}px, 0)`;
        });
    }

    updateNavigationBackground(scrolled) {
        // Disabled - keep nav transparent
        const nav = document.querySelector('.main-nav');
        if (nav) {
            nav.style.background = 'transparent';
            nav.style.backdropFilter = 'none';
            nav.style.borderBottom = 'none';
        }
    }

    updateFloatingShapes(scrolled) {
        const shapes = document.querySelectorAll('.floating-element, .shape');
        shapes.forEach((shape, index) => {
            const speed = 0.5 + (index * 0.1);
            const rotation = scrolled * 0.1 * (index % 2 === 0 ? 1 : -1);
            const yPos = Math.sin((scrolled + index * 100) * 0.01) * 20;
            
            shape.style.transform = `
                translate3d(0, ${yPos}px, 0) 
                rotate(${rotation}deg)
                scale(${1 + Math.sin(scrolled * 0.005) * 0.1})
            `;
        });
    }

    setupMorphingAnimations() {
        // Create morphing blob shapes in hero
        this.createMorphingBlobs();
        
        // Animated gradient backgrounds
        this.setupAnimatedGradients();
        
        // Text reveal animations
        this.setupTextRevealAnimations();
    }

    createMorphingBlobs() {
        const blobContainer = document.querySelector('.hero-bg');
        if (!blobContainer) return;

        for (let i = 0; i < 3; i++) {
            const blob = document.createElement('div');
            blob.className = `morphing-blob blob-${i + 1}`;
            blob.style.cssText = `
                position: absolute;
                width: ${200 + i * 100}px;
                height: ${200 + i * 100}px;
                background: linear-gradient(45deg, 
                    hsla(${200 + i * 60}, 70%, 60%, 0.1), 
                    hsla(${260 + i * 40}, 70%, 70%, 0.05)
                );
                border-radius: 50%;
                filter: blur(40px);
                animation: morphBlob${i + 1} ${15 + i * 5}s ease-in-out infinite;
                pointer-events: none;
                z-index: -1;
            `;
            blobContainer.appendChild(blob);
        }

        // Add CSS keyframes dynamically
        const style = document.createElement('style');
        style.textContent = `
            @keyframes morphBlob1 {
                0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
                33% { transform: translate(30px, -30px) scale(1.1) rotate(120deg); }
                66% { transform: translate(-20px, 20px) scale(0.9) rotate(240deg); }
            }
            @keyframes morphBlob2 {
                0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
                50% { transform: translate(-40px, -20px) scale(1.2) rotate(180deg); }
            }
            @keyframes morphBlob3 {
                0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
                25% { transform: translate(20px, 30px) scale(0.8) rotate(90deg); }
                75% { transform: translate(-30px, -10px) scale(1.1) rotate(270deg); }
            }
            @keyframes floatUp {
                0% {
                    transform: translateY(0) scale(0);
                    opacity: 0;
                }
                10% {
                    opacity: 1;
                }
                90% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100vh) scale(1);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    setupMagneticInteractions() {
        const magneticElements = document.querySelectorAll('.btn, .feature-card, .room-card, .nav-btn');
        
        magneticElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (!this.isReducedMotion) {
                    el.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                }
            });

            el.addEventListener('mousemove', (e) => {
                if (this.isReducedMotion) return;
                
                const rect = el.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                const deltaX = (e.clientX - centerX) * 0.1;
                const deltaY = (e.clientY - centerY) * 0.1;
                
                el.style.transform = `translate3d(${deltaX}px, ${deltaY}px, 0) scale(1.05)`;
            });

            el.addEventListener('mouseleave', () => {
                el.style.transform = 'translate3d(0, 0, 0) scale(1)';
            });
        });
    }

    setupFluidTransitions() {
        // Page transition system
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && !link.hasAttribute('target') && link.hostname === window.location.hostname) {
                e.preventDefault();
                this.navigateWithAnimation(link.href);
            }
        });

        // Smooth page reveal animations
        this.setupPageRevealAnimations();
    }

    setupPageRevealAnimations() {
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        revealElements.forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(50px)';
            
            setTimeout(() => {
                el.style.transition = 'all 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, index * 200);
        });
    }

    setupParticleSystem() {
        // Subtle particle effects for hero section
        const heroSection = document.querySelector('.hero');
        if (!heroSection || this.isReducedMotion) return;

        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            overflow: hidden;
            z-index: 1;
        `;
        
        heroSection.appendChild(particleContainer);

        // Create floating particles
        for (let i = 0; i < 30; i++) {
            this.createParticle(particleContainer, i);
        }
    }

    createParticle(container, index) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        const size = Math.random() * 3 + 1;
        const startX = Math.random() * window.innerWidth;
        const startY = window.innerHeight + 100;
        const duration = Math.random() * 20 + 10;
        const delay = Math.random() * 5;
        
        particle.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            background: rgba(59, 130, 246, ${Math.random() * 0.5 + 0.1});
            border-radius: 50%;
            left: ${startX}px;
            top: ${startY}px;
            animation: floatUp ${duration}s ${delay}s infinite linear;
        `;
        
        container.appendChild(particle);
        
        // Remove and recreate particle after animation
        setTimeout(() => {
            if (particle.parentNode) {
                particle.remove();
                this.createParticle(container, index);
            }
        }, (duration + delay) * 1000);
    }

    initMorphingShapes() {
        // Initialize any additional morphing shape configurations
        this.setupAnimatedGradients();
        this.setupTextRevealAnimations();
    }

    setupAnimatedGradients() {
        const gradientElements = document.querySelectorAll('.animated-gradient');
        gradientElements.forEach(el => {
            el.style.backgroundSize = '400% 400%';
            el.style.animation = 'gradientShift 8s ease infinite';
        });

        // Add gradient animation CSS if not present
        if (!document.querySelector('#gradient-animations')) {
            const style = document.createElement('style');
            style.id = 'gradient-animations';
            style.textContent = `
                @keyframes gradientShift {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    setupTextRevealAnimations() {
        const textElements = document.querySelectorAll('.text-reveal');
        textElements.forEach(el => {
            const text = el.textContent;
            el.innerHTML = '';
            
            [...text].forEach((char, index) => {
                const span = document.createElement('span');
                span.textContent = char === ' ' ? '\u00A0' : char;
                span.style.opacity = '0';
                span.style.transform = 'translateY(50px)';
                span.style.transition = `all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.05}s`;
                el.appendChild(span);
            });

            // Trigger animation when element comes into view
            this.observer.observe(el);
            el.addEventListener('visible', () => {
                el.querySelectorAll('span').forEach(span => {
                    span.style.opacity = '1';
                    span.style.transform = 'translateY(0)';
                });
            });
        });
    }

    triggerElementAnimation(element) {
        const animationType = element.dataset.animation || 'fadeUp';
        
        switch (animationType) {
            case 'slideInLeft':
                element.style.transform = 'translateX(0)';
                break;
            case 'slideInRight':
                element.style.transform = 'translateX(0)';
                break;
            case 'scaleUp':
                element.style.transform = 'scale(1)';
                break;
            case 'rotateIn':
                element.style.transform = 'rotate(0deg) scale(1)';
                break;
            default:
                element.style.transform = 'translateY(0)';
        }
    }

    updateProgressAnimations(scrolled, windowHeight) {
        // Progress-based animations for stats counters
        const statsCounters = document.querySelectorAll('.stat-number[data-count]');
        statsCounters.forEach(counter => {
            const rect = counter.getBoundingClientRect();
            if (rect.top < windowHeight && rect.bottom > 0 && !counter.dataset.animated) {
                counter.dataset.animated = 'true';
                this.animateCounter(counter);
            }
        });

        // Progress bars and other elements
        const progressElements = document.querySelectorAll('.progress-element');
        progressElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const progress = Math.max(0, Math.min(1, (windowHeight - rect.top) / windowHeight));
            el.style.setProperty('--progress', progress);
        });
    }

    animateCounter(element) {
        const target = parseInt(element.dataset.count);
        const duration = 2000;
        const start = Date.now();
        
        const updateCounter = () => {
            const elapsed = Date.now() - start;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(easeOut * target);
            
            element.textContent = current;
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    }

    trackScrollPerformance() {
        // Monitor scroll performance and adjust animations if needed
        let scrollCount = 0;
        let lastScrollTime = Date.now();
        
        window.addEventListener('scroll', () => {
            scrollCount++;
            const now = Date.now();
            
            if (now - lastScrollTime > 100) {
                if (scrollCount > 10) {
                    // Disable heavy animations if scrolling is too frequent
                    document.body.classList.add('reduced-animations');
                } else {
                    document.body.classList.remove('reduced-animations');
                }
                scrollCount = 0;
                lastScrollTime = now;
            }
        });
    }

    updateMagneticElements() {
        // Update cursor-following elements
        if (this.isReducedMotion) return;
        
        const magneticElements = document.querySelectorAll('.magnetic');
        magneticElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const distance = Math.sqrt(
                Math.pow(this.mousePosition.x - (rect.left + rect.width / 2), 2) +
                Math.pow(this.mousePosition.y - (rect.top + rect.height / 2), 2)
            );
            
            if (distance < 150) {
                const strength = (150 - distance) / 150;
                const x = (this.mousePosition.x - (rect.left + rect.width / 2)) * strength * 0.1;
                const y = (this.mousePosition.y - (rect.top + rect.height / 2)) * strength * 0.1;
                
                el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            } else {
                el.style.transform = 'translate3d(0, 0, 0)';
            }
        });
    }

    setupModalHandlers() {
        // Enhanced modal animations
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            const openModal = () => {
                // Clear any previous inline styles
                const content = modal.querySelector('.modal-content');
                if (content) {
                    content.style.cssText = '';
                }
                
                // Show modal
                modal.classList.add('active');
                document.body.style.overflow = 'hidden';
            };

            const closeModal = () => {
                // Remove active class
                modal.classList.remove('active');
                document.body.style.overflow = '';
                
                // Clear inline styles after animation
                setTimeout(() => {
                    const content = modal.querySelector('.modal-content');
                    if (content) {
                        content.style.cssText = '';
                    }
                }, 300);
            };

            // Attach event listeners with proper event handling
            const openBtns = document.querySelectorAll(`[data-modal="${modal.id}"]`);
            openBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    openModal();
                });
            });

            const closeBtns = modal.querySelectorAll('.modal-close');
            closeBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    closeModal();
                });
            });

            // Close modal when clicking on the modal container (outside content)
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
            
            // Prevent clicks on modal content from closing the modal
            const modalContent = modal.querySelector('.modal-content');
            if (modalContent) {
                modalContent.addEventListener('click', (e) => {
                    e.stopPropagation();
                });
            }
        });

        // Sign in modal specific handlers
        const signInBtn = document.getElementById('sign-in-btn');
        const getStartedBtn = document.getElementById('get-started-btn');
        const modal = document.getElementById('signin-modal');
        
        if (signInBtn && modal) {
            signInBtn.addEventListener('click', () => {
                window.location.href = 'login/login.html';

                // modal.classList.add('active');
                // document.body.style.overflow = 'hidden';
            });
        }
        
        if (getStartedBtn && modal) {
            getStartedBtn.addEventListener('click', () => {
                window.location.href = 'login/login.html';

                // modal.classList.add('active');
                // document.body.style.overflow = 'hidden';
            });
        }

        const closeBtn = document.getElementById('modal-close-btn');
        if (closeBtn && modal) {
            closeBtn.addEventListener('click', () => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }

        // Close on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        }
    }

    navigateWithAnimation(url) {
        // Smooth page transition
        document.body.style.transition = 'opacity 0.3s ease-out';
        document.body.style.opacity = '0';
        
        setTimeout(() => {
            window.location.href = url;
        }, 300);
    }

    createRipple(event) {
        const button = event.currentTarget;
        const circle = document.createElement('span');
        const diameter = Math.max(button.clientWidth, button.clientHeight);
        const radius = diameter / 2;

        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - button.offsetLeft - radius}px`;
        circle.style.top = `${event.clientY - button.offsetTop - radius}px`;
        circle.classList.add('ripple');

        const ripple = button.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }

        button.appendChild(circle);
    }

    setupSmoothScroll() {
        // Smooth scroll for anchor links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="#"]');
            if (link) {
                e.preventDefault();
                const target = document.querySelector(link.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        }
    }

    // Fix button functionality 
    fixButtonFunctionality() {
        // Ensure all buttons are properly clickable
        const buttons = document.querySelectorAll('button, .btn, .button, [role="button"]');
        buttons.forEach(button => {
            // Ensure proper cursor
            button.style.cursor = 'pointer';
            
            // Ensure proper z-index for clickability
            const computedStyle = window.getComputedStyle(button);
            if (computedStyle.position === 'relative' || computedStyle.position === 'absolute') {
                if (!computedStyle.zIndex || computedStyle.zIndex === 'auto') {
                    button.style.zIndex = '10';
                }
            }
            
            // Add proper touch handling for mobile
            button.addEventListener('touchstart', function(e) {
                this.style.transform = 'scale(0.95)';
            }, { passive: true });
            
            button.addEventListener('touchend', function(e) {
                this.style.transform = '';
            }, { passive: true });
        });
        
        // Fix common button selectors
        this.fixModalButtons();
        this.fixNavigationButtons();
    }
    
    fixModalButtons() {
        // Sign in modal buttons
        const signInButtons = document.querySelectorAll('[onclick*="openSignInModal"], .sign-in-btn, #sign-in-btn');
        signInButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const modal = document.getElementById('signInModal') || document.getElementById('signin-modal');
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });
        
        // Close modal buttons
        const closeButtons = document.querySelectorAll('.modal-close, .close-modal, [data-close="modal"]');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                const modal = this.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });
    }
    
    fixNavigationButtons() {
        // Main landing page buttons
        this.setupMainPageButtons();
        
        // Navigation buttons that might be broken
        const navButtons = document.querySelectorAll('.nav-link, .btn-primary, .btn-secondary');
        navButtons.forEach(btn => {
            if (btn.href && btn.href !== window.location.href) {
                btn.addEventListener('click', function(e) {
                    if (!e.defaultPrevented) {
                        // Let normal navigation work
                        return true;
                    }
                });
            }
        });
    }

    setupMainPageButtons() {
        // Explore Rooms button
        const exploreRoomsBtn = document.getElementById('explore-rooms-btn');
        if (exploreRoomsBtn) {
            exploreRoomsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Explore Rooms clicked - navigating to rooms page');
                window.location.href = 'rooms/rooms.html';
            });
        }

        // Real-Time Availability button
        const realTimeBtn = document.getElementById('real-time-btn');
        if (realTimeBtn) {
            realTimeBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Real-Time Availability clicked - navigating to rooms page');
                window.location.href = 'rooms/rooms.html';
            });
        }

        // Interactive Maps button
        const interactiveMapsBtn = document.getElementById('interactive-maps-btn');
        if (interactiveMapsBtn) {
            interactiveMapsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Interactive Maps clicked - navigating to map view');
                window.location.href = 'rooms/rooms.html'; // or 'rooms/map.html' if you have a separate map page
            });
        }

        // Get Started button  
        const getStartedBtn = document.getElementById('get-started-btn');
        if (getStartedBtn) {
            getStartedBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Get Started clicked - opening sign in modal');
                const modal = document.getElementById('signInModal') || document.getElementById('signin-modal');
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                } else {
                    // Fallback to rooms page
                    window.location.href = 'rooms/rooms.html';
                }
            });
        }

        // About button
        const aboutBtn = document.getElementById('about-btn');
        if (aboutBtn) {
            aboutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('About clicked - scrolling to features');
                const featuresSection = document.querySelector('.features');
                if (featuresSection) {
                    featuresSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        // Feature cards - make them clickable
        this.setupFeatureCards();
    }

    setupFeatureCards() {
        const featureCards = document.querySelectorAll('.feature-card');
        featureCards.forEach((card, index) => {
            card.style.cursor = 'pointer';
            card.style.transition = 'transform 0.3s ease';
            
            card.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const title = card.querySelector('h3')?.textContent || '';
                console.log(`Feature card clicked: ${title}`);
                
                // Navigate based on feature
                switch (index) {
                    case 0: // Real-Time Availability
                        console.log('Navigating to rooms for real-time availability');
                        window.location.href = 'rooms/rooms.html';
                        break;
                    case 1: // Interactive Maps
                        console.log('Navigating to interactive maps');
                        // Check if map.html exists, otherwise go to rooms
                        window.location.href = 'rooms/map.html';
                        break;
                    case 2: // Smart Filtering
                        console.log('Navigating to smart filtering');
                        window.location.href = 'home/home.html';
                        break;
                    default:
                        window.location.href = 'rooms/rooms.html';
                }
            });

            // Add hover effect
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });
    }
}

// Global Animation System
window.AnimationSystem = {
    initialized: false,
    
    init() {
        if (this.initialized) return;
        this.initialized = true;
        
        // Initialize all components
        new ModernAnimations();
        new PageTransitions();
        new PerformanceOptimizer();
        
        console.log('Animation System initialized');
    }
};

// Initialize animations when DOM is ready
function initializeAnimationSystem() {
    if (!window.AnimationSystem.initialized) {
        window.AnimationSystem.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnimationSystem);
} else {
    initializeAnimationSystem();
}

// Cursor trail effect (optional enhancement)
class CursorTrail {
    constructor() {
        this.trails = [];
        this.maxTrails = 10;
        this.init();
    }

    init() {
        // Only on desktop
        if (window.innerWidth > 1024) {
            this.createTrails();
            this.bindEvents();
        }
    }

    createTrails() {
        for (let i = 0; i < this.maxTrails; i++) {
            const trail = document.createElement('div');
            trail.className = 'cursor-trail';
            trail.style.cssText = `
                position: fixed;
                width: 4px;
                height: 4px;
                background: var(--accent);
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                opacity: ${1 - (i / this.maxTrails)};
                transform: scale(${1 - (i / this.maxTrails) * 0.5});
                transition: transform 0.1s ease-out;
            `;
            document.body.appendChild(trail);
            this.trails.push({
                element: trail,
                x: 0,
                y: 0
            });
        }
    }

    bindEvents() {
        let mouseX = 0;
        let mouseY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const animate = () => {
            let x = mouseX;
            let y = mouseY;

            this.trails.forEach((trail, index) => {
                trail.element.style.left = x + 'px';
                trail.element.style.top = y + 'px';
                
                x += (trail.x - x) * 0.3;
                y += (trail.y - y) * 0.3;
                
                trail.x = x;
                trail.y = y;
            });

            requestAnimationFrame(animate);
        };

        animate();
    }
}

// Cursor trail disabled
// document.addEventListener('DOMContentLoaded', () => {
//     new CursorTrail();
// });

// Page transition effects
class PageTransitions {
    constructor() {
        this.init();
    }

    init() {
        // Intercept navigation clicks
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.href && !link.target && !link.hasAttribute('download')) {
                if (link.hostname === window.location.hostname) {
                    e.preventDefault();
                    this.navigateTo(link.href);
                }
            }
        });

        // Handle browser back/forward
        window.addEventListener('popstate', (e) => {
            this.navigateTo(window.location.href, false);
        });
    }

    navigateTo(url, pushState = true) {
        // Add exit animation
        document.body.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
        document.body.style.opacity = '0.7';
        document.body.style.transform = 'translateY(-10px)';

        setTimeout(() => {
            if (pushState) {
                window.history.pushState(null, '', url);
            }
            window.location.href = url;
        }, 300);
    }
}

// Page transitions handled by AnimationSystem

// Performance optimizations
class PerformanceOptimizer {
    constructor() {
        this.init();
    }

    init() {
        // Lazy load images
        this.lazyLoadImages();
        
        // Optimize animations on low-end devices
        this.optimizeForDevice();
        
        // Preload critical resources
        this.preloadResources();
    }

    lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    optimizeForDevice() {
        // Reduce animations on low-performance devices
        const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
        const isSlowConnection = connection && (connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
        const isLowEndDevice = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;

        if (isSlowConnection || isLowEndDevice) {
            document.documentElement.style.setProperty('--transition-fast', '0ms');
            document.documentElement.style.setProperty('--transition', '100ms');
            document.documentElement.style.setProperty('--transition-slow', '200ms');
        }
    }

    preloadResources() {
        // Preload next likely page
        const roomsLink = document.createElement('link');
        roomsLink.rel = 'prefetch';
        roomsLink.href = 'rooms/rooms.html';
        document.head.appendChild(roomsLink);
    }
}

// Performance optimizations handled by AnimationSystem

// Global functions for HTML onclick handlers
window.openSignInModal = function() {
    const modal = document.getElementById('signInModal') || document.getElementById('signin-modal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
};

window.closeSignInModal = function() {
    const modal = document.getElementById('signInModal') || document.getElementById('signin-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
};
