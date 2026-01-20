const mqtt = require('mqtt');
const SensorData = require('../models/SensorData');
const Device = require('../models/Device');
const { io } = require('./socketService');
const logger = require('../utils/logger');

class MQTTService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.topics = new Set();
    }

    connect() {
        const brokerUrl = process.env.MQTT_BROKER_URL || 'mqtt://test.mosquitto.org';
        
        this.client = mqtt.connect(brokerUrl, {
            clientId: `iot_dashboard_${Date.now()}`,
            clean: true,
            connectTimeout: 4000,
            reconnectPeriod: 1000,
        });

        // Event handlers
        this.client.on('connect', () => {
            this.connected = true;
            logger.info(`MQTT Connected to ${brokerUrl}`);
            this.subscribeToDefaultTopics();
        });

        this.client.on('message', this.handleMessage.bind(this));
        
        this.client.on('error', (error) => {
            logger.error(`MQTT Error: ${error.message}`);
            this.connected = false;
        });

        this.client.on('close', () => {
            logger.warn('MQTT Connection closed');
            this.connected = false;
        });
    }

    subscribeToDefaultTopics() {
        const defaultTopics = [
            'iot/+/data',
            'iot/+/status',
            'iot/+/command',
            'devices/+/telemetry'
        ];

        defaultTopics.forEach(topic => {
            this.subscribe(topic);
        });
    }

    subscribe(topic) {
        if (this.connected && this.client) {
            this.client.subscribe(topic, (err) => {
                if (err) {
                    logger.error(`Failed to subscribe to ${topic}: ${err.message}`);
                } else {
                    this.topics.add(topic);
                    logger.info(`Subscribed to topic: ${topic}`);
                }
            });
        }
    }

    async handleMessage(topic, message) {
        try {
            const payload = JSON.parse(message.toString());
            logger.debug(`Received MQTT message on ${topic}: ${JSON.stringify(payload)}`);

            
            const topicParts = topic.split('/');
            const deviceId = topicParts[1] || payload.deviceId;

            if (!deviceId) {
                logger.warn(`No device ID found in topic: ${topic}`);
                return;
            }

           
            if (topic.endsWith('/data') || topic.endsWith('/telemetry')) {
                await this.handleSensorData(deviceId, payload);
            } else if (topic.endsWith('/status')) {
                await this.handleDeviceStatus(deviceId, payload);
            }

           
            this.emitRealTimeUpdate(deviceId, topic, payload);

        } catch (error) {
            logger.error(`Error processing MQTT message: ${error.message}`);
        }
    }

    emitDeviceUpdate(type, device) {
    if (io) {
        io.emit('device:update', {
            type: type,
            device: device,
            timestamp: new Date()
        });
    }
}

    async handleSensorData(deviceId, payload) {
        try {
           
            const sensorData = new SensorData({
                deviceId,
                timestamp: payload.timestamp || new Date(),
                data: payload.data || payload,
                unit: payload.unit,
                metadata: payload.metadata
            });

            await sensorData.save();

           
            await Device.findOneAndUpdate(
                { deviceId },
                { 
                    lastSeen: new Date(),
                    isConnected: true,
                    status: 'active'
                },
                { upsert: true, new: true }
            );

                const existingDevice = await Device.findOne({ deviceId });
        if (!existingDevice) {
           
            const newDevice = await Device.create({
                deviceId,
                name: deviceId,
                type: payload.type || 'custom',
                location: payload.location || 'Unknown',
                status: 'active',
                isConnected: true
            });
             this.emitDeviceUpdate('added', newDevice);
        }
            logger.debug(`Saved sensor data for device: ${deviceId}`);

        } catch (error) {
            logger.error(`Error saving sensor data: ${error.message}`);
        }
    }

    async handleDeviceStatus(deviceId, payload) {
        try {
            await Device.findOneAndUpdate(
                { deviceId },
                {
                    status: payload.status || 'active',
                    isConnected: payload.connected !== undefined ? payload.connected : true,
                    lastSeen: new Date(),
                    ...payload
                },
                { upsert: true, new: true }
            );

            logger.debug(`Updated status for device: ${deviceId}`);

        } catch (error) {
            logger.error(`Error updating device status: ${error.message}`);
        }
    }

    emitRealTimeUpdate(deviceId, topic, payload) {
        if (io) {
            
            io.to(`device:${deviceId}`).emit('device:data', {
                deviceId,
                topic,
                timestamp: new Date(),
                data: payload
            });

           
            io.emit('dashboard:update', {
                type: 'data',
                deviceId,
                timestamp: new Date(),
                data: payload
            });
        }
    }

    publish(topic, message) {
        if (this.connected && this.client) {
            const payload = typeof message === 'object' ? JSON.stringify(message) : message;
            this.client.publish(topic, payload);
            logger.debug(`Published to ${topic}: ${payload}`);
        }
    }

    disconnect() {
        if (this.client) {
            this.client.end();
            this.connected = false;
        }
    }
}

module.exports = new MQTTService();