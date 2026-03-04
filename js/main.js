document.addEventListener("DOMContentLoaded", () => {
    
    // --- 0. PRELOADER Y REVELACIÓN DE TEXTO ---
    const overlay = document.getElementById('page-transition-overlay');
    const preloader = document.getElementById('preloader');
    
    document.querySelectorAll('.reveal-text').forEach(el => {
        el.innerHTML = `<span class="reveal-inner">${el.innerHTML}</span>`;
    });

    window.addEventListener('pageshow', () => { 
        if(overlay) overlay.classList.add('hidden'); 
    });

    const triggerReveal = () => { document.body.classList.add('page-loaded'); };

    if (preloader) {
        if (sessionStorage.getItem('jbda_preloader_shown')) {
            preloader.style.display = 'none';
            setTimeout(triggerReveal, 50);
        } else {
            setTimeout(() => { 
                preloader.classList.add('preloader-hidden'); 
                sessionStorage.setItem('jbda_preloader_shown', 'true');
                setTimeout(triggerReveal, 100);
            }, 900);
        }
    } else {
        setTimeout(triggerReveal, 50);
    }

    // --- 1. EFECTO SATÉLITE (CURSOR LED QUE SIGUE AL MOUSE NATIVO) ---
    const cursorLed = document.getElementById('cursor-led');
    window.addEventListener('mousemove', (e) => {
        if (cursorLed) cursorLed.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
    });
    
    const interactives = document.querySelectorAll('a, button, summary, input[type=range], #terminal-toggle');
    interactives.forEach(el => {
        el.addEventListener('mouseenter', () => { if(cursorLed) cursorLed.classList.add('tx-rx'); });
        el.addEventListener('mouseleave', () => { if(cursorLed) cursorLed.classList.remove('tx-rx'); });
    });

    // --- 2. LENIS SCROLL ---
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

    function closeMobileMenu() {
        if(menuOpen && navLinks && menuBtn) {
            navLinks.classList.remove('active');
            menuBtn.classList.remove('open');
            document.body.style.overflow = '';
            menuOpen = false;
        }
    }

    if(menuBtn && navLinks) {
        menuBtn.addEventListener('click', () => {
            menuOpen = !menuOpen;
            navLinks.classList.toggle('active');
            menuBtn.classList.toggle('open');
            document.body.style.overflow = menuOpen ? 'hidden' : '';
        });
    }

    // --- 4. TRANSICIONES DE PÁGINA ---
    document.querySelectorAll('a').forEach(anchor => {
        if(anchor.href && !anchor.target && !anchor.id.includes('calendly')) {
            anchor.addEventListener('click', function(e) {
                const targetUrl = this.getAttribute('href');
                if (targetUrl && targetUrl.startsWith('#')) {
                    e.preventDefault(); closeMobileMenu(); 
                    setTimeout(() => {
                        if (typeof lenis !== 'undefined') { lenis.scrollTo(targetUrl); } 
                        else { document.querySelector(targetUrl).scrollIntoView({behavior: 'smooth'}); }
                    }, 50);
                } 
                else if (this.hostname === window.location.hostname || targetUrl.startsWith('.') || targetUrl.startsWith('/')) {
                    e.preventDefault();
                    if(overlay) { overlay.classList.remove('hidden'); setTimeout(() => { window.location.href = this.href; }, 400); } 
                    else { window.location.href = this.href; }
                }
            });
        }
    });

    // --- 5. MODO OSCURO NATIVO ---
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
                if(moonIcon) moonIcon.style.display = 'none'; if(sunIcon) sunIcon.style.display = 'block';
            } else {
                localStorage.setItem('jbda_theme', 'light');
                if(moonIcon) moonIcon.style.display = 'block'; if(sunIcon) sunIcon.style.display = 'none';
            }
        });
    }

    // --- 6. SIMULADOR DE ESTRÉS DINÁMICO ---
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

            let tradWidth = 5 + (val * 1.5);
            if(tradWidth > 100) tradWidth = 100;
            barTrad.style.width = `${tradWidth}%`;
            let cpuT = Math.min(100, Math.floor(15 + (val * 0.95)));
            
            if(val > 75) {
                metricStatus.innerText = isEnglish ? 'CRITICAL' : 'CRÍTICO'; metricStatus.classList.add('status-red');
                barTrad.style.backgroundColor = '#ef4444'; barTrad.parentElement.parentElement.classList.add('alert-shake');
                statusTrad.innerText = isEnglish ? 'Latency: 999ms (FAILURE)' : 'Latencia: 999ms (CAÍDA)'; statusTrad.className = 'status status-red';
                cpuTrad.innerText = isEnglish ? `CPU: 100% (CRASH)` : `CPU: 100% (COLAPSO)`; cpuTrad.className = 'cpu-load status-red';
                slider.style.setProperty('--thumb-color', '#ef4444'); slider.style.setProperty('--thumb-glow', 'rgba(239, 68, 68, 0.6)');
            } else if (val > 40) {
                metricStatus.innerText = isEnglish ? 'Warning' : 'Riesgo'; metricStatus.classList.add('status-yellow');
                barTrad.style.backgroundColor = '#f59e0b'; barTrad.parentElement.parentElement.classList.remove('alert-shake');
                let latT = Math.floor(65 + (val-50)*8);
                statusTrad.innerText = isEnglish ? `Latency: ${latT}ms` : `Latencia: ${latT}ms`; statusTrad.className = 'status status-yellow';
                cpuTrad.innerText = `CPU: ${cpuT}%`; cpuTrad.className = 'cpu-load status-yellow';
                slider.style.setProperty('--thumb-color', '#f59e0b'); slider.style.setProperty('--thumb-glow', 'rgba(245, 158, 11, 0.6)');
            } else {
                metricStatus.innerText = isEnglish ? 'Stable' : 'Estable'; metricStatus.classList.add('status-green');
                barTrad.style.backgroundColor = '#10b981'; barTrad.parentElement.parentElement.classList.remove('alert-shake');
                let latT = Math.floor(15 + val);
                statusTrad.innerText = isEnglish ? `Latency: ${latT}ms` : `Latencia: ${latT}ms`; statusTrad.className = 'status status-green';
                cpuTrad.innerText = `CPU: ${cpuT}%`; cpuTrad.className = 'cpu-load status-green';
                slider.style.setProperty('--thumb-color', 'var(--pink-premium)'); slider.style.setProperty('--thumb-glow', 'rgba(212, 0, 109, 0.5)');
            }

            let jbdaWidth = 5 + (val * 0.15); 
            let cpuJ = Math.floor(12 + (val * 0.33)); 
            let latJ = 12 + Math.floor(val * 0.05);   
            barJbda.style.width = `${jbdaWidth}%`; barJbda.style.backgroundColor = 'var(--pink-premium)';
            statusJbda.innerText = isEnglish ? `Latency: ${latJ}ms (99.8% QoS)` : `Latencia: ${latJ}ms (99.8% QoS)`;
            cpuJbda.innerText = isEnglish ? `CPU: ${cpuJ}% (Active Balancing)` : `CPU: ${cpuJ}% (Balanceo Activo)`;
        });
    }

    // --- 7. BOTONES MAGNÉTICOS (FÍSICAS ÉLITE) ---
    const magneticBtns = document.querySelectorAll('.magnetic-btn');
    magneticBtns.forEach(btn => {
        const baseTransition = 'box-shadow 0.4s ease, border-color 0.4s ease, color 0.3s ease';
        let currentX = 0; let currentY = 0;

        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const h = rect.width / 2; const v = rect.height / 2;
            currentX = (e.clientX - rect.left - h) * 0.4; currentY = (e.clientY - rect.top - v) * 0.4;
            btn.style.transition = `${baseTransition}, transform 0.1s ease-out`; 
            btn.style.transform = `translate(${currentX}px, ${currentY}px) scale(1)`;
            btn.style.setProperty('--x', `${e.clientX - rect.left}px`); btn.style.setProperty('--y', `${e.clientY - rect.top}px`);
        });

        btn.addEventListener('mouseleave', () => { 
            currentX = 0; currentY = 0;
            btn.style.transition = `${baseTransition}, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)`; 
            btn.style.transform = `translate(0px, 0px) scale(1)`; 
        });

        btn.addEventListener('mousedown', () => { btn.style.transition = `${baseTransition}, transform 0.1s ease-in`; btn.style.transform = `translate(${currentX}px, ${currentY}px) scale(0.92)`; });
        btn.addEventListener('mouseup', () => { btn.style.transition = `${baseTransition}, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`; btn.style.transform = `translate(${currentX}px, ${currentY}px) scale(1)`; });
        btn.addEventListener('touchstart', () => { btn.style.transition = `${baseTransition}, transform 0.1s ease-in`; btn.style.transform = `translate(0px, 0px) scale(0.92)`; }, {passive: true});
        btn.addEventListener('touchend', () => { btn.style.transition = `${baseTransition}, transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)`; btn.style.transform = `translate(0px, 0px) scale(1)`; });
    });

    // --- 8. CONTADORES DINÁMICOS ---
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
                        if(current < target) { entry.target.innerText = isDecimal ? current.toFixed(1) : Math.ceil(current); requestAnimationFrame(updateCounter); } 
                        else { entry.target.innerText = target; }
                    };
                    updateCounter(); observerCounters.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        counters.forEach(c => observerCounters.observe(c));
    }

    // --- 9. SCROLL-FOCUS ---
    setTimeout(() => {
        const focusCards = document.querySelectorAll('.card, .team-card, details');
        if(focusCards.length > 0) {
            let observerFocus = new IntersectionObserver(entries => {
                entries.forEach(entry => {
                    if (entry.target.classList.contains('aos-animate') || !entry.target.hasAttribute('data-aos')) {
                        if(entry.isIntersecting) { entry.target.classList.add('scroll-focused'); entry.target.classList.remove('scroll-dimmed'); } 
                        else { entry.target.classList.remove('scroll-focused'); entry.target.classList.add('scroll-dimmed'); }
                    }
                });
            }, { rootMargin: "-25% 0px -25% 0px" }); 
            focusCards.forEach(c => observerFocus.observe(c));
        }
    }, 1200);

    // --- 10. ANIMACIÓN SVG ---
    const svgCards = document.querySelectorAll('.card');
    if(svgCards.length > 0) {
        let observerSvg = new IntersectionObserver(entries => {
            entries.forEach(entry => { if(entry.isIntersecting) { entry.target.classList.add('svg-animate'); observerSvg.unobserve(entry.target); } });
        }, { rootMargin: "-45% 0px -45% 0px" }); 
        svgCards.forEach(c => observerSvg.observe(c));
    }

    // --- 11. RED INTERACTIVA: PULSOS EFECTO COMETA (ÉLITE) ---
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height, particles = [], pulses = [];
        let mouse = { x: null, y: null, radius: 150 };
        let animationFrameId = null; let isCanvasVisible = true;
        
        window.addEventListener('mousemove', function(event) { const rect = canvas.getBoundingClientRect(); mouse.x = event.clientX - rect.left; mouse.y = event.clientY - rect.top; });
        window.addEventListener('mouseout', function() { mouse.x = undefined; mouse.y = undefined; });

        const header = document.querySelector('header');
        if (header) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    isCanvasVisible = entry.isIntersecting;
                    if (isCanvasVisible && !animationFrameId) { animateCanvas(); } 
                    else if (!isCanvasVisible && animationFrameId) { cancelAnimationFrame(animationFrameId); animationFrameId = null; }
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
                    let dx = mouse.x - this.x; let dy = mouse.y - this.y; let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < mouse.radius) {
                        ctx.beginPath(); ctx.moveTo(this.x, this.y); ctx.lineTo(mouse.x, mouse.y);
                        const isDark = document.body.classList.contains('dark-theme');
                        ctx.strokeStyle = isDark ? `rgba(244, 114, 182, ${0.4 - distance/mouse.radius * 0.4})` : `rgba(212, 0, 109, ${0.2 - distance/mouse.radius * 0.2})`; 
                        ctx.lineWidth = 1; ctx.stroke();
                        const forceDirectionX = dx / distance; const forceDirectionY = dy / distance; const force = (mouse.radius - distance) / mouse.radius;
                        this.vx -= forceDirectionX * force * 1.5; this.vy -= forceDirectionY * force * 1.5;
                    }
                }
                let spring = 0.05; let friction = 0.85;
                this.vx += (this.baseX - this.x) * spring; this.vy += (this.baseY - this.y) * spring;
                this.vx *= friction; this.vy *= friction; this.x += this.vx; this.y += this.vy;
            }
            draw(isDark) {
                ctx.fillStyle = isDark ? 'rgba(244, 114, 182, 0.4)' : 'rgba(212, 0, 109, 0.2)';
                ctx.beginPath(); ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2); ctx.fill();
            }
        }

        class Pulse {
            constructor(p1, p2) {
                this.p1 = p1; this.p2 = p2;
                this.progress = 0;
                this.speed = Math.random() * 0.008 + 0.006; 
                this.active = true;
                this.length = 0.25; 
            }
            update() {
                this.progress += this.speed;
                if (this.progress > 1 + this.length) this.active = false;
            }
            draw(ctx, isDark) {
                if (!this.active) return;
                
                let startP = Math.max(0, this.progress - this.length);
                let endP = Math.min(1, this.progress);

                let x1 = this.p1.x + (this.p2.x - this.p1.x) * startP;
                let y1 = this.p1.y + (this.p2.y - this.p1.y) * startP;
                let x2 = this.p1.x + (this.p2.x - this.p1.x) * endP;
                let y2 = this.p1.y + (this.p2.y - this.p1.y) * endP;

                let colorRGB = isDark ? '244, 114, 182' : '212, 0, 109';
                let gradient = ctx.createLinearGradient(x1, y1, x2, y2);
                gradient.addColorStop(0, `rgba(${colorRGB}, 0)`); 
                gradient.addColorStop(1, `rgba(${colorRGB}, 1)`); 

                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2.5; 
                ctx.shadowBlur = 10;
                ctx.shadowColor = `rgba(${colorRGB}, 0.8)`;
                ctx.stroke();
                ctx.shadowBlur = 0; 
            }
        }

        function initCanvas() { 
            width = canvas.width = window.innerWidth; height = canvas.height = document.querySelector('header').offsetHeight; 
            particles = []; pulses = [];
            const particleCount = window.innerWidth < 768 ? 60 : 120; 
            for (let i = 0; i < particleCount; i++) { particles.push(new Particle()); } 
        }
        
        function animateCanvas() {
            if (!isCanvasVisible) return; 
            animationFrameId = requestAnimationFrame(animateCanvas); ctx.clearRect(0, 0, width, height);
            const isDark = document.body.classList.contains('dark-theme');
            
            for (let i = 0; i < particles.length; i++) {
                let p = particles[i]; p.update(); p.draw(isDark);
                for (let j = i + 1; j < particles.length; j++) {
                    let p2 = particles[j]; let dist = Math.sqrt(Math.pow(p.x - p2.x, 2) + Math.pow(p.y - p2.y, 2));
                    if (dist < 160) {
                        ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = isDark ? `rgba(244, 114, 182, ${0.25 - dist/160 * 0.25})` : `rgba(212, 0, 109, ${0.1 - dist/160 * 0.1})`; 
                        ctx.lineWidth = 0.8; ctx.stroke();
                        
                        if (dist > 80 && Math.random() < 0.0003) { pulses.push(new Pulse(p, p2)); }
                    }
                }
            }

            for(let i = pulses.length - 1; i >= 0; i--) {
                pulses[i].update();
                pulses[i].draw(ctx, isDark);
                if(!pulses[i].active) pulses.splice(i, 1);
            }
        }
        window.addEventListener('resize', initCanvas); initCanvas(); animateCanvas();
    }

    // --- 12. SOMBRA DE NAVBAR Y BARRA DE PROGRESO ---
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

    // --- 13. ENLACES CENTRALIZADOS ---
    if (typeof JBDA_CONFIG !== 'undefined') {
        const isEnglish = document.documentElement.lang === 'en';
        const mensaje = isEnglish ? JBDA_CONFIG.whatsappMsgEN : JBDA_CONFIG.whatsappMsgES;
        const urlWhats = `https://wa.me/${JBDA_CONFIG.whatsappNum}?text=${encodeURIComponent(mensaje)}`;
        
        if(document.getElementById('link-whatsapp-footer')) document.getElementById('link-whatsapp-footer').href = urlWhats; 
        if(document.getElementById('link-concierge-whatsapp')) document.getElementById('link-concierge-whatsapp').href = urlWhats; 
        if(document.getElementById('link-linkedin')) document.getElementById('link-linkedin').href = JBDA_CONFIG.linkedin;

        const emailLinks = document.querySelectorAll('.link-email');
        emailLinks.forEach(el => { el.href = `mailto:${JBDA_CONFIG.email}`; const textSpan = el.querySelector('.email-text'); if (textSpan) textSpan.innerText = JBDA_CONFIG.email; });

        // ==============================================================
        // MOTOR MODAL JBDA (LA SOLUCIÓN DEFINITIVA DE LA "X")
        // ==============================================================
        let customModal, customIframe;
        
        const initCustomCalendly = () => {
            const overlay = document.createElement('div');
            overlay.className = 'jbda-modal-overlay hidden';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'jbda-modal-close';
            closeBtn.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;
            
            const content = document.createElement('div');
            content.className = 'jbda-modal-content';
            
            const iframe = document.createElement('iframe');
            iframe.width = '100%';
            iframe.height = '100%';
            iframe.frameBorder = '0';
            
            content.appendChild(iframe);
            overlay.appendChild(closeBtn);
            overlay.appendChild(content);
            document.body.appendChild(overlay);
            
            const close = () => {
                overlay.classList.add('hidden');
                setTimeout(() => iframe.src = '', 400); 
            };
            
            closeBtn.addEventListener('click', close);
            overlay.addEventListener('click', (e) => { if(e.target === overlay) close(); });
            
            customModal = overlay;
            customIframe = iframe;
        };

        const abrirCalendly = (e) => { 
            e.preventDefault(); 
            if(!customModal) initCustomCalendly();
            
            const cleanUrl = JBDA_CONFIG.calendly + '?embed=1&hide_event_type_details=1&hide_gdpr_banner=1';
            customIframe.src = cleanUrl;
            customModal.classList.remove('hidden');
            
            const concierge = document.getElementById('concierge-menu');
            if(concierge) concierge.classList.remove('active'); 
            return false; 
        };

        if(document.getElementById('link-hero')) document.getElementById('link-hero').addEventListener('click', abrirCalendly); 
        if(document.getElementById('link-cta')) document.getElementById('link-cta').addEventListener('click', abrirCalendly); 
        if(document.getElementById('link-concierge-calendly')) document.getElementById('link-concierge-calendly').addEventListener('click', abrirCalendly);
    }

    // --- 14. BOTÓN FLOTANTE ---
    const conciergeToggle = document.getElementById('concierge-toggle'); const conciergeMenu = document.getElementById('concierge-menu');
    if(conciergeToggle && conciergeMenu) {
        conciergeToggle.addEventListener('click', (e) => { e.stopPropagation(); conciergeMenu.classList.toggle('active'); });
        document.addEventListener('click', (event) => { if (!conciergeToggle.contains(event.target) && !conciergeMenu.contains(event.target)) { conciergeMenu.classList.remove('active'); } });
    }

    // --- 15. MODO TERMINAL ---
    const terminalToggle = document.getElementById('terminal-toggle');
    if(terminalToggle) { terminalToggle.addEventListener('click', (e) => { e.stopPropagation(); document.body.classList.toggle('terminal-mode'); }); }
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', event => { if (event.keyCode === 123 || (event.ctrlKey && event.shiftKey && (event.keyCode === 73 || event.keyCode === 74)) || (event.ctrlKey && event.keyCode === 85)) { event.preventDefault(); } });
});
