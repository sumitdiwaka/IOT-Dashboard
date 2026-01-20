const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const asyncHandler = require('express-async-handler');
const mqttService = require('../services/mqttService');
const { io } = require('../services/socketService');


const getDevices = asyncHandler(async (req, res) => {
    const devices = await Device.find().sort({ createdAt: -1 });
    res.json({
        success: true,
        count: devices.length,
        data: devices
    });
});


const getDevice = asyncHandler(async (req, res) => {
    const device = await Device.findOne({ deviceId: req.params.id });
    
    if (!device) {
        res.status(404);
        throw new Error('Device not found');
    }

    res.json({
        success: true,
        data: device
    });
});


const createDevice = asyncHandler(async (req, res) => {
    const { deviceId, name, type, location, metadata } = req.body;

   
    const deviceExists = await Device.findOne({ deviceId });
    if (deviceExists) {
        res.status(400);
        throw new Error('Device already exists');
    }

    const device = await Device.create({
        deviceId,
        name,
        type,
        location,
        metadata,
        status: 'active',
        isConnected: false
    });
        mqttService.emitDeviceUpdate('added', device);
  if (io) {
        io.emit('device:added', {
            type: 'device_added',
            device: device,
            timestamp: new Date(),
            message: `New device ${device.name} added`
        });
    }
    res.status(201).json({
        success: true,
        data: device
    });
});

const updateDevice = asyncHandler(async (req, res) => {
    const device = await Device.findOneAndUpdate(
        { deviceId: req.params.id },
        req.body,
        { new: true, runValidators: true }
    );

    if (!device) {
        res.status(404);
        throw new Error('Device not found');
    }
     mqttService.emitDeviceUpdate('updated', device);
  if (io) {
        io.emit('device:updated', {
            type: 'device_updated',
            device: device,
            timestamp: new Date()
        });
    }
    res.json({
        success: true,
        data: device
    });
});


const deleteDevice = asyncHandler(async (req, res) => {
    const device = await Device.findOneAndDelete({ deviceId: req.params.id });

    if (!device) {
        res.status(404);
        throw new Error('Device not found');
    }
 mqttService.emitDeviceUpdate('deleted', { deviceId: req.params.id });
 
     if (io) {
        io.emit('device:deleted', {
            type: 'device_deleted',
            deviceId: req.params.id,
            timestamp: new Date(),
            message: `Device ${device.name} removed`
        });
    }

 
 res.json({
        success: true,
        message: 'Device removed'
    });
});


const getDeviceData = asyncHandler(async (req, res) => {
    const { startDate, endDate, limit = 100 } = req.query;
    
    let query = { deviceId: req.params.id };
    
    // Add date filter if provided
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) query.timestamp.$gte = new Date(startDate);
        if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const data = await SensorData.find(query)
        .sort({ timestamp: -1 })
        .limit(parseInt(limit));

    res.json({
        success: true,
        count: data.length,
        data: data
    });
});


const getDeviceStats = asyncHandler(async (req, res) => {
    const deviceId = req.params.id;
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get today's data count
    const todayCount = await SensorData.countDocuments({
        deviceId,
        timestamp: { $gte: new Date(today.setHours(0, 0, 0, 0)) }
    });

    // Get yesterday's data count
    const yesterdayCount = await SensorData.countDocuments({
        deviceId,
        timestamp: { 
            $gte: new Date(yesterday.setHours(0, 0, 0, 0)),
            $lt: new Date(today.setHours(0, 0, 0, 0))
        }
    });

    // Get latest data point
    const latestData = await SensorData.findOne({ deviceId })
        .sort({ timestamp: -1 })
        .limit(1);

    res.json({
        success: true,
        data: {
            todayCount,
            yesterdayCount,
            change: todayCount - yesterdayCount,
            latestData: latestData || null,
            lastUpdated: latestData ? latestData.timestamp : null
        }
    });
});

module.exports = {
    getDevices,
    getDevice,
    createDevice,
    updateDevice,
    deleteDevice,
    getDeviceData,
    getDeviceStats
};