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
    // Берём только цифры
    let digits = value.replace(/\D/g, '');

    // Если начинается с 8 → меняем на 7
    if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
    }

    // Если не начинается с 7 → добавляем 7
    if (digits.length > 0 && !digits.startsWith('7')) {
        digits = '7' + digits;
    }

    // Ограничиваем 11 цифрами
    digits = digits.slice(0, 11);

    // Если пусто — возвращаем пустую строку
    if (digits.length === 0) return '';

    // Форматируем
    let result = '+7';

    if (digits.length > 1) {
        result += '(' + digits.slice(1, 4);
    }
    if (digits.length >= 4) {
        result += ')';
    }
    if (digits.length >= 5) {
        result += digits.slice(4, 7);
    }
    if (digits.length >= 8) {
        result += '-' + digits.slice(7, 9);
    }
    if (digits.length >= 10) {
        result += '-' + digits.slice(9, 11);
    }

    return result;
}

// ===== ФОРМАТИРОВАНИЕ ДАТЫ ДД.ММ.ГГГГ =====
function formatDate(value) {
    let digits = value.replace(/\D/g, '').slice(0, 8);
    let result = '';

    if (digits.length > 0) result += digits.slice(0, 2);
    if (digits.length >= 3) result += '.' + digits.slice(2, 4);
    if (digits.length >= 5) result += '.' + digits.slice(4, 8);

    return result;
}

// Парсинг ДД.ММ.ГГГГ → Date
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

// ДД.ММ.ГГГГ → YYYY-MM-DD
function toIsoDate(str) {
    const d = parseDate(str);
    if (!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

// YYYY-MM-DD → ДД.ММ.ГГГГ
function fromIsoDate(iso) {
    if (!iso) return '';
    const parts = iso.split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}.${parts[1]}.${parts[0]}`;
}

// Проверка занятости номера
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

    // ===== ЭЛЕМЕНТЫ =====
    const phoneInput = document.getElementById('phone');
    const checkInInput = document.getElementById('checkIn');
    const checkOutInput = document.getElementById('checkOut');
    const checkInPicker = document.getElementById('checkInPicker');
    const checkOutPicker = document.getElementById('checkOutPicker');

    // Минимальная дата — сегодня
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    checkInPicker.min = todayIso;
    checkOutPicker.min = todayIso;

    // ===== ТЕЛЕФОН =====
    phoneInput.addEventListener('input', function() {
        const formatted = formatPhone(this.value);
        this.value = formatted;
    });

    phoneInput.addEventListener('focus', function() {
        if (this.value === '') {
            this.value = '+7(';
        }
    });

    phoneInput.addEventListener('blur', function() {
        const digits = this.value.replace(/\D/g, '');
        if (digits.length <= 1) {
            this.value = '';
        }
    });

    // ===== ДАТА ЗАЕЗДА =====
    checkInInput.addEventListener('input', function() {
        this.value = formatDate(this.value);

        // Синхронизация с календарём
        const iso = toIsoDate(this.value);
        if (iso) {
            checkInPicker.value = iso;
            // Обновляем минимальную дату выезда
            checkOutPicker.min = iso;
        }
    });

    checkInInput.addEventListener('blur', function() {
        if (this.value.length > 0 && this.value.length < 10) {
            this.value = '';
            checkInPicker.value = '';
        }
    });

    // ===== ДАТА ВЫЕЗДА =====
    checkOutInput.addEventListener('input', function() {
        this.value = formatDate(this.value);

        const iso = toIsoDate(this.value);
        if (iso) {
            checkOutPicker.value = iso;
        }
    });

    checkOutInput.addEventListener('blur', function() {
        if (this.value.length > 0 && this.value.length < 10) {
            this.value = '';
            checkOutPicker.value = '';
        }
    });

    // ===== КАЛЕНДАРЬ ЗАЕЗДА =====
    checkInPicker.addEventListener('change', function() {
        if (this.value) {
            checkInInput.value = fromIsoDate(this.value);
            // Обновляем мин. дату выезда
            checkOutPicker.min = this.value;

            // Если выезд раньше заезда — очищаем выезд
            if (checkOutPicker.value && checkOutPicker.value <= this.value) {
                checkOutInput.value = '';
                checkOutPicker.value = '';
            }
        }
    });

    // ===== КАЛЕНДАРЬ ВЫЕЗДА =====
    checkOutPicker.addEventListener('change', function() {
        if (this.value) {
            checkOutInput.value = fromIsoDate(this.value);
        }
    });

    // ===== ОТПРАВКА ФОРМЫ =====
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Очистка ошибок
        document.querySelectorAll('.error').forEach(el => el.textContent = '');

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const phone = phoneInput.value.trim();
        const email = document.getElementById('email').value.trim();
        const checkInStr = checkInInput.value.trim();
        const checkOutStr = checkOutInput.value.trim();

        let hasError = false;

        // Имя
        if (!/^[А-Яа-яЁё\s.\-]+$/.test(firstName) || firstName.length < 2) {
            document.getElementById('err-firstName').textContent = 'Только кириллица, мин. 2 символа';
            hasError = true;
        }

        // Фамилия
        if (!/^[А-Яа-яЁё\s.\-]+$/.test(lastName) || lastName.length < 2) {
            document.getElementById('err-lastName').textContent = 'Только кириллица, мин. 2 символа';
            hasError = true;
        }

        // Телефон
        if (!/^\+7\(\d{3}\)\d{3}-\d{2}-\d{2}$/.test(phone)) {
            document.getElementById('err-phone').textContent = 'Заполните номер полностью';
            hasError = true;
        }

        // Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            document.getElementById('err-email').textContent = 'Неверный формат e-mail';
            hasError = true;
        }

        // Даты
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

        // Проверка занятости
        const roomIdVal = parseInt(document.getElementById('roomId').value);
        if (roomIdVal && !checkAvailability(roomIdVal, checkIn, checkOut)) {
            showMessage('❌ Номер занят в этот период. Выберите другие даты.', false);
            return;
        }

        // Сохранение
        addBooking({
            roomId: roomIdVal,
            firstName, lastName, phone, email,
            checkIn: checkInStr,
            checkOut: checkOutStr
        });

        showMessage('✅ Заявка успешно отправлена!', true);

        // Сброс формы
        this.reset();
        checkInPicker.value = '';
        checkOutPicker.value = '';
        checkOutPicker.min = todayIso;
    });
});
