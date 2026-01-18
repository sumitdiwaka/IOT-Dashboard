const mqtt = require('mqtt');
const logger = require('./logger');

class DeviceSimulator {
    constructor(brokerUrl = 'mqtt://test.mosquitto.org') {
        this.brokerUrl = brokerUrl;
        this.devices = [];
        this.intervals = {};
    }

    connect() {
        this.client = mqtt.connect(this.brokerUrl);
        
        this.client.on('connect', () => {
            logger.success('Device Simulator connected to MQTT broker');
            this.createDevices();
        });

        this.client.on('error', (error) => {
            logger.error(`Device Simulator error: ${error.message}`);
        });
    }

    createDevices() {
        // Create sample devices
        this.devices = [
            { id: 'temp-sensor-001', type: 'temperature', location: 'Living Room', min: 18, max: 30 },
            { id: 'temp-sensor-002', type: 'temperature', location: 'Bedroom', min: 20, max: 28 },
            { id: 'humidity-sensor-001', type: 'humidity', location: 'Kitchen', min: 40, max: 70 },
            { id: 'light-sensor-001', type: 'light', location: 'Office', min: 0, max: 1000 },
            { id: 'motion-sensor-001', type: 'motion', location: 'Entrance', min: 0, max: 1 }
        ];

        // Start publishing for each device
        this.devices.forEach(device => {
            this.startPublishing(device);
        });
    }

    startPublishing(device) {
        // Clear any existing interval
        if (this.intervals[device.id]) {
            clearInterval(this.intervals[device.id]);
        }

        // Set up interval for publishing
        this.intervals[device.id] = setInterval(() => {
            this.publishData(device);
        }, this.getPublishInterval(device.type));
    }

    getPublishInterval(type) {
        const intervals = {
            temperature: 5000,    // 5 seconds
            humidity: 10000,      // 10 seconds
            light: 3000,          // 3 seconds
            motion: 2000,         // 2 seconds
            default: 5000         // 5 seconds
        };
        return intervals[type] || intervals.default;
    }

    publishData(device) {
        const timestamp = new Date().toISOString();
        let data;

        switch(device.type) {
            case 'temperature':
                data = {
                    temperature: this.getRandomValue(device.min, device.max, 1),
                    unit: '°C'
                };
                break;
            case 'humidity':
                data = {
                    humidity: this.getRandomValue(device.min, device.max, 1),
                    unit: '%'
                };
                break;
            case 'light':
                data = {
                    lightLevel: this.getRandomValue(device.min, device.max),
                    unit: 'lux'
                };
                break;
            case 'motion':
                data = {
                    motion: Math.random() > 0.7 ? 1 : 0,
                    unit: 'boolean'
                };
                break;
            default:
                data = {
                    value: this.getRandomValue(device.min, device.max),
                    unit: 'units'
                };
        }

        const payload = {
            deviceId: device.id,
            timestamp,
            data,
            location: device.location,
            type: device.type
        };

        // Publish to MQTT
        const topic = `iot/${device.id}/data`;
        this.client.publish(topic, JSON.stringify(payload));
        
        logger.debug(`Published to ${topic}: ${JSON.stringify(data)}`);

        // Occasionally publish status
        if (Math.random() > 0.8) {
            this.publishStatus(device);
        }
    }

    publishStatus(device) {
        const statusPayload = {
            deviceId: device.id,
            status: 'active',
            connected: true,
            battery: this.getRandomValue(20, 100),
            signalStrength: this.getRandomValue(-80, -40),
            timestamp: new Date().toISOString()
        };

        const topic = `iot/${device.id}/status`;
        this.client.publish(topic, JSON.stringify(statusPayload));
    }

    getRandomValue(min, max, decimals = 0) {
        const value = Math.random() * (max - min) + min;
        return decimals ? parseFloat(value.toFixed(decimals)) : Math.round(value);
    }

    stopAll() {
        // Clear all intervals
        Object.values(this.intervals).forEach(interval => {
            clearInterval(interval);
        });
        this.intervals = {};

        // Disconnect MQTT
        if (this.client) {
            this.client.end();
        }
    }
}

// Run simulator if this file is executed directly
if (require.main === module) {
    const simulator = new DeviceSimulator();
    simulator.connect();
    
    // Handle shutdown
    process.on('SIGINT', () => {
        console.log('\nStopping device simulator...');
        simulator.stopAll();
        process.exit(0);
    });
}

module.exports = DeviceSimulator;