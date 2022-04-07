const minify = require('html-minifier').minify;
const purify = require('purify-css');

const fs = require('fs');

const purifyOptions = {minify: true};

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

const osmdJs = fs.readFileSync('node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js').toString();
html = html.replace(
    '<script src="/node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js"></script>',
    '<script>' + osmdJs + '</script>'
);
initialHtml = initialHtml.replace(
    '<script src="/node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js"></script>',
    '<script>' + osmdJs + '</script>'
);

const shortcutsJs = fs.readFileSync('html/shortcuts.js').toString();
html = html.replace(
    '<script src="shortcuts.js"></script>',
    '<script>' + shortcutsJs + '</script>'
);
initialHtml = initialHtml.replace(
    '<script src="shortcuts.js"></script>',
    '<script>' + shortcutsJs + '</script>'
);

const mainJs = fs.readFileSync('html/main.js').toString();
html = html.replace(
    '<script src="main.js"></script>',
    '<script>' + mainJs + '</script>'
);
initialHtml = initialHtml.replace(
    '<script src="main.js"></script>',
    '<script>' + mainJs + '</script>'
);

const modalJs = fs.readFileSync('html/modal.js').toString();
html = html.replace(
    '<script src="modal.js"></script>',
    '<script>' + modalJs + '</script>'
);
initialHtml = initialHtml.replace(
    '<script src="modal.js"></script>',
    '<script>' + modalJs + '</script>'
);

const backendJs = fs.readFileSync('html/backend.js').toString();
html = html.replace(
    '<script src="backend.js"></script>',
    '<script>' + backendJs + '</script>'
);
initialHtml = initialHtml.replace(
    '<script src="backend.js"></script>',
    '<script>' + backendJs + '</script>'
);

if (fs.existsSync('build'))
    fs.rmSync('build', {recursive: true, force: true});
fs.mkdirSync('build');

// Run minifier
const result = minify(html, {
    collapseBooleanAttributes: true,
    collapseInlineTagWhitespace: true,
    collapseWhitespace: true,
    minifyCSS: {level: 2},
    minifyJS: true,
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
fs.writeFile('build/index.html', result, err => {
    if (err)
        return console.error(err);
    console.info();
    console.info('Initial size:', initialHtml.length);
    console.info("Minified size:", result.length);
    console.info("---", ((1 - (result.length / initialHtml.length)) * 100), "% ---");
});
