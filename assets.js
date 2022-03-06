'use strict';

module.exports = {
    client: {
        css: [
            'gemtool/static/css/style.css',
        ],
        js: [
            'gemtool/static/app/*.js',
            'gemtool/static/app/**/*.js'
        ],
        views: [
            'gemtool/templates/*.html',
            'gemtool/templates/**/*.html',
        ],
        templates: ['static/templates.js']
    },
    server: {
        gulpConfig: ['gulpfile.js']
    }
};
