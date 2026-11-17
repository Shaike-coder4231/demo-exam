// Получить параметр из URL
function getUrlParam(name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
}

// Показать сообщение
function showMessage(text, isSuccess) {
    const msgDiv = document.getElementById('message');
    msgDiv.innerHTML = `<div class="alert ${isSuccess ? 'success' : 'error'}">${text}</div>`;
    msgDiv.scrollIntoView({ behavior: 'smooth' });
}

// ===== ФОРМАТИРОВАНИЕ ТЕЛЕФОНА =====
function formatPhone(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.startsWith('8')) digits = '7' + digits.slice(1);
    if (!digits.startsWith('7') && digits.length > 0) digits = '7' + digits;
    digits = digits.slice(0, 11);

    let result = '+7';
    if (digits.length > 1) result += '(' + digits.slice(1, 4);
    if (digits.length >= 4) result += ')';
    if (digits.length >= 5) result += digits.slice(4, 7);
    if (digits.length >= 8) result += '-' + digits.slice(7, 9);
    if (digits.length >= 10) result += '-' + digits.slice(9, 11);
    return result;
}

// ===== ФОРМАТИРОВАНИЕ ДАТЫ ДД.ММ.ГГГГ =====
function formatDate(value) {
    // Оставляем только цифры
    let digits = value.replace(/\D/g, '').slice(0, 8);
    let result = '';

    if (digits.length > 0) result += digits.slice(0, 2);
    if (digits.length >= 3) result += '.' + digits.slice(2, 4);
    if (digits.length >= 5) result += '.' + digits.slice(4, 8);

    return result;
}

// Парсинг даты ДД.ММ.ГГГГ
function parseDate(str) {
    const match = str.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (!match) return null;
    const [, day, month, year] = match;
    const date = new Date(year, month - 1, day);
    if (date.getDate() != day || date.getMonth() != month - 1 || date.getFullYear() != year) {
        return null;
    }
    return date;
}

// Конвертация ДД.ММ.ГГГГ → YYYY-MM-DD (для input type="date")
function toIsoDate(str) {
    const d = parseDate(str);
    if (!d) return '';
    return d.toISOString().split('T')[0];
}

