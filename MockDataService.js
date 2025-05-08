// src/services/MockDataService.js

// สร้างข้อมูลตัวอย่างสำหรับประวัติการวัด
const generateSampleMeasurementHistory = () => {
    // สร้างข้อมูลเพียงหนึ่งรายการเท่านั้น
    const now = new Date();
    
    // ข้อมูลตัวอย่างแบบเดียว
    const sampleData = {
      id: Date.now(),
      prediction: "Normal Sinus Rhythm",
      confidence: 92.4,
      bpm: 72,
      timestamp: now.toISOString(),
      date: now.toISOString(),
      processing_time: 1.25,
      probabilities: {
        "Normal Sinus Rhythm": 0.924,
        "Atrial Fibrillation": 0.035,
        "Left Bundle Branch Block": 0.015,
        "Right Bundle Branch Block": 0.01,
        "Premature Ventricular Contraction": 0.016
      },
      spectrogram_base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      lead1DataLength: 4850,
      lead2DataLength: 4200,
      lead3DataLength: 3980,
      risk_level: 'Low Risk'
    };
    
    return [sampleData]; // ส่งคืนเป็นอาร์เรย์ที่มีข้อมูลเพียงรายการเดียว
  };
  
  // ฟังก์ชันสำหรับบันทึกข้อมูลตัวอย่างลงใน localStorage
  const initializeSampleData = () => {
    const STORAGE_KEY = 'watjaiMeasurementHistory';
    
    try {
      // ตรวจสอบว่ามีข้อมูลใน localStorage หรือไม่
      const existingData = localStorage.getItem(STORAGE_KEY);
      
      // ถ้าไม่มีข้อมูล ให้สร้างข้อมูลตัวอย่างเพียงรายการเดียว
      if (!existingData || JSON.parse(existingData).length === 0) {
        const sampleData = generateSampleMeasurementHistory();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
        console.log('Initialized single sample measurement history data');
        return sampleData;
      } else {
        console.log('Measurement history data already exists');
        
        // อ่านข้อมูลปัจจุบัน และเก็บไว้เพียงรายการเดียว
        // (ใช้เฉพาะเมื่อต้องการลบรายการอื่นๆ ที่มีอยู่แล้ว)
        // const currentData = JSON.parse(existingData);
        // if (currentData.length > 1) {
        //   const singleData = [currentData[0]];
        //   localStorage.setItem(STORAGE_KEY, JSON.stringify(singleData));
        //   console.log('Reduced existing data to single entry');
        //   return singleData;
        // }
        
        return JSON.parse(existingData);
      }
    } catch (error) {
      console.error('Error initializing sample data:', error);
      return [];
    }
  };
  
  // ฟังก์ชันเพื่อล้างข้อมูลทั้งหมดและสร้างข้อมูลตัวอย่างเดียว (สำหรับรีเซ็ตข้อมูล)
  const resetToSingleSample = () => {
    const STORAGE_KEY = 'watjaiMeasurementHistory';
    try {
      const sampleData = generateSampleMeasurementHistory();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sampleData));
      console.log('Reset to single sample data');
      return sampleData;
    } catch (error) {
      console.error('Error resetting data:', error);
      return [];
    }
  };
  
  export default {
    generateSampleMeasurementHistory,
    initializeSampleData,
    resetToSingleSample
  };