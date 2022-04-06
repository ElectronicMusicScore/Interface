console.warn("Warning! Do not use in production. Testing server.");

// Load parameters from .env file
require('dotenv').config();

const HTTP_PORT = process.env.HTTP_PORT || 3000;

const express = require("express");
const path = require('path');

const app = express();

// The opensheetmusicdisplay script
app.use(
    '/node_modules/opensheetmusicdisplay/build',
    express.static(path.join(__dirname, 'node_modules/opensheetmusicdisplay/build'))
);

// The Bulma framework
app.use(
    '/node_modules/bulma/css',
    express.static(path.join(__dirname, 'node_modules/bulma/css'))
);

// Serve the html files
app.use(express.static('html'))

app.listen(HTTP_PORT, () => {
    console.info(`Server available on: http://localhost:${HTTP_PORT}`);
});