// Конвертация YYYY-MM-DD → ДД.ММ.ГГГГ
function fromIsoDate(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}.${m}.${y}`;
}

// Открыть нативный календарь
function openPicker(pickerId) {
    const picker = document.getElementById(pickerId);
    // Хак для открытия нативного date picker
    picker.showPicker?.() || picker.focus();
    picker.click();
}

// Проверка пересечения дат
function checkAvailability(roomId, checkIn, checkOut) {
    const bookings = getBookings();
    return !bookings.some(b =>
        b.roomId === roomId &&
        b.status === 'Одобрена' &&
        new Date(b.checkIn) < checkOut &&
        new Date(b.checkOut) > checkIn
    );
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    const roomId = parseInt(getUrlParam('room_id'));
    const roomInfoDiv = document.getElementById('roomInfo');

    // Информация о номере
    if (roomId) {
        const room = roomsData.find(r => r.id === roomId);
        if (room) {
            document.getElementById('roomId').value = room.id;
            roomInfoDiv.innerHTML = `
                <h3>${room.category}</h3>
                <p>${room.price.toLocaleString('ru-RU')} ₽/сутки | Мест: ${room.capacity} | Площадь: ${room.area} м²</p>
                <p>${room.amenities}</p>
            `;
        }
    } else {
        roomInfoDiv.innerHTML = '<p>Номер не выбран. <a href="catalog.html">Вернуться в каталог</a></p>';
    }

    // ===== МАСКА ТЕЛЕФОНА =====
    const phoneInput = document.getElementById('phone');
    phoneInput.value = '+7(';

    phoneInput.addEventListener('input', function() {
        this.value = formatPhone(this.value) || '+7(';
    });

    phoneInput.addEventListener('keydown', function(e) {
        if (e.key === 'Backspace' && this.selectionStart <= 3) {
            e.preventDefault();
        }
    });

    phoneInput.addEventListener('focus', function() {
        if (this.value === '') this.value = '+7(';
    });

    phoneInput.addEventListener('blur', function() {
        const digits = this.value.replace(/\D/g, '');
        if (digits.length < 11) this.value = '';
    });

    // ===== МАСКА ДАТЫ ЗАЕЗДА =====
    const checkInInput = document.getElementById('checkIn');
    const checkInPicker = document.getElementById('checkInPicker');
    const checkOutInput = document.getElementById('checkOut');
    const checkOutPicker = document.getElementById('checkOutPicker');

    // Устанавливаем минимальную дату (сегодня)
    const today = new Date();
    const todayIso = today.toISOString().split('T')[0];
    checkInPicker.min = todayIso;
    checkOutPicker.min = todayIso;

    // Автоформатирование при вводе
    checkInInput.addEventListener('input', function() {
        this.value = formatDate(this.value);
        // Синхронизация с календарём
        const iso = toIsoDate(this.value);
        if (iso) {
            checkInPicker.value = iso;
            // Обновляем min для даты выезда
            checkOutPicker.min = iso;
        }
    });

    checkOutInput.addEventListener('input', function() {
        this.value = formatDate(this.value);
        const iso = toIsoDate(this.value);
        if (iso) checkOutPicker.value = iso;
    });

    // При выборе в календаре — обновляем текстовое поле
    checkInPicker.addEventListener('change', function() {
        const formatted = fromIsoDate(this.value);
        checkInInput.value = formatted;
        // Обновляем min для выезда
        if (this.value) {
            checkOutPicker.min = this.value;
            // Если дата выезда раньше заезда — очищаем её
            if (checkOutPicker.value && checkOutPicker.value <= this.value) {
                checkOutInput.value = '';
                checkOutPicker.value = '';
            }
        }
    });

    checkOutPicker.addEventListener('change', function() {
        checkOutInput.value = fromIsoDate(this.value);
    });

    // При потере фокуса — очищаем неполные даты
    checkInInput.addEventListener('blur', function() {
        if (this.value.length > 0 && this.value.length < 10) {
            this.value = '';
            checkInPicker.value = '';
        }
    });

    checkOutInput.addEventListener('blur', function() {
        if (this.value.length > 0 && this.value.length < 10) {
            this.value = '';
            checkOutPicker.value = '';
        }
    });

    // ===== ОТПРАВКА ФОРМЫ =====
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();

        document.querySelectorAll('.error').forEach(el => el.textContent = '');

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const checkInStr = checkInInput.value.trim();
        const checkOutStr = checkOutInput.value.trim();

        let hasError = false;

        if (!/^[А-Яа-яЁё\s.\-]+$/.test(firstName) || firstName.length < 2) {
            document.getElementById('err-firstName').textContent = 'Только кириллица, мин. 2 символа';
            hasError = true;
        }

        if (!/^[А-Яа-яЁё\s.\-]+$/.test(lastName) || lastName.length < 2) {
            document.getElementById('err-lastName').textContent = 'Только кириллица, мин. 2 символа';
            hasError = true;
        }

        if (!/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(phone)) {
            document.getElementById('err-phone').textContent = 'Заполните номер полностью';
            hasError = true;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('err-email').textContent = 'Неверный формат e-mail';
            hasError = true;
        }

        const checkIn = parseDate(checkInStr);
        const checkOut = parseDate(checkOutStr);
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        if (!checkIn) {
            document.getElementById('err-checkIn').textContent = 'Формат: ДД.ММ.ГГГГ';
            hasError = true;
        } else if (checkIn < todayDate) {
            document.getElementById('err-checkIn').textContent = 'Дата не раньше сегодня';
            hasError = true;
        }

        if (!checkOut) {
            document.getElementById('err-checkOut').textContent = 'Формат: ДД.ММ.ГГГГ';
            hasError = true;
        } else if (checkIn && checkOut <= checkIn) {
            document.getElementById('err-checkOut').textContent = 'Дата позже даты заезда';
            hasError = true;
        }

        if (hasError) return;

        const roomIdVal = parseInt(document.getElementById('roomId').value);
        if (roomIdVal && !checkAvailability(roomIdVal, checkIn, checkOut)) {
            showMessage('❌ Номер занят в этот период. Выберите другие даты.', false);
            return;
        }

        addBooking({
            roomId: roomIdVal,
            firstName, lastName, phone, email,
            checkIn: checkInStr,
            checkOut: checkOutStr
        });

        showMessage('✅ Заявка успешно отправлена!', true);
        this.reset();
        phoneInput.value = '+7(';
        checkInPicker.value = '';
        checkOutPicker.value = '';
        checkOutPicker.min = todayIso;
    });
});
