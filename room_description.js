// Implement the individual room website page.

class RoomDescription {
    constructor(room) {
        this.room = room;
    }

    render() {
        const container = document.createElement('div');
        container.className = 'room-description';

        const title = document.createElement('h1');
        title.textContent = this.room.name;
        container.appendChild(title);

        const image = document.createElement('img');
        image.src = this.room.image;
        image.alt = `${this.room.name} image`;
        container.appendChild(image);

        const location = document.createElement('p');
        location.textContent = `Location: ${this.room.location}`;
        container.appendChild(location);

        const seats = document.createElement('p');
        seats.textContent = `Number of seats: ${this.room.seats}`;
        container.appendChild(seats);

        const availability = document.createElement('p');
        availability.textContent = `Availability: ${this.room.availability ? 'Available' : 'Not Available'}`;
        container.appendChild(availability);

        const bookingsTitle = document.createElement('h2');
        bookingsTitle.textContent = 'Bookings:';
        container.appendChild(bookingsTitle);

        const bookingsList = document.createElement('ul');
        this.room.bookings.forEach(booking => {
            const listItem = document.createElement('li');
            listItem.textContent = booking;
            bookingsList.appendChild(listItem);
        });
        container.appendChild(bookingsList);

        return container;
    }
}