document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. PRELOADER ---
    setTimeout(() => { 
        const preloader = document.getElementById('preloader');
        if(preloader) preloader.classList.add('preloader-hidden'); 
    }, 900);

    // --- 1. LÓGICA DE CURSOR LED (SWITCH TX/RX) ---
    const cursorLed = document.getElementById('cursor-led');
    if (cursorLed) {
        window.addEventListener('mousemove', (e) => {
            cursorLed.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        });
        const interactives = document.querySelectorAll('a, button, summary, .brand-logo, .card, .team-card');
        interactives.forEach(el => {
            el.addEventListener('mouseenter', () => cursorLed.classList.add('tx-rx'));
            el.addEventListener('mouseleave', () => cursorLed.classList.remove('tx-rx'));
        });
    }

    // --- 2. MODO OSCURO NATIVO CON MEMORIA ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const moonIcon = document.getElementById('moon-icon');
    const sunIcon = document.getElementById('sun-icon');
    
    if (localStorage.getItem('jbda_theme') === 'dark') {
        document.body.classList.add('dark-theme');
        if (moonIcon && sunIcon) { moonIcon.style.display = 'none'; sunIcon.style.display = 'block'; }
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            if (document.body.classList.contains('dark-theme')) {
                localStorage.setItem('jbda_theme', 'dark');
                if(moonIcon) moonIcon.style.display = 'none'; 
                if(sunIcon) sunIcon.style.display = 'block';
            } else {
                localStorage.setItem('jbda_theme', 'light');
                if(moonIcon) moonIcon.style.display = 'block'; 
                if(sunIcon) sunIcon.style.display = 'none';
            }
        });
    }

    // --- 3. BOTONES MAGNÉTICOS & RIPPLE ---
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const h = rect.width / 2; const v = rect.height / 2;
            const xTranslate = e.clientX - rect.left - h; const yTranslate = e.clientY - rect.top - v;
            btn.style.transform = `translate(${xTranslate * 0.3}px, ${yTranslate * 0.3}px)`;
            
            const xRipple = e.clientX - rect.left; const yRipple = e.clientY - rect.top;
            btn.style.setProperty('--x', `${xRipple}px`); btn.style.setProperty('--y', `${yRipple}px`);
        });
        btn.addEventListener('mouseleave', () => { btn.style.transform = `translate(0px, 0px)`; });
    });

    // --- 4. MOTOR DE DATOS: CONTADORES DINÁMICOS ---
    const counters = document.querySelectorAll('.counter-val');
    if(counters.length > 0) {
        let observerCounters = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const target = parseFloat(entry.target.getAttribute('data-target'));
                    const isDecimal = entry.target.getAttribute('data-decimal') === 'true';
                    const duration = 1500;
                    const step = target / (duration / 16);
                    let current = 0;
                    const updateCounter = () => {
                        current += step;
                        if(current < target) {
                            entry.target.innerText = isDecimal ? current.toFixed(1) : Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            entry.target.innerText = target;
                        }
                    };
                    updateCounter();
                    observerCounters.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(c => observerCounters.observe(c));
    }

    // --- 5. SCROLL-FOCUS DINÁMICO SEGURO ---
    setTimeout(() => {
        const focusCards = document.querySelectorAll('.card, .team-card, details');
        if(focusCards.length > 0) {
            let observerFocus = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.target.classList.contains('aos-animate') || !entry.target.hasAttribute('data-aos')) {
                        if(entry.isIntersecting) {
                            entry.target.classList.add('scroll-focused');
                            entry.target.classList.remove('scroll-dimmed');
                        } else {
                            entry.target.classList.remove('scroll-focused');
                            entry.target.classList.add('scroll-dimmed');
                        }
                    }
                });
            }, { rootMargin: "-25% 0px -25% 0px" }); 
            focusCards.forEach(c => observerFocus.observe(c));
        }
    }, 1200);

    // --- 6. ANIMACIÓN DE RED INTERACTIVA (CON SENSOR DE LUZ) ---
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        let mouse = { x: null, y: null, radius: 150 };
        
        window.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left; mouse.y = event.clientY - rect.top;
        });
        window.addEventListener('mouseout', function() { mouse.x = undefined; mouse.y = undefined; });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height;
                this.baseX = this.x; this.baseY = this.y;
                this.wanderAngle = Math.random() * Math.PI * 2;
                this.vx = 0; this.vy = 0;
                this.radius = Math.random() * 2.5 + 2;
            }
            update() {
                this.wanderAngle += 0.01;
                this.baseX += Math.cos(this.wanderAngle) * 0.2; this.baseY += Math.sin(this.wanderAngle) * 0.2;
                if (this.baseX < 0 || this.baseX > width) this.baseX = Math.random() * width;
                if (this.baseY < 0 || this.baseY > height) this.baseY = Math.random() * height;
                
                if(mouse.x != undefined && mouse.y != undefined) {
                    let dx = mouse.x - this.x; let dy = mouse.y - this.y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance < mouse.radius) {
                        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(mouse.x, mouse.y);
                        
                        const isDark = document.body.classList.contains('dark-theme');
                        ctx.strokeStyle = isDark 
                            ? `rgba(244, 114, 182, ${0.4 - distance/mouse.radius * 0.4})` 
                            : `rgba(212, 0, 109, ${0.2 - distance/mouse.radius * 0.2})`; 
                        
                        ctx.lineWidth = 1; ctx.stroke();
                        
                        const forceDirectionX = dx / distance; const forceDirectionY = dy / distance;
                        const force = (mouse.radius - distance) / mouse.radius;
                        this.vx -= forceDirectionX * force * 1.5; this.vy -= forceDirectionY * force * 1.5;
                    }
                }
                let spring = 0.05; let friction = 0.85;
                this.vx += (this.baseX - this.x) * spring; this.vy += (this.baseY - this.y) * spring;
                this.vx *= friction; this.vy *= friction;
                this.x += this.vx; this.y += this.vy;
            }
            draw() {
                const isDark = document.body.classList.contains('dark-theme');
                ctx.fillStyle = isDark ? 'rgba(244, 114, 182, 0.4)' : 'rgba(212, 0, 109, 0.2)';
                ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
            }
        }

        function initCanvas() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = document.querySelector('header').offsetHeight;
            particles = [];
            const particleCount = window.innerWidth < 768 ? 60 : 120;
            for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); }
        }

        function animateCanvas() {
            requestAnimationFrame(animateCanvas);
            ctx.clearRect(0, 0, width, height);
            
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i];
                p.update(); p.draw();

                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j]; 
                    let dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
                    
                    if (dist < 160) {
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                        const isDark = document.body.classList.contains('dark-theme');
                        ctx.strokeStyle = isDark 
                            ? `rgba(244, 114, 182, ${0.25 - dist/160 * 0.25})` 
                            : `rgba(212, 0, 109, ${0.1 - dist/160 * 0.1})`; 
                        ctx.lineWidth = 0.8; ctx.stroke();
                    }
                }
            }
        }
        window.addEventListener('resize', initCanvas); initCanvas(); animateCanvas();
    }

    // --- 7. BARRA DE PROGRESO Y SOMBRA DINÁMICA ---
    const nav = document.getElementById('main-nav');
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => { 
        if(nav) {
            if (window.scrollY > 50) { nav.classList.add('nav-scrolled'); } else { nav.classList.remove('nav-scrolled'); } 
        }
        if(progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        }
    });

    // --- 8. LÓGICA DEL MENÚ MÓVIL ---
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const navItems = document.querySelectorAll('.nav-item');
    let menuOpen = false;

    if(menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active'); menuOpen = !menuOpen;
            if(menuOpen) { menuBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>'; } else { menuBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/></svg>'; }
        });

        navItems.forEach(item => {
            if(item.id !== 'dark-mode-toggle') {
                item.addEventListener('click', () => { navLinks.classList.remove('active'); menuOpen = false; menuBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/></svg>'; });
            }
        });
    }

    // --- 9. INICIALIZACIÓN DE ENLACES Y AOS ---
    if (typeof AOS !== 'undefined') { AOS.init({ duration: 1000, once: true, offset: 100 }); }

    const numeroWhatsApp = "525613388030"; const mensajeGeneral = "Hola JBDA, solicito información de consultoría."; const urlWhatsGeneral = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeGeneral)}`;
    
    if(document.getElementById('link-whatsapp-footer')) document.getElementById('link-whatsapp-footer').href = urlWhatsGeneral; 
    if(document.getElementById('link-concierge-whatsapp')) document.getElementById('link-concierge-whatsapp').href = urlWhatsGeneral; 
    if(document.getElementById('link-linkedin')) document.getElementById('link-linkedin').href = "https://www.linkedin.com/company/jbdamx/";

    const urlCalendly = "https://calendly.com/jbda_tech/diagnostico";
    const abrirCalendly = (e) => { e.preventDefault(); Calendly.initPopupWidget({url: urlCalendly}); document.getElementById('concierge-menu').classList.remove('active'); return false; };
    
    if(document.getElementById('link-hero')) document.getElementById('link-hero').addEventListener('click', abrirCalendly); 
    if(document.getElementById('link-cta')) document.getElementById('link-cta').addEventListener('click', abrirCalendly); 
    if(document.getElementById('link-concierge-calendly')) document.getElementById('link-concierge-calendly').addEventListener('click', abrirCalendly);

    // --- 10. LÓGICA DEL BOTÓN FLOTANTE ---
    const conciergeToggle = document.getElementById('concierge-toggle'); const conciergeMenu = document.getElementById('concierge-menu');
    if(conciergeToggle && conciergeMenu) {
        conciergeToggle.addEventListener('click', (e) => { e.stopPropagation(); conciergeMenu.classList.toggle('active'); });
        document.addEventListener('click', (event) => { if (!conciergeToggle.contains(event.target) && !conciergeMenu.contains(event.target)) { conciergeMenu.classList.remove('active'); } });
    }

    // --- 11. MODO TERMINAL (EASTER EGG) ---
    const terminalToggle = document.getElementById('terminal-toggle');
    if(terminalToggle) { terminalToggle.addEventListener('click', () => { document.body.classList.toggle('terminal-mode'); }); }

    // --- 12. SCRIPT DE PROTECCIÓN ---
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', event => { if (event.keyCode === 123 || (event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 74)) || (event.ctrlKey && event.keyCode === 85)) { event.preventDefault(); } });
});
