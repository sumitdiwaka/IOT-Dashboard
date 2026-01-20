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
      
      
      SocketService.instance = this;
    }
    return SocketService.instance;
  }


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


  isAlive() {
    return this.socket && this.socket.connected;
  }
}


const socketService = new SocketService();

if (typeof window !== 'undefined') {
  
  setTimeout(() => {
    socketService.connect();
  }, 1000);
  

  setInterval(() => {
    if (socketService.isConnected && socketService.socket) {
      socketService.socket.emit('ping', { timestamp: Date.now() });
    }
  }, 30000);
}

export default socketService;