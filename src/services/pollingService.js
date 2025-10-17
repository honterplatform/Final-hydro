// Polling service for cross-user updates when real-time isn't available
import { getRepresentatives } from './supabaseService.js';

class PollingService {
  constructor() {
    this.subscribers = new Set();
    this.isPolling = false;
    this.pollInterval = 5000; // Poll every 5 seconds
    this.lastDataHash = null;
    this.pollTimer = null;
  }

  // Subscribe to updates
  subscribe(callback) {
    this.subscribers.add(callback);
    
    // Start polling if this is the first subscriber
    if (!this.isPolling) {
      this.startPolling();
    }

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
      
      // Stop polling if no more subscribers
      if (this.subscribers.size === 0) {
        this.stopPolling();
      }
    };
  }

  // Start polling for changes
  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    console.log('🔄 Starting polling for updates...');
    
    this.pollTimer = setInterval(async () => {
      try {
        const data = await getRepresentatives();
        const dataHash = this.hashData(data);
        
        // Only notify if data has changed
        if (this.lastDataHash !== null && this.lastDataHash !== dataHash) {
          console.log('📡 Data changed, notifying subscribers...');
          this.notifySubscribers(data);
        }
        
        this.lastDataHash = dataHash;
      } catch (error) {
        console.error('❌ Polling error:', error);
      }
    }, this.pollInterval);
  }

  // Stop polling
  stopPolling() {
    if (!this.isPolling) return;
    
    this.isPolling = false;
    console.log('🛑 Stopping polling...');
    
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  // Notify all subscribers
  notifySubscribers(data) {
    this.subscribers.forEach(callback => {
      try {
        callback({
          eventType: 'UPDATE',
          new: data,
          old: null
        });
      } catch (error) {
        console.error('❌ Error notifying subscriber:', error);
      }
    });
  }

  // Create a simple hash of the data to detect changes
  hashData(data) {
    if (!data || !Array.isArray(data)) return null;
    
    // Create a simple hash based on data length and first few items
    const hashData = {
      length: data.length,
      firstId: data[0]?.id,
      lastId: data[data.length - 1]?.id,
      sample: data.slice(0, 3).map(item => ({
        id: item.id,
        rep_name: item.rep_name,
        updated_at: item.updated_at
      }))
    };
    
    return JSON.stringify(hashData);
  }

  // Force a poll (useful for testing)
  async forcePoll() {
    try {
      const data = await getRepresentatives();
      this.notifySubscribers(data);
      return data;
    } catch (error) {
      console.error('❌ Force poll error:', error);
      throw error;
    }
  }
}

// Create a singleton instance
const pollingService = new PollingService();

export default pollingService;
