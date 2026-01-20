const Device = require('../models/Device');
const SensorData = require('../models/SensorData');
const asyncHandler = require('express-async-handler');


const getDashboardSummary = asyncHandler(async (req, res) => {
    const totalDevices = await Device.countDocuments();
    const activeDevices = await Device.countDocuments({ isConnected: true });
    const offlineDevices = await Device.countDocuments({ isConnected: false });

  
    const recentData = await SensorData.find()
        .sort({ timestamp: -1 })
        .limit(10)
        .populate('deviceId', 'name type');

 
    const deviceTypes = await Device.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({
        success: true,
        data: {
            totalDevices,
            activeDevices,
            offlineDevices,
            connectionRate: totalDevices > 0 ? (activeDevices / totalDevices * 100).toFixed(2) : 0,
            recentData,
            deviceTypes
        }
    });
});


const getRealTimeMetrics = asyncHandler(async (req, res) => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const metrics = await SensorData.aggregate([
        {
            $match: {
                timestamp: { $gte: oneHourAgo }
            }
        },
        {
            $group: {
                _id: null,
                totalReadings: { $sum: 1 },
                devicesTracked: { $addToSet: "$deviceId" }
            }
        },
        {
            $project: {
                totalReadings: 1,
                activeDevicesCount: { $size: "$devicesTracked" }
            }
        }
    ]);

    res.json({
        success: true,
        data: metrics[0] || { totalReadings: 0, activeDevicesCount: 0 }
    });
});


const getTimeSeriesData = asyncHandler(async (req, res) => {
    const { deviceId, hours = 24 } = req.query;
    const timeAgo = new Date(Date.now() - hours * 60 * 60 * 1000);

    let matchQuery = { timestamp: { $gte: timeAgo } };
    if (deviceId) {
        matchQuery.deviceId = deviceId;
    }

    const timeSeriesData = await SensorData.aggregate([
        { $match: matchQuery },
        {
            $group: {
                _id: {
                    hour: { $hour: "$timestamp" },
                    deviceId: "$deviceId"
                },
                avgValue: { $avg: { $toDouble: { $arrayElemAt: [{ $objectToArray: "$data" }, 0] } } },
                maxValue: { $max: { $toDouble: { $arrayElemAt: [{ $objectToArray: "$data" }, 0] } } },
                minValue: { $min: { $toDouble: { $arrayElemAt: [{ $objectToArray: "$data" }, 0] } } },
                count: { $sum: 1 }
            }
        },
        { $sort: { "_id.hour": 1 } }
    ]);

    res.json({
        success: true,
        data: timeSeriesData
    });
});

module.exports = {
    getDashboardSummary,
    getRealTimeMetrics,
    getTimeSeriesData
};