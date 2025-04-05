// Функция форматирования даты
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Функция для загрузки списка пользователей
async function loadUsers() {
    try {
        const response = await fetch('/api/users');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const users = await response.json();
        
        // Обновляем статистику
        document.getElementById('totalUsers').textContent = users.length;
        
        // Считаем регистрации за сегодня
        const today = new Date().toISOString().split('T')[0];
        const todayUsers = users.filter(user => 
            user.registration_date.split('T')[0] === today
        ).length;
        document.getElementById('todayUsers').textContent = todayUsers;
        
        // Последняя регистрация
        if (users.length > 0) {
            const lastUser = users[0]; // Уже отсортировано на сервере
            document.getElementById('lastRegistration').textContent = 
                formatDate(lastUser.registration_date);
        }
        
        // Обновляем таблицу
        const tbody = document.getElementById('usersList');
        tbody.innerHTML = '';
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.id}</td>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${formatDate(user.registration_date)}</td>
            `;
            tbody.appendChild(row);
        });
        
        // Добавляем анимацию
        tbody.classList.add('fade-in');
        setTimeout(() => tbody.classList.remove('fade-in'), 300);
        
    } catch (error) {
        console.error('Ошибка при загрузке пользователей:', error);
        document.getElementById('usersList').innerHTML = `
            <tr>
                <td colspan="4" class="no-users">
                    Ошибка при загрузке данных. Пожалуйста, обновите страницу.
                </td>
            </tr>
        `;
    }
}

// Загружаем пользователей при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    loadUsers();
    // Обновляем данные каждые 10 секунд
    setInterval(loadUsers, 10000);
}); 