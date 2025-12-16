// Rooms listing page functionality

/* load_rooms() => Promise<Object>
   Load and parse the rooms.json file with fallback paths.
*/
async function load_rooms() {
    const paths = ['../rooms.json', './rooms.json', '/rooms.json'];
    let last_error = null;
    for (const path of paths) {
        try {
            console.log(`Fetching rooms.json from ${path}...`);
            const response = await fetch(path, { cache: 'no-cache' });
            console.log('Fetch response:', response.status, response.ok);
            
            if (!response.ok) {
                throw new Error(`Failed to fetch rooms.json (status ${response.status})`);
            }
            
            const data = await response.json();
            console.log('Rooms data loaded:', data);
            return data;
        } catch (error) {
            console.warn(`Error loading rooms.json from ${path}:`, error);
            last_error = error;
        }
    }
    console.error('All attempts to load rooms.json failed', last_error);
    throw last_error || new Error('rooms.json could not be loaded');
}

/**
 * Create a room card element for the rooms grid.
 * Takes a room object and returns a DOM element.
 */
function create_room_card(room) {
    const card = document.createElement('div');
    card.className = 'room-card animate-on-scroll';
    card.setAttribute('data-room-id', room.id);

    // Determine availability
    const is_available = room.seats > 0 && room.building !== '';
    const availability_class = is_available ? 'available' : 'unavailable';
    const availability_text = is_available ? 'Available' : 'Unavailable';

    // Handle features
    const features_html = room.features && room.features.length > 0
        ? room.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')
        : '<span class="no-features">No special features</span>';

    // Truncate description if too long
    const description = room.description || 'No description available.';
    const truncated_description = description.length > 120 
        ? description.substring(0, 120) + '...' 
        : description;

    card.innerHTML = `
        <div class="room-card-header">
            <h3 class="room-name">${room.name || 'Unknown Room'}</h3>
            <p class="room-building">${room.building || 'Unknown Building'}</p>
        </div>
        <div class="room-card-body">
            <div class="room-details">
                <div class="room-detail">
                    <span class="room-detail-label">Floor</span>
                    <span class="room-detail-value">${room.location?.floor || 'N/A'}</span>
                </div>
                <div class="room-detail">
                    <span class="room-detail-label">Capacity</span>
                    <span class="room-detail-value">${room.seats || 0} seats</span>
                </div>
            </div>
            <div class="room-availability ${availability_class}">${availability_text}</div>
            <p class="room-description">${truncated_description}</p>
            <div class="room-features">
                <span class="room-features-label">Features:</span>
                <div class="features-list">
                    ${features_html}
                </div>
            </div>
        </div>
        <div class="room-card-footer">
            <button class="view-room-btn" ${!is_available ? 'disabled' : ''}>
                ${is_available ? 'View Details' : 'Unavailable'}
            </button>
        </div>
    `;

    // Add click event listener to the card
    card.addEventListener('click', (e) => {
        // Don't navigate if clicking on the button itself
        if (e.target.closest('.view-room-btn')) {
            return;
        }
        if (is_available) {
            navigate_to_room(room.id);
        }
    });

    // Add specific click handler to the View Details button
    const viewBtn = card.querySelector('.view-room-btn');
    if (viewBtn && is_available) {
        viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            navigate_to_room(room.id);
        });
    }

    return card;
}

/**
 * Navigate to the individual room page.
 * Takes a room ID and redirects to the room detail page.
 */
function navigate_to_room(room_id) {
    window.location.href = `../room/room.html?id=${room_id}`;
}

/**
 * Filter rooms based on current filter selections.
 * Takes an array of rooms and returns filtered array.
 */
