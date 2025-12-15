/* loadRooms() => object
    This function opens the room info JSON and returns the parsed data
*/
async function loadRooms() {
    try {
        const res = await fetch('/rooms.json');
        if (!res.ok) {
            throw new Error(`Failed to fetch rooms.json (status ${res.status})`);
        }
        const data = await res.json();
        return data;
    } catch (err) {
        console.error('Error loading rooms.json:', err);
        throw err;
    }
}

/* loadRoomById(id : int) => object|null
    This function parses through the rooms data and returns the room with the matching ID.
    Returns null if no room is found.
*/
async function loadRoomById(id) {
    if (id == null) return null;
    const data = await loadRooms();
    let roomsArray = null;
    if (Array.isArray(data)) {
        roomsArray = data;
    } else if (data && Array.isArray(data.rooms)) {
        roomsArray = data.rooms;
    }

    if (!roomsArray) return null;

    // Compare as strings to be tolerant of number/string ids
    return roomsArray.find(r => String(r.id) === String(id)) || null;
}

/* render_room_details(room : object) => null
    This function takes in the room object and updates the HTML elements on the page
*/
function render_room_details(room) {
    // Update room information
    document.getElementById('room-name').textContent = room.name || 'Unknown Room';
    document.getElementById('room-building').textContent = room.building || 'N/A';
    document.getElementById('room-floor').textContent = room.location?.floor || 'N/A';
    document.getElementById('room-number').textContent = room.location?.roomNumber || 'N/A';
    document.getElementById('room-capacity').textContent = `${room.seats || 0} seats`;
    document.getElementById('room-description-text').textContent = room.description || 'No description available.';

    // Update availability status
    const availability_element = document.getElementById('room-availability');
    const is_available = room.seats > 0 && room.building !== '';
    availability_element.textContent = is_available ? 'Available' : 'Unavailable';
    availability_element.className = `detail-value availability-badge ${is_available ? 'available' : 'unavailable'}`;

    /* load_room_image (room object) => void
       Load room images based on room number and building.
       Images are stored in ../rooms/images/ with naming patterns:
       - Olin: olin_[roomNumber].png 
       - Exley (Science Library): scili_[roomNumber].png
       Falls back to placeholder if image not found or fails to load. */
    // Load room images based on room number
    const image_element = document.getElementById('room-image');
    const placeholder_element = image_element.parentElement.querySelector('.room-image-placeholder');
    
    // Determine image path based on room number and building
    let image_path = null;
    
    if (room.location?.roomNumber) {
        const room_number = room.location.roomNumber;
        
        if (room.building === 'Olin') {
            image_path = `../rooms/images/olin_${room_number}.png`;
        } else if (room.building === 'Exley') {
            image_path = `../rooms/images/scili_${room_number}.png`;
        }
    }
    
    if (image_path) {
        // Try to load the image
        const test_image = new Image();
        test_image.onload = function() {
            // Image exists and loaded successfully
            image_element.src = image_path;
            image_element.style.display = 'block';
            placeholder_element.style.display = 'none';
        };
        test_image.onerror = function() {
            // Image doesn't exist or failed to load, keep placeholder
            console.log(`Image not found: ${image_path}`);
            image_element.style.display = 'none';
            placeholder_element.style.display = 'flex';
        };
        test_image.src = image_path;
    } else {
        // No image available for this room, keep placeholder
        image_element.style.display = 'none';
        placeholder_element.style.display = 'flex';
    }

    // Render features
    const features_container = document.getElementById('features-list');
    if (features_container) {
        render_room_features(room.features || []);
    }

    // Update page title
    document.title = `${room.name} - Library Room Details`;

    // Enable/disable booking button based on availability
    const book_button = document.getElementById('book-room-btn');
    if (is_available) {
        book_button.disabled = false;
        book_button.textContent = 'Book This Room';
    } else {
        book_button.disabled = true;
        book_button.textContent = 'Room Unavailable';
    }
}

