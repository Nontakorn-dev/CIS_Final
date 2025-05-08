import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHeart, FaClock, FaHistory, FaChartLine, FaUserMd, FaPlug, FaTimes, FaUser, FaSignOutAlt, FaSignInAlt } from 'react-icons/fa';
import { useECG } from '../context/ECGContext';
import WebSocketService from '../services/WebSocketService';

const HomePage = () => {
  const { isConnected, deviceIP, updateConnectionStatus, updateDeviceIP } = useECG();
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [ipAddress, setIpAddress] = useState(deviceIP || '');
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to true for demonstration
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('Nontakorn');
  
  // Health metrics state
  const [showBPModal, setShowBPModal] = useState(false);
  const [showBSModal, setShowBSModal] = useState(false);
  const [showCholModal, setShowCholModal] = useState(false);
  
  // Blood pressure values
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [bpValue, setBpValue] = useState('--/--');
  const [bpLastMeasured, setBpLastMeasured] = useState('Last measured 2h ago');
  
  // Blood sugar values
  const [bloodSugar, setBloodSugar] = useState('');
  const [bsUnit, setBsUnit] = useState('mg/dL');
  const [bsValue, setBsValue] = useState('--/--');
  const [bsLastMeasured, setBsLastMeasured] = useState('Last measured 2h ago');
  
  // Cholesterol values
  const [cholesterol, setCholesterol] = useState('');
  const [cholUnit, setCholUnit] = useState('mg/dL');
  const [cholValue, setCholValue] = useState('--/--');
  const [cholLastMeasured, setCholLastMeasured] = useState('Last measured 2h ago');
  
  const currentTime = new Date().toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  
  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };
  
  // Handle connection to device
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
  
  // Handle disconnection from device
  const handleDisconnect = async () => {
    try {
      await WebSocketService.disconnect();
    } catch (err) {
      setError(`Disconnect error: ${err.message}`);
    }
  };

  // Handle login
  const handleLogin = (e) => {
    e.preventDefault();
    // This is just a mock login - in a real app, you would call an API
    if (username && password) {
      setIsLoggedIn(true);
      setUserDisplayName(username);
      setShowLoginModal(false);
      setUsername('');
      setPassword('');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserDisplayName('');
  };
  
  // Blood pressure handlers
  const handleSaveBP = () => {
    if (systolic && diastolic) {
      setBpValue(`${systolic}/${diastolic}`);
      setBpLastMeasured(`Last measured ${getCurrentTimeText()}`);
      setShowBPModal(false);
      setSystolic('');
      setDiastolic('');
    }
  };
  
  // Blood sugar handlers
  const handleSaveBS = () => {
    if (bloodSugar) {
      setBsValue(`${bloodSugar} ${bsUnit}`);
      setBsLastMeasured(`Last measured ${getCurrentTimeText()}`);
      setShowBSModal(false);
      setBloodSugar('');
    }
  };
  
  // Cholesterol handlers
  const handleSaveCholesterol = () => {
    if (cholesterol) {
      setCholValue(`${cholesterol} ${cholUnit}`);
      setCholLastMeasured(`Last measured ${getCurrentTimeText()}`);
      setShowCholModal(false);
      setCholesterol('');
    }
  };
  
  const getCurrentTimeText = () => {
    return 'just now';
  };
  
  return (
    <div className="home-page">
      {/* Enhanced User Profile Header */}
      <div className="user-header">
        <div className="user-profile-container">
          {isLoggedIn ? (
            <>
              <div className="user-avatar">
                <FaUser className="avatar-icon" />
              </div>
              <div className="user-info">
                <div className="user-name">{userDisplayName}</div>
                <button className="logout-button" onClick={handleLogout}>
                  <FaSignOutAlt className="me-2" /> ออกจากระบบ
                </button>
              </div>
            </>
          ) : (
            <button className="signin-button" onClick={() => setShowLoginModal(true)}>
              <FaSignInAlt className="me-2" /> เข้าสู่ระบบ
            </button>
          )}
        </div>
      </div>

      <Container className="main-container">
        {/* Device Status */}
        <div className="device-status-card">
          <div className="status-content">
            <div className="status-icon-container">
              <FaHeart className="status-heart-icon" />
            </div>
            <div className="status-info">
              <h2 className="status-title">WatJai ECG Device</h2>
              <div className="status-details">
                <Badge 
                  bg={isConnected ? "success" : "danger"} 
                  className="status-badge"
                >
                  {isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
                {isConnected && <span className="status-battery">87%</span>}
              </div>
            </div>
          </div>
          
          <div className="connect-button-container">
            {isConnected ? (
              <Button
                variant="outline-danger"
                size="md"
                className="rounded-pill disconnect-button"
                onClick={handleDisconnect}
              >
                <FaTimes className="me-2" /> Disconnect
              </Button>
            ) : (
              <Button
                variant="primary"
                size="md"
                className="rounded-pill connect-button"
                onClick={() => setShowConnectModal(true)}
              >
                <FaPlug className="me-2" /> Connect
              </Button>
            )}
          </div>
        </div>
      
        {/* Error Alert */}
        {error && (
          <div className="error-alert">
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              {error}
              <button
                type="button"
                className="btn-close"
                onClick={() => setError('')}
                aria-label="Close"
              ></button>
            </div>
          </div>
        )}

        {/* Main Actions */}
        <div className="main-actions-container">
          <Row className="action-cards-row g-3">
            <Col xs={6} md={3}>
              <Link to="/electrode-position" className="action-link">
                <div className="action-card">
                  <div className="icon-container blue">
                    <FaHeart className="action-icon" />
                  </div>
                  <div className="action-title">Monitor ECG</div>
                </div>
              </Link>
            </Col>
            
            <Col xs={6} md={3}>
              <Link to="/history" className="action-link">
                <div className="action-card">
                  <div className="icon-container green">
                    <FaClock className="action-icon" />
                  </div>
                  <div className="action-title">History</div>
                </div>
              </Link>
            </Col>
            
            <Col xs={6} md={3}>
              <Link to="/results" className="action-link">
                <div className="action-card">
                  <div className="icon-container purple">
                    <FaChartLine className="action-icon" />
                  </div>
                  <div className="action-title">Analysis Results</div>
                </div>
              </Link>
            </Col>
            
            <Col xs={6} md={3}>
              <Link to="/telemedicine" className="action-link">
                <div className="action-card">
                  <div className="icon-container orange">
                    <FaUserMd className="action-icon" />
                  </div>
                  <div className="action-title">Telemedicine</div>
                </div>
              </Link>
            </Col>
          </Row>
        </div>
        
        {/* Health Metrics Section - ENHANCED */}
        <div className="health-metrics-section">
          <h2 className="section-title">Health Metrics</h2>
          
          {/* Blood Pressure Metric - Interactive */}
          <div className="metric-card" onClick={() => setShowBPModal(true)}>
            <div className="icon-container blue">
              <FaHeart className="metric-icon" />
            </div>
            <div className="metric-info">
              <div className="metric-title">Blood Pressure</div>
              <div className="metric-time">{bpLastMeasured}</div>
            </div>
            <div className="metric-value">{bpValue}</div>
          </div>
          
          {/* Blood Sugar Metric - Interactive */}
          <div className="metric-card" onClick={() => setShowBSModal(true)}>
            <div className="icon-container blue">
              <FaHeart className="metric-icon" />
            </div>
            <div className="metric-info">
              <div className="metric-title">Blood Sugar</div>
              <div className="metric-time">{bsLastMeasured}</div>
            </div>
            <div className="metric-value">{bsValue}</div>
          </div>
          
          {/* Cholesterol Metric - Interactive */}
          <div className="metric-card" onClick={() => setShowCholModal(true)}>
            <div className="icon-container blue">
              <FaHeart className="metric-icon" />
            </div>
            <div className="metric-info">
              <div className="metric-title">Cholesterol</div>
              <div className="metric-time">{cholLastMeasured}</div>
            </div>
            <div className="metric-value">{cholValue}</div>
          </div>
        </div>
      </Container>
      
      {/* Connection Modal */}
      {showConnectModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="modal-title">Connect to Device</h5>
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

      {/* Login Modal */}
      {showLoginModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="modal-title">เข้าสู่ระบบ</h5>
              <button
                className="close-button"
                onClick={() => setShowLoginModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <Form onSubmit={handleLogin}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">ชื่อผู้ใช้</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="กรอกชื่อผู้ใช้" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold">รหัสผ่าน</Form.Label>
                  <Form.Control 
                    type="password" 
                    placeholder="กรอกรหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </Form.Group>
                <div className="text-end mt-4">
                  <Button
                    variant="secondary"
                    onClick={() => setShowLoginModal(false)}
                    className="me-2 rounded-pill"
                  >
                    ยกเลิก
                  </Button>
                  <Button
                    variant="primary"
                    type="submit"
                    className="rounded-pill"
                  >
                    เข้าสู่ระบบ
                  </Button>
                </div>
              </Form>
            </div>
          </div>
        </div>
      )}
      
      {/* Blood Pressure Input Modal */}
      {showBPModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="modal-title">Blood Pressure</h5>
              <button
                className="close-button"
                onClick={() => setShowBPModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="bp-input-container">
                <div className="bp-input-group">
                  <label htmlFor="systolic" className="form-label fw-bold">SYS</label>
                  <input
                    type="number"
                    id="systolic"
                    className="form-control form-control-lg text-center"
                    placeholder="SYS"
                    value={systolic}
                    onChange={(e) => setSystolic(e.target.value)}
                    min="0"
                    max="300"
                  />
                </div>
                
                <div className="bp-divider">/</div>
                
                <div className="bp-input-group">
                  <label htmlFor="diastolic" className="form-label fw-bold">DIA</label>
                  <input
                    type="number"
                    id="diastolic"
                    className="form-control form-control-lg text-center"
                    placeholder="DIA"
                    value={diastolic}
                    onChange={(e) => setDiastolic(e.target.value)}
                    min="0"
                    max="200"
                  />
                </div>
                
                <div className="bp-unit">mmHg</div>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowBPModal(false)}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveBP}
                disabled={!systolic || !diastolic}
                className="rounded-pill"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Blood Sugar Input Modal */}
      {showBSModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="modal-title">Blood Sugar</h5>
              <button
                className="close-button"
                onClick={() => setShowBSModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="measurement-input-container">
                <div className="value-input-group">
                  <label htmlFor="bloodSugar" className="form-label fw-bold">Value</label>
                  <input
                    type="number"
                    id="bloodSugar"
                    className="form-control form-control-lg text-center"
                    placeholder="Value"
                    value={bloodSugar}
                    onChange={(e) => setBloodSugar(e.target.value)}
                    min="0"
                    max="1000"
                  />
                </div>
                
                <div className="unit-selector">
                  <label className="form-label fw-bold">&nbsp;</label>
                  <select 
                    className="form-select form-select-lg"
                    value={bsUnit}
                    onChange={(e) => setBsUnit(e.target.value)}
                  >
                    <option value="mg/dL">mg/dL</option>
                    <option value="mmol/L">mmol/L</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowBSModal(false)}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveBS}
                disabled={!bloodSugar}
                className="rounded-pill"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cholesterol Input Modal */}
      {showCholModal && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h5 className="modal-title">Cholesterol</h5>
              <button
                className="close-button"
                onClick={() => setShowCholModal(false)}
              >
                &times;
              </button>
            </div>
            <div className="modal-body">
              <div className="measurement-input-container">
                <div className="value-input-group">
                  <label htmlFor="cholesterol" className="form-label fw-bold">Value</label>
                  <input
                    type="number"
                    id="cholesterol"
                    className="form-control form-control-lg text-center"
                    placeholder="Value"
                    value={cholesterol}
                    onChange={(e) => setCholesterol(e.target.value)}
                    min="0"
                    max="500"
                  />
                </div>
                
                <div className="unit-label">
                  mg/dL
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <Button
                variant="secondary"
                onClick={() => setShowCholModal(false)}
                className="rounded-pill"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSaveCholesterol}
                disabled={!cholesterol}
                className="rounded-pill"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}


      
      <style jsx>{`
        .home-page {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding-bottom: 40px;
        }
        
        /* Enhanced User Header Styling */
        /* Enhanced User Header Styling */
.user-header {
  background-color: white;
  padding: 12px 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
}

.user-profile-container {
  display: flex;
  align-items: center;
  margin: 0;
  justify-content: flex-start;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #4065e0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  margin-right: 12px;
  box-shadow: 0 2px 5px rgba(65, 101, 224, 0.3);
}

.avatar-icon {
  font-size: 20px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin-bottom: 2px;
}

.logout-button {
  background: none;
  border: none;
  color: #4065e0;
  font-size: 14px;
  font-weight: 500;
  padding: 0;
  cursor: pointer;
  text-align: left;
  display: flex;
  align-items: center;
}
        
        .logout-button:hover {
          color: #2c4dca;
          text-decoration: underline;
        }
        
        .signin-button {
          color: white;
          font-weight: 600;
          padding: 12px 24px;
          border: none;
          border-radius: 28px;
          background-color: #4065e0;
          display: flex;
          align-items: center;
          font-size: 16px;
          gap: 8px;
          box-shadow: 0 4px 10px rgba(65, 101, 224, 0.3);
          transition: all 0.3s ease;
        }
        
        .signin-button:hover {
          background-color: #2c4dca;
          transform: translateY(-2px);
          box-shadow: 0 6px 12px rgba(65, 101, 224, 0.4);
        }
        
        /* Main Container */
        .main-container {
          padding-top: 0;
        }
        
        /* Device Status Card */
        .device-status-card {
          background-color: white;
          border-radius: 16px;
          padding: 20px;
          margin-bottom: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          transition: all 0.3s ease;
        }
        
        .device-status-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
          transform: translateY(-2px);
        }
        
        .status-content {
          display: flex;
          align-items: center;
        }
        
        .status-icon-container {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background-color: #e6f1ff;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-right: 15px;
        }
        
        .status-heart-icon {
          color: #4183f4;
          font-size: 28px;
        }
        
        .status-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0 0 5px 0;
          color: #333;
        }
        
        .status-details {
          display: flex;
          align-items: center;
        }
        
        .status-badge {
          padding: 8px 12px;
          border-radius: 20px;
          font-weight: 500;
          font-size: 14px;
        }
        
        .status-battery {
          color: #666;
          font-weight: 500;
          margin-left: 15px;
          font-size: 14px;
        }
        
        .connect-button-container {
          margin-left: 15px;
        }
        
        .connect-button, 
        .disconnect-button {
          padding: 10px 20px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;
        }
        
        .connect-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(65, 131, 244, 0.4);
        }
        
        .disconnect-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.3);
        }
        
        /* Error Alert */
        .error-alert {
          margin-bottom: 20px;
        }
        
        /* Section Titles */
        .section-title {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #333;
          position: relative;
          padding-bottom: 10px;
        }
        
        .section-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: #4183f4;
        }
        
        /* Main Actions */
        .main-actions-container {
          margin-bottom: 30px;
        }
        
        .action-cards-row {
          margin-top: 0;
        }
        
        .action-link {
          text-decoration: none;
          color: inherit;
          display: block;
          height: 100%;
        }
        
        .action-card {
          background-color: white;
          border-radius: 16px;
          padding: 20px;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .action-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        }
        
        .icon-container {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .icon-container.blue {
          background-color: #e6f1ff;
        }
        
        .icon-container.green {
          background-color: #e6ffef;
        }
        
        .icon-container.purple {
          background-color: #f0e6ff;
        }
        
        .icon-container.orange {
          background-color: #fff0e6;
        }
        
        .action-icon {
          font-size: 28px;
        }
        
        .icon-container.blue .action-icon {
          color: #4183f4;
        }
        
        .icon-container.green .action-icon {
          color: #34c759;
        }
        
        .icon-container.purple .action-icon {
          color: #7c5cff;
        }
        
        .icon-container.orange .action-icon {
          color: #ff8c5a;
        }
        
        .action-title {
          font-size: 16px;
          font-weight: 600;
          text-align: center;
          margin-top: 10px;
        }
        
        /* Health Metrics */
        .health-metrics-section {
          margin-bottom: 30px;
        }
        
        .metric-card {
          background-color: white;
          border-radius: 16px;
          padding: 18px;
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .metric-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
        }
        
        .metric-icon {
          color: #4183f4;
          font-size: 22px;
        }
        
        .metric-info {
          flex: 1;
          margin-left: 15px;
        }
        
        .metric-title {
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }
        
        .metric-time {
          color: #999;
          font-size: 14px;
          margin-top: 4px;
        }
        
        .metric-value {
          font-weight: 700;
          font-size: 20px;
          color: #333;
        }
        
        /* About Section */
        .about-section {
          margin-bottom: 30px;
        }
        
        .about-card {
          background-color: white;
          border-radius: 16px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .about-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }
        
        .about-card p {
          font-size: 16px;
          line-height: 1.6;
          color: #444;
          margin-bottom: 15px;
        }
        
        .about-card p:last-child {
          margin-bottom: 0;
        }
        
        /* Modal Styling */
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
        
        .modal-container {
          background-color: white;
          border-radius: 16px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
          animation: modalAppear 0.3s ease;
        }
        
        @keyframes modalAppear {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 25px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .modal-title {
          font-size: 20px;
          font-weight: 700;
          color: #333;
          margin: 0;
        }
        
        .modal-body {
          padding: 25px;
        }
        
        .modal-footer {
          padding: 20px 25px;
          border-top: 1px solid #f0f0f0;
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 28px;
          color: #999;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        .close-button:hover {
          color: #333;
        }
        
        /* Responsive adjustments */
        @media (max-width: 768px) {
          .device-status-card {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .connect-button-container {
            margin-left: 0;
            margin-top: 15px;
            width: 100%;
          }
          
          .connect-button, 
          .disconnect-button {
            width: 100%;
            justify-content: center;
          }
          
          .status-title {
            font-size: 18px;
          }
          
          .section-title {
            font-size: 22px;
          }
          
          .icon-container {
            width: 50px;
            height: 50px;
          }
          
          .action-icon {
            font-size: 24px;
          }
          
          .metric-value {
            font-size: 20px;
          }
          
          .user-avatar {
            width: 48px;
            height: 48px;
          }
          
          .avatar-icon {
            font-size: 24px;
          }
          
          .user-name {
            font-size: 20px;
          }
          
          .logout-button {
            font-size: 14px;
          }
        }
        
        @media (max-width: 576px) {
          .user-header {
            padding: 15px 20px;
          }
          
          .user-name {
            font-size: 18px;
          }
          
          .signin-button {
            font-size: 14px;
            padding: 10px 16px;
          }
          
          .section-title {
            font-size: 20px;
          }
          
          .metric-title {
            font-size: 15px;
          }
          
          .about-card p {
            font-size: 15px;
          }
        }
      `}</style>

<style jsx global>{`
      html, body {
        background-color: #f8f9fa;
        margin: 0;
        padding: 0;
      }
    `}</style>
    </div>
  );
};

export default HomePage;