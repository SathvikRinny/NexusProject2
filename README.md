# Techy Software Company: Business Website

A responsive company landing page with a working contact form and a star-rating feedback form. Built during the Nexus internship (Project 2).

## Features

- Landing page with Home, Products/Services, About Us and Contact Us sections
- **Contact form:** saves name, email and message to `contact-data.json`
- **Feedback form:** 1–5 star rating with a comment, saved to `feedback-data.json`
- Admin views to read submissions: `/check-feedback` and `/check-contact`

## Tech stack

- Frontend: HTML, CSS, JavaScript (`index.html`)
- Backend: Node.js, Express (`server.js`)

## Running locally

```bash
npm install
npm start
```

Open http://localhost:3000. The page sends form data to `http://localhost:3000`, so the server must be running for the forms to work.

## API

| Method | Route | Purpose |
|---|---|---|
| GET | `/` | Serves the website |
| POST | `/submit-contact` | Stores a contact message |
| POST | `/submit-feedback` | Stores a rating and comment |
| GET | `/check-contact` | Lists contact messages |
| GET | `/check-feedback` | Lists feedback |
