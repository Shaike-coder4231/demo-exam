const roomsData = [
    { id: 1, category: 'Стандартный', price: 3500, capacity: 2, area: 18,
      image: 'images/standard-1.jpeg', amenities: 'Кондиционер, Wi-Fi, телевизор' },
    { id: 2, category: 'Студия', price: 5500, capacity: 3, area: 28,
      image: 'images/studio-1.jpeg', amenities: 'Кондиционер, Wi-Fi, телевизор, холодильник' },
    { id: 3, category: 'Люкс', price: 9000, capacity: 4, area: 45,
      image: 'images/lux-1.png', amenities: 'Кондиционер, Wi-Fi, телевизор, холодильник, мини-бар' },
    { id: 4, category: 'Стандартный', price: 3200, capacity: 1, area: 15,
      image: 'images/standard-2.jpeg', amenities: 'Wi-Fi, телевизор' },
    { id: 5, category: 'Студия', price: 6000, capacity: 2, area: 30,
      image: 'images/studio-2.jpeg', amenities: 'Кондиционер, Wi-Fi, холодильник' },
    { id: 6, category: 'Люкс', price: 10000, capacity: 4, area: 50,
      image: 'images/lux-2.jpeg', amenities: 'Полный набор удобств' },
    { id: 7, category: 'Стандартный', price: 3800, capacity: 2, area: 20,
      image: 'images/standard-3.jpeg', amenities: 'Кондиционер, Wi-Fi' },
    { id: 8, category: 'Студия', price: 5800, capacity: 3, area: 32,
      image: 'images/studio-3.jpeg', amenities: 'Кондиционер, Wi-Fi, холодильник' }
];

function getBookings() {
    const bookings = localStorage.getItem('hotel_bookings');
    return bookings ? JSON.parse(bookings) : [];
}

function saveBookings(bookings) {
    localStorage.setItem('hotel_bookings', JSON.stringify(bookings));
}

function addBooking(booking) {
    const bookings = getBookings();
    booking.id = Date.now();
    booking.status = 'Новая';
    booking.createdAt = new Date().toLocaleString('ru-RU');
    bookings.push(booking);
    saveBookings(bookings);
    return booking;
}

function updateBookingStatus(id, status) {
    const bookings = getBookings();
    const booking = bookings.find(b => b.id === id);
    if (booking) {
        booking.status = status;
        saveBookings(bookings);
    }
}

function deleteBooking(id) {
    let bookings = getBookings();
    bookings = bookings.filter(b => b.id !== id);
    saveBookings(bookings);
}
