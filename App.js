import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import Header from './components/Header';
import HomePage from './pages/HomePage';
import ElectrodePositionPage from './pages/ElectrodePositionPage';
import MeasurementPage from './pages/MeasurementPage';
import ResultsPage from './pages/ResultsPage';
import HistoryPage from './pages/HistoryPage';
import TelemedicinePage from './pages/TelemedicinePage';
import VideoConsultationPage from './pages/VideoConsultationPage';
import { ECGProvider } from './context/ECGContext';

function App() {
  return (
    <ECGProvider>
      <Router>
        <Header />
        <Container className="py-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/measure" element={<MeasurementPage />} />
          <Route path="/electrode-position" element={<ElectrodePositionPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/telemedicine" element={<TelemedicinePage />} />
          <Route path="/telemedicine/consult/:sessionId" element={<VideoConsultationPage />} />
        </Routes>
        </Container>
      </Router>
    </ECGProvider>
  );
}

export default App;