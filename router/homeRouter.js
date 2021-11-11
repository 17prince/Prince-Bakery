const express = require('express');

// CONTROLLERS
const homeController = require('../controller/homeController');

const router = express.Router();

router.route('/').get(homeController.getHomePage);

module.exports = router;
