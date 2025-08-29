const path = require('path');

function configViewEngine(app) {
  app.set('views', path.join(__dirname, '..', 'views'));
  app.set('view engine', 'ejs');
}

module.exports = configViewEngine;
