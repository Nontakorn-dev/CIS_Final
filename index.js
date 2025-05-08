import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import MockDataService from './services/MockDataService';

// เริ่มต้นด้วยการรีเซ็ตข้อมูลเป็นรายการเดียว
// ถ้าต้องการใช้ข้อมูลเดิม ให้ comment บรรทัดนี้แล้วเปิด initializeSampleData แทน
MockDataService.resetToSingleSample();

// initializeSampleData จะสร้างข้อมูลใหม่ก็ต่อเมื่อยังไม่มีข้อมูล
// MockDataService.initializeSampleData();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);