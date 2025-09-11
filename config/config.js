const path = require('path')
require('dotenv').config()

const ROOT = path.resolve(__dirname, '..');

const paths = {
    root: ROOT,
    public: path.join(ROOT, 'public'),
    views: path.join(ROOT, 'src', 'views'),
    layouts: path.join(ROOT, 'src', 'views', 'layouts'),
    partials: path.join(ROOT, 'src', 'views', 'partials'),
};

module.exports = {
    PORT: process.env.PORT || 8080,
    getFilePath: (filename) => path.join(__dirname, `../data/${filename}`),
    paths
}