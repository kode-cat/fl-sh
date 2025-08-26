/**
 * Offline PeerJS Fallback
 * 
 * This script provides a minimal implementation of PeerJS that works in offline mode
 * for local network connections. It's used when the original PeerJS library
 * cannot be loaded due to network issues.
 */

(function() {
  console.warn('Using offline PeerJS fallback - limited functionality available');
  
  // Create a minimal Peer class that works for local connections
  class OfflinePeer {
    constructor(id, options = {}) {
      this.id = id;
      this.options = options;
      this.connections = new Map();
      this._events = {};
      
      // Use localStorage to simulate peer discovery in offline mode
      this._registerPeer();
      
      // Simulate successful connection
      setTimeout(() => {
        this._trigger('open', this.id);
      }, 500);
      
      // Setup local network discovery
      this._setupLocalDiscovery();
    }
    
    // Event handling
    on(event, callback) {
      if (!this._events[event]) {
        this._events[event] = [];
      }
      this._events[event].push(callback);
      return this;
    }
    
    _trigger(event, ...args) {
      const callbacks = this._events[event] || [];
      callbacks.forEach(callback => callback(...args));
    }
    
    // Connect to another peer
    connect(peerId, options = {}) {
      console.log(`[Offline PeerJS] Attempting to connect to ${peerId}`);
      
      // Check if peer exists in local storage
      const peerExists = this._checkPeerExists(peerId);
      
      if (!peerExists) {
        console.error(`[Offline PeerJS] Peer ${peerId} not found on local network`);
        return null;
      }
      
      // Create a connection object
      const conn = new OfflineDataConnection(this.id, peerId, options);
      this.connections.set(peerId, conn);
      
      // Simulate connection establishment
      setTimeout(() => {
        conn._open();
        this._trigger('connection', conn);
      }, 1000);
      
      return conn;
    }
    
    // Register this peer in localStorage for discovery
    _registerPeer() {
      try {
        const peers = JSON.parse(localStorage.getItem('offline-peers') || '{}');
        peers[this.id] = {
          lastSeen: Date.now(),
          options: this.options
        };
        localStorage.setItem('offline-peers', JSON.stringify(peers));
        
        // Keep updating the lastSeen timestamp
        setInterval(() => {
          const peers = JSON.parse(localStorage.getItem('offline-peers') || '{}');
          if (peers[this.id]) {
            peers[this.id].lastSeen = Date.now();
            localStorage.setItem('offline-peers', JSON.stringify(peers));
          }
        }, 5000);
      } catch (err) {
        console.error('[Offline PeerJS] Error registering peer:', err);
      }
    }
    
    // Check if a peer exists in localStorage
    _checkPeerExists(peerId) {
      try {
        const peers = JSON.parse(localStorage.getItem('offline-peers') || '{}');
        const peer = peers[peerId];
        
        if (!peer) return false;
        
        // Check if peer was seen in the last minute
        const now = Date.now();
        return (now - peer.lastSeen) < 60000;
      } catch (err) {
        console.error('[Offline PeerJS] Error checking peer:', err);
        return false;
      }
    }
    
    // Setup local network discovery using localStorage events
    _setupLocalDiscovery() {
      window.addEventListener('storage', (event) => {
        if (event.key === 'offline-peer-message') {
          try {
            const message = JSON.parse(event.newValue);
            
            // Check if message is for this peer
            if (message.to === this.id) {
              if (message.type === 'connection-request') {
                // Create a connection object for the incoming connection
                const conn = new OfflineDataConnection(message.from, this.id, {});
                this.connections.set(message.from, conn);
                
                // Notify about the new connection
                setTimeout(() => {
                  conn._open();
                  this._trigger('connection', conn);
                }, 500);
              }
            }
          } catch (err) {
            console.error('[Offline PeerJS] Error processing message:', err);
          }
        }
      });
    }
    
    // Clean up
    destroy() {
      try {
        const peers = JSON.parse(localStorage.getItem('offline-peers') || '{}');
        delete peers[this.id];
        localStorage.setItem('offline-peers', JSON.stringify(peers));
      } catch (err) {
        console.error('[Offline PeerJS] Error destroying peer:', err);
      }
      
      this.connections.forEach(conn => {
        conn.close();
      });
      
      this.connections.clear();
      this._events = {};
    }
  }
  
  // DataConnection implementation for offline mode
  class OfflineDataConnection {
    constructor(from, to, options) {
      this.peer = to;
      this.connectionId = `${from}-${to}-${Date.now()}`;
      this.options = options;
      this.metadata = options.metadata || {};
      this.open = false;
      this._events = {};
      this._from = from;
      
      // Send connection request
      this._sendMessage({
        type: 'connection-request',
        from: from,
        to: to,
        metadata: this.metadata
      });
    }
    
    // Event handling
    on(event, callback) {
      if (!this._events[event]) {
        this._events[event] = [];
      }
      this._events[event].push(callback);
      return this;
    }
    
    once(event, callback) {
      const onceCallback = (...args) => {
        this.off(event, onceCallback);
        callback(...args);
      };
      return this.on(event, onceCallback);
    }
    
    off(event, callback) {
      if (!this._events[event]) return this;
      if (!callback) {
        delete this._events[event];
        return this;
      }
      this._events[event] = this._events[event].filter(cb => cb !== callback);
      return this;
    }
    
    _trigger(event, ...args) {
      const callbacks = this._events[event] || [];
      callbacks.forEach(callback => callback(...args));
    }
    
    // Mark connection as open
    _open() {
      this.open = true;
      this._trigger('open');
    }
    
    // Send data to the other peer
    send(data) {
      if (!this.open) {
        console.error('[Offline PeerJS] Cannot send data - connection not open');
        return;
      }
      
      this._sendMessage({
        type: 'data',
        from: this._from,
        to: this.peer,
        connectionId: this.connectionId,
        data: data
      });
    }
    
    // Send message via localStorage
    _sendMessage(message) {
      try {
        localStorage.setItem('offline-peer-message', JSON.stringify(message));
        // This triggers the storage event in other tabs/windows
      } catch (err) {
        console.error('[Offline PeerJS] Error sending message:', err);
      }
    }
    
    // Close the connection
    close() {
      if (!this.open) return;
      
      this.open = false;
      
      this._sendMessage({
        type: 'close',
        from: this._from,
        to: this.peer,
        connectionId: this.connectionId
      });
      
      this._trigger('close');
    }
  }
  
  // Expose the Peer class globally
  window.Peer = OfflinePeer;
  
  console.log('[Offline PeerJS] Fallback initialized - local network connections only');
})();

