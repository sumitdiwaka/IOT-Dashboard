import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
    this.isConnected = false;
  }

  connect() {
    if (this.socket && this.isConnected) return;

    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('Socket connected:', this.socket.id);
      this.emitEvent('socket:connected', { connected: true });
    });

    this.socket.on('disconnect', () => {
      this.isConnected = false;
      console.log('Socket disconnected');
      this.emitEvent('socket:disconnected', { connected: false });
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.emitEvent('socket:error', { error: error.message });
    });

    // Listen for real-time updates
   this.socket.on('device:added', (data) => {
    console.log('New device added:', data);
    this.emitEvent('device:added', data);
});

this.socket.on('device:updated', (data) => {
    console.log('Device updated:', data);
    this.emitEvent('device:updated', data);
});

this.socket.on('device:deleted', (data) => {
    console.log('Device deleted:', data);
    this.emitEvent('device:deleted', data);
});;

    this.socket.on('dashboard:update', (data) => {
      this.emitEvent('dashboard:update', data);
    });
    // this.socket.on('device:update', (data) => {
//     console.log('Device update received:', data);
//     this.emitEvent('device:update', data);
// });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinDeviceRoom(deviceId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('join:device', deviceId);
    }
  }

  leaveDeviceRoom(deviceId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave:device', deviceId);
    }
  }

  sendCommand(deviceId, command, payload = {}) {
    if (this.socket && this.isConnected) {
      this.socket.emit('device:command', { deviceId, command, payload });
    }
  }

  // Event subscription
  subscribe(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
  }

  unsubscribe(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emitEvent(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in ${event} callback:`, error);
        }
      });
    }
  }
}

// Singleton instance
const socketService = new SocketService();
export default socketService;