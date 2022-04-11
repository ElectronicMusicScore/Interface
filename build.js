const minify = require('html-minifier').minify;
const purify = require('purify-css');
const UglifyJS = require('uglify-js');

const fs = require('fs');

const {humanFileSize} = require('./utils');

const purifyOptions = {minify: true};
const uglifyjsOptions = {
    compress: {
        passes: 2,
        drop_console: true,
    },
    mangle: {
        toplevel: true,
    },
};

let initialHtml = fs.readFileSync('html/index.html').toString();
let html = initialHtml;

const bulmaCssRaw = fs.readFileSync('node_modules/bulma/css/bulma.min.css').toString();
const bulmaCss = purify(initialHtml, bulmaCssRaw, purifyOptions);
console.info('Bulma CSS minifier:', ((1 - (bulmaCss.length / bulmaCssRaw.length)) * 100), "%");
html = html.replace(
    '<link href="/node_modules/bulma/css/bulma.min.css" rel="stylesheet" type="text/css"/>',
    '<style>' + bulmaCss + '</style>'
);
initialHtml = initialHtml.replace(
    '<link href="/node_modules/bulma/css/bulma.min.css" rel="stylesheet" type="text/css"/>',
    '<style>' + bulmaCssRaw + '</style>'
);

const mainCssRaw = fs.readFileSync('html/main.css').toString();
const mainCss = purify(initialHtml, mainCssRaw, purifyOptions);
console.info('Main CSS minifier: ', (1 - (mainCss.length / mainCssRaw.length)) * 100, "%");
html = html.replace(
    '<link href="main.css" rel="stylesheet" type="text/css"/>',
    '<style>' + mainCss + '</style>'
);
initialHtml = initialHtml.replace(
    '<link href="main.css" rel="stylesheet" type="text/css"/>',
    '<style>' + mainCssRaw + '</style>'
);

console.info(); // Leave line break

const shortcutsJs = fs.readFileSync('html/shortcuts.js').toString();
const modalJs = fs.readFileSync('html/modal.js').toString();
const backendJs = fs.readFileSync('html/backend.js').toString();
const filesBackendJs = fs.readFileSync('html/files-backend.js').toString();
const downDetectorJs = fs.readFileSync('html/down-detector.js').toString();
const utilsJs = fs.readFileSync('html/utils.js').toString();
const mainJs = fs.readFileSync('html/main.js').toString();
const osmdJsRaw = fs.readFileSync('node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js').toString();
const chevronLeftSvg = fs.readFileSync('html/icons/chevron_left_black_24dp.svg').toString();
const uploadFileSvg = fs.readFileSync('html/icons/upload_file_black_24dp.svg').toString();
const zoomInSvg = fs.readFileSync('html/icons/zoom_in_black_24dp.svg').toString();
const zoomOutSvg = fs.readFileSync('html/icons/zoom_out_black_24dp.svg').toString();
const compressedJs = UglifyJS.minify({
    'opensheetmusicdisplay.min.js': osmdJsRaw,
    'shortcuts.js': shortcutsJs,
    'main.js': mainJs,
    'modal.js': modalJs,
    'utils.js': utilsJs,
    'backend.js': backendJs,
    'files-backend.js': filesBackendJs,
    'down-detector.js': downDetectorJs,
}, uglifyjsOptions);

if (compressedJs.error)
    return console.error(compressedJs.error);

html = html.replace(
    '<script src="/node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js"></script>',
    '<script type="application/javascript" rel="script">' + compressedJs.code + '</script>'
)
    .replace('<script src="shortcuts.js"></script>', '')
    .replace('<script src="main.js"></script>', '')
    .replace('<script src="modal.js"></script>', '')
    .replace('<script src="backend.js"></script>', '')
    .replace('<script src="files-backend.js"></script>', '')
    .replace('<script src="down-detector.js"></script>', '')
    .replace('<script src="utils.js"></script>', '')
    .replaceAll('<img alt="..." src="icons/chevron_left_black_24dp.svg"/>', chevronLeftSvg)
    .replaceAll('<img alt="..." src="icons/upload_file_black_24dp.svg"/>', uploadFileSvg)
    .replaceAll('<img alt="..." src="icons/zoom_in_black_24dp.svg"/>', zoomInSvg)
    .replaceAll('<img alt="..." src="icons/zoom_out_black_24dp.svg"/>', zoomOutSvg);
initialHtml = initialHtml.replace(
    '<script src="/node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js"></script>',
    '<script>' + osmdJsRaw + '</script>'
).replace('<script src="main.js"></script>', '<script>' + mainJs + '</script>')
    .replace('<script src="shortcuts.js"></script>', '<script>' + shortcutsJs + '</script>')
    .replace('<script src="modal.js"></script>', '<script>' + modalJs + '</script>')
    .replace('<script src="utils.js"></script>', '<script>' + utilsJs + '</script>')
    .replace('<script src="backend.js"></script>', '<script>' + backendJs + '</script>')
    .replace('<script src="files-backend.js"></script>', '<script>' + filesBackendJs + '</script>')
    .replace('<script src="down-detector.js"></script>', '<script>' + downDetectorJs + '</script>');
console.info('JavaScript minifier:', (1 - (html.length / initialHtml.length)) * 100, '%');

if (fs.existsSync('build'))
    fs.rmSync('build', {recursive: true, force: true});
fs.mkdirSync('build');

// Run minifier
const result = minify(html, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: false,
    minifyJS: false,
    removeAttributeQuotes: true,
    removeComments: true,
    removeEmptyAttributes: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
});
fs.writeFile('build/index.min.html', result, err => {
    if (err)
        return console.error(err);
    console.info();
    console.info('Initial size: ', initialHtml.length, '(' + humanFileSize(initialHtml.length) + ')');
    console.info('Minified size:', result.length, '(' + humanFileSize(result.length) + ')');
    console.info("---", ((1 - (result.length / initialHtml.length)) * 100), "% ---");
});