function filter_rooms(rooms) {
    const building_filter = document.getElementById('building-filter').value;
    const capacity_filter = document.getElementById('capacity-filter').value;
    const availability_filter = document.getElementById('availability-filter').value;
    const features_filter = document.getElementById('features-filter');

    console.log('Filtering rooms:', {
        total_rooms: rooms.length,
        building_filter,
        capacity_filter,
        availability_filter,
        features_filter_element: !!features_filter
    });

    return rooms.filter(room => {
        // Building filter
        if (building_filter && room.building !== building_filter) {
            return false;
        }

        // Capacity filter
        if (capacity_filter && room.seats < parseInt(capacity_filter)) {
            return false;
        }

        // Availability filter
        if (availability_filter) {
            const is_available = room.seats > 0 && room.building !== '';
            if (availability_filter === 'available' && !is_available) {
                return false;
            }
            if (availability_filter === 'unavailable' && is_available) {
                return false;
            }
        }

        // Features filter (checkbox-based)
        if (features_filter) {
            const checkboxes = features_filter.querySelectorAll('.feature-checkbox:checked');
            const selected_features = Array.from(checkboxes).map(checkbox => checkbox.value);
            if (selected_features.length > 0) {
                // Check if room has ALL selected features
                const room_features = room.features || [];
                const has_all_features = selected_features.every(feature => 
                    room_features.includes(feature)
                );
                if (!has_all_features) {
                    return false;
                }
            }
        }

        return true;
    });
}

/**
 * Render rooms grid with given rooms array.
 * Takes an array of rooms and populates the rooms grid.
 */
function render_rooms_grid(rooms) {
    const rooms_grid = document.getElementById('rooms-grid');
    const no_results = document.getElementById('no-results');
    
    // Clear existing content
    rooms_grid.innerHTML = '';
    
    if (rooms.length === 0) {
        no_results.classList.remove('hidden');
        return;
    }
    
    no_results.classList.add('hidden');
    
    // Create and append room cards
    rooms.forEach(room => {
        const card = create_room_card(room);
        rooms_grid.appendChild(card);
    });
    
    // Setup row-based animations immediately after cards are added
    requestAnimationFrame(() => {
        setupRowAnimations();
        console.log('Row animations setup complete');
        
        // Check if any rows should be visible on initial load
        setTimeout(() => {
            checkInitiallyVisibleRows();
        }, 100);
    });
}

/**
 * Apply current filters and update the display.
 */
function apply_filters() {
    if (window.all_rooms && window.all_rooms.length > 0) {
        console.log('Applying filters to', window.all_rooms.length, 'rooms');
        const filtered_rooms = filter_rooms(window.all_rooms);
        console.log('Filtered result:', filtered_rooms.length, 'rooms');
        render_rooms_grid(filtered_rooms);
        // Update statistics to reflect filtered results
        calculate_and_update_statistics(filtered_rooms);
    } else {
        console.log('No rooms available to filter');
    }
}

/**
 * Clear all filters and show all rooms.
 */
function clear_filters() {
    // Clear custom dropdowns
    clear_custom_dropdown('building-filter', 'All Buildings');
    clear_custom_dropdown('capacity-filter', 'Any Capacity');
    clear_custom_dropdown('availability-filter', 'All Rooms');
    
    // Clear features filter (checkboxes)
    const features_filter = document.getElementById('features-filter');
    if (features_filter) {
        const checkboxes = features_filter.querySelectorAll('.feature-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Update the custom dropdown count display
        const featuresTrigger = document.getElementById('features-filter-toggle');
        if (featuresTrigger) {
            const countLabel = featuresTrigger.querySelector('.trigger-count');
            if (countLabel) {
                countLabel.textContent = '(0 selected)';
            }
        }
    }
    
    if (window.all_rooms) {
        render_rooms_grid(window.all_rooms);
        // Reset statistics to show all rooms
        calculate_and_update_statistics(window.all_rooms);
    }
}

/**
 * Clear a custom dropdown to its default state
 */
/* clear_custom_dropdown(filter_id, default_text) => void
   Clear a custom dropdown filter and reset to default text.
*/
function clear_custom_dropdown(filter_id, default_text) {
    const hidden_select = document.getElementById(filter_id);
    const trigger = document.getElementById(`${filter_id}-toggle`);
    const filter_group = trigger?.closest('.custom-filter-group');
    
    if (hidden_select && trigger && filter_group) {
        // Reset hidden select
        hidden_select.value = '';
        
        // Reset trigger text
        const trigger_label = trigger.querySelector('.trigger-label');
        if (trigger_label) {
            trigger_label.textContent = default_text;
        }
        
        // Reset selected options
        const options = filterGroup.querySelectorAll('.filter-option');
        options.forEach(option => {
            option.classList.remove('selected');
            if (option.getAttribute('data-value') === '') {
                option.classList.add('selected');
            }
        });
        
        // Close dropdown
        filterGroup.classList.remove('open');
    }
}

/**
 * Show loading state while data is being fetched.
 */
function show_loading_state() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('rooms-container').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

/**
 * Show error state when data loading fails.
 */
function show_error_state() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('rooms-container').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
}