/* render_room_features(features : array) => null
    Render room features into the features grid.
    Takes an array of feature strings and creates feature items.
*/
function render_room_features(features) {
    const features_container = document.getElementById('features-list');
    if (!features_container) {
        return;
    }
    
    features_container.innerHTML = '';

    if (!features || features.length === 0) {
        features_container.innerHTML = '<div class="no-features">No special features listed for this room.</div>';
        return;
    }

    features.forEach(feature => {
        const feature_element = create_feature_element(feature);
        features_container.appendChild(feature_element);
    });
}

/* create_feature_element(feature : string) => HTMLElement
    Create a feature element for the features grid.
    Takes a feature string and returns a DOM element representing that feature.
*/
function create_feature_element(feature) {
    const feature_div = document.createElement('div');
    feature_div.className = 'feature-item';

    const icon_span = document.createElement('span');
    icon_span.className = 'feature-icon';
    
    // Map features to appropriate icons
    const feature_icons = {
        'blackboard': '📝',
        'whiteboard': '📋',
        'projector': '📽️',
        'computer': '💻',
        'wifi': '📶',
        'printer': '🖨️',
        'scanner': '📄',
        'phone': '📞',
        'tv': '📺',
        'conference': '👥',
        'microphone': '🎤',
        'speaker': '🔊'
    };
    
    icon_span.textContent = feature_icons[feature.toLowerCase()] || '🔧';

    const text_span = document.createElement('span');
    text_span.className = 'feature-text';
    text_span.textContent = feature;

    feature_div.appendChild(icon_span);
    feature_div.appendChild(text_span);

    return feature_div;
}

/* show_loading_state() => null
    Show loading state while data is being fetched.
*/
function show_loading_state() {
    document.getElementById('loading-state').classList.remove('hidden');
    document.getElementById('room-container').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
}

/* show_error_state() => null
    Show error state when room is not found or an error occurs.
*/
function show_error_state() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('room-container').classList.add('hidden');
    document.getElementById('error-state').classList.remove('hidden');
}

/* show_room_content() => null
    Show room content when data is successfully loaded.
*/
function show_room_content() {
    document.getElementById('loading-state').classList.add('hidden');
    document.getElementById('error-state').classList.add('hidden');
    document.getElementById('room-container').classList.remove('hidden');
}

/* initialize_modal() => null
    Initialize modal functionality for booking.
*/
function initialize_modal() {
    const modal = document.getElementById('booking-modal');
    const book_button = document.getElementById('book-room-btn');
    const close_button = document.querySelector('.modal-close');

    //linking reservation page to the book button
    // Open modal or redirect to booking link
    book_button.addEventListener('click', async () => {
        if (!book_button.disabled) {
            const room_id = new URLSearchParams(window.location.search).get('id');
            try {
                const room = await loadRoomById(room_id);
                
                if (room && room.link) {
                    // Open the LibCal link in a new tab
                    window.open(room.link, '_blank');
                } else {
                    // Fallback to modal if no link is available
                    modal.classList.remove('hidden');
                    console.warn('No booking link found for this room');
                }
            } catch (error) {
                console.error('Error opening booking link:', error);
                modal.classList.remove('hidden');
            }
        }
    });

    // Close modal
    close_button.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Close modal when clicking outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.add('hidden');
        }
    });
}

/* initialize_availability_check() => null
    Initialize availability check functionality.
*/
function initialize_availability_check() {
    const availability_button = document.getElementById('check-availability-btn');
    
    availability_button.addEventListener('click', () => {
        alert('Need to add availability checking later.');
    });
}

// Main execution when page loads
document.addEventListener('DOMContentLoaded', () => {
    show_loading_state();
    
    // Initialize modal and other interactive elements
    initialize_modal();
    initialize_availability_check();

    const query_string = window.location.search;
    const params = new URLSearchParams(query_string);
    const room_id = params.get('id');

    if (room_id) {
        loadRoomById(room_id)
            .then(room => {
                if (room) {
                    console.log('Loaded room:', room);
                    render_room_details(room);
                    show_room_content();
                } else {
                    console.warn(`Room with id ${room_id} not found in rooms.json`);
                    show_error_state();
                }
            })
            .catch(err => {
                console.error('Error loading room data:', err);
                show_error_state();
            });
    } else {
        console.log('No room id provided in URL');
        show_error_state();
    }

    renderAvailabilityBar();
    fetchAvailability();
});

