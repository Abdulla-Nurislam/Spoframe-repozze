const i18n = require('i18n');
const path = require('path');

i18n.configure({
    locales: ['ru', 'en'],
    defaultLocale: 'ru',
    directory: path.join(__dirname, 'locales'),
    objectNotation: true,
    updateFiles: false,
    syncFiles: false,
    cookie: 'locale',
    queryParameter: 'lang',
    autoReload: true,
    api: {
        __: 't',
        __n: 'tn'
    }
});

module.exports = i18n; 