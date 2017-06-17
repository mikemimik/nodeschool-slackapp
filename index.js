'use strict';

const express = require('express');
const app = express();

app.set('port', (process.env.PORT || 5000));
app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => {
  res.send('Hello World!')
});

app.post('/checkin', (req, res) => {
  // const { params, query, headers, body } = req;
  const keys = Object.keys(req);
  console.log('body:', body);
  console.log('keys:', keys);

  // todo: check `token`
  // todo: check `team_id`

  // todo: set header of response `application/json`
  // todo: response with 200 "OK"

  /**
   * {
   *  text: "some reply",
   *  attachments: [
   *    {
   *      text: "looks like quoted text"
   *    }
   *  ]
   * }
   */
  res.end();
});

app.listen(app.get('port'), function() {
  console.log("Node app is running at localhost:" + app.get('port'));
});
