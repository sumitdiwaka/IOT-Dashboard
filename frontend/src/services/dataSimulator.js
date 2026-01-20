class DataSimulator {
  constructor() {
    this.interval = null;
    this.subscribers = new Set();
    this.metrics = {
      totalReadings: 1250,
      activeDevices: 5,
      dataRate: 0,
      uptime: 48
    };
  }

  start() {
    if (this.interval) return;
    
    this.interval = setInterval(() => {
  
      this.metrics.totalReadings += Math.floor(Math.random() * 5) + 1;
      this.metrics.dataRate = Math.floor(Math.random() * 10) + 2;
      this.metrics.activeDevices = Math.floor(Math.random() * 3) + 3;
      
     
      this.notifySubscribers();
    }, 3000); 
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
  }

  unsubscribe(callback) {
    this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(callback => {
      callback({
        ...this.metrics,
        timestamp: new Date()
      });
    });
  }

  getMetrics() {
    return { ...this.metrics, timestamp: new Date() };
  }
}

export const dataSimulator = new DataSimulator();


if (typeof window !== 'undefined') {
  setTimeout(() => dataSimulator.start(), 2000);
}