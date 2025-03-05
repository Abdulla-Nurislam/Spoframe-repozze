// Инициализация AOS
AOS.init({
    duration: 1000,
    once: true,
    offset: 100
});

// Инициализация Locomotive Scroll
const scroll = new LocomotiveScroll({
    el: document.querySelector('[data-scroll-container]'),
    smooth: true,
    multiplier: 1,
    lerp: 0.1
});

// Регистрация плагина ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Анимация навигации
gsap.from('.navbar', {
    y: -100,
    opacity: 0,
    duration: 1,
    ease: 'power3.out'
});

// Анимация героя
gsap.timeline()
    .from('.hero-slide.active', {
        scale: 1.1,
        duration: 2,
        ease: 'power2.out'
    })
    .from('.hero-content', {
        y: 100,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
    }, '-=1.5');

// Анимация карточек особенностей
gsap.utils.toArray('.feature-card').forEach((card, i) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top bottom-=100',
            toggleActions: 'play none none reverse'
        },
        y: 100,
        opacity: 0,
        duration: 0.8,
        delay: i * 0.2
    });
});

// Плавная анимация при наведении на кнопки
const buttons = document.querySelectorAll('.btn-watch-now, .btn-explore-features');
buttons.forEach(button => {
    button.addEventListener('mouseenter', () => {
        gsap.to(button, {
            scale: 1.05,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
    
    button.addEventListener('mouseleave', () => {
        gsap.to(button, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    });
});

// Анимация слайдера
const dots = document.querySelectorAll('.dot');
const slides = document.querySelectorAll('.hero-slide');
let currentSlide = 0;

function updateSlider() {
    gsap.to(slides[currentSlide], {
        opacity: 0,
        duration: 0.5,
        ease: 'power2.inOut'
    });
    
    currentSlide = (currentSlide + 1) % slides.length;
    
    gsap.fromTo(slides[currentSlide],
        {
            opacity: 0,
            scale: 1.1
        },
        {
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: 'power2.inOut'
        }
    );
    
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentSlide);
    });
}

// Автоматическое переключение слайдов
setInterval(updateSlider, 5000);

// Обновление ScrollTrigger при прокрутке Locomotive
scroll.on('scroll', ScrollTrigger.update);

// Обновление ScrollTrigger при изменении размера окна
ScrollTrigger.addEventListener('refresh', () => scroll.update());

// Первоначальное обновление ScrollTrigger
ScrollTrigger.refresh(); 