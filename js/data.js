// Данные номеров
const roomsData = [
    {
        id: 1,
        category: 'Стандартный',
        price: 3500,
        capacity: 2,
        area: 18,
        image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d7036b?w=400',
        amenities: 'Кондиционер, Wi-Fi, телевизор'
    },
    {
        id: 2,
        category: 'Студия',
        price: 5500,
        capacity: 3,
        area: 28,
        image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400',
        amenities: 'Кондиционер, Wi-Fi, телевизор, холодильник'
    },
    {
        id: 3,
        category: 'Люкс',
        price: 9000,
        capacity: 4,
        area: 45,
        image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400',
        amenities: 'Кондиционер, Wi-Fi, телевизор, холодильник, мини-бар'
    },
    {
        id: 4,
        category: 'Стандартный',
        price: 3200,
        capacity: 1,
        area: 15,
        image: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?w=400',
        amenities: 'Wi-Fi, телевизор'
    },
    {
        id: 5,
        category: 'Студия',
        price: 6000,
        capacity: 2,
        area: 30,
        image: 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=400',
        amenities: 'Кондиционер, Wi-Fi, холодильник'
    },
    {
        id: 6,
        category: 'Люкс',
        price: 10000,
        capacity: 4,
        area: 50,
        image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=400',
        amenities: 'Полный набор удобств'
    },
    {
        id: 7,
        category: 'Стандартный',
        price: 3800,
        capacity: 2,
        area: 20,
        image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400',
        amenities: 'Кондиционер, Wi-Fi'
    },
    {
        id: 8,
        category: 'Студия',
        price: 5800,
        capacity: 3,
        area: 32,
        image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400',
        amenities: 'Кондиционер, Wi-Fi, холодильник'
    }
];

// Функции для работы с localStorage
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
