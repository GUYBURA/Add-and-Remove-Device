const express = require('express');
const router = express.Router();

// ดึงแต่ละโมดูล
const weather = require('./apiWeather');      // หรือ '../routes/weather.js'
const greenhouse = require('./apiGreenhouse');
const pump = require('./apiPump');

// ใช้ route prefix
router.use('/weather_station', weather);
router.use('/greenhouse', greenhouse);
router.use('/pump', pump);

module.exports = router;
