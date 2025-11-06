// Rooms listing page functionality

/**
 * Load and parse the rooms.json file.
 * Returns a Promise that resolves to the parsed JSON.
 */
async function load_rooms() {
    try {
        const response = await fetch('../rooms.json');
        if (!response.ok) {
            throw new Error(`Failed to fetch rooms.json (status ${response.status})`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error loading rooms.json:', error);
        throw error;
    }
}

/**
 * Create a room card element for the rooms grid.
 * Takes a room object and returns a DOM element.
 */
function create_room_card(room) {
    const card = document.createElement('div');
    card.className = 'room-card';
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

    // Add click event listener
    card.addEventListener('click', () => {
        if (is_available) {
            navigate_to_room(room.id);
        }
    });

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
}

/**
 * Apply current filters and update the display.
 */
function apply_filters() {
    if (window.all_rooms) {
        const filtered_rooms = filter_rooms(window.all_rooms);
        render_rooms_grid(filtered_rooms);
    }
}

/**
 * Clear all filters and show all rooms.
 */
function clear_filters() {
    document.getElementById('building-filter').value = '';
    document.getElementById('capacity-filter').value = '';
    document.getElementById('availability-filter').value = '';
    
    if (window.all_rooms) {
        render_rooms_grid(window.all_rooms);
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
    // Filter change listeners
    document.getElementById('building-filter').addEventListener('change', apply_filters);
    document.getElementById('capacity-filter').addEventListener('change', apply_filters);
    document.getElementById('availability-filter').addEventListener('change', apply_filters);
    
    // Clear filters button
    document.getElementById('clear-filters').addEventListener('click', clear_filters);
    
    // Retry button for error state
    document.getElementById('retry-button').addEventListener('click', load_and_display_rooms);
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
        
        console.log(`Loaded ${rooms_array.length} rooms successfully`);
        
    } catch (error) {
        console.error('Failed to load rooms:', error);
        show_error_state();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initialize_event_listeners();
    load_and_display_rooms();
});
