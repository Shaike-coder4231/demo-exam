// Проверка авторизации
if (sessionStorage.getItem('admin_logged') !== 'true') {
    window.location.href = 'admin-login.html';
}

// Выход
function logout() {
    sessionStorage.removeItem('admin_logged');
    window.location.href = 'admin-login.html';
}

// Отрисовка таблицы заявок
function renderBookings() {
    const bookings = getBookings();
    const container = document.getElementById('bookingsTable');

    if (bookings.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:40px;">Заявок пока нет</p>';
        return;
    }

    const table = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>#</th>
                    <th>Номер</th>
                    <th>ФИО</th>
                    <th>Телефон</th>
                    <th>Email</th>
                    <th>Заезд</th>
                    <th>Выезд</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${bookings.map(b => {
                    const room = roomsData.find(r => r.id === b.roomId);
                    const statusClass = b.status === 'Новая' ? 'status-new' : 
                                       b.status === 'Одобрена' ? 'status-approved' : 'status-rejected';
                    return `
                        <tr>
                            <td>${b.id}</td>
                            <td>${room ? room.category : 'N/A'}</td>
                            <td>${b.lastName} ${b.firstName}</td>
                            <td>${b.phone}</td>
                            <td>${b.email}</td>
                            <td>${b.checkIn}</td>
                            <td>${b.checkOut}</td>
                            <td><span class="status ${statusClass}">${b.status}</span></td>
                            <td>
                                ${b.status === 'Новая' ? `
                                    <button class="btn-small approve" onclick="approveBooking(${b.id})">Одобрить</button>
                                    <button class="btn-small reject" onclick="rejectBooking(${b.id})">Отклонить</button>
                                ` : ''}
                                <button class="btn-small delete" onclick="deleteBookingById(${b.id})">Удалить</button>
                            </td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;

    container.innerHTML = table;
}

// Одобрить
function approveBooking(id) {
    updateBookingStatus(id, 'Одобрена');
    renderBookings();
}

// Отклонить
function rejectBooking(id) {
    updateBookingStatus(id, 'Отклонена');
    renderBookings();
}

// Удалить
function deleteBookingById(id) {
    if (confirm('Удалить заявку?')) {
        deleteBooking(id);
        renderBookings();
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', renderBookings);
