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

    // --- 1. NUEVO: LINTERNA VOLUMÉTRICA & CURSOR LED ---
    const cursorLed = document.getElementById('cursor-led');
    window.addEventListener('mousemove', (e) => {
        // Mueve el LED
        if (cursorLed) cursorLed.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        // Mueve la Linterna (Blueprint Grid)
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

    // --- 3. MENÚ MÓVIL ---
    const menuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    let menuOpen = false;

    if(menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active'); menuOpen = !menuOpen;
            if(menuOpen) { menuBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>'; } 
            else { menuBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/></svg>'; }
        });
    }

    // --- 4. TRANSICIONES DE PÁGINA Y SCROLL ---
    document.querySelectorAll('a').forEach(anchor => {
        if(anchor.href && !anchor.target && !anchor.id.includes('calendly')) {
            anchor.addEventListener('click', function(e) {
                const targetUrl = this.getAttribute('href');
                if (targetUrl && targetUrl.startsWith('#')) {
                    e.preventDefault();
                    if(menuOpen && menuBtn) {
                        navLinks.classList.remove('active'); menuOpen = false;
                        menuBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M3 6h18v2H3V6m0 5h18v2H3v-2m0 5h18v2H3v-2z"/></svg>';
                    }
                    if (typeof lenis !== 'undefined') { lenis.scrollTo(targetUrl); } 
                    else { document.querySelector(targetUrl).scrollIntoView({behavior: 'smooth'}); }
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

    // --- 5. NUEVO: MOTOR DATA SCRAMBLE (DECODIFICADOR) ---
    class TextScramble {
        constructor(el) {
            this.el = el;
            this.chars = '!<>-_\\/[]{}—=+*^?#_010101';
            this.update = this.update.bind(this);
        }
        setText(newText) {
            const oldText = this.el.innerText;
            const length = Math.max(oldText.length, newText.length);
            const promise = new Promise((resolve) => this.resolve = resolve);
            this.queue = [];
            for (let i = 0; i < length; i++) {
                const from = oldText[i] || ''; const to = newText[i] || '';
                const start = Math.floor(Math.random() * 40);
                const end = start + Math.floor(Math.random() * 40);
                this.queue.push({ from, to, start, end });
            }
            cancelAnimationFrame(this.frameRequest);
            this.frame = 0;
            this.update();
            return promise;
        }
        update() {
            let output = ''; let complete = 0;
            for (let i = 0, n = this.queue.length; i < n; i++) {
                let { from, to, start, end, char } = this.queue[i];
                if (this.frame >= end) {
                    complete++; output += to;
                } else if (this.frame >= start) {
                    if (!char || Math.random() < 0.28) { char = this.randomChar(); this.queue[i].char = char; }
                    output += `<span class="dud">${char}</span>`;
                } else {
                    output += from;
                }
            }
            this.el.innerHTML = output;
            if (complete === this.queue.length) { this.resolve(); } else {
                this.frameRequest = requestAnimationFrame(this.update); this.frame++;
            }
        }
        randomChar() { return this.chars[Math.floor(Math.random() * this.chars.length)]; }
    }

    // Iniciar el Decodificador cuando el texto entra en pantalla
    const scrambles = document.querySelectorAll('.scramble-text');
    const scrambleObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if(entry.isIntersecting && !entry.target.scrambled) {
                const fx = new TextScramble(entry.target);
                const original = entry.target.getAttribute('data-original') || entry.target.innerText;
                entry.target.setAttribute('data-original', original);
                fx.setText(original);
                entry.target.scrambled = true; // Solo lo hace 1 vez
            }
        });
    }, {threshold: 0.1});
    
    scrambles.forEach(el => {
        el.setAttribute('data-original', el.innerText);
        el.innerHTML = '&nbsp;'; // Oculta temporalmente para el impacto
        scrambleObserver.observe(el);
    });

    // --- 6. MODO OSCURO NATIVO ---
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

    // --- 7. SIMULADOR DE ESTRÉS ---
    const slider = document.getElementById('traffic-slider');
    const metricUsers = document.getElementById('metric-users');
    const metricRps = document.getElementById('metric-rps');
    const metricStatus = document.getElementById('metric-status');
    const barTrad = document.getElementById('bar-trad');
    const barJbda = document.getElementById('bar-jbda');
    const statusTrad = document.getElementById('status-trad');
    const statusJbda = document.getElementById('status-jbda');
    const cpuTrad = document.getElementById('cpu-trad');
    const cpuJbda = document.getElementById('cpu-jbda');

    if (slider && barTrad && barJbda) {
        slider.addEventListener('input', (e) => {
            const val = parseInt(e.target.value);
            const isEnglish = document.documentElement.lang === 'en';
            
            let users = Math.floor(150 + (val * 248.5)); 
            let rps = Math.floor(300 + (val * 1497));    
            
            metricUsers.innerText = users.toLocaleString();
            metricRps.innerText = rps.toLocaleString();

            metricStatus.classList.remove('status-green', 'status-yellow', 'status-red');
            if(val < 40) {
                metricStatus.innerText = isEnglish ? 'Stable' : 'Estable';
                metricStatus.classList.add('status-green');
            } else if(val < 75) {
                metricStatus.innerText = isEnglish ? 'Warning (Peak)' : 'Riesgo (Pico)';
                metricStatus.classList.add('status-yellow');
            } else {
                metricStatus.innerText = isEnglish ? 'CRITICAL / OVERLOAD' : 'CRÍTICO / SOBRECARGA';
                metricStatus.classList.add('status-red');
            }

            let tradWidth = 5 + (val * 1.5);
            if(tradWidth > 100) tradWidth = 100;
            barTrad.style.width = `${tradWidth}%`;
            let cpuT = Math.min(100, Math.floor(15 + (val * 0.95)));
            
            if(val > 75) {
                barTrad.style.backgroundColor = '#ef4444'; 
                barTrad.parentElement.parentElement.classList.add('alert-shake');
                statusTrad.innerText = isEnglish ? 'Latency: 999ms (FAILURE)' : 'Latencia: 999ms (CAÍDA)';
                statusTrad.className = 'status status-red';
                cpuTrad.innerText = isEnglish ? `CPU: 100% (CRASH)` : `CPU: 100% (COLAPSO)`;
                cpuTrad.className = 'cpu-load status-red';
            } else if (val > 40) {
                barTrad.style.backgroundColor = '#f59e0b'; 
                barTrad.parentElement.parentElement.classList.remove('alert-shake');
                let latT = Math.floor(65 + (val-50)*8);
                statusTrad.innerText = isEnglish ? `Latency: ${latT}ms` : `Latencia: ${latT}ms`;
                statusTrad.className = 'status status-yellow';
                cpuTrad.innerText = `CPU: ${cpuT}%`;
                cpuTrad.className = 'cpu-load status-yellow';
            } else {
                barTrad.style.backgroundColor = '#10b981'; 
                barTrad.parentElement.parentElement.classList.remove('alert-shake');
                let latT = Math.floor(15 + val);
                statusTrad.innerText = isEnglish ? `Latency: ${latT}ms` : `Latencia: ${latT}ms`;
                statusTrad.className = 'status status-green';
                cpuTrad.innerText = `CPU: ${cpuT}%`;
                cpuTrad.className = 'cpu-load status-green';
            }

            let jbdaWidth = 5 + (val * 0.15); 
            let cpuJ = Math.floor(12 + (val * 0.33)); 
            let latJ = 12 + Math.floor(val * 0.05);   

            barJbda.style.width = `${jbdaWidth}%`;
            barJbda.style.backgroundColor = 'var(--pink-premium)';
            statusJbda.innerText = isEnglish ? `Latency: ${latJ}ms (99.8% QoS)` : `Latencia: ${latJ}ms (99.8% QoS)`;
            cpuJbda.innerText = isEnglish ? `CPU: ${cpuJ}% (Load Balanced)` : `CPU: ${cpuJ}% (Balanceo Activo)`;
        });
    }

    // --- 8. BOTONES MAGNÉTICOS ---
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

    // --- 9. CONTADORES DINÁMICOS ---
    const counters = document.querySelectorAll('.counter-val');
    if(counters.length > 0) {
        let observerCounters = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if(entry.isIntersecting) {
                    const target = parseFloat(entry.target.getAttribute('data-target'));
                    const isDecimal = entry.target.getAttribute('data-decimal') === 'true';
                    const duration = 1500; const step = target / (duration / 16);
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
                    updateCounter(); observerCounters.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(c => observerCounters.observe(c));
    }

    // --- 10. SCROLL-FOCUS ---
    setTimeout(() => {
        const focusCards = document.querySelectorAll('.card, .team-card, details');
        if(focusCards.length > 0) {
            let observerFocus = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.target.classList.contains('aos-animate') || !entry.target.hasAttribute('data-aos')) {
                        if(entry.isIntersecting) {
                            entry.target.classList.add('scroll-focused'); entry.target.classList.remove('scroll-dimmed');
                        } else {
                            entry.target.classList.remove('scroll-focused'); entry.target.classList.add('scroll-dimmed');
                        }
                    }
                });
            }, { rootMargin: "-25% 0px -25% 0px" }); 
            focusCards.forEach(c => observerFocus.observe(c));
        }
    }, 1200);

    // --- 11. ANIMACIÓN DE RED INTERACTIVA ---
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [];
        let mouse = { x: null, y: null, radius: 150 };
        let animationFrameId = null;
        let isCanvasVisible = true;
        
        window.addEventListener('mousemove', function(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left; mouse.y = event.clientY - rect.top;
        });
        window.addEventListener('mouseout', function() { mouse.x = undefined; mouse.y = undefined; });

        const header = document.querySelector('header');
        if (header) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isCanvasVisible = entry.isIntersecting;
                    if (isCanvasVisible && !animationFrameId) {
                        animateCanvas(); 
                    } else if (!isCanvasVisible && animationFrameId) {
                        cancelAnimationFrame(animationFrameId); 
                        animationFrameId = null;
                    }
                });
            }, { rootMargin: "100px" }); 
            observer.observe(header);
        }

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
                        ctx.strokeStyle = isDark ? `rgba(244, 114, 182, ${0.4 - distance/mouse.radius * 0.4})` : `rgba(212, 0, 109, ${0.2 - distance/mouse.radius * 0.2})`; 
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
            particles = []; const particleCount = window.innerWidth < 768 ? 60 : 120;
            for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); }
        }

        function animateCanvas() {
            if (!isCanvasVisible) return; 
            animationFrameId = requestAnimationFrame(animateCanvas);
            ctx.clearRect(0, 0, width, height);
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i]; p.update(); p.draw();
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j]; 
                    let dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
                    if (dist < 160) {
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                        const isDark = document.body.classList.contains('dark-theme');
                        ctx.strokeStyle = isDark ? `rgba(244, 114, 182, ${0.25 - dist/160 * 0.25})` : `rgba(212, 0, 109, ${0.1 - dist/160 * 0.1})`; 
                        ctx.lineWidth = 0.8; ctx.stroke();
                    }
                }
            }
        }
        window.addEventListener('resize', initCanvas); initCanvas(); animateCanvas();
    }

    // --- 12. SOMBRA DE NAVBAR ---
    const nav = document.getElementById('main-nav');
    const progressBar = document.getElementById('scroll-progress');
    window.addEventListener('scroll', () => { 
        if(nav) { if (window.scrollY > 50) { nav.classList.add('nav-scrolled'); } else { nav.classList.remove('nav-scrolled'); } }
        if(progressBar) {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.width = scrolled + "%";
        }
    });

    if (typeof AOS !== 'undefined') { AOS.init({ duration: 1000, once: true, offset: 100 }); }

    // --- 13. ENLACES Y CALENDLY ---
    const numeroWhatsApp = "525613388030"; const mensajeGeneral = "Hola JBDA, solicito información de consultoría."; const urlWhatsGeneral = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeGeneral)}`;
    if(document.getElementById('link-whatsapp-footer')) document.getElementById('link-whatsapp-footer').href = urlWhatsGeneral; 
    if(document.getElementById('link-concierge-whatsapp')) document.getElementById('link-concierge-whatsapp').href = urlWhatsGeneral; 
    if(document.getElementById('link-linkedin')) document.getElementById('link-linkedin').href = "https://www.linkedin.com/company/jbdamx/";

    const urlCalendly = "https://calendly.com/jbda_tech/diagnostico";
    const abrirCalendly = (e) => { e.preventDefault(); Calendly.initPopupWidget({url: urlCalendly}); document.getElementById('concierge-menu').classList.remove('active'); return false; };
    if(document.getElementById('link-hero')) document.getElementById('link-hero').addEventListener('click', abrirCalendly); 
    if(document.getElementById('link-cta')) document.getElementById('link-cta').addEventListener('click', abrirCalendly); 
    if(document.getElementById('link-concierge-calendly')) document.getElementById('link-concierge-calendly').addEventListener('click', abrirCalendly);

    // --- 14. BOTÓN FLOTANTE ---
    const conciergeToggle = document.getElementById('concierge-toggle'); const conciergeMenu = document.getElementById('concierge-menu');
    if(conciergeToggle && conciergeMenu) {
        conciergeToggle.addEventListener('click', (e) => { e.stopPropagation(); conciergeMenu.classList.toggle('active'); });
        document.addEventListener('click', (event) => { if (!conciergeToggle.contains(event.target) && !conciergeMenu.contains(event.target)) { conciergeMenu.classList.remove('active'); } });
    }

    // --- 15. MODO TERMINAL ---
    const terminalToggle = document.getElementById('terminal-toggle');
    if(terminalToggle) { 
        terminalToggle.addEventListener('click', (e) => { 
            e.stopPropagation(); document.body.classList.toggle('terminal-mode'); 
        }); 
    }

    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', event => { if (event.keyCode === 123 || (event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 74)) || (event.ctrlKey && event.keyCode === 85)) { event.preventDefault(); } });
});


/* =========================================
   LÓGICA DEL MENÚ MÓVIL (HAMBURGUESA)
========================================= */
document.addEventListener('DOMContentLoaded', () => {
    const hamburgerBtn = document.getElementById('hamburger-btn');
    const mobileOverlay = document.getElementById('mobile-menu-overlay');
    const mobileLinks = document.querySelectorAll('.mobile-link');

    if (hamburgerBtn && mobileOverlay) {
        // Abrir/Cerrar al tocar la hamburguesa
        hamburgerBtn.addEventListener('click', () => {
            hamburgerBtn.classList.toggle('active');
            mobileOverlay.classList.toggle('active');
            
            // Congelar el scroll del fondo cuando el menú está abierto
            if (mobileOverlay.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Cerrar el menú automáticamente cuando se hace clic en un enlace
        mobileLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburgerBtn.classList.remove('active');
                mobileOverlay.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }
});
