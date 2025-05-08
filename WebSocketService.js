// src/services/WebSocketService.js
class WebSocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.onDataReceived = null;
    this.onConnectionChanged = null;
    this.onError = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.connectionUrl = null;
  }

  async connect(ip = null) {
    try {
      // If IP address not provided
      if (!ip) {
        // Use prompt to get IP from user
        ip = prompt("Please enter the IP Address of your Test1 device:", "192.168.1."); 
        if (!ip) {
          this.handleError("IP Address not received");
          return false;
        }
      }

      // Validate IP format
      if (!this.validateIpAddress(ip)) {
        this.handleError("Invalid IP Address");
        return false;
      }

      // Cancel existing connection if any
      if (this.socket) {
        this.disconnect();
      }

      console.log("Connecting to:", ip);
      this.connectionUrl = `ws://${ip}/ws`;
      
      // Create WebSocket connection
      this.socket = new WebSocket(this.connectionUrl);

      // Set event handlers
      this.socket.onopen = () => {
        console.log("WebSocket connection successful");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        
        if (this.onConnectionChanged) {
          this.onConnectionChanged(true);
        }
      };

      this.socket.onmessage = (event) => {
        const data = event.data;
        console.log("Received data:", data);
        
        if (this.onDataReceived) {
          this.onDataReceived(data);
        }
      };

      this.socket.onclose = (event) => {
        console.log("WebSocket closed:", event.code, event.reason);
        this.isConnected = false;
        
        if (this.onConnectionChanged) {
          this.onConnectionChanged(false);
        }
        
        // Try to reconnect (if within attempt limit)
        if (this.reconnectAttempts < this.maxReconnectAttempts && this.connectionUrl) {
          console.log(`Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
          this.reconnectAttempts++;
          setTimeout(() => this.connect(), 3000);
        }
      };

      this.socket.onerror = (error) => {
        console.error("WebSocket error:", error);
        this.handleError("Error connecting to WebSocket");
      };

      // Wait for connection to complete
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.socket.readyState === WebSocket.OPEN) {
            resolve(true);
          } else if (this.socket.readyState === WebSocket.CLOSED || this.socket.readyState === WebSocket.CLOSING) {
            resolve(false);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });

    } catch (error) {
      this.handleError(`Connection error: ${error.message}`);
      console.error("Error details:", error);
      return false;
    }
  }

  async disconnect() {
    if (this.socket) {
      console.log("Disconnecting WebSocket...");
      
      // Set not to attempt reconnection
      this.reconnectAttempts = this.maxReconnectAttempts;
      
      try {
        this.socket.close();
      } catch (error) {
        console.error("Error closing WebSocket:", error);
      }
      
      this.socket = null;
      this.isConnected = false;
      this.connectionUrl = null;
      
      if (this.onConnectionChanged) {
        this.onConnectionChanged(false);
      }
      
      console.log("Disconnected successfully");
    }
    
    return true;
  }

  async sendCommand(command) {
    if (!this.isConnected || !this.socket || this.socket.readyState !== WebSocket.OPEN) {
      this.handleError("Not connected to device");
      return false;
    }
    
    try {
      console.log("Sending command:", command);
      this.socket.send(command);
      console.log("Command sent successfully");
      return true;
    } catch (error) {
      this.handleError(`Command failed: ${error.message}`);
      console.error("Command error details:", error);
      return false;
    }
  }

  validateIpAddress(ip) {
    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipRegex.test(ip);
  }

  handleError(message) {
    console.error(message);
    if (this.onError) {
      this.onError(message);
    }
  }
}

export default new WebSocketService();