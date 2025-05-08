import React from 'react';
import { Container, Row, Col, Card, Button, Alert, Badge, ProgressBar } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useECG } from '../context/ECGContext';
import ECGChart from '../components/ECGChart';

const ResultsPage = () => {
  const navigate = useNavigate();
  const { 
    results, 
    lead1Data, 
    lead2Data, 
    lead3Data,
    measurementHistory
  } = useECG();

  // If no analysis results exist, show alert
  if (!results) {
    return (
      <Container>
        <Alert variant="warning">
          <Alert.Heading>No Analysis Results</Alert.Heading>
          <p>Please measure and analyze ECG first</p>
          <hr />
          <div className="d-flex justify-content-between">
            <Link to="/measure">
              <Button variant="primary">Go to ECG Measurement</Button>
            </Link>
            
            {measurementHistory.length > 0 && (
              <Link to="/history">
                <Button variant="secondary">View Measurement History</Button>
              </Link>
            )}
          </div>
        </Alert>
      </Container>
    );
  }

  // Display analysis results
  return (
    <Container>
      <h2 className="mb-4">Analysis Results</h2>
      
      <Row>
        <Col md={6}>
          <Card className="mb-4">
            <Card.Body>
              <Card.Title className="text-center mb-4">ECG Analysis Results</Card.Title>
              
              <div className="result-box text-center mb-4">
                <h3 className="display-6">{results.prediction}</h3>
                <p className="lead">Confidence: {results.confidence.toFixed(2)}%</p>
                
                <ProgressBar 
                  now={results.confidence} 
                  variant={results.confidence > 80 ? "success" : results.confidence > 50 ? "warning" : "danger"}
                  className="mb-3"
                />
                
                <Badge 
                  bg={results.prediction === 'Normal' ? 'success' : 'warning'} 
                  className="p-2"
                >
                  {results.prediction === 'Normal' ? 'Normal' : 'Consult a doctor'}
                </Badge>
              </div>
              
              <div className="timestamp-box text-center text-muted mb-3">
                <small>Analysis Date: {new Date(results.timestamp).toLocaleString()}</small>
                <br />
                <small>Processing Time: {results.processing_time.toFixed(2)} seconds</small>
              </div>
              
              <div className="text-center">
                <Button 
                  variant="primary" 
                  className="me-2"
                  onClick={() => navigate('/measure')}
                >
                  New Measurement
                </Button>
                
                <Button 
                  variant="success"
                  onClick={() => {
                    // In a real scenario, this might save to a database or share via API
                    alert('Analysis results saved successfully');
                  }}
                >
                  Save Results
                </Button>
              </div>
            </Card.Body>
          </Card>
          
          {/* Show Spectrogram */}
          {results.spectrogram_base64 && (
            <Card className="mb-4">
              <Card.Body>
                <Card.Title>Spectrogram</Card.Title>
                <div className="text-center">
                  <img 
                    src={`data:image/png;base64,${results.spectrogram_base64}`} 
                    alt="ECG Spectrogram"
                    className="img-fluid spectrogram-image"
                  />
                </div>
              </Card.Body>
            </Card>
          )}
          
          {/* Show probabilities for each class */}
          <Card>
            <Card.Body>
              <Card.Title>Class Probabilities</Card.Title>
              
              {results.probabilities && Object.entries(results.probabilities)
                .sort(([, a], [, b]) => b - a)
                .map(([className, probability]) => (
                  <div key={className} className="mb-2">
                    <div className="d-flex justify-content-between mb-1">
                      <span>{className}</span>
                      <span>{(probability * 100).toFixed(2)}%</span>
                    </div>
                    <ProgressBar 
                      now={probability * 100} 
                      variant={className === results.prediction ? "primary" : "secondary"}
                    />
                  </div>
                ))}
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={6}>
          {/* Display ECG graphs for each lead */}
          <Card className="mb-4">
            <Card.Body>
              <Card.Title>ECG Signals</Card.Title>
              
              <div className="mb-3">
                <h6>Lead 1 ({lead1Data.length} points)</h6>
                <ECGChart data={lead1Data.slice(0, 500)} label="Lead 1" color="rgb(255, 99, 132)" />
              </div>
              
              {lead2Data.length > 0 && (
                <div className="mb-3">
                  <h6>Lead 2 ({lead2Data.length} points)</h6>
                  <ECGChart data={lead2Data.slice(0, 500)} label="Lead 2" color="rgb(54, 162, 235)" />
                </div>
              )}
              
              {lead3Data.length > 0 && (
                <div>
                  <h6>Lead 3 ({lead3Data.length} points)</h6>
                  <ECGChart data={lead3Data.slice(0, 500)} label="Lead 3" color="rgb(75, 192, 192)" />
                </div>
              )}
            </Card.Body>
          </Card>
          
          {/* Recommendations */}
          <Card>
            <Card.Body>
              <Card.Title>Recommendations</Card.Title>
              
              {results.prediction === 'Normal' ? (
                <Alert variant="success">
                  <Alert.Heading>Normal Signal</Alert.Heading>
                  <p>
                    Your ECG signals appear normal without concerning abnormalities.
                  </p>
                  <hr />
                  <p className="mb-0">
                    Maintain your health with regular check-ups and consistent exercise.
                  </p>
                </Alert>
              ) : (
                <Alert variant="warning">
                  <Alert.Heading>Abnormality Detected</Alert.Heading>
                  <p>
                    The system detected patterns of {results.prediction} in your ECG signal.
                  </p>
                  <hr />
                  <p className="mb-0">
                    We recommend consulting with a medical professional for further examination. This system is for preliminary screening only and cannot replace a medical diagnosis.
                  </p>
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResultsPage;