const express = require('express');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || '';
const DATA_DIR = path.join(__dirname, 'data');
const FEEDBACK_FILE = path.join(DATA_DIR, 'feedback.jsonl');
const CONTACT_FILE = path.join(DATA_DIR, 'contacts.jsonl');
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// ---------- helpers ----------
const clean = (value, max) => (typeof value === 'string' ? value.trim().slice(0, max) : '');

const escapeHtml = str => String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[c]));

async function appendRecord(file, record) {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.appendFile(file, JSON.stringify(record) + '\n');
}

async function readRecords(file) {
    try {
        const raw = await fs.readFile(file, 'utf-8');
        return raw.split('\n').filter(Boolean).map(line => {
            try { return JSON.parse(line); } catch { return null; }
        }).filter(Boolean);
    } catch (err) {
        if (err.code === 'ENOENT') return [];
        throw err;
    }
}

// Simple in-memory rate limit: 10 submissions per IP per 10 minutes.
const hits = new Map();
function rateLimit(req, res, next) {
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    const list = (hits.get(req.ip) || []).filter(t => now - t < windowMs);
    if (list.length >= 10) {
        return res.status(429).json({ error: 'Too many submissions. Please try again later.' });
    }
    list.push(now);
    hits.set(req.ip, list);
    next();
}

// Admin pages: require ?token=ADMIN_TOKEN when it is set, otherwise allow only local requests.
function requireAdmin(req, res, next) {
    const isLocal = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
    if (ADMIN_TOKEN ? req.query.token === ADMIN_TOKEN : isLocal) return next();
    res.status(403).send('Forbidden');
}

function adminPage(title, rows, columns) {
    const head = columns.map(c => `<th>${escapeHtml(c.label)}</th>`).join('');
    const body = rows.length
        ? rows.slice().reverse().map(r => `<tr>${columns.map(c => `<td>${escapeHtml(r[c.key] ?? '')}</td>`).join('')}</tr>`).join('')
        : `<tr><td colspan="${columns.length}">No submissions yet.</td></tr>`;
    return `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(title)}</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;color:#1d1b22}table{border-collapse:collapse;width:100%}
th,td{border:1px solid #e6e0ec;padding:8px 10px;text-align:left;vertical-align:top}th{background:#efe3f6}
td{white-space:pre-wrap;word-break:break-word}</style></head>
<body><h1>${escapeHtml(title)} (${rows.length})</h1><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></body></html>`;
}

// ---------- routes ----------
app.post('/submit-contact', rateLimit, async (req, res, next) => {
    try {
        const name = clean(req.body.name, 100);
        const email = clean(req.body.email, 200);
        const message = clean(req.body.message, 2000);

        if (!name || !message) return res.status(400).json({ error: 'Name and message are required.' });
        if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });

        await appendRecord(CONTACT_FILE, { name, email, message, createdAt: new Date().toISOString() });
        res.status(201).json({ ok: true });
    } catch (err) {
        next(err);
    }
});

app.post('/submit-feedback', rateLimit, async (req, res, next) => {
    try {
        const rating = Number(req.body.rating);
        const description = clean(req.body.description, 1000);

        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
        }

        await appendRecord(FEEDBACK_FILE, { rating, description, createdAt: new Date().toISOString() });
        res.status(201).json({ ok: true });
    } catch (err) {
        next(err);
    }
});

app.get('/check-contact', requireAdmin, async (req, res, next) => {
    try {
        const rows = await readRecords(CONTACT_FILE);
        res.send(adminPage('Contact messages', rows, [
            { key: 'createdAt', label: 'Date' },
            { key: 'name', label: 'Name' },
            { key: 'email', label: 'Email' },
            { key: 'message', label: 'Message' },
        ]));
    } catch (err) {
        next(err);
    }
});

app.get('/check-feedback', requireAdmin, async (req, res, next) => {
    try {
        const rows = await readRecords(FEEDBACK_FILE);
        res.send(adminPage('Feedback', rows, [
            { key: 'createdAt', label: 'Date' },
            { key: 'rating', label: 'Rating' },
            { key: 'description', label: 'Comment' },
        ]));
    } catch (err) {
        next(err);
    }
});

// JSON body parse errors and anything unexpected
app.use((err, req, res, next) => {
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid request.' });
    console.error(err);
    res.status(500).json({ error: 'Internal server error.' });
});

if (require.main === module) {
    app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
}

module.exports = app;
