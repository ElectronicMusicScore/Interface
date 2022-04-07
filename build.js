const htmlnano = require('htmlnano');
const preset = require('htmlnano').presets.max;
const options = {
    collapseAttributeWhitespace: true,
    collapseWhitespace: 'aggressive',
    deduplicateAttributeValues: true,
    removeComments: 'all',
    removeEmptyAttributes: true,
    removeUnusedCss: {
        tool: 'uncss',
    },
    minifyCss: {
        preset: ['default', {
            discardComments: {
                removeAll: true,
            },
        }],
    },
    minifyJs: true,
};
const postHtmlOptions = {
    sync: false, // https://github.com/posthtml/posthtml#usage
    lowerCaseTags: true, // https://github.com/posthtml/posthtml-parser#options
    quoteAllAttributes: false, // https://github.com/posthtml/posthtml-render#options
};

const fs = require('fs');

let html = fs.readFileSync('html/index.html').toString();

const bulmaCss = fs.readFileSync('node_modules/bulma/css/bulma.min.css').toString();
html = html.replace(
    '<link href="/node_modules/bulma/css/bulma.min.css" rel="stylesheet" type="text/css"/>',
    '<style>' + bulmaCss + '</style>'
);

const mainCss = fs.readFileSync('html/main.css').toString();
html = html.replace(
    '<link href="main.css" rel="stylesheet" type="text/css"/>',
    '<style>' + mainCss + '</style>'
);

const osmdJs = fs.readFileSync('node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js').toString();
html = html.replace(
    '<script src="/node_modules/opensheetmusicdisplay/build/opensheetmusicdisplay.min.js"></script>',
    '<script>' + osmdJs + '</script>'
);

const shortcutsJs = fs.readFileSync('html/shortcuts.js').toString();
html = html.replace(
    '<script src="shortcuts.js"></script>',
    '<script>' + shortcutsJs + '</script>'
);

const mainJs = fs.readFileSync('html/main.js').toString();
html = html.replace(
    '<script src="main.js"></script>',
    '<script>' + mainJs + '</script>'
);

const modalJs = fs.readFileSync('html/modal.js').toString();
html = html.replace(
    '<script src="modal.js"></script>',
    '<script>' + modalJs + '</script>'
);

if (fs.existsSync('build'))
    fs.rmSync('build', {recursive: true, force: true});
fs.mkdirSync('build');

htmlnano
    // "preset" arg might be skipped (see "Presets" section below for more info)
    // "postHtmlOptions" arg might be skipped
    .process(html, options, preset, postHtmlOptions)
    .then(function (result) {
        // result.html is minified
        fs.writeFile('build/index.html', result.html, err => {
            if (err)
                return console.error(err);
            console.log(result.html);
        });
    })
    .catch(function (err) {
        console.error(err);
    });