/**
 * Show rooms content when data is successfully loaded.
 */
function show_rooms_content() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('rooms-container').classList.remove('hidden');
}

/**
 * Initialize event listeners for filters and controls.
 */
function initialize_event_listeners() {
    console.log('Initializing event listeners...');
    
    // Initialize custom single-select dropdowns
    initializeCustomDropdown('building-filter', 'All Buildings');
    initializeCustomDropdown('capacity-filter', 'Any Capacity');
    initializeCustomDropdown('availability-filter', 'All Rooms');
    
    // Filter change listeners
    const buildingFilter = document.getElementById('building-filter');
    const capacityFilter = document.getElementById('capacity-filter');
    const availabilityFilter = document.getElementById('availability-filter');
    const featuresFilter = document.getElementById('features-filter');
    const featuresTrigger = document.getElementById('features-filter-toggle');
    const featuresGroup = document.querySelector('.feature-filter-group');
    const clearFiltersBtn = document.getElementById('clear-filters');
    const retryBtn = document.getElementById('retry-button');
    
    if (buildingFilter) {
        buildingFilter.addEventListener('change', apply_filters);
        console.log('Building filter listener added');
    } else {
        console.warn('Building filter not found');
    }
    
    if (capacityFilter) {
        capacityFilter.addEventListener('change', apply_filters);
        console.log('Capacity filter listener added');
    } else {
        console.warn('Capacity filter not found');
    }
    
    if (availabilityFilter) {
        availabilityFilter.addEventListener('change', apply_filters);
        console.log('Availability filter listener added');
    } else {
        console.warn('Availability filter not found');
    }

    if (featuresFilter && featuresTrigger && featuresGroup) {
        const updateFeaturesCount = () => {
            const checkboxes = featuresFilter.querySelectorAll('.feature-checkbox:checked');
            const count = checkboxes.length;
            const countLabel = featuresTrigger.querySelector('.trigger-count');
            if (countLabel) {
                countLabel.textContent = `(${count} selected)`;
            }
        };

        featuresTrigger.addEventListener('click', (e) => {
            e.stopPropagation();
            featuresGroup.classList.toggle('open');
        });

        document.addEventListener('click', (e) => {
            if (!featuresGroup.contains(e.target)) {
                featuresGroup.classList.remove('open');
            }
        });

        // Add event listeners to all checkboxes
        const checkboxes = featuresFilter.querySelectorAll('.feature-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                updateFeaturesCount();
                apply_filters();
            });
        });

        updateFeaturesCount();
        console.log('Features filter with checkbox UI initialized');
    } else {
        console.warn('Features filter not fully initialized - missing elements');
    }
    
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clear_filters);
        console.log('Clear filters button listener added');
    } else {
        console.warn('Clear filters button not found');
    }
    
    // Map view button
    const mapBtn = document.getElementById('map-view-btn');
    if (mapBtn) {
        console.log('Map view button found, adding listener');
        mapBtn.addEventListener('click', () => {
            console.log('Map view button clicked - navigating to map.html');
            window.location.href = 'map.html';
        });
    } else {
        console.warn('Map view button not found in DOM');
    }
    
    if (retryBtn) {
        retryBtn.addEventListener('click', load_and_display_rooms);
        console.log('Retry button listener added');
    } else {
        console.warn('Retry button not found');
    }
}

// Navigation scroll effects
/* setup_navigation_scroll_effects() => void
   Setup navigation scroll effects and transparency changes.
*/
function setup_navigation_scroll_effects() {
    const nav = document.querySelector('.main-nav');
    if (!nav) return;

    let ticking = false;

    function updateNavigation() {
        const scrollY = window.scrollY;
        
        if (scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateNavigation);
            ticking = true;
        }
    });
}

/**
 * Load rooms data and display on the page.
 */
async function load_and_display_rooms() {
    show_loading_state();
    
    try {
        const data = await load_rooms();
        let rooms_array = [];
        
        // Handle both array format and object format with rooms property
        if (Array.isArray(data)) {
            rooms_array = data;
        } else if (data && Array.isArray(data.rooms)) {
            rooms_array = data.rooms;
        } else {
            throw new Error('Invalid rooms data format');
        }
        
        // Store globally for filtering
        window.all_rooms = rooms_array;
        
        // Render all rooms initially
        render_rooms_grid(rooms_array);
        show_rooms_content();
        
        // Calculate and update real room statistics
        calculate_and_update_statistics(rooms_array);
        
        console.log(`Loaded ${rooms_array.length} rooms successfully`);
        
    } catch (error) {
        console.error('Failed to load rooms:', error);
        show_error_state();
    }
}

