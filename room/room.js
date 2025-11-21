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

    // placeholder images since we havent done urls yet
    const image_element = document.getElementById('room-image');
    if (room.image && room.image !== '') {
        image_element.src = room.image;
        image_element.style.display = 'block';
        image_element.parentElement.querySelector('.room-image-placeholder').style.display = 'none';
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
        return; // Exit if features container doesn't exist in HTML
    }
    
    features_container.innerHTML = ''; // Clear existing features

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

    // Open modal
    book_button.addEventListener('click', () => {
        if (!book_button.disabled) {
            modal.classList.remove('hidden');
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

    // Render the availability bar (15-minute intervals across 24 hours)
    renderAvailabilityBar();
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

    const totalMinutes = (endHour - startHour) * 60;
    const segments = Math.floor(totalMinutes / intervalMinutes);
    const segmentsPerHour = 60 / intervalMinutes;
    const segmentWidth = 20; // px per 15-minute block; adjust for density

    // set inner width explicitly so outer container can scroll predictably
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
    // const statusElement = document.getElementById('status');
    // const resultsElement = document.getElementById('results');

    // 1. Update status
    // statusElement.textContent = 'Fetching data...';
    // resultsElement.textContent = '';

    // 2. Define the URL for your Vercel Function
    // Assuming your function file is at /api/external-call.ts or similar
    // Use a relative path, which is best practice when calling an API 
    // on the same domain.
    const apiEndpoint = '/api/post'; // Adjust path if needed

    try {
        // 3. Use the Fetch API
        // Although your Vercel function executes a POST request to the external server,
        // the client-side call to YOUR Vercel function can be a simple GET 
        // since the payload is hardcoded on the server.
        const response = await fetch(apiEndpoint, {
            method: 'GET', // Or 'POST', but 'GET' is sufficient for a trigger
            // No need for a body since the Vercel function handles the payload
            // If you wanted to send dates, you would add a 'body' and 'headers' here
        });

        // 4. Check for response errors (e.g., 404, 500)
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // 5. Parse the JSON response
        const data = await response.json();

        // 6. Display results
        console.log('Data fetched successfully!');
        console.log(JSON.stringify(data, null, 2));
        // statusElement.textContent = 'Data fetched successfully!';
        // resultsElement.textContent = JSON.stringify(data, null, 2);

    } catch (error) {
        // 7. Handle network or API errors
        // statusElement.textContent = `Error fetching data: ${error.message}`;
        console.error('Fetch error:', error);
        // resultsElement.textContent = 'An error occurred. Check the console for details.';
    }
}

// Call update function
fetchAvailability();