// Visual map page functionality

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
 * Navigate to the individual room page.
 * Takes a room ID and redirects to the room detail page.
 */
function navigate_to_room(room_id) {
    window.location.href = `../room/room.html?id=${room_id}`;
}

/**
 * Navigate to the rooms list page.
 */
function navigate_to_list() {
    window.location.href = 'rooms.html';
}

/**
 * Update room marker status based on room availability.
 * Takes room data and updates the corresponding marker on the map.
 */
function update_room_marker(room) {
    const marker = document.querySelector(`[data-room-id="${room.id}"]`);
    if (!marker) return;

    const is_available = room.seats > 0 && room.building !== '';
    const status_element = marker.querySelector('.room-status');

    if (is_available) {
        marker.classList.remove('unavailable');
        status_element.classList.remove('unavailable');
        status_element.classList.add('available');
    } else {
        marker.classList.add('unavailable');
        status_element.classList.remove('available');
        status_element.classList.add('unavailable');
    }
}

/**
 * Show tooltip with room information.
 * Takes room data and mouse event to position tooltip.
 */
function show_room_tooltip(room, event) {
    const tooltip = document.getElementById('room-tooltip');
    const tooltip_name = document.getElementById('tooltip-name');
    const tooltip_capacity = document.getElementById('tooltip-capacity');
    const tooltip_status = document.getElementById('tooltip-status');

    // Update tooltip content
    tooltip_name.textContent = room.name || `Room ${room.location?.roomNumber}`;
    tooltip_capacity.textContent = `Capacity: ${room.seats || 0} seats`;
    
    const is_available = room.seats > 0 && room.building !== '';
    tooltip_status.textContent = `Status: ${is_available ? 'Available' : 'Unavailable'}`;
    tooltip_status.style.color = is_available ? '#2ecc71' : '#e74c3c';

    // Position tooltip
    tooltip.style.left = (event.pageX + 10) + 'px';
    tooltip.style.top = (event.pageY - 10) + 'px';
    
    // Show tooltip
    tooltip.classList.remove('hidden');
}

/**
 * Hide the room tooltip.
 */
function hide_room_tooltip() {
    const tooltip = document.getElementById('room-tooltip');
    tooltip.classList.add('hidden');
}

/**
 * Initialize room markers with data and event listeners.
 * Takes rooms data array and sets up interactive markers.
 */
function initialize_room_markers(rooms) {
    const markers = document.querySelectorAll('.room-marker');
    
    markers.forEach(marker => {
        const room_id = marker.getAttribute('data-room-id');
        const room = rooms.find(r => String(r.id) === String(room_id));
        
        if (room) {
            // Update marker status
            update_room_marker(room);
            
            // Add click handler
            marker.addEventListener('click', () => {
                const is_available = room.seats > 0 && room.building !== '';
                if (is_available) {
                    navigate_to_room(room_id);
                }
            });
            
            // Add hover handlers for tooltip
            marker.addEventListener('mouseenter', (event) => {
                show_room_tooltip(room, event);
            });
            
            marker.addEventListener('mousemove', (event) => {
                show_room_tooltip(room, event);
            });
            
            marker.addEventListener('mouseleave', () => {
                hide_room_tooltip();
            });
        }
    });
}

/**
 * Show loading state while data is being fetched.
 */
function show_loading_state() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('map-container').classList.add('hidden');
    document.getElementById('map-legend').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

/**
 * Show error state when data loading fails.
 */
function show_error_state() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('map-container').classList.add('hidden');
    document.getElementById('map-legend').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
}

/**
 * Show map content when data is successfully loaded.
 */
function show_map_content() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('map-container').classList.remove('hidden');
    document.getElementById('map-legend').classList.remove('hidden');
}

/**
 * Initialize event listeners for navigation and controls.
 */
function initialize_event_listeners() {
    // List view button
    document.getElementById('list-view-btn').addEventListener('click', navigate_to_list);
    
    // Floor plan image error handling
    const floor_plan = document.getElementById('floor-plan');
    floor_plan.addEventListener('error', () => {
        console.error('Failed to load floor plan image');
        show_error_state();
    });
    
    // Floor plan image load success
    floor_plan.addEventListener('load', () => {
        console.log('Floor plan image loaded successfully');
    });
}

/**
 * Load rooms data and initialize the map.
 */
async function load_and_initialize_map() {
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
        
        // Filter for Science Library rooms only (since this is the Science Library floor plan)
        const science_library_rooms = rooms_array.filter(room => 
            room.building === 'Exley' || room.building === 'Exeley'
        );
        
        // Initialize room markers
        initialize_room_markers(science_library_rooms);
        show_map_content();
        
        console.log(`Initialized map with ${science_library_rooms.length} Science Library rooms`);
        
    } catch (error) {
        console.error('Failed to load rooms data:', error);
        show_error_state();
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initialize_event_listeners();
    load_and_initialize_map();
});