// Check which rows should be visible on initial load
function checkInitiallyVisibleRows() {
    const cards = document.querySelectorAll('.room-card');
    
    cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (isVisible) {
            const rowNumber = card.getAttribute('data-row');
            const rowCards = document.querySelectorAll(`.room-card[data-row="${rowNumber}"]`);
            
            // Show the entire row if any card in it is initially visible
            rowCards.forEach(rowCard => {
                rowCard.classList.add('row-visible');
            });
        }
    });
}

// Enhanced row-based animation system with bidirectional scrolling
function setupRowAnimations() {
    console.log('setupRowAnimations called');
    const roomsGrid = document.getElementById('rooms-grid');
    if (!roomsGrid) {
        console.error('Rooms grid not found!');
        return;
    }

    // Determine cards per row based on screen width
    function getCardsPerRow() {
        const width = window.innerWidth;
        if (width <= 640) return 1;
        if (width <= 1024) return 2;
        return 3;
    }

    // Clear existing animation classes and observers
    const existingCards = roomsGrid.querySelectorAll('.room-card');
    existingCards.forEach(card => {
        card.className = card.className.replace(/row-\d+|row-visible|row-hidden|animate-in|animate-out/g, '').trim();
        card.classList.add('room-card'); // Ensure base class remains
    });

    // Group cards into rows
    const cards = Array.from(roomsGrid.querySelectorAll('.room-card'));
    const cardsPerRow = getCardsPerRow();
    console.log(`Found ${cards.length} cards, ${cardsPerRow} cards per row`);
    const rows = [];
    
    for (let i = 0; i < cards.length; i += cardsPerRow) {
        const rowCards = cards.slice(i, i + cardsPerRow);
        const rowNumber = Math.floor(i / cardsPerRow) + 1;
        
        // Add row classes to cards
        rowCards.forEach((card, index) => {
            card.classList.add(`row-${rowNumber}`);
            card.setAttribute('data-row', rowNumber);
            card.setAttribute('data-position', index);
            
            // First row is always visible, others start hidden
            if (rowNumber === 1) {
                card.classList.remove('row-hidden');
                card.classList.add('row-visible', 'animate-in');
            } else {
                card.classList.remove('row-visible', 'animate-in');
                card.classList.add('row-hidden');
            }
        });

        rows.push({
            cards: rowCards,
            number: rowNumber
        });
    }

    console.log(`Created ${rows.length} rows with ${cardsPerRow} cards each`);

    // Track last scroll position to determine scroll direction
    let lastScrollY = window.scrollY;
    const appearRatio = 0.1;
    const hideRatio = Math.min(appearRatio * 2.5, 0.1); // hide sooner (2-3x the appear threshold)
    
    // Create intersection observer for one-way animations
    const observer = new IntersectionObserver((entries) => {
        console.log(`Intersection observer triggered with ${entries.length} entries`);
        
        // Determine current scroll direction
        const currentScrollY = window.scrollY;
        const scrollingDown = currentScrollY > lastScrollY;
        lastScrollY = currentScrollY;
        
        console.log(`Scroll direction: ${scrollingDown ? 'DOWN' : 'UP'}`);
        
        // Group entries by row to avoid multiple triggers
        const rowUpdates = new Map();
        
        entries.forEach(entry => {
            const row = rows.find(r => r.cards.includes(entry.target));
            if (!row) {
                console.warn('No row found for card:', entry.target);
                return;
            }
            
            console.log(`Card in row ${row.number} is ${entry.isIntersecting ? 'entering' : 'leaving'} viewport, ratio: ${entry.intersectionRatio}`);
            
            rowUpdates.set(row.number, {
                row: row,
                isIntersecting: entry.isIntersecting,
                intersectionRatio: entry.intersectionRatio,
                scrollingDown: scrollingDown
            });
        });
        
        // Process row updates
        rowUpdates.forEach(({row, isIntersecting, intersectionRatio, scrollingDown}) => {
            const firstCard = row.cards[0];
            const rect = firstCard.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            
            // Check where the row is relative to viewport
            const completelyAboveViewport = rect.bottom < 0;
            const completelyBelowViewport = rect.top > viewportHeight;
            
            console.log(`Processing row ${row.number}: visible=${isIntersecting}, scrollingDown=${scrollingDown}, top=${rect.top.toFixed(0)}, bottom=${rect.bottom.toFixed(0)}, vh=${viewportHeight}`);
            
            // RULE 1: Show cards when scrolling DOWN and they enter viewport from bottom
            if (scrollingDown && isIntersecting && intersectionRatio > appearRatio) {
                if (!firstCard.classList.contains('row-visible')) {
                    console.log(`✓ Showing row ${row.number} (scrolling down, entering viewport)`);
                    animateRowVisible(row);
                }
            }
            
            // RULE 2: When scrolling UP, show cards that re-enter from top
            else if (!scrollingDown && isIntersecting && intersectionRatio > appearRatio) {
                if (!firstCard.classList.contains('row-visible')) {
                    console.log(`✓ Showing row ${row.number} (scrolling up, re-entering viewport)`);
                    animateRowVisible(row);
                }
            }

            // RULE 2.5: When scrolling UP, start hiding just before the row exits the BOTTOM
            // BUT NEVER hide the first row
            else if (!scrollingDown && isIntersecting && intersectionRatio < hideRatio && rect.bottom > viewportHeight * (1 - hideRatio) && row.number !== 1) {
                if (firstCard.classList.contains('row-visible')) {
                    console.log(`✗ Early hiding row ${row.number} (scrolling up, nearly exited bottom)`);
                    animateRowHidden(row);
                }
            }
            
            // RULE 3: When scrolling UP, hide cards that exit at BOTTOM (below viewport)
            // This is the key: when scrolling up, cards that move out the bottom should hide
            // BUT NEVER hide the first row
            else if (!scrollingDown && !isIntersecting && completelyBelowViewport && row.number !== 1) {
                if (firstCard.classList.contains('row-visible')) {
                    console.log(`✗ Hiding row ${row.number} (scrolling up, exited bottom)`);
                    animateRowHidden(row);
                }
            }
        });
    }, {
        threshold: [0, 0.1, 0.2, 0.3, 0.5], // Multiple thresholds for detection
        rootMargin: '0px 0px 0px 0px' // No extra margin - clean viewport detection
    });

    // Observe all cards for bidirectional animation
    cards.forEach(card => {
        observer.observe(card);
    });
}

