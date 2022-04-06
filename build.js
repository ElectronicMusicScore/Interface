const posthtml = require('posthtml');
const minifyClassnames = require('posthtml-minify-classnames');

const fs = require('fs');

const html = fs.readFileSync('html/index.html').toString();

if (fs.existsSync('build'))
    fs.rmSync('build', {recursive: true, force: true});

posthtml()
    .use(minifyClassnames({
        filter: /^.bar/,
        genNameClass: 'genNameEmoji',
        genNameId: 'genNameEmoji',
        customAttributes: ['x-transition:enter']
    }))
    .process(html)
    .then((result) => {
        fs.writeFileSync('build/index.html', result.html);
        console.log(result.html);
    });
