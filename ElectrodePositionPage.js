import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Alert, Badge } from 'react-bootstrap';
import { useECG } from '../context/ECGContext';
import WebSocketService from '../services/WebSocketService';

const ElectrodePositionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    switchLead, 
    isConnected: contextIsConnected, 
    updateConnectionStatus,
    deviceIP,
    updateDeviceIP
  } = useECG();
  
  // อ่านค่า lead จาก query parameter
  const queryParams = new URLSearchParams(location.search);
  const leadParam = queryParams.get('lead');
  
  // สถานะเฉพาะหน้านี้
  const [error, setError] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [ipAddress, setIpAddress] = useState(deviceIP || '');
  
  // กำหนดค่า selectedLead เริ่มต้นจาก query parameter หรือใช้ค่า 'I' ถ้าไม่มี
  const [selectedLead, setSelectedLead] = useState(() => {
    if (leadParam) {
      // ถ้ามี lead ใน URL ให้แปลงเป็นรูปแบบที่ถูกต้อง ('I', 'II', 'III')
      const leadNumber = parseInt(leadParam);
      if (leadNumber === 1) return 'I';
      if (leadNumber === 2) return 'II';
      if (leadNumber === 3) return 'III';
    }
    return 'I'; // ค่าเริ่มต้น
  });

  useEffect(() => {
    const autoConnect = async () => {
      if (!contextIsConnected && deviceIP) {
        try {
          console.log('Auto-connecting to device:', deviceIP);
          await WebSocketService.connect(deviceIP);
        } catch (error) {
          console.error('Auto-connect failed:', error);
        }
      }
    };
    
    autoConnect();
    
    // เมื่อเปลี่ยนหน้า ให้บันทึกค่า lead ไปยัง ECGContext
    if (leadParam) {
      const leadNumber = parseInt(leadParam);
      if (leadNumber >= 1 && leadNumber <= 3) {
        switchLead(leadNumber);
      }
    }
    
    // Setup WebSocket callbacks
    WebSocketService.onConnectionChanged = (connected) => {
      updateConnectionStatus(connected);
      if (connected) {
        setError('');
      }
    };
    
    WebSocketService.onError = (message) => {
      setError(message);
    };
    
    return () => {
      // Cleanup
      WebSocketService.onConnectionChanged = null;
      WebSocketService.onError = null;
    };
  }, [contextIsConnected, deviceIP, leadParam, switchLead, updateConnectionStatus]);

  // Function to handle connection
  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      if (ipAddress) {
        updateDeviceIP(ipAddress);
      }
      
      const success = await WebSocketService.connect(ipAddress);
      if (!success) {
        setError('Could not connect to device');
      } else {
        setShowConnectModal(false);
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    } finally {
      setIsConnecting(false);
    }
  };

  // Function to handle navigation to measurement page
  const handleStartRecording = () => {
    let leadNumber = 1;
    if (selectedLead === 'II') leadNumber = 2;
    if (selectedLead === 'III') leadNumber = 3;
    
    switchLead(leadNumber);
    navigate('/measure');
  };
  
  // Function to handle lead selection
  const handleLeadSelection = (lead) => {
    setSelectedLead(lead);
    
    let leadNumber = 1;
    if (lead === 'II') leadNumber = 2;
    if (lead === 'III') leadNumber = 3;
    switchLead(leadNumber);
  };
  
  // Function to go back
  const handleGoBack = () => {
    navigate('/');
  };

  // Generate SVG for different lead positions
  const getPlaceholderSVG = (lead) => {
    if (lead === 'I') {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><path d="M200,20 C270,20 330,80 330,150 C330,220 270,280 200,280 C130,280 70,220 70,150 C70,80 130,20 200,20 Z" fill="none" stroke="black" stroke-width="2"/><circle cx="120" cy="120" r="20" fill="#8B4513"/><circle cx="280" cy="120" r="20" fill="#DAA520"/><circle cx="200" cy="170" r="30" stroke="black" fill="white" stroke-width="2"/><text x="200" y="175" font-family="Arial" font-size="12" text-anchor="middle">WATJAI</text><text x="200" y="320" font-family="Arial" font-size="16" text-anchor="middle" font-weight="bold">Lead I: RA - LA</text></svg>';
    } else if (lead === 'II') {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><path d="M200,20 C270,20 330,80 330,150 C330,220 270,280 200,280 C130,280 70,220 70,150 C70,80 130,20 200,20 Z" fill="none" stroke="black" stroke-width="2"/><circle cx="120" cy="120" r="20" fill="#8B4513"/><circle cx="240" cy="250" r="20" fill="#DAA520"/><circle cx="200" cy="170" r="30" stroke="black" fill="white" stroke-width="2"/><text x="200" y="175" font-family="Arial" font-size="12" text-anchor="middle">WATJAI</text><text x="200" y="320" font-family="Arial" font-size="16" text-anchor="middle" font-weight="bold">Lead II: RA - LL</text></svg>';
    } else {
      return 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><path d="M200,20 C270,20 330,80 330,150 C330,220 270,280 200,280 C130,280 70,220 70,150 C70,80 130,20 200,20 Z" fill="none" stroke="black" stroke-width="2"/><circle cx="280" cy="120" r="20" fill="#8B4513"/><circle cx="160" cy="250" r="20" fill="#DAA520"/><circle cx="200" cy="170" r="30" stroke="black" fill="white" stroke-width="2"/><text x="200" y="175" font-family="Arial" font-size="12" text-anchor="middle">WATJAI</text><text x="200" y="320" font-family="Arial" font-size="16" text-anchor="middle" font-weight="bold">Lead III: LA - LL</text></svg>';
    }
  };

  return (
    <div className="electrode-position-page">
      {/* Header Section */}
      <div className="page-header">
        <button className="back-button" onClick={handleGoBack}>
          ←
        </button>
        <h1 className="header-title">Position the Electrodes</h1>
      </div>
      
      {/* Connection Status Section */}
      <div className="connection-bar">
        <div className="d-flex justify-content-between align-items-center">
          {contextIsConnected ? (
            <Button variant="success" className="status-button" disabled>
              <span className="status-dot connected"></span>
              Connected
            </Button>
          ) : (
            <Button variant="danger" className="status-button" disabled>
              <span className="status-dot disconnected"></span>
              Disconnected
            </Button>
          )}
          
          {!contextIsConnected && (
            <Button
              variant="outline-primary"
              className="connect-button"
              onClick={() => setShowConnectModal(true)}
            >
              Connect
            </Button>
          )}
        </div>
      </div>
      
      <div className="main-content-container">
        {/* Left Side - Controls (on desktop) */}
        <div className="controls-section">
          <div className="lead-selection-container">
            <h2 className="section-title">Select Lead</h2>
            <div className="lead-buttons">
              <button 
                className={`lead-button ${selectedLead === 'I' ? 'active' : ''}`}
                onClick={() => handleLeadSelection('I')}
              >
                Lead I
              </button>
              <button 
                className={`lead-button ${selectedLead === 'II' ? 'active' : ''}`}
                onClick={() => handleLeadSelection('II')}
              >
                Lead II
              </button>
              <button 
                className={`lead-button ${selectedLead === 'III' ? 'active' : ''}`}
                onClick={() => handleLeadSelection('III')}
              >
                Lead III
              </button>
            </div>
          </div>
          
          <div className="action-container">
            <Button 
              variant="primary" 
              className="action-button" 
              onClick={handleStartRecording}
              disabled={!contextIsConnected}
            >
              Start Recording
            </Button>
            
            {!contextIsConnected && (
              <div className="mt-3 text-danger text-center">
                <small>Please connect to a device before starting measurement</small>
              </div>
            )}
          </div>
        </div>
        
        {/* Right Side - Diagram (on desktop) */}
        <div className="diagram-section">
          <div className="diagram-frame">
            <div className="image-placeholder">
              {selectedLead === 'I' && (
                <img 
                  src="/images/lead-I-placement.png" 
                  alt="Lead I Electrode Placement" 
                  className="diagram-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getPlaceholderSVG('I');
                  }}
                />
              )}
              {selectedLead === 'II' && (
                <img 
                  src="/images/lead-II-placement.png" 
                  alt="Lead II Electrode Placement" 
                  className="diagram-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getPlaceholderSVG('II');
                  }}
                />
              )}
              {selectedLead === 'III' && (
                <img 
                  src="/images/lead-III-placement.png" 
                  alt="Lead III Electrode Placement" 
                  className="diagram-image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = getPlaceholderSVG('III');
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Connection Modal */}
      {showConnectModal && (
        <div className="modal-overlay">
          <div className="connection-modal">
            <div className="modal-header">
              <h5 className="mb-0">Connect to Device</h5>
              <button
                className="close-button"
                onClick={() => setShowConnectModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group mb-3">
                <label htmlFor="ipAddress" className="form-label fw-bold mb-2">Device IP Address:</label>
                <input
                  type="text"
                  id="ipAddress"
                  className="form-control form-control-lg"
                  placeholder="e.g., 192.168.1.100"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                />
                <small className="form-text text-muted mt-2">
                  Enter the IP Address of your ESP32 device connected to your WiFi network
                </small>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowConnectModal(false)}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleConnect}
                disabled={isConnecting || !ipAddress}
                className="rounded-pill"
              >
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Error Alert */}
      {error && (
        <Alert 
          variant="danger" 
          className="error-alert"
          onClose={() => setError('')} 
          dismissible
        >
          {error}
        </Alert>
      )}
      
      <style jsx>{`
        .electrode-position-page {
          width: 100%;
          min-height: 100vh;
          background-color: #f5f7fa;
        }
        
        .page-header {
          display: flex;
          align-items: center;
          background-color: white;
          padding: 15px 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          margin-bottom: 20px;
        }
        
        .back-button {
          background: none;
          border: none;
          font-size: 22px;
          margin-right: 15px;
          cursor: pointer;
          color: #333;
          font-weight: bold;
        }
        
        .header-title {
          font-size: 20px;
          font-weight: 600;
          margin: 0;
          color: #333;
        }
        
        .connection-bar {
          padding: 10px 20px;
          background-color: white;
          margin: 0 auto 20px auto;
          max-width: 1200px;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .status-button {
          pointer-events: none;
          padding: 8px 16px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .status-dot {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
        }
        
        .status-dot.connected {
          background-color: white;
        }
        
        .status-dot.disconnected {
          background-color: white;
        }
        
        .connect-button {
          border-radius: 20px;
          padding: 6px 16px;
        }
        
        .main-content-container {
          display: flex;
          flex-direction: column-reverse;
          padding: 0 20px;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .controls-section {
          margin-bottom: 20px;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 15px;
          color: #333;
        }
        
        .lead-selection-container {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .lead-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .lead-button {
          padding: 15px;
          border-radius: 10px;
          background-color: white;
          border: 2px solid #e5e7eb;
          font-weight: 600;
          font-size: 16px;
          color: #333;
          display: flex;
          justify-content: center;
          align-items: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .lead-button.active {
          background-color: #3b5bdb;
          color: white;
          border-color: #3b5bdb;
          box-shadow: 0 4px 8px rgba(59, 91, 219, 0.25);
        }
        
        .lead-button:hover:not(.active) {
          border-color: #3b5bdb;
          background-color: #f5f7ff;
        }
        
        .action-container {
          background-color: white;
          border-radius: 10px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .action-button {
          width: 100%;
          border-radius: 10px;
          background-color: #3b5bdb;
          border: none;
          color: white;
          font-weight: 600;
          font-size: 18px;
          padding: 14px 0;
          text-transform: uppercase;
          letter-spacing: 1px;
          box-shadow: 0 4px 8px rgba(59, 91, 219, 0.25);
          transition: all 0.2s ease;
        }
        
        .action-button:hover:not(:disabled) {
          background-color: #2b4db3;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(59, 91, 219, 0.3);
        }
        
        .action-button:disabled {
          background-color: #a0aec0;
          opacity: 0.7;
        }
        
        .diagram-section {
          margin-bottom: 20px;
        }
        
        .diagram-frame {
          width: 100%;
          aspect-ratio: 1 / 1;
          border-radius: 10px;
          overflow: hidden;
          background-color: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 15px;
        }
        
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }
        
        .diagram-image {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        
        .error-alert {
          margin: 20px auto;
          border-radius: 10px;
          max-width: 1200px;
        }
        
        /* Modal styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        
        .connection-modal {
          background-color: white;
          border-radius: 12px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .modal-body {
          padding: 20px;
        }
        
        .modal-footer {
          padding: 20px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 24px;
          cursor: pointer;
          color: #666;
        }
        
        /* Responsive Layout for Desktop */
        @media (min-width: 992px) {
          .main-content-container {
            flex-direction: row;
            gap: 30px;
          }
          
          .controls-section {
            flex: 0 0 350px;
            margin-bottom: 0;
          }
          
          .diagram-section {
            flex: 1;
          }
          
          .diagram-frame {
            max-height: 600px;
          }
          
          .lead-buttons {
            flex-direction: column;
          }
        }
        
        /* Medium Screens */
        @media (min-width: 768px) and (max-width: 991.98px) {
          .lead-buttons {
            flex-direction: row;
          }
          
          .lead-button {
            flex: 1;
          }
          
          .diagram-frame {
            max-width: 600px;
            margin: 0 auto;
          }
        }
        
        /* Mobile Screens */
        @media (max-width: 767.98px) {
          .lead-buttons {
            flex-direction: row;
          }
          
          .lead-button {
            flex: 1;
            padding: 12px;
            font-size: 14px;
          }
          
          .action-button {
            font-size: 16px;
            padding: 12px 0;
          }
        }
      `}</style>
    </div>
  );
};

export default ElectrodePositionPage;