function animateRowVisible(row) {
    console.log(`Showing row ${row.number} with ${row.cards.length} cards`);
    
    // Animate all cards in the row with slight stagger
    row.cards.forEach((card, index) => {
        // Small delay between cards in the same row for staggered effect
        setTimeout(() => {
            card.classList.remove('row-hidden', 'animate-out');
            card.classList.add('row-visible', 'animate-in');
        }, index * 50); // 50ms delay between each card
    });
}

function animateRowHidden(row) {
    console.log(`Hiding row ${row.number} with ${row.cards.length} cards`);
    
    // Hide all cards in the row with reverse stagger (right to left)
    row.cards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.remove('row-visible', 'animate-in');
            card.classList.add('row-hidden', 'animate-out');
        }, index * 30); // 30ms delay for quick reverse animation
    });
}

// Enhanced room card creation with animation classes
function create_room_card_enhanced(room) {
    const card = create_room_card(room); // Use existing function
    
    // Add animation-ready classes
    card.classList.add('animate-on-scroll');
    
    return card;
}

/**
 * Initialize a custom single-select dropdown
 */
function initializeCustomDropdown(filterId, defaultText) {
    const trigger = document.getElementById(`${filterId}-toggle`);
    const filterGroup = trigger?.closest('.custom-filter-group');
    const hiddenSelect = document.getElementById(filterId);
    const dropdown = filterGroup?.querySelector('.filter-select-dropdown');
    const options = filterGroup?.querySelectorAll('.filter-option');
    
    if (!trigger || !filterGroup || !hiddenSelect || !dropdown || !options.length) {
        console.warn(`Custom dropdown initialization failed for ${filterId}`);
        return;
    }

    // Toggle dropdown visibility
    trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        // Close other dropdowns
        document.querySelectorAll('.custom-filter-group.open, .feature-filter-group.open').forEach(group => {
            if (group !== filterGroup) group.classList.remove('open');
        });
        filterGroup.classList.toggle('open');
    });

    // Handle option selection
    options.forEach(option => {
        option.addEventListener('click', () => {
            const value = option.getAttribute('data-value');
            const text = option.textContent;
            
            // Update hidden select
            hiddenSelect.value = value;
            
            // Update trigger text
            const triggerLabel = trigger.querySelector('.trigger-label');
            if (triggerLabel) {
                triggerLabel.textContent = text;
            }
            
            // Update selected state
            options.forEach(opt => opt.classList.remove('selected'));
            option.classList.add('selected');
            
            // Close dropdown
            filterGroup.classList.remove('open');
            
            // Trigger filter update
            apply_filters();
        });
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!filterGroup.contains(e.target)) {
            filterGroup.classList.remove('open');
        }
    });

    // Set initial selected state
    const initialValue = hiddenSelect.value;
    options.forEach(option => {
        if (option.getAttribute('data-value') === initialValue) {
            option.classList.add('selected');
        }
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('Rooms.js loaded - initializing...');
    
    try {
        initialize_event_listeners();
        console.log('Event listeners initialized');
        
        load_and_display_rooms();
        console.log('Loading rooms...');
        
        // Initialize modern animations
        if (typeof AnimationSystem !== 'undefined') {
            AnimationSystem.init();
            console.log('Animation system initialized');
        }
        
        // Setup navigation scroll effects
        setup_navigation_scroll_effects();
        console.log('Navigation scroll effects set up');
        
        // Row animations will be set up after rooms are loaded
        
    } catch (error) {
        console.error('Error initializing rooms page:', error);
    }
});

