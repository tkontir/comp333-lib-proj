// Library Room Reservation Skeleton Code


// Import the rooms data json 
let rooms = null;

async function loadRoomsModuleOrFetch() {
    // Try dynamic import with JSON assertion first. This works in modern browsers
    // when JSON modules / import assertions are supported.
    try {
        const mod = await import('../rooms.json', { assert: { type: 'json' } });
        // Some loaders expose the data as default, others directly as the module value
        rooms = mod.default || mod;
        console.log('Loaded rooms via import assertion:', rooms);
        return rooms;
    } catch (err) {
        // If import assertions aren't supported you'll land here. Fall back to fetch.
        console.warn('Import assertion failed or not supported — falling back to fetch:', err);
        // Use a path relative to this module. `import.meta.url` is available in modules.
        try {
            const url = new URL('../rooms.json', import.meta.url).href;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`);
            rooms = await res.json();
            console.log('Loaded rooms via fetch fallback:', rooms);
            return rooms;
        } catch (fetchErr) {
            console.error('Failed to load rooms.json via fetch fallback:', fetchErr);
            throw fetchErr;
        }
    }
}

// DOM Element References
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

// Function to get all rooms
function getAllRooms() {
    // TODO: Implement room collection logic
    return [];
}

// Function to populate library options
function populateLibraries() {
    // TODO: Add library options to library select dropdown
}

// Function to populate floors based on selected library
function populateFloors() {
    // TODO: Dynamically populate floor options
}

// Function to populate rooms based on selected library and floor
function populateRooms() {
    // TODO: Dynamically populate room options
}

// Function to populate rooms in availability view
function populateAllRooms() {
    // TODO: Populate rooms across all libraries
}

// Event Listeners
function setupFilterByChangeListener() {
    // TODO: Handle filter type selection (library vs availability)
}

function setupLibrarySelectionListener() {
    // TODO: Handle library selection and floor population
}

function setupFloorSelectionListener() {
    // TODO: Handle floor selection and room population
}

function setupRoomSelectionListener() {
    // TODO: Handle room selection and reservation button state
}

function setupReservationButtonListener() {
    // TODO: Handle reservation button click and reservation process
}

// Initialization function
function initializeReservationSystem() {
    // TODO: Set up all event listeners and initial state
    populateLibraries();
    setupFilterByChangeListener();
    setupLibrarySelectionListener();
    setupFloorSelectionListener();
    setupRoomSelectionListener();
    setupReservationButtonListener();
}

// Initialize the system when the page loads. Ensure rooms are loaded first.
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await loadRoomsModuleOrFetch();
    } catch (err) {
        // If loading rooms fails, still initialize so UI shows an error state
        console.error('Could not load rooms data during initialization:', err);
    }
    initializeReservationSystem();
});