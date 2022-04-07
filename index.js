console.warn("Warning! Do not use in production. Testing server.");

// Load parameters from .env file
require('dotenv').config();

const HTTP_PORT = process.env.HTTP_PORT || 3000;

const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');

const {faker} = require('@faker-js/faker');

const {generateRandom} = require('./utils');

const app = express();

// For parsing body data
app.use(bodyParser.urlencoded());

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
app.get('/files', (req, resp) => {
    let files = [];

    for (let j = 0; j < generateRandom(5); j++)
        files.push('/' + faker.system.fileName());

    resp.status(200)
        .send({"files": files});
});
app.get('/nets', (req, resp) => {
    let networks = [];

    for (let j = 0; j < generateRandom(15); j++)
        networks.push({
            ssid: faker.word.adjective() + ' ' + faker.word.noun(),
        });

    resp.status(200)
        .send({"networks": networks});
});
app.post('/connect/:ssid', (req, resp) => {
    const params = req.params;
    const body = req.body;

    const ssid = params['ssid'];
    const password = body['pass'];
    console.log('Should connect to', ssid, 'with', password);

    let result;
    if (faker.datatype.boolean())
        result = 'ok';
    else switch (generateRandom(2)) {
        case 0:
            result = 'fail:out-of-range';
            break;
        case 1:
            result = 'fail:auth-error';
            break;
        default:
            result = 'fail:unknown-error';
            break;
    }
    resp.status(result === 'ok' ? 200 : 400)
        .send(result);
});

app.listen(HTTP_PORT, () => {
    console.info(`Server available on: http://localhost:${HTTP_PORT}`);
});
