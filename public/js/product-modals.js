document.addEventListener('DOMContentLoaded', function() {
    // Находим все кнопки "Подробнее"
    const detailButtons = document.querySelectorAll('.btn-view-details');
    const modals = document.querySelectorAll('.product-modal');
    const closeButtons = document.querySelectorAll('.product-modal__close');

    // Добавляем обработчики для кнопок "Подробнее"
    detailButtons.forEach((button, index) => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const modalId = this.closest('.product-card').dataset.modalTarget;
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden'; // Запрещаем прокрутку фона
            }
        });
    });

    // Добавляем обработчики для кнопок закрытия
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.product-modal');
            modal.style.display = 'none';
            document.body.style.overflow = ''; // Возвращаем прокрутку
        });
    });

    // Закрытие по клику вне модального окна
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('product-modal')) {
            e.target.style.display = 'none';
            document.body.style.overflow = '';
        }
    });
});
