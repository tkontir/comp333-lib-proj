// individual library room class
class Room {
    // constructor now accepts id as the first parameter and assigns it correctly
    constructor(id, name, location, capacity, image, description) {
        // Unique identifier
        this.id = id;

        // Room number/name
        this.name = name;

        // Room description
        this.description = description;

        // Number of seats in the room
        this.capacity = capacity;

        // Availability of the room
        this.availability = true;

        // Image of the room
        this.image = image;

        // Location of the room
        this.location = location;

        // Bookings for the room
        this.bookings = [];
    }
}

/**
 * Load and parse the rooms.json file.
 * Returns a Promise that resolves to the parsed JSON (usually an array of rooms).
 * Throws an error if the fetch fails or the JSON is invalid.
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

/**
 * Find and return a room by id from rooms.json.
 * Returns the room object or null if not found.
 * Handles both top-level array and an object like { rooms: [...] }.
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

// Expose helpers globally so other scripts/pages can call them
// window.loadRooms = loadRooms;
// window.loadRoomById = loadRoomById;

// Runs when the details.html page loads
const queryString = window.location.search;
const params = new URLSearchParams(queryString);


// Retrieve the roomId
const roomId = params.get('id');
console.log(roomId)
// If an id is present in the query string, load that room and log (or render) it.
if (roomId) {
    loadRoomById(roomId)
        .then(room => {
            if (room) {
                console.log('Loaded room:', room);
                // If you want a Room instance:
                // const roomInstance = new Room(room.id, room.name, room.location, room.capacity, room.image, room.description);
                // TODO: render room details into the page DOM here.
            } else {
                console.warn(`Room with id ${roomId} not found in rooms.json`);
            }
        })
        .catch(err => console.error('Error loading room data:', err));
} else {
    console.log('No room id provided in URL');
}