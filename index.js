console.warn("Warning! Do not use in production. Testing server.");

// Load parameters from .env file
require('dotenv').config();

const HTTP_PORT = process.env.HTTP_PORT || 3000;
const fsPath = process.env.FS_PATH || './fs';
const configPath = process.env.CONFIG_FILE || './config.yml';

const express = require("express");
const cors = require('cors');
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
const {touch} = require('./fs-utils');

const app = express();

// For parsing body data
app.use(cors());
app.use(busboy());
app.use(express.urlencoded({extended: true}));
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
/**
 * Stores the amount of space used in the filesystem.
 * @type {number}
 */
let usedSpace = 0;
/**
 * Stores the available space in the filesystem. Obviously must be greater than `usedSpace`.
 * @type {number}
 */
let availableSpace = 0;

/**
 * Initializes the list at `filesList`.
 * @author Arnau Mora
 * @since 20220409
 */
const initializeFilesList = () => {
    usedSpace = 0;
    filesList = [];
    fs.readdirSync(cacheFs).forEach((file) => {
        const filePath = path.join(cacheFs, file);
        const stats = fs.lstatSync(filePath);
        const size = stats.size
        usedSpace += size;
        filesList.push({path: `/${file}`, size});
    });
    if (availableSpace <= 0 || availableSpace < usedSpace)
        availableSpace = faker.datatype.number({min: usedSpace});
}
initializeFilesList();

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
        return resp.status(400).send('fail:missing-params');
    const filePath = path.join(cacheFs, queryPath);
    if (!fs.existsSync(filePath))
        return resp.status(404).send('fail:not-exist');
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
    let status = 200;
    if (faker.datatype.boolean())
        result = 'ok';
    else switch (generateRandom(2)) {
        case 0:
            result = 'fail:out-of-range';
            status = 404;
            break;
        case 1:
            result = 'fail:auth-error';
            status = 401;
            break;
        default:
            result = 'fail:unknown-error';
            status = 500;
            break;
    }
    resp.status(status)
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
            .setHeader('error-message', err)
            .send('fail:internal');
    }
});
app.patch('/rename', async (req, resp) => {
    const body = req.body;
    console.log('Body:', body);
    /**
     * @type {string}
     */
    const from = body['FROM'];
    /**
     * @type {string}
     */
    const to = body['TO'];
    /**
     * If true, and the target file already exists, it will be overridden.
     * @type {boolean}
     */
    const force = body['FORCE'] || false;

    if (!from || !to)
        return resp
            .status(400)
            .send('fail:missing-params');
    try {
        const fromFile = path.join(cacheFs, from);
        const toFile = path.join(cacheFs, to);

        if (!fs.existsSync(fromFile))
            return resp
                .status(404)
                .send('fail:not-exist');
        if (fs.existsSync(toFile))
            if (force)
                fs.rmSync(toFile)
            else
                return resp
                    .status(406)
                    .send('fail:exist');

        fs.renameSync(fromFile, toFile);
        resp.status(200)
            .send('ok');
        filesList.map((i) => {
            if (i.path.includes(from))
                i.path = to;
            return i;
        });
    } catch (e) {
        resp.status(500)
            .setHeader('error-message', e)
            .send('fail:internal');
    }
});
app.delete('/:path', (req, resp) => {
    try {
        const params = req.params;
        /**
         * @type {string}
         */
        const file = params.path;

        if (file == null)
            return resp
                .status(400)
                .send('fail:missing-params');

        const filePath = path.join(cacheFs, file);

        if (!fs.existsSync(filePath))
            return resp
                .status(404)
                .send('fail:not-exist');

        const fileInfo = fs.statSync(filePath);

        if (fileInfo.isDirectory())
            return resp
                .status(406)
                .send('fail:is-directory');

        // Remove the file
        fs.rmSync(filePath)

        if (fs.existsSync(filePath))
            return resp
                .status(500)
                .send('fail:internal');

        initializeFilesList();

        resp.status(200)
            .send('ok');
    } catch (e) {
        resp.status(500)
            .setHeader('error-message', e)
            .send('fail:internal');
    }
});
app.patch('/config/:key/:value', async (req, resp) => {
    const params = req.params;

    /**
     * @type {string}
     */
    const key = params.key;
    /**
     * @type {string}
     */
    const value = params.value;

    try {
        if (!fs.existsSync(configPath))
            await touch(configPath)

        fs.writeFileSync(
            configPath,
            fs.readFileSync(configPath)
                .toString()
                // Remove the line with that key
                .replace(new RegExp(`^${key}=.*\n`, 'gm'), '')
            + `${key}=${value}\n`,
        );

        resp.status(200)
            .send('ok');
    } catch (e) {
        console.error(e);
        resp.status(500)
            .setHeader('error-message', e)
            .send('fail:internal');
    }
});
app.get('/config/:key', (req, resp) => {
    const params = req.params;

    /**
     * @type {string}
     */
    const key = params.key;

    try {
        const line = fs.readFileSync(configPath)
            .toString()
            .match(new RegExp(`^${key}=.*\n`, 'gm'));

        if (line == null || line.length <= 0)
            return resp
                .status(404)
                .send('fail:not-set');

        resp.status(200)
            .send(
                line[0]
                    .toString()
                    .replace(/\n/gm, '')
                    .substring(key.length + 1)
            );
    } catch (e) {
        console.error(e);
        resp.status(500)
            .setHeader('error-message', e)
            .send('fail:internal');
    }
});
app.patch('/config_sheet', async (req, resp) => {
    const body = req.body;

    /**
     * @type {string}
     */
    const file = body.file;
    /**
     * @type {string}
     */
    const key = body.key;
    /**
     * @type {string}
     */
    const value = body.value;

    if (!file || !key || !value)
        return resp
            .status(400)
            .send('fail:missing-parameters');

    try {
        const sheetFile = path.join(cacheFs, file);
        if (!fs.existsSync(sheetFile))
            return resp
                .status(404)
                .send('fail:not-exist');

        switch (key) {
            case 'instruments':
                const fileName = path.join(cacheFs, file + '.ins');
                const fileContents = value
                    .replace(/,/gm, '\n');

                if (fs.existsSync(fileName))
                    fs.rmSync(fileName);

                fs.writeFileSync(fileName, fileContents);

                resp.status(200)
                    .send('ok');
                break;
            default:
                resp.status(405)
                    .send('fail:invalid-key');
                break;
        }
    } catch (e) {
        resp.status(500)
            .set('error-message', e)
            .send('fail:internal');
    }
});
app.get('/config_sheet', async (req, resp) => {
    const query = req.query;

    /**
     * @type {string}
     */
    const file = query.file;
    /**
     * @type {string}
     */
    const key = query.key;

    if (!file || !key)
        return resp
            .status(400)
            .send('fail:missing-parameters');

    try {
        const sheetFile = path.join(cacheFs, file);
        if (!fs.existsSync(sheetFile))
            return resp
                .status(404)
                .send('fail:not-exist');

        switch (key) {
            case 'instruments':
                const fileName = path.join(cacheFs, file + '.ins');

                if (!fs.existsSync(fileName))
                    return resp.status(406)
                        .send('fail:no-data');

                const fileContents = fs.readFileSync(fileName)
                    .toString();

                resp.status(200)
                    .send(fileContents);

                break;
            default:
                resp.status(405)
                    .send('fail:invalid-key');
                break;
        }
    } catch (e) {
        resp.status(500)
            .set('error-message', e)
            .send('fail:internal');
    }
});

app.listen(HTTP_PORT, () => {
    console.info(`Server available on: http://localhost:${HTTP_PORT}`);
});
