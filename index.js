'use strict';

const bodyParser = require('body-parser');
const express = require('express');
const app = express();

// APPLICATION FUNCTION
app.set('port', (process.env.PORT || 5000));
app.use(express.static(`${__dirname}/public`));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// APPLICATION ROUTES
app.use('/', require('./routes/index'));
app.use('/checkin', require('./routes/checkin'));
app.use('/links', require('./routes/links'));
app.use('/register', require('./routes/register'));

app.listen(app.get('port'), function () {
  console.log('Node app is running at localhost:' + app.get('port'));
});
