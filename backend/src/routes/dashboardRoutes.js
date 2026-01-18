const express = require('express');
const router = express.Router();
const {
    getDashboardSummary,
    getRealTimeMetrics,
    getTimeSeriesData
} = require('../controllers/dashboardController');

router.route('/summary')
    .get(getDashboardSummary);

router.route('/metrics')
    .get(getRealTimeMetrics);

router.route('/timeseries')
    .get(getTimeSeriesData);

module.exports = router;