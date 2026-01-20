// import { io } from 'socket.io-client';

// const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// class SocketService {
//   constructor() {
//     this.socket = null;
//     this.listeners = new Map();
//     this.isConnected = false;
//   }

//   connect() {
//     if (this.socket && this.isConnected) return;

//     this.socket = io(SOCKET_URL, {
//       transports: ['websocket', 'polling'],
//       reconnection: true,
//       reconnectionAttempts: 5,
//       reconnectionDelay: 1000,
//     });

//     this.socket.on('connect', () => {
//       this.isConnected = true;
//       console.log('Socket connected:', this.socket.id);
//       this.emitEvent('socket:connected', { connected: true });
//     });

//     this.socket.on('disconnect', () => {
//       this.isConnected = false;
//       console.log('Socket disconnected');
//       this.emitEvent('socket:disconnected', { connected: false });
//     });

//     this.socket.on('connect_error', (error) => {
//       console.error('Socket connection error:', error);
//       this.emitEvent('socket:error', { error: error.message });
//     });

//     // Listen for real-time updates
//    this.socket.on('device:added', (data) => {
//     console.log('New device added:', data);
//     this.emitEvent('device:added', data);
// });

// this.socket.on('device:updated', (data) => {
//     console.log('Device updated:', data);
//     this.emitEvent('device:updated', data);
// });

// this.socket.on('device:deleted', (data) => {
//     console.log('Device deleted:', data);
//     this.emitEvent('device:deleted', data);
// });;

//     this.socket.on('dashboard:update', (data) => {
//       this.emitEvent('dashboard:update', data);
//     });
//     // this.socket.on('device:update', (data) => {
// //     console.log('Device update received:', data);
// //     this.emitEvent('device:update', data);
// // });
//   }

//   disconnect() {
//     if (this.socket) {
//       this.socket.disconnect();
//       this.socket = null;
//       this.isConnected = false;
//     }
//   }

//   joinDeviceRoom(deviceId) {
//     if (this.socket && this.isConnected) {
//       this.socket.emit('join:device', deviceId);
//     }
//   }

//   leaveDeviceRoom(deviceId) {
//     if (this.socket && this.isConnected) {
//       this.socket.emit('leave:device', deviceId);
//     }
//   }

//   sendCommand(deviceId, command, payload = {}) {
//     if (this.socket && this.isConnected) {
//       this.socket.emit('device:command', { deviceId, command, payload });
//     }
//   }

//   // Event subscription
//   subscribe(event, callback) {
//     if (!this.listeners.has(event)) {
//       this.listeners.set(event, new Set());
//     }
//     this.listeners.get(event).add(callback);
//   }

//   unsubscribe(event, callback) {
//     if (this.listeners.has(event)) {
//       this.listeners.get(event).delete(callback);
//     }
//   }

//   emitEvent(event, data) {
//     if (this.listeners.has(event)) {
//       this.listeners.get(event).forEach(callback => {
//         try {
//           callback(data);
//         } catch (error) {
//           console.error(`Error in ${event} callback:`, error);
//         }
//       });
//     }
//   }
// }

// // Singleton instance
// const socketService = new SocketService();
// export default socketService;

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    if (!SocketService.instance) {
      this.socket = null;
      this.listeners = new Map();
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      
      // Create singleton instance
      SocketService.instance = this;
    }
    return SocketService.instance;
  }

  // Singleton pattern
  static getInstance() {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  connect() {
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return;
    }

    // If socket exists but disconnected, clean up
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    console.log('Connecting to socket:', SOCKET_URL);
    
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: true,
      autoConnect: true
    });

    this.setupEventHandlers();
  }

  setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Socket connected:', this.socket.id);
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emitEvent('socket:connected', { connected: true, socketId: this.socket.id });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      this.isConnected = false;
      this.emitEvent('socket:disconnected', { connected: false, reason });
      
      // Auto-reconnect
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        setTimeout(() => {
          console.log(`Attempting reconnect ${this.reconnectAttempts}/${this.maxReconnectAttempts}`);
          this.connect();
        }, 2000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.emitEvent('socket:error', { error: error.message });
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`✅ Reconnected after ${attemptNumber} attempts`);
      this.isConnected = true;
    });

    // Listen for real-time updates
    this.socket.on('device:data', (data) => {
      this.emitEvent('device:data', data);
    });

    this.socket.on('dashboard:update', (data) => {
      this.emitEvent('dashboard:update', data);
    });

    this.socket.on('device:added', (data) => {
      this.emitEvent('device:added', data);
    });

    this.socket.on('device:updated', (data) => {
      this.emitEvent('device:updated', data);
    });

    this.socket.on('device:deleted', (data) => {
      this.emitEvent('device:deleted', data);
    });
  }

  disconnect() {
    if (this.socket) {
      console.log('Disconnecting socket...');
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

  // Keep alive check
  isAlive() {
    return this.socket && this.socket.connected;
  }
}

// Create singleton instance
const socketService = new SocketService();

// Auto-connect on import
if (typeof window !== 'undefined') {
  // Connect after a small delay
  setTimeout(() => {
    socketService.connect();
  }, 1000);
  
  // Keep connection alive
  setInterval(() => {
    if (socketService.isConnected && socketService.socket) {
      socketService.socket.emit('ping', { timestamp: Date.now() });
    }
  }, 30000);
}

export default socketService;