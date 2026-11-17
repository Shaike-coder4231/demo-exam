// Получить случайные 6 номеров
function getRandomRooms(count) {
    const shuffled = [...roomsData].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

// Отрисовать номера
function renderRooms(rooms) {
    const grid = document.getElementById('roomsGrid');
    if (!grid) return;

    if (rooms.length === 0) {
        grid.innerHTML = '<p style="text-align:center; padding:40px;">Номера не найдены</p>';
        return;
    }

    grid.innerHTML = rooms.map(room => `
        <div class="room-card slide-up">
            <img src="${room.image}" alt="${room.category}">
            <h3>${room.category}</h3>
            <p class="price">${room.price.toLocaleString('ru-RU')} ₽/сутки</p>
            <p>Мест: ${room.capacity} | Площадь: ${room.area} м²</p>
            <p>${room.amenities}</p>
            <a href="booking.html?room_id=${room.id}" class="btn btn-primary">Забронировать</a>
        </div>
    `).join('');
}

// Применить фильтр
function applyFilter() {
    const category = document.getElementById('filterCategory').value;
    let filtered = getRandomRooms(6);

    if (category) {
        filtered = roomsData.filter(r => r.category === category);
        // Перемешиваем и берём 6
        filtered = filtered.sort(() => Math.random() - 0.5).slice(0, 6);
    }

    renderRooms(filtered);
}

// Сбросить фильтр
function resetFilter() {
    document.getElementById('filterCategory').value = '';
    renderRooms(getRandomRooms(6));
}

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    renderRooms(getRandomRooms(6));
});
