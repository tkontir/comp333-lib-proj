let rooms = null;

/* load_rooms_module_or_fetch () => object
    This function retrieves and returns all the rooms specified in the provided JSON
*/
async function load_rooms_module_or_fetch() {
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
const filter_by_select = document.getElementById('filterBy');
const library_filter_view = document.getElementById('libraryFilterView');
const availability_filter_view = document.getElementById('availabilityFilterView');

const library_select = document.getElementById('library');
const floor_select = document.getElementById('floor');
const room_select = document.getElementById('room');
const floor_section = document.getElementById('floorSection');
const room_section = document.getElementById('roomSection');

const available_room_select = document.getElementById('availableRoom');
const reserve_btn = document.getElementById('reserveBtn');


/* initialize_reservation_system() => null
    This function calls the necessary functions for the page to run
*/ 
function initialize_reservation_system() {
    populate_libraries();
    setup_filter_by_change_listener();
    setup_library_selection_listener();
    setup_floor_selection_listener();
    setup_room_selection_listener();
    setup_reservation_button_listener();
}

// Initialize modern animations and enhanced functionality
document.addEventListener('DOMContentLoaded', () => {
    // Initialize animation system
    if (typeof AnimationSystem !== 'undefined') {
        AnimationSystem.init();
    }
    
    // Initialize stat counter animation
    initialize_stat_counters();
    
    // Initialize ripple effects on buttons
    initialize_ripple_effects();
    
    // Load rooms and set up the system
    initialize_reservation_system();
});

/* initialize_stat_counters() => null
    Animate stat counters with counting animation
*/
function initialize_stat_counters() {
    const stat_numbers = document.querySelectorAll('.stat-number[data-target]');
    
    const animate_counter = (element, target) => {
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
                animate_counter(entry.target, target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    stat_numbers.forEach(stat => observer.observe(stat));
}

/* initialize_ripple_effects() => null
    Add ripple effect to buttons
*/
function initialize_ripple_effects() {
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
        await load_rooms_module_or_fetch();
    } catch (err) {
        // If loading rooms fails, still initialize so UI shows an error state
        console.error('Could not load rooms data during initialization:', err);
    }
    initialize_reservation_system();
});