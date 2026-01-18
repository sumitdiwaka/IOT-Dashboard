const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ['temperature', 'humidity', 'pressure', 'motion', 'light', 'energy', 'custom']
    },
    location: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'offline', 'error'],
        default: 'active'
    },
    lastSeen: {
        type: Date,
        default: Date.now
    },
    metadata: {
        type: Map,
        of: String
    },
    isConnected: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Update timestamp on save
deviceSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Device', deviceSchema);