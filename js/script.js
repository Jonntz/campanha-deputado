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
