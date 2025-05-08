import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, Modal, Form, Spinner } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useECG } from '../context/ECGContext';
import { 
  FaCalendarAlt, 
  FaHeartbeat, 
  FaSearch, 
  FaSort, 
  FaTrashAlt, 
  FaInfoCircle, 
  FaFileAlt, 
  FaRegChartBar, 
  FaAngleDown, 
  FaAngleUp, 
  FaFilter
} from 'react-icons/fa';

const HistoryPage = () => {
  const navigate = useNavigate();
  const { measurementHistory, saveResults, updateMeasurementHistory } = useECG();
  
  // States for enhanced functionality
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [recordToDelete, setRecordToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortCriteria, setSortCriteria] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [isLoading, setIsLoading] = useState(false);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: '',
    endDate: ''
  });
  const [resultFilter, setResultFilter] = useState('all');
  const [confidenceFilter, setConfidenceFilter] = useState([0, 100]);
  const [expandedRecords, setExpandedRecords] = useState({});

  // Load history from local storage on mount
  useEffect(() => {
    // Update filtered history whenever the original history or filters change
    filterAndSortHistory();
  }, [measurementHistory, searchTerm, sortCriteria, sortDirection, dateRangeFilter, resultFilter, confidenceFilter]);

  // Toggle expanded state for a record
  const toggleExpandRecord = (recordId) => {
    setExpandedRecords(prev => ({
      ...prev,
      [recordId]: !prev[recordId]
    }));
  };

  // Function to filter and sort history
  const filterAndSortHistory = () => {
    let filtered = [...measurementHistory];
    
    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(record => 
        record.prediction.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Apply date range filter
    if (dateRangeFilter.startDate) {
      const startDate = new Date(dateRangeFilter.startDate);
      filtered = filtered.filter(record => new Date(record.date) >= startDate);
    }
    
    if (dateRangeFilter.endDate) {
      const endDate = new Date(dateRangeFilter.endDate);
      endDate.setHours(23, 59, 59, 999); // End of the day
      filtered = filtered.filter(record => new Date(record.date) <= endDate);
    }
    
    // Apply result type filter
    if (resultFilter !== 'all') {
      const isNormal = resultFilter === 'normal';
      filtered = filtered.filter(record => {
        const recordIsNormal = record.prediction.toLowerCase().includes('normal');
        return isNormal ? recordIsNormal : !recordIsNormal;
      });
    }
    
    // Apply confidence filter
    if (confidenceFilter[0] > 0 || confidenceFilter[1] < 100) {
      filtered = filtered.filter(record => 
        record.confidence >= confidenceFilter[0] && record.confidence <= confidenceFilter[1]
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      if (sortCriteria === 'date') {
        return sortDirection === 'asc' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      } else if (sortCriteria === 'confidence') {
        return sortDirection === 'asc'
          ? a.confidence - b.confidence
          : b.confidence - a.confidence;
      } else {
        // Sort by prediction (alphabetically)
        return sortDirection === 'asc'
          ? a.prediction.localeCompare(b.prediction)
          : b.prediction.localeCompare(a.prediction);
      }
    });
    
    setFilteredHistory(filtered);
  };

  // Function to clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setDateRangeFilter({ startDate: '', endDate: '' });
    setResultFilter('all');
    setConfidenceFilter([0, 100]);
    setShowFilterModal(false);
  };

  // View details of selected record
  const handleViewDetails = (record) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  // View analysis results again
  const handleViewResult = (record) => {
    saveResults(record);
    navigate('/results');
  };

  // Confirm delete for a record
  const confirmDelete = (record) => {
    setRecordToDelete(record);
    setShowDeleteModal(true);
  };

  // Delete the record
  const handleDeleteRecord = () => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      const updatedHistory = measurementHistory.filter(item => item.id !== recordToDelete.id);
      updateMeasurementHistory(updatedHistory);
      setShowDeleteModal(false);
      setRecordToDelete(null);
      setIsLoading(false);
    }, 500);
  };

  // Delete all history
  const handleDeleteAll = () => {
    setIsLoading(true);
    
    // Simulate API call with timeout
    setTimeout(() => {
      updateMeasurementHistory([]);
      setIsLoading(false);
    }, 800);
  };

  // Toggle sort direction or change sort criteria
  const handleSort = (criteria) => {
    if (criteria === sortCriteria) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortCriteria(criteria);
      setSortDirection('desc'); // Default to descending for new criteria
    }
  };

  // Format date string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // If no measurement history
  if (measurementHistory.length === 0) {
    return (
      <Container className="history-page py-4">
        <div className="page-header mb-4">
          <h2 className="page-title">ECG Measurement History</h2>
        </div>

        <Alert variant="info" className="no-data-alert">
          <Alert.Heading>No Measurement History</Alert.Heading>
          <div className="alert-content">
            <p>You don't have any ECG measurement records yet.</p>
            <div className="heart-animation">
              <FaHeartbeat className="heartbeat-icon" />
            </div>
            <p>Start measuring your ECG to build your history.</p>
          </div>
          <hr />
          <div className="d-flex justify-content-end">
            <Button variant="primary" onClick={() => navigate('/measure')} className="action-button">
              Go to ECG Measurement
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container fluid="lg" className="history-page py-4">
      <div className="page-header">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="page-title mb-0">ECG Measurement History</h2>
          <Button
            variant="danger"
            size="sm"
            className="delete-all-button"
            onClick={handleDeleteAll}
            disabled={isLoading || filteredHistory.length === 0}
          >
            {isLoading ? <Spinner size="sm" animation="border" /> : <FaTrashAlt className="me-2" />}
            Clear All History
          </Button>
        </div>
        
        <div className="filter-bar mb-4">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder="Search history..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <button 
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                >
                  &times;
                </button>
              )}
            </div>
          </div>
          
          <div className="filter-actions">
            <Button 
              variant="light" 
              className="filter-button"
              onClick={() => setShowFilterModal(true)}
            >
              <div className="d-flex align-items-center">
                <FaFilter className="me-2" />
                <span>Filter</span>
                {(dateRangeFilter.startDate || dateRangeFilter.endDate || resultFilter !== 'all') && 
                  <Badge pill bg="primary" className="ms-2">
                    {((dateRangeFilter.startDate || dateRangeFilter.endDate) ? 1 : 0) + 
                     (resultFilter !== 'all' ? 1 : 0)}
                  </Badge>
                }
              </div>
            </Button>
            
            <div className="sort-dropdown">
              <Button 
                variant="light" 
                className="sort-button"
                onClick={() => document.getElementById('sort-dropdown-menu').classList.toggle('show')}
              >
                <FaSort className="me-2" />
                <span>Sort by: {
                  sortCriteria === 'date' ? 'Date' :
                  sortCriteria === 'confidence' ? 'Confidence' : 'Result'
                }</span>
                {sortDirection === 'asc' ? <FaAngleUp className="ms-2" /> : <FaAngleDown className="ms-2" />}
              </Button>
              
              <div className="sort-dropdown-menu" id="sort-dropdown-menu">
                <div 
                  className={`sort-item ${sortCriteria === 'date' ? 'active' : ''}`}
                  onClick={() => handleSort('date')}
                >
                  <FaCalendarAlt className="me-2" />
                  <span>Date</span>
                  {sortCriteria === 'date' && (
                    sortDirection === 'asc' ? <FaAngleUp className="ms-2" /> : <FaAngleDown className="ms-2" />
                  )}
                </div>
                <div 
                  className={`sort-item ${sortCriteria === 'confidence' ? 'active' : ''}`}
                  onClick={() => handleSort('confidence')}
                >
                  <FaRegChartBar className="me-2" />
                  <span>Confidence</span>
                  {sortCriteria === 'confidence' && (
                    sortDirection === 'asc' ? <FaAngleUp className="ms-2" /> : <FaAngleDown className="ms-2" />
                  )}
                </div>
                <div 
                  className={`sort-item ${sortCriteria === 'prediction' ? 'active' : ''}`}
                  onClick={() => handleSort('prediction')}
                >
                  <FaHeartbeat className="me-2" />
                  <span>Analysis Result</span>
                  {sortCriteria === 'prediction' && (
                    sortDirection === 'asc' ? <FaAngleUp className="ms-2" /> : <FaAngleDown className="ms-2" />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="active-filters">
          {dateRangeFilter.startDate && (
            <div className="filter-tag">
              <span>Start Date: {new Date(dateRangeFilter.startDate).toLocaleDateString()}</span>
              <button 
                className="clear-tag"
                onClick={() => setDateRangeFilter(prev => ({ ...prev, startDate: '' }))}
              >
                &times;
              </button>
            </div>
          )}
          
          {dateRangeFilter.endDate && (
            <div className="filter-tag">
              <span>End Date: {new Date(dateRangeFilter.endDate).toLocaleDateString()}</span>
              <button 
                className="clear-tag"
                onClick={() => setDateRangeFilter(prev => ({ ...prev, endDate: '' }))}
              >
                &times;
              </button>
            </div>
          )}
          
          {resultFilter !== 'all' && (
            <div className="filter-tag">
              <span>Result: {resultFilter === 'normal' ? 'Normal' : 'Abnormal'}</span>
              <button 
                className="clear-tag"
                onClick={() => setResultFilter('all')}
              >
                &times;
              </button>
            </div>
          )}
          
          {(confidenceFilter[0] > 0 || confidenceFilter[1] < 100) && (
            <div className="filter-tag">
              <span>Confidence: {confidenceFilter[0]}% - {confidenceFilter[1]}%</span>
              <button 
                className="clear-tag"
                onClick={() => setConfidenceFilter([0, 100])}
              >
                &times;
              </button>
            </div>
          )}
          
          {(dateRangeFilter.startDate || dateRangeFilter.endDate || resultFilter !== 'all' || confidenceFilter[0] > 0 || confidenceFilter[1] < 100) && (
            <button 
              className="clear-all-filters"
              onClick={clearFilters}
            >
              Clear All Filters
            </button>
          )}
        </div>
      </div>
      
      {isLoading && (
        <div className="text-center py-4">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2">Loading data...</p>
        </div>
      )}
      
      {!isLoading && filteredHistory.length === 0 && (
        <Alert variant="warning" className="mt-3">
          <div className="text-center">
            <FaInfoCircle className="mb-2" size={24} />
            <p className="mb-0">No history records match your search criteria.</p>
          </div>
        </Alert>
      )}
      
      {!isLoading && filteredHistory.map((record) => (
        <Card key={record.id} className="history-card mb-3">
          <Card.Body>
            <Row>
              <Col lg={8} md={7}>
                <div className="record-header">
                  <div>
                    <div className="prediction-label">Analysis Result:</div>
                    <h5 className="prediction-title">{record.prediction}</h5>
                  </div>
                  <Badge 
                    bg={record.prediction.toLowerCase().includes('normal') ? 'success' : 'warning'} 
                    className="status-badge"
                  >
                    {record.prediction.toLowerCase().includes('normal') ? 'Normal' : 'Consult Doctor'}
                  </Badge>
                </div>
                
                <div className="record-date mb-3">
                  <FaCalendarAlt className="date-icon" />
                  <span>{formatDate(record.date)}</span>
                </div>
                
                <div className="d-flex align-items-center mb-3">
                  <div className="confidence-label">Confidence:</div>
                  <div className="confidence-value">{record.confidence.toFixed(1)}%</div>
                  <div className="confidence-bar-container">
                    <div 
                      className="confidence-bar" 
                      style={{ width: `${record.confidence}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className={`additional-info ${expandedRecords[record.id] ? 'show' : ''}`}>
                  <div className="leads-info">
                    <div className="info-label">ECG Data:</div>
                    <div className="leads-badges">
                      <Badge bg="primary" className="lead-badge">Lead I: {record.lead1DataLength} points</Badge>
                      {record.lead2DataLength > 0 && (
                        <Badge bg="primary" className="lead-badge">Lead II: {record.lead2DataLength} points</Badge>
                      )}
                      {record.lead3DataLength > 0 && (
                        <Badge bg="primary" className="lead-badge">Lead III: {record.lead3DataLength} points</Badge>
                      )}
                    </div>
                  </div>
                  
                  {record.processing_time && (
                    <div className="processing-time">
                      <span className="info-label">Processing Time:</span>
                      <span>{record.processing_time.toFixed(2)} seconds</span>
                    </div>
                  )}
                  
                  {record.probabilities && (
                    <div className="probabilities mt-3">
                      <div className="info-label mb-2">Probabilities:</div>
                      <div className="probabilities-grid">
                        {Object.entries(record.probabilities)
                          .sort(([, a], [, b]) => b - a)
                          .slice(0, 3)
                          .map(([className, probability]) => (
                            <div key={className} className="probability-item">
                              <div className="d-flex justify-content-between mb-1">
                                <small>{className}</small>
                                <small>{(probability * 100).toFixed(1)}%</small>
                              </div>
                              <div className="probability-bar-container">
                                <div 
                                  className="probability-bar"
                                  style={{ width: `${probability * 100}%` }}
                                ></div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <button 
                  className="toggle-details-btn"
                  onClick={() => toggleExpandRecord(record.id)}
                >
                  {expandedRecords[record.id] ? 'Show Less ▲' : 'Show More ▼'}
                </button>
              </Col>
              
              <Col lg={4} md={5} className="action-column">
                <div className="action-buttons">
                  <Button 
                    variant="light" 
                    className="action-btn details-btn"
                    onClick={() => handleViewDetails(record)}
                  >
                    <FaInfoCircle className="btn-icon" />
                    Details
                  </Button>
                  
                  <Button 
                    variant="outline-danger"
                    className="action-btn delete-btn"
                    onClick={() => confirmDelete(record)}
                  >
                    <FaTrashAlt className="btn-icon" />
                    Delete
                  </Button>
                </div>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      ))}
      
      {/* Details Modal */}
      <Modal 
        show={showModal} 
        onHide={() => setShowModal(false)} 
        size="lg"
        centered
        className="details-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title className="modal-title">
            <FaInfoCircle className="me-2 modal-title-icon" />
            Analysis Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <>
              <div className="details-header">
                <div className="result-wrapper">
                  <div className="details-label">Diagnosis</div>
                  <h4 className="diagnosis-title">{selectedRecord.prediction}</h4>
                </div>
                <Badge 
                  bg={selectedRecord.prediction.toLowerCase().includes('normal') ? 'success' : 'warning'} 
                  className="status-badge-lg"
                >
                  {selectedRecord.prediction.toLowerCase().includes('normal') ? 'Normal' : 'Consult Doctor'}
                </Badge>
              </div>
              
              <div className="details-meta">
                <div className="meta-item">
                  <FaCalendarAlt className="meta-icon" />
                  <span>{formatDate(selectedRecord.date)}</span>
                </div>
                
                <div className="meta-item">
                  <FaHeartbeat className="meta-icon" />
                  <span>{selectedRecord.bpm || 72} BPM</span>
                </div>
              </div>
              
              <div className="details-overview">
                <div className="overview-item">
                  <div className="overview-label">Confidence</div>
                  <div className="overview-value">{selectedRecord.confidence.toFixed(1)}%</div>
                  <div className="overview-bar-container">
                    <div 
                      className="overview-bar"
                      style={{ width: `${selectedRecord.confidence}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <div className="details-section probabilities-section">
                <h5 className="section-title">
                  <FaRegChartBar className="section-icon" />
                  Probability Analysis
                </h5>
                <div className="probabilities-list">
                  {selectedRecord.probabilities && Object.entries(selectedRecord.probabilities)
                    .sort(([, a], [, b]) => b - a)
                    .map(([className, probability], index) => (
                      <div key={className} className={`probability-detail-item ${index === 0 ? 'primary-item' : ''}`}>
                        <div className="d-flex justify-content-between mb-1">
                          <span className="probability-class">{className}</span>
                          <span className="probability-value">{(probability * 100).toFixed(2)}%</span>
                        </div>
                        <div className="probability-bar-container">
                          <div 
                            className="probability-bar"
                            style={{ 
                              width: `${probability * 100}%`,
                              backgroundColor: index === 0 ? '#4183f4' : '#6c757d'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
              
              {selectedRecord.spectrogram_base64 && (
                <div className="details-section">
                  <h5 className="section-title">
                    <FaFileAlt className="section-icon" />
                    Spectrogram
                  </h5>
                  <div className="spectrogram-container">
                    <img 
                      src={`data:image/png;base64,${selectedRecord.spectrogram_base64}`} 
                      alt="ECG Spectrogram"
                      className="img-fluid spectrogram-image"
                    />
                  </div>
                </div>
              )}
              
              <div className="details-section">
                <h5 className="section-title">
                  <FaInfoCircle className="section-icon" />
                  Measurement Information
                </h5>
                <div className="measurement-info">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-label">Lead I</div>
                      <div className="info-value">{selectedRecord.lead1DataLength} points</div>
                    </div>
                    
                    {selectedRecord.lead2DataLength > 0 && (
                      <div className="info-item">
                        <div className="info-label">Lead II</div>
                        <div className="info-value">{selectedRecord.lead2DataLength} points</div>
                      </div>
                    )}
                    
                    {selectedRecord.lead3DataLength > 0 && (
                      <div className="info-item">
                        <div className="info-label">Lead III</div>
                        <div className="info-value">{selectedRecord.lead3DataLength} points</div>
                      </div>
                    )}
                    
                    <div className="info-item">
                      <div className="info-label">Processing Time</div>
                      <div className="info-value">{selectedRecord.processing_time?.toFixed(2) || '1.25'} seconds</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Confidence</div>
                      <div className="info-value">{selectedRecord.confidence.toFixed(2)}%</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Heart Rate</div>
                      <div className="info-value">{selectedRecord.bpm || 72} BPM</div>
                    </div>
                    
                    <div className="info-item">
                      <div className="info-label">Record ID</div>
                      <div className="info-value">ECG-{selectedRecord.id.toString().substr(-6)}</div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} className="close-modal-btn">
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Delete Confirmation Modal */}
      <Modal 
        show={showDeleteModal} 
        onHide={() => setShowDeleteModal(false)} 
        size="sm"
        centered
        className="delete-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="text-center mb-3">
            <FaTrashAlt className="delete-icon" />
          </div>
          <p className="text-center">
            Are you sure you want to delete this record? This action cannot be undone.
          </p>
          {recordToDelete && (
            <div className="record-summary">
              <div><strong>Result:</strong> {recordToDelete.prediction}</div>
              <div><strong>Date:</strong> {formatDate(recordToDelete.date)}</div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={() => setShowDeleteModal(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleDeleteRecord}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner as="span" animation="border" size="sm" className="me-2" />
                Deleting...
              </>
            ) : 'Delete Record'}
          </Button>
        </Modal.Footer>
      </Modal>
      
      {/* Filter Modal */}
      <Modal 
        show={showFilterModal} 
        onHide={() => setShowFilterModal(false)} 
        size="md"
        centered
        className="filter-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>Filter Data</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form> 
            <Form.Group className="mb-4"> 
              <Form.Label className="filter-section-label">Date Range</Form.Label> 
              <Row> 
                <Col xs={6}> 
                  <Form.Label className="filter-label">Start Date</Form.Label> 
                  <Form.Control 
                    type="date" 
                    value={dateRangeFilter.startDate} 
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, startDate: e.target.value }))} 
                    className="filter-date-input"
                  /> 
                </Col> 
                <Col xs={6}> 
                  <Form.Label className="filter-label">End Date</Form.Label> 
                  <Form.Control 
                    type="date" 
                    value={dateRangeFilter.endDate} 
                    onChange={(e) => setDateRangeFilter(prev => ({ ...prev, endDate: e.target.value }))} 
                    className="filter-date-input"
                    min={dateRangeFilter.startDate}
                  /> 
                </Col> 
              </Row> 
            </Form.Group> 
            
            <Form.Group className="mb-4"> 
              <Form.Label className="filter-section-label">Result Type</Form.Label> 
              <div className="result-filter-options"> 
                <Form.Check 
                  type="radio" 
                  id="filter-all" 
                  name="resultFilter" 
                  label="All" 
                  checked={resultFilter === 'all'} 
                  onChange={() => setResultFilter('all')} 
                  className="filter-option" 
                /> 
                <Form.Check 
                  type="radio" 
                  id="filter-normal" 
                  name="resultFilter" 
                  label="Normal" 
                  checked={resultFilter === 'normal'} 
                  onChange={() => setResultFilter('normal')} 
                  className="filter-option" 
                /> 
                <Form.Check 
                  type="radio" 
                  id="filter-abnormal" 
                  name="resultFilter" 
                  label="Abnormal" 
                  checked={resultFilter === 'abnormal'} 
                  onChange={() => setResultFilter('abnormal')} 
                  className="filter-option" 
                /> 
              </div> 
            </Form.Group>
            
            <Form.Group className="mb-4"> 
              <Form.Label className="filter-section-label">Confidence Level</Form.Label> 
              <div className="confidence-filter-container mb-2">
                <span className="slider-value">{confidenceFilter[0]}%</span>
                <span className="slider-value">{confidenceFilter[1]}%</span>
              </div>
              <div className="confidence-slider-container">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceFilter[0]}
                  onChange={(e) => setConfidenceFilter([
                    parseInt(e.target.value),
                    Math.max(parseInt(e.target.value), confidenceFilter[1])
                  ])}
                  className="confidence-slider min-slider"
                />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={confidenceFilter[1]}
                  onChange={(e) => setConfidenceFilter([
                    Math.min(confidenceFilter[0], parseInt(e.target.value)),
                    parseInt(e.target.value)
                  ])}
                  className="confidence-slider max-slider"
                />
                <div className="slider-track"></div>
              </div>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={clearFilters}>
            Clear Filters
          </Button>
          <Button variant="secondary" onClick={() => setShowFilterModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => setShowFilterModal(false)}>
            Apply Filters
          </Button>
        </Modal.Footer>
      </Modal>
      
      <style jsx>{`
        .history-page {
          background-color: #f8f9fa;
          min-height: calc(100vh - 60px);
          padding-bottom: 40px;
        }
        
        .page-header {
          position: relative;
          margin-bottom: 30px;
        }
        
        .page-title {
          font-size: 28px;
          font-weight: 700;
          color: #333;
          position: relative;
          padding-bottom: 10px;
        }
        
        .page-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 3px;
          background-color: #4183f4;
        }
        
        .delete-all-button {
          font-weight: 500;
          font-size: 14px;
          padding: 8px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.3s ease;
        }
        
        .delete-all-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(220, 53, 69, 0.25);
        }
        
        /* Filter Bar */
        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 15px;
          background-color: white;
          padding: 15px;
          border-radius: 12px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.03);
          margin-bottom: 20px;
        }
        
        .search-container {
          flex: 1;
          min-width: 250px;
        }
        
        .search-input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }
        
        .search-icon {
          position: absolute;
          left: 15px;
          color: #6c757d;
        }
        
        .search-input {
          width: 100%;
          padding: 12px 40px;
          border-radius: 30px;
          border: 1px solid #ced4da;
          font-size: 16px;
          transition: all 0.3s ease;
          background-color: #f8f9fa;
        }
        
        .search-input:focus {
          outline: none;
          border-color: #4183f4;
          background-color: white;
          box-shadow: 0 0 0 0.25rem rgba(65, 131, 244, 0.25);
        }
        
        .clear-search-btn {
          position: absolute;
          right: 15px;
          background: none;
          border: none;
          color: #6c757d;
          font-size: 20px;
          cursor: pointer;
        }
        
        .filter-actions {
          display: flex;
          gap: 10px;
        }
        
        .filter-button,
        .sort-button {
          background-color: white;
          border: 1px solid #ced4da;
          padding: 10px 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }
        
        .filter-button:hover,
        .sort-button:hover {
          background-color: #f8f9fa;
          border-color: #4183f4;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        
        /* Sort Dropdown */
        .sort-dropdown {
          position: relative;
        }
        
        .sort-dropdown-menu {
          position: absolute;
          top: 100%;
          right: 0;
          margin-top: 5px;
          background-color: white;
          border-radius: 8px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
          width: 200px;
          z-index: 100;
          display: none;
        }
        
        .sort-dropdown-menu.show {
          display: block;
          animation: fadeIn 0.2s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .sort-item {
          padding: 12px 15px;
          display: flex;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .sort-item:hover {
          background-color: #f8f9fa;
        }
        
        .sort-item.active {
          background-color: #f0f7ff;
          color: #4183f4;
          font-weight: 500;
        }
        
        /* Active Filters */
        .active-filters {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 15px;
        }
        
        .filter-tag {
          background-color: #e7f1ff;
          color: #0d6efd;
          padding: 5px 12px;
          border-radius: 30px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .clear-tag {
          background: none;
          border: none;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          cursor: pointer;
          color: #0d6efd;
          padding: 0;
        }
        
        .clear-all-filters {
          background: none;
          border: none;
          color: #0d6efd;
          font-size: 14px;
          cursor: pointer;
          text-decoration: underline;
          margin-left: 5px;
        }
        
        /* History Card */
        .history-card {
          border-radius: 12px;
          border: none;
          overflow: hidden;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .history-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.08);
        }
        
        .record-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 10px;
        }
        
        .prediction-label {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 3px;
        }
        
        .prediction-title {
          font-size: 20px;
          font-weight: 700;
          margin: 0;
          color: #333;
        }
        
        .status-badge {
          padding: 8px 15px;
          border-radius: 30px;
          font-weight: 500;
          font-size: 14px;
        }
        
        .record-date {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #6c757d;
          font-size: 14px;
        }
        
        .date-icon {
          color: #6c757d;
        }
        
        .confidence-label {
          font-size: 14px;
          margin-right: 10px;
          min-width: 80px;
        }
        
        .confidence-value {
          font-weight: 700;
          color: #333;
          width: 60px;
        }
        
        .confidence-bar-container {
          flex: 1;
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-left: 10px;
        }
        
        .confidence-bar {
          height: 100%;
          background-color: #4183f4;
          background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
          background-size: 1rem 1rem;
          border-radius: 4px;
          transition: width 1s ease-in-out;
        }
        
        .additional-info {
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease;
        }
        
        .additional-info.show {
          max-height: 500px;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        
        .leads-info {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
          flex-wrap: wrap;
        }
        
        .info-label {
          font-size: 14px;
          color: #6c757d;
          margin-right: 10px;
          min-width: 100px;
        }
        
        .leads-badges {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        
        .lead-badge {
          padding: 5px 10px;
          border-radius: 5px;
          font-weight: 500;
          font-size: 13px;
        }
        
        .processing-time {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .probabilities {
          background-color: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          margin-top: 15px;
        }
        
        .probabilities-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 12px;
        }
        
        .probability-item {
          margin-bottom: 8px;
        }
        
        .probability-bar-container {
          height: 6px;
          background-color: #e9ecef;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .probability-bar {
          height: 100%;
          background-color: #6c757d;
          border-radius: 3px;
        }
        
        .toggle-details-btn {
          display: block;
          border: none;
          background: none;
          color: #4183f4;
          font-size: 14px;
          margin-top: 8px;
          cursor: pointer;
          padding: 0;
          text-align: left;
          transition: all 0.2s ease;
        }
        
        .toggle-details-btn:hover {
          color: #2c70e0;
          text-decoration: underline;
        }
        
        .action-column {
          display: flex;
          align-items: center;
          justify-content: flex-end;
        }
        
        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 10px;
          width: 100%;
        }
        
        .action-btn {
          width: 100%;
          padding: 10px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .details-btn {
          background-color: #f8f9fa;
          color: #333;
        }
        
        .details-btn:hover {
          background-color: #e9ecef;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
        }
        
        .delete-btn {
          color: #dc3545;
        }
        
        .delete-btn:hover {
          background-color: rgba(220, 53, 69, 0.1);
          transform: translateY(-2px);
        }
        
        .btn-icon {
          font-size: 16px;
        }
        
        /* Details Modal */
        .details-modal .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.15);
          overflow: hidden;
        }
        
        .details-modal .modal-header {
          background-color: #f8f9fa;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
          padding: 16px 24px;
        }
        
        .modal-title {
          display: flex;
          align-items: center;
          font-weight: 700;
          color: #333;
        }
        
        .modal-title-icon {
          color: #4183f4;
          margin-right: 10px;
        }
        
        .details-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .result-wrapper {
          flex: 1;
        }
        
        .details-label {
          font-size: 14px;
          color: #6c757d;
          margin-bottom: 5px;
        }
        
        .diagnosis-title {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
          color: #333;
        }
        
        .status-badge-lg {
          padding: 8px 16px;
          border-radius: 30px;
          font-weight: 600;
          font-size: 14px;
          letter-spacing: 0.3px;
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
        }
        
        .details-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          margin-bottom: 25px;
        }
        
        .meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #555;
          font-size: 15px;
        }
        
        .meta-icon {
          color: #4183f4;
        }
        
        .details-overview {
          background-color: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 25px;
        }
        
        .overview-item {
          margin-bottom: 10px;
        }
        
        .overview-item:last-child {
          margin-bottom: 0;
        }
        
        .overview-label {
          font-size: 15px;
          font-weight: 500;
          margin-bottom: 8px;
          color: #555;
        }
        
        .overview-value {
          font-size: 26px;
          font-weight: 700;
          color: #333;
          margin-bottom: 10px;
        }
        
        .overview-bar-container {
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .overview-bar {
          height: 100%;
          background-color: #4183f4;
          background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
          background-size: 1rem 1rem;
          border-radius: 4px;
          transition: width 1.5s ease-out;
        }
        
        .details-section {
          margin-bottom: 30px;
          background-color: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
        }
        
        .probabilities-section {
          background-color: #f8f9fa;
        }
        
        .section-title {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #333;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .section-icon {
          color: #4183f4;
          font-size: 18px;
        }
        
        .probabilities-list {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 20px;
        }
        
        .probability-detail-item {
          background-color: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .probability-detail-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }
        
        .primary-item {
          border-left: 3px solid #4183f4;
        }
        
        .probability-class {
          font-weight: 500;
          font-size: 15px;
        }
        
        .probability-value {
          font-weight: 700;
          font-size: 16px;
          color: #4183f4;
        }
        
        .probability-bar-container {
          height: 8px;
          background-color: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
          margin-top: 5px;
        }
        
        .probability-bar {
          height: 100%;
          border-radius: 4px;
          transition: width 0.8s ease-out;
        }
        
        .spectrogram-container {
          background-color: white;
          padding: 20px;
          border-radius: 10px;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
        }
        
        .spectrogram-image {
          max-width: 100%;
          border-radius: 8px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .measurement-info {
          padding: 0;
          border-radius: 10px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 20px;
        }
        
        .info-item {
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 8px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          transition: all 0.3s ease;
        }
        
        .info-item:hover {
          background-color: #e8f0fe;
          transform: translateY(-2px);
        }
        
        .info-label {
          color: #6c757d;
          font-size: 13px;
          font-weight: 500;
        }
        
        .info-value {
          font-weight: 700;
          color: #333;
          font-size: 16px;
        }
        
        .close-modal-btn {
          border-radius: 8px;
          font-weight: 500;
          padding: 8px 20px;
        }
        
        .close-modal-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
        }
        
        /* Delete Modal */
        .delete-modal .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        .delete-icon {
          color: #dc3545;
          font-size: 48px;
          margin-bottom: 15px;
        }
        
        .record-summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
        }
        
        /* Filter Modal */
        .filter-modal .modal-content {
          border-radius: 16px;
          border: none;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
        }
        
        .filter-section-label {
          font-weight: 600;
          font-size: 16px;
          color: #333;
        }
        
        .filter-label {
          font-size: 14px;
          color: #666;
        }
        
        .filter-date-input {
          border-radius: 8px;
          border-color: #ced4da;
          padding: 8px 12px;
          transition: all 0.3s ease;
        }
        
        .filter-date-input:focus {
          border-color: #4183f4;
          box-shadow: 0 0 0 0.25rem rgba(65, 131, 244, 0.25);
        }
        
        .result-filter-options {
          display: flex;
          gap: 15px;
          margin-top: 10px;
        }
        
        .filter-option {
          font-size: 16px;
        }
        
        /* Confidence Slider Styles */
        .confidence-filter-container {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        
        .slider-value {
          font-size: 14px;
          font-weight: 500;
          color: #4183f4;
        }
        
        .confidence-slider-container {
          position: relative;
          width: 100%;
          height: 40px;
        }
        
        .slider-track {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          height: 5px;
          width: 100%;
          background-color: #e9ecef;
          border-radius: 3px;
          z-index: 1;
        }
        
        .confidence-slider {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          height: 5px;
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          pointer-events: auto;
          z-index: 2;
        }
        
        .confidence-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4183f4;
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(65, 131, 244, 0.3);
          transition: all 0.2s ease;
        }
        
        .confidence-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #4183f4;
          cursor: pointer;
          box-shadow: 0 0 0 3px rgba(65, 131, 244, 0.3);
          transition: all 0.2s ease;
        }
        
        .confidence-slider::-webkit-slider-thumb:hover {
          box-shadow: 0 0 0 5px rgba(65, 131, 244, 0.4);
        }
        
        .confidence-slider::-moz-range-thumb:hover {
          box-shadow: 0 0 0 5px rgba(65, 131, 244, 0.4);
        }
        
        /* No Data Alert */
        .no-data-alert {
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          padding: 25px;
        }
        
        .alert-content {
          text-align: center;
          padding: 20px 0;
        }
        
        .heart-animation {
          margin: 20px 0;
        }
        
        .heartbeat-icon {
          font-size: 48px;
          color: #dc3545;
          animation: heartbeat 1.5s infinite;
        }
        
        .action-button {
          font-weight: 600;
          padding: 10px 20px;
          border-radius: 8px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
        
        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        /* Responsive Styles */
        @media (max-width: 992px) {
          .action-column {
            margin-top: 20px;
          }
          
          .action-buttons {
            flex-direction: row;
            flex-wrap: wrap;
          }
          
          .action-btn {
            flex: 1;
            min-width: 120px;
          }
        }
        
        @media (max-width: 768px) {
          .filter-bar {
            flex-direction: column;
            align-items: stretch;
          }
          
          .filter-actions {
            justify-content: space-between;
          }
          
          .action-buttons {
            flex-direction: row;
          }
          
          .probabilities-grid,
          .probabilities-list,
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 576px) {
          .action-buttons {
            flex-direction: column;
          }
          
          .confidence-label,
          .info-label {
            min-width: auto;
            margin-bottom: 5px;
          }
          
          .confidence-value {
            width: auto;
          }
          
          .page-title {
            font-size: 24px;
          }
          
          .prediction-title {
            font-size: 18px;
          }
          
          .status-badge {
            padding: 5px 10px;
            font-size: 12px;
          }
        }
      `}</style>
    </Container>
  );
};

export default HistoryPage;