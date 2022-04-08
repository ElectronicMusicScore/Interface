console.warn("Warning! Do not use in production. Testing server.");

// Load parameters from .env file
require('dotenv').config();

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const fsPath = process.env.FS_PATH || './fs';

const express = require("express");
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');

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
app.use(express.static('build'));

// Instantiate the endpoints' data
const cacheFs = fsPath + '.cache';
if (fs.existsSync(cacheFs))
    fs.rmSync(cacheFs, {recursive: true, force: true});
fse.copySync(fsPath, cacheFs, {});

let filesList = [];
let usedSpace = 0;
fs.readdirSync(cacheFs).forEach((file) => {
    const filePath = path.join(cacheFs, file);
    const stats = fs.lstatSync(filePath);
    const size = stats.size
    usedSpace += size;
    filesList.push({path: `/${file}`, size});
});
const availableSpace = faker.datatype.number({min: usedSpace});

// Emulate the device endpoints
app.get('/ping', (req, resp) => resp.status(200).send('ok'));
app.get('/files', (req, resp) => {
    const info = {'used': usedSpace, 'max': availableSpace};

    resp.status(200)
        .send({files: filesList, info});
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
