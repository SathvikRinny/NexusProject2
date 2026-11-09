const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// ----- Mobile menu -----
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');

function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    links.classList.toggle('open', open);
}

toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
links.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// ----- Header shadow on scroll -----
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ----- Reveal sections as they scroll into view -----
const revealEls = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                io.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });
    revealEls.forEach(el => io.observe(el));
} else {
    revealEls.forEach(el => el.classList.add('visible'));
}

// ----- Count-up stats -----
const counters = document.querySelectorAll('[data-count]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if ('IntersectionObserver' in window && !reduceMotion) {
    const countIO = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const target = Number(el.dataset.count);
            const start = performance.now();
            const step = now => {
                const t = Math.min((now - start) / 1200, 1);
                el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
                if (t < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            countIO.unobserve(el);
        });
    }, { threshold: 0.6 });
    counters.forEach(el => countIO.observe(el));
}

// ----- Testimonial slider -----
const slides = Array.from(document.querySelectorAll('.slide'));
const indexEl = document.getElementById('slide-index');
let current = 0;
let autoplay;

function showSlide(i) {
    current = (i + slides.length) % slides.length;
    slides.forEach((s, n) => {
        s.hidden = n !== current;
        s.classList.toggle('is-active', n === current);
    });
    indexEl.textContent = String(current + 1).padStart(2, '0');
}

function startAutoplay() {
    if (reduceMotion) return;
    clearInterval(autoplay);
    autoplay = setInterval(() => showSlide(current + 1), 7000);
}

document.querySelectorAll('.slider-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        showSlide(current + Number(btn.dataset.dir));
        startAutoplay();
    });
});
startAutoplay();

// ----- Forms -----
function setStatus(form, message, type) {
    const el = form.querySelector('.form-status');
    el.textContent = message;
    el.className = `form-status ${type || ''}`;
}

async function postJSON(url, data) {
    const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(body.error || 'Something went wrong. Please try again.');
    return body;
}

async function submitWithButton(form, fn) {
    const btn = form.querySelector('button[type="submit"]');
    const label = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending…';
    try {
        await fn();
    } catch (err) {
        const offline = err instanceof TypeError;
        setStatus(form, offline ? 'Could not reach the server. Is it running?' : err.message, 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = label;
    }
}

// Contact form
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', e => {
    e.preventDefault();
    const name = contactForm.elements.name;
    const email = contactForm.elements.email;
    const message = contactForm.elements.message;

    const problems = [];
    [name, email, message].forEach(f => f.setAttribute('aria-invalid', 'false'));
    if (!name.value.trim()) { problems.push('your name'); name.setAttribute('aria-invalid', 'true'); }
    if (!EMAIL_RE.test(email.value.trim())) { problems.push('a valid email'); email.setAttribute('aria-invalid', 'true'); }
    if (!message.value.trim()) { problems.push('a message'); message.setAttribute('aria-invalid', 'true'); }
    if (problems.length) {
        setStatus(contactForm, `Please enter ${problems.join(', ')}.`, 'error');
        contactForm.querySelector('[aria-invalid="true"]').focus();
        return;
    }

    submitWithButton(contactForm, async () => {
        await postJSON('/submit-contact', {
            name: name.value.trim(),
            email: email.value.trim(),
            message: message.value.trim(),
        });
        contactForm.reset();
        setStatus(contactForm, 'Thanks! Your message has been sent.', 'success');
    });
});

// Feedback form
const feedbackForm = document.getElementById('feedbackForm');
feedbackForm.addEventListener('submit', e => {
    e.preventDefault();
    const rating = Number(new FormData(feedbackForm).get('rating'));
    if (!rating) {
        setStatus(feedbackForm, 'Please choose a star rating first.', 'error');
        return;
    }

    submitWithButton(feedbackForm, async () => {
        await postJSON('/submit-feedback', {
            rating,
            description: feedbackForm.elements.description.value.trim(),
        });
        feedbackForm.reset();
        setStatus(feedbackForm, 'Thank you for your feedback!', 'success');
    });
});

document.getElementById('year').textContent = new Date().getFullYear();
