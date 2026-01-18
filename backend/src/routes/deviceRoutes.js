const express = require('express');
const router = express.Router();
const {
    getDevices,
    getDevice,
    createDevice,
    updateDevice,
    deleteDevice,
    getDeviceData,
    getDeviceStats
} = require('../controllers/deviceController');

router.route('/')
    .get(getDevices)
    .post(createDevice);

router.route('/:id')
    .get(getDevice)
    .put(updateDevice)
    .delete(deleteDevice);

router.route('/:id/data')
    .get(getDeviceData);

router.route('/:id/stats')
    .get(getDeviceStats);

module.exports = router;