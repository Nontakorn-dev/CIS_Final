// src/services/ApiService.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Mock data for testing without API
const mockECGAnalysisResults = {
  prediction: "Normal Sinus Rhythm",
  confidence: 92.5,
  bpm: 72,
  timestamp: new Date().toISOString(),
  processing_time: 1.25,
  probabilities: {
    "Normal Sinus Rhythm": 0.925,
    "Atrial Fibrillation": 0.035,
    "Left Bundle Branch Block": 0.015,
    "Right Bundle Branch Block": 0.01,
    "Premature Ventricular Contraction": 0.015
  },
  // Fictional base64 data - in a real scenario, this would be actual spectrogram data
  spectrogram_base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=="
};

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.useMockData = true; // Set to true to bypass API calls
  }

  async getModelInfo() {
    if (this.useMockData) {
      return {
        model_name: "ECG-ResNet50-Transformer",
        version: "1.0.0",
        accuracy: 0.92,
        last_updated: "2023-01-15"
      };
    }
    
    try {
      const response = await this.api.get('/model-info');
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  async analyzeECG(ecgData) {
    if (this.useMockData) {
      console.log("Using mock ECG analysis data");
      // Add a small delay to simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return mockECGAnalysisResults;
    }
    
    try {
      const response = await this.api.post('/predict', ecgData);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  async createSpectrogram(signal) {
    if (this.useMockData) {
      return {
        spectrogram_base64: mockECGAnalysisResults.spectrogram_base64
      };
    }
    
    try {
      const response = await this.api.post('/create-spectrogram', { signal });
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  // Toggle between mock data and real API
  setUseMockData(value) {
    this.useMockData = value;
  }
}

const apiService = new ApiService();
export default apiService;