// Handle window resize for responsive animations
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        console.log('Window resized, recalculating row animations');
        
        // Reset all cards to initial state
        const allCards = document.querySelectorAll('.room-card');
        allCards.forEach(card => {
            card.classList.remove('row-visible', 'row-hidden');
        });
        
        // Recalculate and setup animations
        setupRowAnimations();
    }, 250);
});

/**
 * Calculate and update statistics based on room data.
 * Counts available rooms and total seats from available rooms.
 * 
 * calculate_and_update_statistics(rooms_array) => void
 * Updates the hero statistics with real counts
 */
function calculate_and_update_statistics(rooms_array) {
    // Calculate available rooms (rooms with seats > 0 and building not empty)
    const available_rooms = rooms_array.filter(room => room.seats > 0 && room.building !== '');
    const available_rooms_count = available_rooms.length;
    
    // Calculate total study seats from available rooms
    const total_seats = available_rooms.reduce((sum, room) => sum + room.seats, 0);
    
    // Count unique library locations
    const unique_buildings = [...new Set(available_rooms.map(room => room.building))];
    const library_count = unique_buildings.length;
    
    console.log(`Statistics calculated: ${available_rooms_count} available rooms, ${total_seats} total seats, ${library_count} libraries`);
    
    // Update the DOM elements
    const stats = document.querySelectorAll('.stat-number');
    if (stats.length >= 3) {
        // Update Available Rooms
        stats[0].setAttribute('data-count', available_rooms_count);
        stats[0].textContent = available_rooms_count;
        
        // Update Library Locations
        stats[1].setAttribute('data-count', library_count);
        stats[1].textContent = library_count;
        
        // Update Study Seats
        stats[2].setAttribute('data-count', total_seats);
        stats[2].textContent = total_seats;
        
        // Trigger animation if available
        stats.forEach(stat => {
            animate_counter(stat);
        });
    }
}

/**
 * Animate a counter from 0 to its target value.
 * 
 * animate_counter(element) => void
 * Animates the counter with a smooth counting effect
 */
function animate_counter(element) {
    const target = parseInt(element.getAttribute('data-count'));
    const duration = 1500; // 1.5 seconds
    const start_time = performance.now();
    const start_value = 0;
    
    function update_counter(current_time) {
        const elapsed = current_time - start_time;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease out cubic function for smooth deceleration
        const ease_progress = 1 - Math.pow(1 - progress, 3);
        const current_value = Math.floor(start_value + (target - start_value) * ease_progress);
        
        element.textContent = current_value;
        
        if (progress < 1) {
            requestAnimationFrame(update_counter);
        } else {
            element.textContent = target;
        }
    }
    
    requestAnimationFrame(update_counter);
}
