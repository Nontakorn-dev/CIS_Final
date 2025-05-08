import React, { useState, useEffect, useCallback } from 'react';
import { Button, Alert, ProgressBar, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import WebSocketService from '../services/WebSocketService';
import ApiService from '../services/ApiService';
import ECGChart from '../components/ECGChart';
import { useECG } from '../context/ECGContext';

const MobileMeasurementPage = () => {
  const navigate = useNavigate();
  const {
    currentLead,
    switchLead,
    saveLeadData,
    lead1Data,
    lead2Data,
    lead3Data,
    saveResults,
    isConnected: contextIsConnected,
    updateConnectionStatus,
    deviceIP
  } = useECG();
  
  const [isMeasuring, setIsMeasuring] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordingInterval, setRecordingInterval] = useState(null);
  const [error, setError] = useState('');
  const [receiveBuffer, setReceiveBuffer] = useState([]);
  const [lastReceivedData, setLastReceivedData] = useState([]);
  
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [ipAddress, setIpAddress] = useState(deviceIP);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const maxRecordingTimeSeconds = 15;
  
  // Auto-connect on page load
  useEffect(() => {
    const autoConnect = async () => {
      if (!contextIsConnected && deviceIP) {
        try {
          await WebSocketService.connect(deviceIP);
        } catch (error) {
          console.error('Auto-connect failed:', error);
        }
      }
    };
    
    autoConnect();
  }, [contextIsConnected, deviceIP]);
  
  // Save data for current lead
  const saveCurrentLeadData = useCallback((data) => {
    if (data.length > 0) {
      saveLeadData(currentLead, data);
    }
  }, [currentLead, saveLeadData]);
  
  // Process data received from ESP32
  const processReceivedData = useCallback((data) => {
    const lines = data.toString().split('\n');
    
    lines.forEach(line => {
      if (line.trim() === '') return;
      
      if (line.startsWith('STATUS:')) {
        // Status handling
      } else if (line.startsWith('BUFFER:FULL')) {
        saveCurrentLeadData([...receiveBuffer]);
        setReceiveBuffer([]);
      } else if (line.startsWith('DATA:START')) {
        setReceiveBuffer([]);
      } else if (line.startsWith('DATA:END')) {
        saveCurrentLeadData([...receiveBuffer]);
        setReceiveBuffer([]);
      } else if (line.includes(',')) {
        // Comma-separated ECG data
        const values = line.split(',').map(v => parseInt(v.trim()));
        setReceiveBuffer(prev => [...prev, ...values]);
        setLastReceivedData(prev => {
          const newData = [...prev, ...values];
          // Keep only last 500 points for display
          return newData.length > 500 ? newData.slice(newData.length - 500) : newData;
        });
      } else if (!isNaN(Number(line.trim()))) {
        // Single ECG data point
        const value = Number(line.trim());
        setReceiveBuffer(prev => [...prev, value]);
        setLastReceivedData(prev => {
          const newData = [...prev, value];
          // Keep only last 500 points for display
          return newData.length > 500 ? newData.slice(newData.length - 500) : newData;
        });
      }
    });
  }, [receiveBuffer, saveCurrentLeadData]);
  
  // Setup WebSocket callbacks
  useEffect(() => {
    WebSocketService.onConnectionChanged = (connected) => {
      updateConnectionStatus(connected);
      
      if (connected) {
        setError('');
      }
    };
    
    WebSocketService.onError = (message) => {
      setError(message);
    };
    
    WebSocketService.onDataReceived = (data) => {
      processReceivedData(data);
    };
    
    return () => {
      WebSocketService.onConnectionChanged = null;
      WebSocketService.onError = null;
      WebSocketService.onDataReceived = null;
    };
  }, [processReceivedData, updateConnectionStatus]);
  
  // Disconnect from device
  const handleDisconnect = async () => {
    if (contextIsConnected) {
      try {
        await WebSocketService.disconnect();
      } catch (err) {
        setError(`Disconnect error: ${err.message}`);
      }
    }
  };
  
  // Handle connection
  const handleConnect = async () => {
    setIsConnecting(true);
    setError('');
    
    try {
      if (ipAddress) {
        localStorage.setItem('watjaiIpAddress', ipAddress);
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
  
  // Start measurement
  const handleStartMeasurement = async () => {
    if (contextIsConnected) {
      setLastReceivedData([]);
      setRecordingTime(0);
      setIsMeasuring(true);
      
      await WebSocketService.sendCommand(`LEAD:${currentLead}`);
      await WebSocketService.sendCommand('START');
      
      const interval = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxRecordingTimeSeconds) {
            handleStopMeasurement();
            clearInterval(interval);
            return maxRecordingTimeSeconds;
          }
          return prev + 1;
        });
      }, 1000);
      
      setRecordingInterval(interval);
    } else {
      setError('Please connect to a device first');
    }
  };
  
  // Stop measurement
  const handleStopMeasurement = async () => {
    if (contextIsConnected) {
      setIsMeasuring(false);
      
      await WebSocketService.sendCommand('STOP');
      
      if (recordingInterval) {
        clearInterval(recordingInterval);
        setRecordingInterval(null);
      }
      
      if (receiveBuffer.length > 0) {
        saveCurrentLeadData([...receiveBuffer]);
        setReceiveBuffer([]);
      }
    }
  };
  
  // Handle navigation to next lead or results page
  const handleNext = async () => {
    if (isMeasuring) {
      setError('Please wait for the measurement to complete or stop it manually');
      return;
    }
    
    const currentLeadData = getLeadData(currentLead);
    if (currentLeadData.length === 0) {
      setError(`Please complete a recording for Lead ${currentLead === 1 ? 'I' : currentLead === 2 ? 'II' : 'III'}`);
      return;
    }
    
    if (currentLead < 3) {
      const nextLead = currentLead + 1;
      switchLead(nextLead);
      navigate(`/electrode-position?lead=${nextLead}`);
    } else {
      if (lead1Data.length > 0) {
        try {
          const requestData = {
            signal_lead1: lead1Data,
            signal_lead2: lead2Data.length > 0 ? lead2Data : null,
            signal_lead3: lead3Data.length > 0 ? lead3Data : null,
            sampling_rate: 360
          };
          
          const results = await ApiService.analyzeECG(requestData);
          saveResults(results);
          navigate('/results');
        } catch (err) {
          setError(`Analysis failed: ${err.message}`);
        }
      } else {
        setError('Please measure Lead I first');
      }
    }
  };
  
  // Clean up timer when component unmounts
  useEffect(() => {
    return () => {
      if (recordingInterval) {
        clearInterval(recordingInterval);
      }
    };
  }, [recordingInterval]);
  
  const getLeadData = (leadNumber) => {
    switch (leadNumber) {
      case 1: return lead1Data;
      case 2: return lead2Data;
      case 3: return lead3Data;
      default: return [];
    }
  };
  
  // Get status for Next button
  const canProceedToNext = () => {
    if (isMeasuring) return false;
    
    const currentLeadData = getLeadData(currentLead);
    return currentLeadData.length > 0;
  };

  // Get lead name (I, II, III) for display
  const getLeadName = (leadNumber) => {
    return leadNumber === 1 ? 'I' : leadNumber === 2 ? 'II' : 'III';
  };

  // Calculate progress percentage
  const progressPercentage = (recordingTime / maxRecordingTimeSeconds) * 100;

  return (
    <div className="mobile-measurement-page">
      {/* Header Section */}
      <div className="status-header">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center">
            <Badge 
              bg={contextIsConnected ? "success" : "danger"} 
              className="me-2 px-3 py-2 fs-6"
            >
              <span className="connection-icon me-2">●</span>
              <span className="fw-bold">{contextIsConnected ? "Connected" : "Disconnected"}</span>
            </Badge>
          </div>
          
          {!contextIsConnected ? (
            <Button
              variant="outline-primary"
              size="sm"
              onClick={() => setShowConnectModal(true)}
              className="rounded-pill"
            >
              Connect
            </Button>
          ) : (
            <Button
              variant="outline-danger"
              size="sm"
              onClick={handleDisconnect}
              className="rounded-pill"
            >
              Disconnect
            </Button>
          )}
        </div>
        
        <div className="recording-status">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div className="fw-bold fs-5">
              Recording Lead {getLeadName(currentLead)}
              {isMeasuring && <span className="recording-pulse ms-2"></span>}
            </div>
            <div className="text-dark fs-6">{recordingTime}s / {maxRecordingTimeSeconds}s</div>
          </div>
          
          <ProgressBar 
            variant={isMeasuring ? "danger" : "success"} 
            now={progressPercentage} 
            className="mb-3" 
            animated={isMeasuring}
          />
          
          <Button
            variant={isMeasuring ? "danger" : "success"}
            className="w-100 rounded-pill py-3 fs-5 fw-bold"
            onClick={isMeasuring ? handleStopMeasurement : handleStartMeasurement}
            disabled={!contextIsConnected}
          >
            {isMeasuring ? (
              <>
                Stop Recording
              </>
            ) : (
              <>
                {getLeadData(currentLead).length > 0 && !isMeasuring ? 
                  `Record Lead ${getLeadName(currentLead)} Again` : 
                  `Record Lead ${getLeadName(currentLead)}`}
              </>
            )}
          </Button>
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
      
      {/* ECG Monitor Section */}
      <div className="ecg-section">
        <div className="section-header">
          <span className="heart-icon text-danger me-2">♥</span>
          <h4 className="mb-0 fw-bold">ECG Monitor</h4>
        </div>
        <div className="section-content">
          {[1, 2, 3].map(leadNumber => (
            <div 
              key={leadNumber} 
              className={`lead-container mb-4 ${currentLead === leadNumber && isMeasuring ? 'active-lead' : ''}`}
            >
              <div className="d-flex justify-content-between align-items-center mb-2">
                <h6 className="mb-0">
                  Lead {getLeadName(leadNumber)}
                  {currentLead === leadNumber && isMeasuring && 
                    <Badge bg="danger" pill className="ms-2">Recording</Badge>
                  }
                </h6>
                <div className="text-dark fs-6">
                  {getLeadData(leadNumber).length > 0 ? 
                    <strong>{getLeadData(leadNumber).length} samples</strong> : 
                    <span className="text-warning fw-bold">No data recorded</span>}
                </div>
              </div>
              
              <div className="ecg-chart-container">
                {currentLead === leadNumber ? (
                  <ECGChart
                    data={lastReceivedData.length > 0 ? lastReceivedData : getLeadData(leadNumber)}
                    label={`Lead ${getLeadName(leadNumber)}`}
                    color={leadNumber === 1 ? '#ff6384' : (leadNumber === 2 ? '#36a2eb' : '#4bc0c0')}
                  />
                ) : getLeadData(leadNumber).length > 0 ? (
                  <ECGChart
                    data={getLeadData(leadNumber)}
                    label={`Lead ${getLeadName(leadNumber)}`}
                    color={leadNumber === 1 ? '#ff6384' : (leadNumber === 2 ? '#36a2eb' : '#4bc0c0')}
                  />
                ) : (
                  <div className="empty-chart">
                    <span className="text-dark">No data for Lead {getLeadName(leadNumber)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Instructions & Next Button */}
      <div className="bottom-section">
        <p className="instruction-text mb-4 py-3 bg-light rounded text-center fs-5 fw-bold">
          Please remain still and breathe normally during recording
        </p>
        
        <Button
          variant="primary"
          size="lg"
          className="next-button rounded-pill w-100 py-3 fs-5 fw-bold"
          onClick={handleNext}
          disabled={!canProceedToNext()}
        >
          {currentLead < 3 ? `Next Lead` : `View Results`} →
        </Button>
        
        {!contextIsConnected && (
          <div className="mt-3 text-danger text-center">
            <small>Please connect to a device before starting measurement</small>
          </div>
        )}
        
        {contextIsConnected && !canProceedToNext() && !isMeasuring && (
          <div className="mt-3 text-warning text-center">
            <small>Please complete a recording to continue</small>
          </div>
        )}
      </div>
      
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
        .mobile-measurement-page {
          width: 100%;
          min-height: 100vh;
          background-color: #eef2f7;
          padding: 16px;
          font-size: 16px;
        }
        
        .status-header {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
        }
        
        .recording-status {
          margin-top: 16px;
        }
        
        .ecg-section {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
          overflow: hidden;
        }
        
        .section-header {
          display: flex;
          align-items: center;
          padding: 18px 20px;
          border-bottom: 2px solid #f0f0f0;
          background-color: #fafafa;
          font-weight: bold;
        }
        
        .section-content {
          padding: 20px;
        }
        
        .bottom-section {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.08);
          margin-bottom: 20px;
        }
        
        .error-alert {
          margin-bottom: 16px;
        }
                
        .next-button {
          background-color: #3b5bdb;
          border: none;
          box-shadow: 0 6px 12px rgba(50, 50, 93, 0.15), 0 3px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .next-button:not(:disabled):hover {
          transform: translateY(-1px);
          box-shadow: 0 7px 14px rgba(50, 50, 93, 0.1), 0 3px 6px rgba(0, 0, 0, 0.08);
        }
        
        .next-button:disabled {
          opacity: 0.6;
        }
        
        .connection-icon {
          display: inline-block;
          font-size: 18px;
        }
        
        .heart-icon {
          display: inline-block;
          font-size: 24px;
          animation: heartbeat 1.5s ease infinite;
          color: #ff3b5c !important;
        }
        
        .recording-pulse {
          display: inline-block;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: #dc3545;
          animation: pulse 1.5s infinite;
        }
        
        .active-lead {
          background-color: #fff9fa;
          padding: 15px;
          margin: -15px;
          margin-bottom: 15px;
          border-radius: 8px;
        }
        
        .empty-chart {
          height: 120px;
          background-color: #f8f9fa;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px dashed #ced4da;
          font-size: 16px;
          font-weight: 500;
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
        
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0.7);
          }
          
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 10px rgba(220, 53, 69, 0);
          }
          
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(220, 53, 69, 0);
          }
        }
        
        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        @media (max-width: 576px) {
          .mobile-measurement-page {
            padding: 8px;
          }
          
          .empty-chart {
            height: 100px;
          }
        }
        
        @media (min-width: 768px) {
          .lead-container {
            padding: 15px;
            border-radius: 8px;
            transition: all 0.3s ease;
          }
          
          .lead-container:hover {
            background-color: #f8f9fa;
          }
        }
      `}</style>

<style jsx global>{`
      html, body {
        background-color: #eef2f7;
        margin: 0;
        padding: 0;
      }
    `}</style>
    </div>
  );
};

export default MobileMeasurementPage;