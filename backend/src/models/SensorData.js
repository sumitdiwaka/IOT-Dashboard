const mongoose = require('mongoose');

const sensorDataSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        index: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    data: {
        type: Map,
        of: mongoose.Schema.Types.Mixed,
        required: true
    },
    unit: {
        type: String
    },
    metadata: {
        type: Map,
        of: String
    }
}, {
    timeseries: {
        timeField: 'timestamp',
        metaField: 'deviceId',
        granularity: 'seconds'
    },
    expireAfterSeconds: 2592000 
});


sensorDataSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('SensorData', sensorDataSchema);