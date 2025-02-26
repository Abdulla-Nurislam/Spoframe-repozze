document.addEventListener('DOMContentLoaded', function() {
    const dots = document.querySelectorAll('.dot');
    const slides = document.querySelectorAll('.hero-slide');
    
    // Функция для переключения слайдов
    function switchSlide(slideIndex) {
        // Убираем активный класс со всех слайдов и точек
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Добавляем активный класс нужному слайду и точке
        slides[slideIndex].classList.add('active');
        dots[slideIndex].classList.add('active');
    }
    
    // Обработчик клика по точкам
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            switchSlide(index);
        });
    });
    
    // Автоматическое переключение слайдов
    let currentSlide = 0;
    setInterval(() => {
        currentSlide = (currentSlide + 1) % slides.length;
        switchSlide(currentSlide);
    }, 5000); // Переключение каждые 5 секунд
}); 