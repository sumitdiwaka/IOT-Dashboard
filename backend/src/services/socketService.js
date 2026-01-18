const socketIO = require('socket.io');

let io = null;

const initializeSocket = (server) => {
      io = socketIO(server, {
        cors: {
            origin: [
                "https://iot-dashboard-zvl5.onrender.com",
                "http://localhost:3000"
            ],
            methods: ["GET", "POST"],
            credentials: true
        }
    })

    io.on('connection', (socket) => {
        console.log(`New client connected: ${socket.id}`);

        // Join device-specific room
        socket.on('join:device', (deviceId) => {
            socket.join(`device:${deviceId}`);
            console.log(`Socket ${socket.id} joined device:${deviceId}`);
        });

        // Leave device room
        socket.on('leave:device', (deviceId) => {
            socket.leave(`device:${deviceId}`);
        });

        // Handle device commands
        socket.on('device:command', (data) => {
            const { deviceId, command, payload } = data;
            // Emit to specific device or broadcast
            io.to(`device:${deviceId}`).emit('device:command', { command, payload });
            console.log(`Command sent to device ${deviceId}: ${command}`);
        });

        socket.on('disconnect', () => {
            console.log(`Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = {
    initializeSocket,
    get io() {
        return io;
    },
    set io(value) {
        io = value;
    }
};