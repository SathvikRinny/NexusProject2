const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs/promises');
const path = require('path');

const app = express();
const port = 3000;
const feedbackFilePath = 'feedback-data.json';
const contactFilePath = 'contact-data.json';

app.use(bodyParser.json());


// Route to serve the index.html file for the root path
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to handle feedback form submissions
app.post('/submit-feedback', async (req, res) => {
    try {
        const feedbackData = {
            rating: req.body.rating,
            description: req.body.description,
        };

        // Append feedback form data to a file
        await fs.appendFile(feedbackFilePath, JSON.stringify(feedbackData) + '\n');

        res.send('Feedback submitted successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display feedback form data
app.get('/check-feedback', async (req, res) => {
    try {
        // Check if the file exists
        const fileExists = await fs.access(feedbackFilePath)
            .then(() => true)
            .catch(() => false);

        if (!fileExists) {
            return res.send('No feedback submissions available.');  // Send a message if no feedback form data exists
        }

        // Read feedback form data from the file
        const feedbackRaw = await fs.readFile(feedbackFilePath, 'utf-8');
        const feedbackArray = feedbackRaw.trim().split('\n').map(JSON.parse);

        // Render a simple HTML page with the feedback form data
        const feedbackHtml = feedbackArray.map(feedback => `<p>Rating: ${feedback.rating}, Description: ${feedback.description}</p>`).join('');
        const html = `<html><body>${feedbackHtml}</body></html>`;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to handle contact form submissions
app.post('/submit-contact', async (req, res) => {
    try {
        const contactData = {
            name: req.body.name,
            email: req.body.email,
            message: req.body.message,
        };

        // Append contact form data to a file
        await fs.appendFile(contactFilePath, JSON.stringify(contactData) + '\n');

        res.send('Contact form submitted successfully!');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Route to display contact form data
app.get('/check-contact', async (req, res) => {
    try {
        // Check if the file exists
        const fileExists = await fs.access(contactFilePath)
            .then(() => true)
            .catch(() => false);

        if (!fileExists) {
            return res.send('No contact form submissions available.');  // Send a message if no contact form data exists
        }

        // Read contact form data from the file
        const contactRaw = await fs.readFile(contactFilePath, 'utf-8');
        const contactArray = contactRaw.trim().split('\n').map(JSON.parse);

        // Render a simple HTML page with the contact form data
        const contactHtml = contactArray.map(contact => `<p>Name: ${contact.name}, Email: ${contact.email}, Message: ${contact.message}</p>`).join('');
        const html = `<html><body>${contactHtml}</body></html>`;

        res.send(html);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