/* renderAvailabilityBar(intervalMinutes = 15, startHour = 0, endHour = 24)
   Creates clickable segments representing availability. Default creates 96 segments (24h * 4).
*/
function renderAvailabilityBar(intervalMinutes = 15, startHour = 0, endHour = 24) {
    const container = document.getElementById('availability-bar');
    if (!container) return;

    container.innerHTML = '';
    const inner = document.createElement('div');
    inner.className = 'bar-inner';
    container.appendChild(inner);

    // expose configuration to other functions (used when applying fetched availability)
    container.dataset.intervalMinutes = String(intervalMinutes);
    container.dataset.startHour = String(startHour);
    container.dataset.endHour = String(endHour);

    const totalMinutes = (endHour - startHour) * 60;
    const segments = Math.floor(totalMinutes / intervalMinutes);
    const segmentsPerHour = 60 / intervalMinutes;
    const segmentWidth = 20; 
    inner.style.width = `${segments * segmentWidth}px`;

    for (let i = 0; i < segments; i++) {
        const div = document.createElement('div');
        div.className = 'availability-segment state-default';
        div.dataset.index = String(i);
        div.style.flex = `0 0 ${segmentWidth}px`;

        const minutes = startHour * 60 + i * intervalMinutes;
        const hh = Math.floor(minutes / 60);
        const mm = minutes % 60;
        const timeLabel = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;

        // Add a visible label only at hour boundaries to reduce clutter
        if (i % segmentsPerHour === 0) {
            const label = document.createElement('span');
            label.className = 'segment-label';
            label.textContent = timeLabel;
            div.appendChild(label);
        }

        // Add title for hover accessibility
        div.title = timeLabel;

        inner.appendChild(div);
    }
}

/* setAvailability(statuses)
   statuses: array with length equal to number of segments, where each value can be:
     - 'available' or true  => green
     - 'unavailable' or false => red
     - 'default' or null/undefined => gray
   If array is shorter, only the provided indices are set.
*/
function setAvailability(statuses) {
    const inner = document.querySelector('#availability-bar .bar-inner');
    if (!inner) return;
    const segments = Array.from(inner.children);
    segments.forEach((seg, idx) => {
        const val = statuses && idx < statuses.length ? statuses[idx] : null;
        seg.classList.remove('state-default', 'state-available', 'state-unavailable');
        if (val === 'available' || val === true) {
            seg.classList.add('state-available');
        } else if (val === 'unavailable' || val === false) {
            seg.classList.add('state-unavailable');
        } else {
            seg.classList.add('state-default');
        }
    });
}

/* fetchAvailability() => null
    Makes the availability API request
*/
async function fetchAvailability() {
    const apiEndpoint = '/api/post';

    try {
        const params = new URLSearchParams(window.location.search);
        const currentRoomId = params.get('id');
        let roomPayload = null;
        let currentRoomItemId = null;
        if (currentRoomId) {
            try {
                const room = await loadRoomById(currentRoomId);
                if (room && Array.isArray(room.payload)) {
                    roomPayload = room.payload;
                    // Extract the itemId (third element in payload array)
                    currentRoomItemId = room.payload[2];
                    console.log('Using room id:', currentRoomItemId);
                }
            } catch (e) {
                console.warn('Unable to load room payload for availability request', e);
            }
        }

        const response = await fetch(apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ payload: roomPayload })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        console.log('Data fetched successfully');
        // console.log(JSON.stringify(data, null, 2));
        
        // Filter data to only include entries matching the current room's itemId
        let filteredData = data;
        console.log(typeof(data));
        if (currentRoomItemId !== null) {
            filteredData = data.filter(item => item.itemId === currentRoomItemId);
            console.log(`Filtered to ${filteredData.length} items matching itemId ${currentRoomItemId}`);
        }
        
        applyAvailabilityFromData(filteredData);

    } catch (error) {
        console.error('Fetch error:', error);
    }
}

