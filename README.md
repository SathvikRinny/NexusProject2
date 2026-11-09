# Techy Software Company: Business Website

A responsive company website with a working contact form and star-rating feedback form, backed by a small Express server. Started during the Nexus internship (Project 2) and since rebuilt.

## Features

- Responsive layout for phones, tablets and desktops, with a mobile hamburger menu
- Sections: hero, about us with animated stats, products and services, clients, testimonial slider, contact and feedback
- **Contact form:** validated in the browser and on the server, saved to `data/contacts.jsonl`
- **Feedback form:** keyboard-accessible 1–5 star rating with a comment, saved to `data/feedback.jsonl`
- Inline success and error messages (no pop-up alerts)
- Admin pages to read submissions, with HTML escaping and access control
- Basic spam protection: request size limit and 10 submissions per IP per 10 minutes
- Accessibility: skip link, labelled fields, focus styles, reduced-motion support
- Images compressed to WebP (5.5 MB → 0.2 MB)

## Tech stack

- **Frontend:** HTML, CSS, JavaScript (`public/`)
- **Backend:** Node.js 18+, Express (`server.js`)

## Running locally

```bash
npm install
npm start          # or: npm run dev  (restarts on file changes)
```

Open http://localhost:3000.

## Viewing submissions

| Page | Shows |
|---|---|
| `/check-contact` | Contact messages |
| `/check-feedback` | Feedback and ratings |

These pages open only from the same computer (`localhost`). To view them on a hosted server, set an admin token and add it to the URL:

```bash
ADMIN_TOKEN=choose-a-long-secret npm start
# then open /check-contact?token=choose-a-long-secret
```

## API

| Method | Route | Body |
|---|---|---|
| POST | `/submit-contact` | `{ "name", "email", "message" }` |
| POST | `/submit-feedback` | `{ "rating": 1-5, "description" }` |

Both return `201 { "ok": true }` on success or `400 { "error": "..." }` with a message.

## Project structure

```
public/
  index.html      Page markup
  styles.css      Styles
  main.js         Menu, slider, animations and form handling
  images/         WebP images
server.js         Express server and API
data/             Submissions (created automatically, not committed)
```
