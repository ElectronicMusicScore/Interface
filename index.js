console.warn("Warning! Do not use in production. Testing server.");

// Load parameters from .env file
require('dotenv').config();

const HTTP_PORT = process.env.HTTP_PORT || 3000;

const express = require("express");
const path = require('path');

const {faker} = require('@faker-js/faker');

const {generateRandom} = require('./utils');

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
app.use(express.static('html'));

// Emulate the device endpoints
app.get('/files', (req, res) => {
    let files = [];

    for (let j = 0; j < generateRandom(5); j++)
        files.push('/' + faker.system.fileName());

    res.status(200).send({"files": files});
});
app.get('/nets', (req, res) => {
    let networks = [];

    for (let j = 0; j < generateRandom(15); j++)
        networks.push({
            ssid: faker.word.adjective() + ' ' + faker.word.noun(),
        });

    res.status(200).send({"networks": networks});
});

app.listen(HTTP_PORT, () => {
    console.info(`Server available on: http://localhost:${HTTP_PORT}`);
});
