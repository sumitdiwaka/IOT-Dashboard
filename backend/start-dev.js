const DeviceSimulator = require('./src/utils/deviceSimulator');

// Start the backend server
require('./src/app');

// Start device simulator after a delay
setTimeout(() => {
    const simulator = new DeviceSimulator();
    simulator.connect();
    console.log('Device simulator started');
}, 3000);