
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