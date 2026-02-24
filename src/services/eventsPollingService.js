import { getEvents, getAllSignups } from './eventsSupabaseService.js';

class EventsPollingService {
  constructor() {
    this.eventSubscribers = new Set();
    this.signupSubscribers = new Set();
    this.isPolling = false;
    this.pollInterval = 5000;
    this.lastEventsHash = null;
    this.lastSignupsHash = null;
    this.pollTimer = null;
  }

  subscribeEvents(callback) {
    this.eventSubscribers.add(callback);
    if (!this.isPolling) this.startPolling();
    return {
      unsubscribe: () => {
        this.eventSubscribers.delete(callback);
        if (this.eventSubscribers.size === 0 && this.signupSubscribers.size === 0) {
          this.stopPolling();
        }
      }
    };
  }

  subscribeSignups(callback) {
    this.signupSubscribers.add(callback);
    if (!this.isPolling) this.startPolling();
    return {
      unsubscribe: () => {
        this.signupSubscribers.delete(callback);
        if (this.eventSubscribers.size === 0 && this.signupSubscribers.size === 0) {
          this.stopPolling();
        }
      }
    };
  }

  startPolling() {
    if (this.isPolling) return;
    this.isPolling = true;

    this.pollTimer = setInterval(async () => {
      try {
        if (this.eventSubscribers.size > 0) {
          const events = await getEvents();
          const hash = JSON.stringify(events.map(e => ({ id: e.id, updatedAt: e.updatedAt })));
          if (this.lastEventsHash !== null && this.lastEventsHash !== hash) {
            this.eventSubscribers.forEach(cb => cb({ eventType: 'UPDATE', new: events }));
          }
          this.lastEventsHash = hash;
        }

        if (this.signupSubscribers.size > 0) {
          const signups = await getAllSignups();
          const hash = JSON.stringify(signups.map(s => ({ id: s.id, signedUpAt: s.signedUpAt })));
          if (this.lastSignupsHash !== null && this.lastSignupsHash !== hash) {
            this.signupSubscribers.forEach(cb => cb({ eventType: 'UPDATE', new: signups }));
          }
          this.lastSignupsHash = hash;
        }
      } catch (error) {
        console.error('Events polling error:', error);
      }
    }, this.pollInterval);
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }
}

const eventsPollingService = new EventsPollingService();
export default eventsPollingService;
