document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. PRELOADER Y CRISTAL LÍQUIDO ---
    const overlay = document.getElementById('page-transition-overlay');
    const preloader = document.getElementById('preloader');
    window.addEventListener('pageshow', () => { if(overlay) overlay.classList.add('hidden'); });

    if (preloader) {
        if (sessionStorage.getItem('jbda_preloader_shown')) {
            preloader.style.display = 'none';
        } else {
            setTimeout(() => { 
                preloader.classList.add('preloader-hidden'); 
                sessionStorage.setItem('jbda_preloader_shown', 'true');
            }, 900);
        }
    }

    // --- 1. LINTERNA VOLUMÉTRICA & CURSOR LED ---
    const cursorLed = document.getElementById('cursor-led');
    window.addEventListener('mousemove', (e) => {
        if (cursorLed) cursorLed.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        document.documentElement.style.setProperty('--mouse-x', e.clientX + 'px');
        document.documentElement.style.setProperty('--mouse-y', e.clientY + 'px');
    });
    
    const interactives = document.querySelectorAll('a, button, summary, input[type=range], #terminal-toggle');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => { if(cursorLed) cursorLed.classList.add('tx-rx'); });
        el.addEventListener('mouseleave', () => { if(cursorLed) cursorLed.classList.remove('tx-rx'); });
    });

    // --- 2. LENIS SCROLL (FÍSICA INERCIAL) ---
    let lenis;
    if (typeof Lenis !== 'undefined') {
        lenis = new Lenis({ duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), direction: 'vertical', smooth: true });
        function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
    }

    // --- 3. LÓGICA UNIFICADA DE MENÚ Y NAVEGACIÓN ---
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    
    function closeMenu() {
        if (navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if(menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('active');
            menuBtn.classList.toggle('open');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });
    }

    // --- 4. TRANSICIONES DE PÁGINA Y SCROLL CORREGIDO ---
    document.querySelectorAll('a').forEach(anchor => {
        if(anchor.href && !anchor.target && !anchor.id.includes('calendly')) {
            anchor.addEventListener('click', function(e) {
                const targetUrl = this.getAttribute('href');
                
                if (targetUrl && targetUrl.startsWith('#')) {
                    e.preventDefault();
                    closeMenu(); // Cierra el menú antes de iniciar scroll

                    setTimeout(() => {
                        if (typeof lenis !== 'undefined') { 
                            lenis.scrollTo(targetUrl); 
                        } else { 
                            document.querySelector(targetUrl).scrollIntoView({behavior: 'smooth'}); 
                        }
                    }, 50); 
                } 
                else if (this.hostname === window.location.hostname || targetUrl.startsWith('.') || targetUrl.startsWith('/')) {
                    e.preventDefault();
                    if(overlay) {
                        overlay.classList.remove('hidden'); 
                        setTimeout(() => { window.location.href = this.href; }, 400); 
                    } else {
                        window.location.href = this.href;
                    }
                }
            });
        }
    });

    // --- [RESTO DEL CÓDIGO: SCRAMBLE, MODO OSCURO, SIMULADOR, ETC. SE MANTIENE IGUAL] ---
    // [Copia aquí desde la Sección 5 de tu main.js original]
});
