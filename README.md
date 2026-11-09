# Techy Software Company: Business Website

**A responsive company website with a working contact form and star-rating feedback, backed by a small Node.js + Express server.** Built during an internship (Project 2) and since rebuilt to modern standards.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)

| Desktop | Mobile |
|---|---|
| ![Desktop view](docs/screenshot.png) | ![Mobile view](docs/screenshot-mobile.png) |

## Contents

- [Features](#features)
- [Getting started](#getting-started)
- [Configuration](#configuration)
- [Viewing submissions](#viewing-submissions)
- [API](#api)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Author](#author)

## Features

### Website
- Sections: hero, about us (with animated stats), products and services, clients, testimonials, contact and feedback
- Works on phones, tablets and desktops, with a hamburger menu on small screens
- Testimonial slider with previous/next buttons and autoplay
- Sections fade in as you scroll
- Accessible: skip link, labelled fields, keyboard-friendly star rating, visible focus outlines, and reduced-motion support

### Forms
- **Contact form:** name, email and message, checked in the browser and on the server
- **Feedback form:** 1–5 star rating with an optional comment
- Success and error messages appear under each form (no pop-ups)

### Server
- Serves the website from `public/`
- Saves submissions to `data/contacts.jsonl` and `data/feedback.jsonl`
- Validates and length-limits every field
- **Spam protection:** 10 KB request limit and at most 10 submissions per IP every 10 minutes
- **Admin pages** list submissions with HTML escaping, so stored text can't run as code; access is restricted

## Getting started

### Requirements

- [Node.js](https://nodejs.org/) 18 or newer

### Install and run

```bash
git clone https://github.com/SathvikRinny/NexusProject2.git
cd NexusProject2
npm install
npm start
```

Open http://localhost:3000.

`npm run dev` restarts the server automatically when you edit `server.js`.

> The forms need the server. Opening `public/index.html` directly shows the page, but submissions will fail.

## Configuration

| Environment variable | Default | Purpose |
|---|---|---|
| `PORT` | `3000` | Port the server listens on |
| `ADMIN_TOKEN` | *(empty)* | Password for the admin pages (see below) |

## Viewing submissions

| Page | Shows |
|---|---|
| `/check-contact` | Contact messages, newest first |
| `/check-feedback` | Ratings and comments, newest first |

- **Without `ADMIN_TOKEN`:** these pages open only from the computer running the server (`localhost`).
- **With `ADMIN_TOKEN`:** add the token to the address from anywhere.

```bash
ADMIN_TOKEN=choose-a-long-secret npm start
# then open http://your-server/check-contact?token=choose-a-long-secret
```

## API

| Method | Route | JSON body | Success |
|---|---|---|---|
| `POST` | `/submit-contact` | `{ "name": "...", "email": "...", "message": "..." }` | `201 { "ok": true }` |
| `POST` | `/submit-feedback` | `{ "rating": 1-5, "description": "..." }` | `201 { "ok": true }` |

Errors return a status code and a message, for example `400 { "error": "Please enter a valid email address." }`. Too many submissions return `429`.

| Field | Rules |
|---|---|
| `name` | Required, up to 100 characters |
| `email` | Required, valid email format, up to 200 characters |
| `message` | Required, up to 2000 characters |
| `rating` | Required, whole number from 1 to 5 |
| `description` | Optional, up to 1000 characters |

## Deployment

The site needs a host that runs Node.js, such as Render, Railway or a VPS. GitHub Pages cannot run the server.

- **Start command:** `npm start`
- Set `ADMIN_TOKEN` in the host's environment settings.
- Submissions are stored in files under `data/`. Many free hosts erase files on every redeploy; for permanent storage, attach a persistent disk or switch to a database.

## Project structure

```
public/
  index.html      Page markup
  styles.css      Styles
  main.js         Menu, slider, animations and form handling
  images/         WebP images
server.js         Express server, API and admin pages
package.json      Scripts and dependencies
data/             Submissions (created automatically, not committed)
docs/             Screenshots
```

## Author

**Sathvik Raju Pothureddy**: [GitHub](https://github.com/SathvikRinny) · [LinkedIn](https://www.linkedin.com/in/sathvik-raju/)

*Techy Software Company is a fictional business created for this project.*
