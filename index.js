'use strict';

const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/checkin', (req, res) => {
  console.log('req:', req);
  res.end();
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
