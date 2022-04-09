console.warn("Warning! Do not use in production. Testing server.");

// Load parameters from .env file
require('dotenv').config();

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const fsPath = process.env.FS_PATH || './fs';

const express = require("express");
const cors = require('cors');
const bodyParser = require('body-parser');
const busboy = require('connect-busboy');
const fileUpload = require('express-fileupload');
const morgan = require('morgan');
require('lodash');

const path = require('path');
const fs = require('fs');
const fse = require('fs-extra');
const mime = require('mime-types');

const {faker} = require('@faker-js/faker');

const {generateRandom} = require('./utils');

const app = express();

// For parsing body data
app.use(cors());
app.use(busboy());
app.use(bodyParser.urlencoded({extended: true}));
app.use(morgan('dev'));

// enable files upload
app.use(fileUpload({
    createParentPath: true
}));

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

/**
 * @type {{path:string,size:number}[]}
 */
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
app.get('/file', (req, resp) => {
    const query = req.query;
    const queryPath = query.path;
    if (!queryPath)
        return resp.status(400).send('error');
    const filePath = path.join(cacheFs, queryPath);
    if (!fs.existsSync(filePath))
        return resp.status(404).send('error');
    const ext = path.extname(filePath);
    const type = mime.lookup(ext);
    const content = fs.readFileSync(filePath);
    resp.status(200).type(type).send(content);
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
app.put('/upload', async (req, resp) => {
    try {
        if (!req.files)
            resp.status(400)
                .send('fail:no-form-files');
        else {
            let file = req.files.file;
            if (!file)
                return resp
                    .status(406)
                    .send('fail:no-file');

            /**
             * @type {string}
             */
            const name = file.name;
            /**
             * @type {number}
             */
            const size = file.size;

            file.mv(path.join(cacheFs, name));

            //send response
            resp.status(200)
                .send('ok');

            // Store new file in cache
            filesList.push({path: name, size});
            usedSpace += size;
            console.log('New files list:', filesList);
        }
    } catch (err) {
        resp.status(500)
            .send('fail:internal');
    }
})

app.listen(HTTP_PORT, () => {
    console.info(`Server available on: http://localhost:${HTTP_PORT}`);
});
