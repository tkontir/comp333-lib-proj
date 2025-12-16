let rooms = null;

/* loadRoomsModuleOrFetch () => object
    This function retreives and returns all the rooms specified in the provided JSO
*/
async function loadRoomsModuleOrFetch() {
    try {
        const mod = await import('../rooms.json', { assert: { type: 'json' } });
        rooms = mod.default || mod;
        // log debug
        console.log('Loaded rooms via import assertion:', rooms);
        return rooms;
    } catch (err) {
        // lof the error
        console.warn('Import assertion failed or not supported — falling back to fetch:', err);
        try {
            const url = new URL('../rooms.json', import.meta.url).href;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
            rooms = await res.json();
            // log debug
            console.log('Loaded rooms via fetch fallback:', rooms);
            return rooms;
        } catch (fetchErr) {
            // log error if occurs
            console.error('Failed to load rooms.json via fetch fallback:', fetchErr);
            throw fetchErr;
        }
    }
}

/* DOM reference constants
    This is used to update the elements in the HTML file
*/
const filterBySelect = document.getElementById('filterBy');
const libraryFilterView = document.getElementById('libraryFilterView');
const availabilityFilterView = document.getElementById('availabilityFilterView');

const librarySelect = document.getElementById('library');
const floorSelect = document.getElementById('floor');
const roomSelect = document.getElementById('room');
const floorSection = document.getElementById('floorSection');
const roomSection = document.getElementById('roomSection');

const availableRoomSelect = document.getElementById('availableRoom');
const reserveBtn = document.getElementById('reserveBtn');


/* initializeReservationSystem() => null
    This functiuon calls the necessary functions for the page to run
*/ 
function initializeReservationSystem() {
    populateLibraries();
    setupFilterByChangeListener();
    setupLibrarySelectionListener();
    setupFloorSelectionListener();
    setupRoomSelectionListener();
    setupReservationButtonListener();
}

// Initialize modern animations and enhanced functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animation system
    if (typeof AnimationSystem !== 'undefined') {
        AnimationSystem.init();
    }
    
    // Initialize stat counter animation
    initializeStatCounters();
    
    // Initialize ripple effects on buttons
    initializeRippleEffects();
    
    // Load rooms and set up the system
    initializeReservationSystem();
});

// Animate stat counters
function initializeStatCounters() {
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    const animateCounter = (element, target) => {
        let count = 0;
        const increment = target / 100;
        const timer = setInterval(() => {
            count += increment;
            element.textContent = Math.floor(count);
            if (count >= target) {
                element.textContent = target;
                clearInterval(timer);
            }
        }, 20);
    };
    
    // Use Intersection Observer to trigger animation when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.getAttribute('data-target'));
                animateCounter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    statNumbers.forEach(stat => observer.observe(stat));
}

// Add ripple effect to buttons
function initializeRippleEffects() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.querySelector('.ripple')) {
                const ripple = this.querySelector('.ripple');
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = x + 'px';
                ripple.style.top = y + 'px';
                ripple.classList.add('animate');
                
                setTimeout(() => {
                    ripple.classList.remove('animate');
                }, 600);
            }
        });
    });
}

// Initialize the function when the page loads
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadRoomsModuleOrFetch();
    } catch (err) {
        // If loading rooms fails, still initialize so UI shows an error state
        console.error('Could not load rooms data during initialization:', err);
    }
    initializeReservationSystem();
});