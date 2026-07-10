document.addEventListener('DOMContentLoaded', () => {
    // Smooth scroll for internal links
    const links = document.querySelectorAll('nav a, .hero a, .footer a');

    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const href = link.getAttribute('href');
            if (href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80, // Adjust for fixed header
                        behavior: 'smooth'
                    });
                }
            }
        });
    });

    // Gallery Lightbox (Simple Implementation)
    const galleryItems = document.querySelectorAll('.gallery-item');

    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            const imgSrc = item.querySelector('img').src;
            const imgAlt = item.querySelector('img').alt;

            const lightbox = document.createElement('div');
            lightbox.id = 'lightbox';
            lightbox.style.position = 'fixed';
            lightbox.style.top = '0';
            lightbox.style.left = '0';
            lightbox.style.width = '100%';
            lightbox.style.height = '100%';
            lightbox.style.backgroundColor = 'rgba(0,0,0,0.9)';
            lightbox.style.display = 'flex';
            lightbox.style.justifyContent = 'center';
            lightbox.style.alignItems = 'center';
            lightbox.style.zIndex = '9999';
            lightbox.style.cursor = 'zoom-out';
            lightbox.setAttribute('role', 'dialog');
            lightbox.setAttribute('aria-label', 'Visualização da imagem');

            const img = document.createElement('img');
            img.src = imgSrc;
            img.alt = imgAlt;
            img.style.maxWidth = '90%';
            img.style.maxHeight = '90%';
            img.style.boxShadow = '0 0 50px rgba(0,0,0,0.5)';
            img.style.borderRadius = '5px';

            lightbox.appendChild(img);
            document.body.appendChild(lightbox);

            lightbox.addEventListener('click', () => {
                document.body.removeChild(lightbox);
            });
        });
    });

    // Header interaction on scroll
    const header = document.querySelector('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.style.padding = '10px 0';
            header.style.boxShadow = '0 5px 20px rgba(0,0,0,0.2)';
        } else {
            header.style.padding = '15px 0';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
        }
    });
});

// ==========================================================================
// Lógica do Carrossel de Credenciais
// ==========================================================================
document.addEventListener('DOMContentLoaded', function () {
    const carousel = document.getElementById('mnCarousel');
    if (!carousel) return;

    const track = carousel.querySelector('.mn-carousel-track');
    const slides = Array.from(track.children);
    const nextBtn = carousel.querySelector('.mn-next');
    const prevBtn = carousel.querySelector('.mn-prev');
    const dotsNav = carousel.querySelector('.mn-carousel-dots');

    let current = 0;
    let autoPlayInterval;
    let isHovering = false;

    // Cria dots
    slides.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.setAttribute('aria-label', 'Ir para credencial ' + (i + 1));
        if (i === 0) dot.classList.add('active');
        dotsNav.appendChild(dot);
    });

    const dots = Array.from(dotsNav.children);

    const moveTo = (idx) => {
        if (idx < 0) idx = slides.length - 1;
        if (idx >= slides.length) idx = 0;
        track.style.transform = `translateX(-${idx * 100}%)`;
        dots[current].classList.remove('active');
        dots[idx].classList.add('active');
        current = idx;
    };

    const nextSlide = () => moveTo(current + 1);
    const prevSlide = () => moveTo(current - 1);

    const startAutoPlay = () => {
        if (!isHovering) {
            autoPlayInterval = setInterval(nextSlide, 6500);
        }
    };

    const stopAutoPlay = () => clearInterval(autoPlayInterval);

    nextBtn.addEventListener('click', () => { stopAutoPlay(); nextSlide(); startAutoPlay(); });
    prevBtn.addEventListener('click', () => { stopAutoPlay(); prevSlide(); startAutoPlay(); });
    dots.forEach((dot, i) => dot.addEventListener('click', () => { stopAutoPlay(); moveTo(i); startAutoPlay(); }));

    // Pausa no hover desktop
    carousel.addEventListener('mouseenter', () => { isHovering = true; stopAutoPlay(); });
    carousel.addEventListener('mouseleave', () => { isHovering = false; startAutoPlay(); });

    // Swipe mobile
    let startX = 0;
    let isDragging = false;

    track.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        isDragging = true;
        stopAutoPlay();
    }, { passive: true });

    track.addEventListener('touchmove', e => {
        if (!isDragging) return;
        const currentX = e.touches[0].clientX;
        const diff = startX - currentX;
        // Previne rolagem de tela apenas quando for um movimento horizontal
        if (Math.abs(diff) > 10) {
            e.preventDefault();
        }
    }, { passive: false });

    track.addEventListener('touchend', e => {
        if (!isDragging) return;
        isDragging = false;
        const endX = e.changedTouches[0].clientX;
        const diff = startX - endX;
        if (diff > 50) nextSlide();
        if (diff < -50) prevSlide();
        startAutoPlay();
    });

    startAutoPlay();
});