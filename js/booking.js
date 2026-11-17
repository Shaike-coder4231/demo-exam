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

// ===== АВТОФОРМАТИРОВАНИЕ ТЕЛЕФОНА =====
function formatPhone(value) {
    // Оставляем только цифры
    let digits = value.replace(/\D/g, '');

    // Если начинается с 8, заменяем на 7
    if (digits.startsWith('8')) {
        digits = '7' + digits.slice(1);
    }

    // Если не начинается с 7, добавляем 7 в начало
    if (!digits.startsWith('7') && digits.length > 0) {
        digits = '7' + digits;
    }

    // Ограничиваем до 11 цифр (7 + 10 цифр номера)
    digits = digits.slice(0, 11);

    // Форматируем по маске +7(XXX)XXX-XX-XX
    let result = '';
    if (digits.length === 0) return '';

    result = '+7';
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

// Инициализация при загрузке
document.addEventListener('DOMContentLoaded', function() {
    const roomId = parseInt(getUrlParam('room_id'));
    const roomInfoDiv = document.getElementById('roomInfo');

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

    // ===== Маска для телефона =====
    const phoneInput = document.getElementById('phone');
    
    // Устанавливаем начальное значение
    phoneInput.value = '+7(';

    // Обработчик ввода
    phoneInput.addEventListener('input', function(e) {
        const cursorPos = this.selectionStart;
        const oldValue = this.value;
        const newValue = formatPhone(this.value);
        
        this.value = newValue;
        
        // Если поле пустое — ставим +7(
        if (newValue === '') {
            this.value = '+7(';
        }
    });

    // Запрещаем удалять +7( в начале
    phoneInput.addEventListener('keydown', function(e) {
        // Backspace
        if (e.key === 'Backspace') {
            const cursorPos = this.selectionStart;
            if (cursorPos <= 3) { // позиция до или в "+7("
                e.preventDefault();
            }
        }
    });

    // При потере фокуса — если номер неполный, очищаем
    phoneInput.addEventListener('blur', function() {
        const digits = this.value.replace(/\D/g, '');
        if (digits.length < 11 && digits.length > 0) {
            this.value = '';
        } else if (digits.length === 0) {
            this.value = '';
        }
    });

    // При получении фокуса — если пусто, ставим +7(
    phoneInput.addEventListener('focus', function() {
        if (this.value === '') {
            this.value = '+7(';
        }
    });

    // Обработка формы
    document.getElementById('bookingForm').addEventListener('submit', function(e) {
        e.preventDefault();

        // Очистка ошибок
        document.querySelectorAll('.error').forEach(el => el.textContent = '');

        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const email = document.getElementById('email').value.trim();
        const checkInStr = document.getElementById('checkIn').value.trim();
        const checkOutStr = document.getElementById('checkOut').value.trim();

        let hasError = false;

        // Имя: кириллица, пробелы, точки, тире
        if (!/^[А-Яа-яЁё\s.\-]+$/.test(firstName) || firstName.length < 2) {
            document.getElementById('err-firstName').textContent = 'Только кириллица, мин. 2 символа';
            hasError = true;
        }

        // Фамилия
        if (!/^[А-Яа-яЁё\s.\-]+$/.test(lastName) || lastName.length < 2) {
            document.getElementById('err-lastName').textContent = 'Только кириллица, мин. 2 символа';
            hasError = true;
        }

        // Телефон +7(ХХХ)ХХХ-ХХ-ХХ
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
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (!checkIn) {
            document.getElementById('err-checkIn').textContent = 'Формат: ДД.ММ.ГГГГ';
            hasError = true;
        } else if (checkIn < today) {
            document.getElementById('err-checkIn').textContent = 'Дата заезда не раньше сегодня';
            hasError = true;
        }

        if (!checkOut) {
            document.getElementById('err-checkOut').textContent = 'Формат: ДД.ММ.ГГГГ';
            hasError = true;
        } else if (checkIn && checkOut <= checkIn) {
            document.getElementById('err-checkOut').textContent = 'Дата выезда должна быть позже даты заезда';
            hasError = true;
        }

        if (hasError) return;

        // Проверка занятости номера
        const roomId = parseInt(document.getElementById('roomId').value);
        if (roomId && !checkAvailability(roomId, checkIn, checkOut)) {
            showMessage('❌ Этот номер занят в выбранный период. Выберите другие даты.', false);
            return;
        }

        // Сохранение брони
        const booking = {
            roomId: roomId,
            firstName: firstName,
            lastName: lastName,
            phone: phone,
            email: email,
            checkIn: checkInStr,
            checkOut: checkOutStr
        };

        addBooking(booking);
        showMessage('✅ Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', true);

        // Очистка формы
        this.reset();
        phoneInput.value = '+7(';
    });
});
