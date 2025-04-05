document.addEventListener('DOMContentLoaded', function() {
    const scrollToTopBtn = document.getElementById('scrollToTop');
    const scrollToBottomBtn = document.getElementById('scrollToBottom');
    
    // Показывать/скрывать кнопки при прокрутке
    window.addEventListener('scroll', function() {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.classList.add('visible');
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.classList.remove('visible');
        }
        
        if ((window.innerHeight + window.pageYOffset) >= document.documentElement.scrollHeight - 300) {
            scrollToBottomBtn.style.opacity = '0';
            scrollToBottomBtn.classList.remove('visible');
        } else {
            scrollToBottomBtn.style.opacity = '1';
            scrollToBottomBtn.classList.add('visible');
        }
    });

    // Плавная прокрутка наверх
    scrollToTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Плавная прокрутка вниз
    scrollToBottomBtn.addEventListener('click', function() {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: 'smooth'
        });
    });
});