/* applyAvailabilityFromData(data)
   Accepts the raw JSON returned by fetchAvailability and maps it to the timeline.
   Rule: if a slot object contains a truthy `className` property (or common variants) it is unavailable (red), otherwise available (green).
*/
function applyAvailabilityFromData(data) {
    if (!data) {
        console.warn('No availability data provided to applyAvailabilityFromData');
        return;
    }

    let slots = null;
    if (Array.isArray(data)) {
        slots = data;
    } else if (data && Array.isArray(data.slots)) {
        slots = data.slots;
    } else if (data && Array.isArray(data.data)) {
        slots = data.data;
    } else if (data && Array.isArray(data.availability)) {
        slots = data.availability;
    }

    if (!slots) {
        console.warn('Couldnt find slots array in availability response');
        return;
    }

    const inner = document.querySelector('#availability-bar .bar-inner');
    if (!inner) {
        console.warn('Availability bar not present');
        return;
    }

    const container = document.getElementById('availability-bar');
    const intervalMinutes = Number(container?.dataset.intervalMinutes || 15);
    const startHour = Number(container?.dataset.startHour || 0);

    const segmentCount = inner.children.length;
    const statuses = new Array(segmentCount);

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();

    console.debug('applyAvailabilityFromData: slots.length=', slots.length, 'nowMinutes=', nowMinutes, 'intervalMinutes=', intervalMinutes, 'startHour=', startHour);

    function parseSlotStartMinutes(slot) {
        if (!slot) return null;
        const keys = ['start', 'startTime', 'time', 'from', 'begin', 'dateTime', 'datetime'];
        for (const k of keys) {
            if (slot[k]) {
                const v = slot[k];
                // If it's numeric minutes index
                if (typeof v === 'number') return v;
                // Try parse as ISO datetime
                const d = new Date(v);
                if (!isNaN(d.getTime())) {
                    return d.getHours() * 60 + d.getMinutes();
                }
                // Try to parse hh:mm string
                if (typeof v === 'string' && /^\d{1,2}:\d{2}$/.test(v)) {
                    const parts = v.split(':').map(Number);
                    return parts[0] * 60 + parts[1];
                }
            }
        }
        return null;
    }

    const slotMap = new Map();
    let anySlotHasTime = false;
    for (let s = 0; s < slots.length; s++) {
        const m = parseSlotStartMinutes(slots[s]);
        if (m !== null) {
            anySlotHasTime = true;
            // normalize minutes to range 0..1439
            const mm = ((m % 1440) + 1440) % 1440;
            slotMap.set(mm, slots[s]);
        }
    }

    for (let i = 0; i < segmentCount; i++) {
        // compute start and end minute for this segment
        const segStartMinutes = startHour * 60 + i * intervalMinutes;
        const segEndMinutes = segStartMinutes + intervalMinutes;

        // If the segment end is in the past, keep gray
        if (segEndMinutes <= nowMinutes) {
            statuses[i] = 'default';
            continue;
        }

        let slot = null;

        if (anySlotHasTime) {
            // match by start minute 
            const key = ((segStartMinutes % 1440) + 1440) % 1440;
            slot = slotMap.get(key) || null;
        } else if (i < slots.length) {
            // fall back to index-based mapping if no time data found
            slot = slots[i];
        } else {
            slot = null;
        }

        // If slot missing from API, keep gray
        if (!slot) {
            statuses[i] = 'default';
            continue;
        }

        const occupied = slot.className || slot.classname || slot.class || slot.booked || slot.occupied;
        statuses[i] = occupied ? 'unavailable' : 'available';
    }

    setAvailability(statuses);
}