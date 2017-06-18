'use strict';

const express = require('express');
const router = express.Router();

router.route('/')
    .get((req, res, next) => {
        res.send('NodeSchool Toronto SlackApp Server Online');
    });

module.exports = router;