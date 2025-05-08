import React, { createContext, useState, useContext, useEffect } from 'react';

const ECGContext = createContext(null);

// ชื่อคีย์ที่จะใช้เก็บข้อมูลใน localStorage
const STORAGE_KEYS = {
  DEVICE_IP: 'watjaiIpAddress',
  MEASUREMENT_HISTORY: 'watjaiMeasurementHistory'
};

export const useECG = () => {
  const context = useContext(ECGContext);
  if (!context) {
    throw new Error('useECG must be used within an ECGProvider');
  }
  return context;
};

export const ECGProvider = ({ children }) => {
  // ข้อมูลของแต่ละ lead
  const [lead1Data, setLead1Data] = useState([]);
  const [lead2Data, setLead2Data] = useState([]);
  const [lead3Data, setLead3Data] = useState([]);
  const [currentLead, setCurrentLead] = useState(1);
  const [results, setResults] = useState(null);
  
  // โหลดประวัติจาก localStorage หรือใช้ค่าเริ่มต้นเป็นอาร์เรย์ว่าง
  const [measurementHistory, setMeasurementHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem(STORAGE_KEYS.MEASUREMENT_HISTORY);
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (error) {
      console.error('Error loading measurement history from localStorage:', error);
      return [];
    }
  });
  
  // เพิ่มสถานะการเชื่อมต่อและข้อมูล IP ของอุปกรณ์
  const [isConnected, setIsConnected] = useState(false);
  const [deviceIP, setDeviceIP] = useState(localStorage.getItem(STORAGE_KEYS.DEVICE_IP) || '');
  
  // บันทึกประวัติการวัดลง localStorage เมื่อมีการเปลี่ยนแปลง
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEASUREMENT_HISTORY, JSON.stringify(measurementHistory));
    } catch (error) {
      console.error('Error saving measurement history to localStorage:', error);
    }
  }, [measurementHistory]);
  
  // เปลี่ยน lead ปัจจุบัน
  const switchLead = (leadNumber) => {
    setCurrentLead(leadNumber);
  };
  
  // บันทึกข้อมูล lead
  const saveLeadData = (leadNumber, data) => {
    switch (leadNumber) {
      case 1:
        setLead1Data(data);
        break;
      case 2:
        setLead2Data(data);
        break;
      case 3:
        setLead3Data(data);
        break;
      default:
        break;
    }
  };
  
  // รีเซ็ตข้อมูล lead ทั้งหมด
  const resetAllData = () => {
    setLead1Data([]);
    setLead2Data([]);
    setLead3Data([]);
    setResults(null);
  };
  
  // บันทึกผลการวิเคราะห์
  const saveResults = (resultData) => {
    setResults(resultData);
    
    // ตรวจสอบว่าเป็นผลวิเคราะห์ใหม่หรือไม่
    const isNewResult = !measurementHistory.some(item => item.id === resultData.id);
    
    // เพิ่มในประวัติเฉพาะเมื่อเป็นผลวิเคราะห์ใหม่
    if (isNewResult) {
      const historyItem = {
        ...resultData,
        id: resultData.id || Date.now(), // ใช้ ID ที่มีอยู่แล้วหรือสร้างใหม่
        date: resultData.date || new Date().toISOString(),
        lead1DataLength: lead1Data.length,
        lead2DataLength: lead2Data.length,
        lead3DataLength: lead3Data.length
      };
      
      setMeasurementHistory(prev => [historyItem, ...prev]);
    }
  };
  
  // อัพเดตประวัติการวัดทั้งหมด (สำหรับการลบหรือแก้ไข)
  const updateMeasurementHistory = (newHistory) => {
    setMeasurementHistory(newHistory);
  };
  
  // อัพเดตสถานะการเชื่อมต่อ
  const updateConnectionStatus = (status) => {
    setIsConnected(status);
  };
  
  // เก็บ IP address ของอุปกรณ์
  const updateDeviceIP = (ip) => {
    setDeviceIP(ip);
    if (ip) {
      localStorage.setItem(STORAGE_KEYS.DEVICE_IP, ip);
    }
  };
  
  const value = {
    lead1Data,
    lead2Data,
    lead3Data,
    currentLead,
    results,
    measurementHistory,
    isConnected,
    deviceIP,
    switchLead,
    saveLeadData,
    resetAllData,
    saveResults,
    updateMeasurementHistory,
    updateConnectionStatus,
    updateDeviceIP
  };
  
  return <ECGContext.Provider value={value}>{children}</ECGContext.Provider>;
};