// База данных пользователей (хранится в sessionStorage для демонстрации)
// Используем sessionStorage вместо localStorage для хранения пользователей в админке
let users = [];

// Функция для получения пользователей из sessionStorage
function getUsers() {
    return JSON.parse(sessionStorage.getItem('admin_users') || '[]');
}

// Функция для сохранения пользователей в sessionStorage
function saveUsers(userList) {
    sessionStorage.setItem('admin_users', JSON.stringify(userList));
}

// Функция для добавления нового пользователя
function addUser(userData) {
    const currentUsers = getUsers();
    const newUser = {
        ...userData,
        id: currentUsers.length > 0 ? Math.max(...currentUsers.map(u => u.id)) + 1 : 1
    };
    
    currentUsers.push(newUser);
    saveUsers(currentUsers);
    refreshData();
}

// Функция для инициализации демо-пользователей, если их нет
function initDemoUsers() {
    users = getUsers();
    
    if (users.length === 0) {
        const demoUsers = [
            {
                id: 1,
                name: 'Иван Иванов',
                email: 'ivan@example.com',
                password: 'password123',
                registrationDate: '2025-03-15T10:30:45'
            },
            {
                id: 2,
                name: 'Мария Петрова',
                email: 'maria@example.com',
                password: 'secure456',
                registrationDate: '2025-03-28T14:20:15'
            },
            {
                id: 3,
                name: 'Алексей Смирнов',
                email: 'alex@example.com',
                password: 'qwerty789',
                registrationDate: '2025-04-02T09:15:30'
            }
        ];
        
        // Сохраняем демо-пользователей
        saveUsers(demoUsers);
        users = demoUsers;
    }
}

// Функция для отображения статистики
function displayStats() {
    // Получаем актуальный список пользователей
    users = getUsers();
    
    // Общее количество пользователей
    document.getElementById('totalUsers').textContent = users.length;
    
    // Пользователи за сегодня
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayRegistrations = users.filter(user => {
        const regDate = new Date(user.registrationDate);
        return regDate >= today;
    });
    
    document.getElementById('todayUsers').textContent = todayRegistrations.length;
    
    // Последняя регистрация
    if (users.length > 0) {
        // Сортируем пользователей по дате регистрации (от новых к старым)
        const sortedUsers = [...users].sort((a, b) => {
            return new Date(b.registrationDate) - new Date(a.registrationDate);
        });
        
        const lastUser = sortedUsers[0];
        const lastRegDate = new Date(lastUser.registrationDate);
        
        // Форматируем дату
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        document.getElementById('lastRegistration').textContent = lastRegDate.toLocaleString('ru-RU', options);
    } else {
        document.getElementById('lastRegistration').textContent = 'Нет данных';
    }
}

// Функция для отображения списка пользователей
function displayUsers() {
    // Получаем актуальный список пользователей
    users = getUsers();
    
    const usersList = document.getElementById('usersList');
    usersList.innerHTML = '';
    
    if (users.length === 0) {
        usersList.innerHTML = `
            <tr>
                <td colspan="4" class="no-users">Нет зарегистрированных пользователей</td>
            </tr>
        `;
        return;
    }
    
    // Сортируем пользователей по дате регистрации (от новых к старым)
    const sortedUsers = [...users].sort((a, b) => {
        return new Date(b.registrationDate) - new Date(a.registrationDate);
    });
    
    sortedUsers.forEach(user => {
        const regDate = new Date(user.registrationDate);
        const options = { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' };
        const formattedDate = regDate.toLocaleString('ru-RU', options);
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.id}</td>
            <td>${user.name || 'Не указано'}</td>
            <td>${user.email}</td>
            <td>${formattedDate}</td>
        `;
        
        usersList.appendChild(row);
    });
}

// Функция для обновления данных
function refreshData() {
    displayStats();
    displayUsers();
}

// Функция для проверки новых пользователей из localStorage
function syncWithLocalStorage() {
    const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (localUsers.length > 0) {
        // Получаем текущих пользователей в админке
        const adminUsers = getUsers();
        
        // Находим новых пользователей, которых нет в админке
        const newUsers = localUsers.filter(localUser => 
            !adminUsers.some(adminUser => adminUser.email === localUser.email)
        );
        
        // Добавляем новых пользователей в админку
        if (newUsers.length > 0) {
            const updatedUsers = [...adminUsers, ...newUsers];
            saveUsers(updatedUsers);
            refreshData();
        }
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initDemoUsers();
    syncWithLocalStorage(); // Синхронизация с localStorage при загрузке
    refreshData();
    
    // Обновляем данные каждые 5 секунд (для демонстрации)
    setInterval(syncWithLocalStorage, 5000);
});
