import React, { useEffect, useState } from 'react';
import { Container, Button, Alert, Badge, Row, Col, Tabs, Tab, Spinner } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useECG } from '../context/ECGContext';
import ECGChart from '../components/ECGChart';
import { 
  FaHeartbeat, 
  FaFilePdf, 
  FaShareAlt, 
  FaDownload, 
  FaPrint, 
  FaTrashAlt, 
  FaSave,
  FaTimes,
  FaLink
} from 'react-icons/fa';

const ResultsPage = () => {
  const navigate = useNavigate();
  const {
    results: contextResults,
    lead1Data: contextLead1Data,
    lead2Data: contextLead2Data,
    lead3Data: contextLead3Data,
    measurementHistory,
    saveResults
  } = useECG();

  const [results, setResults] = useState(null);
  const [lead1Data, setLead1Data] = useState([]);
  const [lead2Data, setLead2Data] = useState([]);
  const [lead3Data, setLead3Data] = useState([]);


  // Check for existing results or get the most recent one from history
  useEffect(() => {
    // First check if we have results in context
    if (contextResults) {
      setResults(contextResults);
      setLead1Data(contextLead1Data);
      setLead2Data(contextLead2Data);
      setLead3Data(contextLead3Data);
    } 
    // If no results in context, try to get most recent result from history
    else if (measurementHistory.length > 0) {
      setIsLoading(true);
      
      // Sort history by date (newest first) and get the first item
      const sortedHistory = [...measurementHistory].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
      );
      
      const mostRecent = sortedHistory[0];
      
      // Set most recent result
      setResults(mostRecent);
      
      // Since we don't have actual ECG data in history, we could:
      // 1. Use any stored data references
      // 2. Generate placeholder data
      // 3. Redirect to detail view of that history item
      
      // For this example, we'll generate some placeholder ECG data
      const generatePlaceholderData = (amplitude = 100, length = 500) => {
        const data = [];
        for (let i = 0; i < length; i++) {
          // Create a sine wave with some noise
          const baseValue = Math.sin(i * 0.1) * amplitude;
          const noise = Math.random() * 20 - 10;
          
          // Add heartbeat peaks at regular intervals
          const heartbeatPeak = i % 40 === 0 ? amplitude * 2 : 0;
          
          data.push(baseValue + noise + heartbeatPeak);
        }
        return data;
      };
      
      // Generate placeholder data with different amplitudes for visualization
      setLead1Data(generatePlaceholderData(100));
      
      // Check if lead2 and lead3 data lengths are stored in history
      if (mostRecent.lead2DataLength > 0) {
        setLead2Data(generatePlaceholderData(80));
      }
      
      if (mostRecent.lead3DataLength > 0) {
        setLead3Data(generatePlaceholderData(60));
      }
      
      // Save this result to context for consistency
      saveResults(mostRecent);
      
      setIsLoading(false);
    }
    // If no results and no history, leave results as null (will show alert)
  }, [contextResults, contextLead1Data, contextLead2Data, contextLead3Data, measurementHistory, saveResults]);

  // If no results and not loading, show alert
  if (!results && !isLoading) {
    return (
      <Container className="results-page py-4">
        <Alert variant="info" className="no-results-alert">
          <Alert.Heading>No ECG Analysis Available</Alert.Heading>
          <div className="alert-content">
            <p>You don't have any ECG analysis results yet.</p>
            <div className="heart-animation">
              <FaHeartbeat className="heartbeat-icon" />
            </div>
            <p>Start measuring your ECG to get analysis results.</p>
          </div>
          <hr />
          <div className="d-flex justify-content-center">
            <Button 
              variant="primary" 
              onClick={() => navigate('/measure')} 
              className="measure-button"
            >
              <FaHeartbeat className="me-2" />
              Go to ECG Measurement
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  // Show loading spinner while loading
  if (isLoading) {
    return (
      <Container className="results-page py-4 d-flex justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" size="lg" />
          <p className="mt-3">Loading analysis results...</p>
        </div>
      </Container>
    );
  }

  // Function to check if result is normal
  const isNormal = () => {
    if (!results) return true;
    
    return results.prediction === 'Normal' || 
           results.prediction === 'Normal Sinus Rhythm' || 
           results.prediction?.toLowerCase().includes('normal');
  };

  const generateSampleData = () => {
      // Generate sample ECG data (sine wave for simplicity)
      const sampleLead1 = [];
      const sampleLead2 = [];
      const sampleLead3 = [];
      
      for (let i = 0; i < 1000; i++) {
        // Create a sine wave with some noise
        const baseValue = Math.sin(i * 0.1) * 100;
        const noise = Math.random() * 20 - 10;
        
        // Add heartbeat peaks at regular intervals
        const heartbeatPeak = i % 40 === 0 ? 200 : 0;
        
        sampleLead1.push(baseValue + noise + heartbeatPeak);
        
        // Leads 2 and 3 are variations of lead 1
        sampleLead2.push(baseValue * 0.8 + Math.random() * 20 - 10 + (i % 40 === 0 ? 180 : 0));
        sampleLead3.push(baseValue * 0.6 + Math.random() * 20 - 10 + (i % 40 === 0 ? 150 : 0));
      }
      
      // Sample results object
      const sampleResults = {
        id: Date.now(),
        prediction: "Normal Sinus Rhythm",
        confidence: 92.5,
        bpm: 72,
        timestamp: new Date().toISOString(),
        date: new Date().toISOString(),
        processing_time: 1.25,
        probabilities: {
          "Normal Sinus Rhythm": 0.925,
          "Atrial Fibrillation": 0.035,
          "Left Bundle Branch Block": 0.015,
          "Right Bundle Branch Block": 0.01,
          "Premature Ventricular Contraction": 0.015
        },
        spectrogram_base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
        risk_level: 'Low Risk'
      };
      
      setResults(sampleResults);
      setLead1Data(sampleLead1);
      setLead2Data(sampleLead2);
      setLead3Data(sampleLead3);
    };
  
    // States for enhanced functionality
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveFailed, setSaveFailed] = useState(false);
    const [activeTab, setActiveTab] = useState('standard');
    const [showShareOptions, setShowShareOptions] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const printFrameRef = useRef(null);
  
    // State for derived leads
    const [derivedLeads, setDerivedLeads] = useState({
      aVR: [],
      aVL: [],
      aVF: [],
      V1: [],
      V2: [],
      V3: [],
      V4: [],
      V5: [],
      V6: []
    });
  
    // Calculate derived leads when base leads change
    useEffect(() => {
      calculateDerivedLeads();
    }, [lead1Data, lead2Data, lead3Data]);
  
    // Function to calculate derived leads
    const calculateDerivedLeads = () => {
      // Skip calculation if we don't have data
      if (!lead1Data?.length) return;
  
      // Create arrays for derived leads
      const aVR = [];
      const aVL = [];
      const aVF = [];
      const V1 = [];
      const V2 = [];
      const V3 = [];
      const V4 = [];
      const V5 = [];
      const V6 = [];
      
      // Use lead2 and lead3 if available, otherwise generate synthetic data
      const lead2DataForCalc = lead2Data?.length > 0 ? lead2Data : generateSyntheticLead();
      const lead3DataForCalc = lead3Data?.length > 0 ? lead3Data : generateSyntheticLead();
  
      // Get the minimum length to avoid index errors
      const minLength = Math.min(
        lead1Data.length, 
        lead2DataForCalc.length, 
        lead3DataForCalc.length
      );
      
      // Calculate for each data point
      for (let i = 0; i < minLength; i++) {
        // Goldberger's Equations for augmented leads
        // aVR = -(I + II)/2
        aVR.push(-(lead1Data[i] + lead2DataForCalc[i]) / 2);
        
        // aVL = I - II/2
        aVL.push(lead1Data[i] - lead2DataForCalc[i] / 2);
        
        // aVF = II - I/2
        aVF.push(lead2DataForCalc[i] - lead1Data[i] / 2);
        
        // Synthetic calculations for precordial leads (V1-V6)
        // These are approximate derivations
        V1.push(-0.4 * lead1Data[i] - 0.2 * lead2DataForCalc[i] + 0.1 * lead3DataForCalc[i] + 40);
        V2.push(-0.3 * lead1Data[i] - 0.05 * lead2DataForCalc[i] + 0.5 * lead3DataForCalc[i] + 30);
        V3.push(-0.2 * lead1Data[i] + 0.1 * lead2DataForCalc[i] + 0.7 * lead3DataForCalc[i] + 20);
        V4.push(-0.1 * lead1Data[i] + 0.25 * lead2DataForCalc[i] + 0.8 * lead3DataForCalc[i] + 10);
        V5.push(0.1 * lead1Data[i] + 0.5 * lead2DataForCalc[i] + 0.6 * lead3DataForCalc[i]);
        V6.push(0.3 * lead1Data[i] + 0.6 * lead2DataForCalc[i] + 0.2 * lead3DataForCalc[i] - 10);
      }
      
      // Update state with all derived leads
      setDerivedLeads({
        aVR,
        aVL,
        aVF,
        V1,
        V2,
        V3,
        V4,
        V5,
        V6
      });
    };
  
    // Generate synthetic lead data for calculation when missing
    const generateSyntheticLead = () => {
      // If lead1 data exists, generate based on that with some variation
      if (lead1Data?.length > 0) {
        return lead1Data.map(value => {
          const variation = Math.random() * 40 - 20; // Random variation between -20 and +20
          return value + variation;
        });
      }
      
      // Otherwise return an empty array
      return [];
    };
  
    // Save analysis to history
    const handleSaveAnalysis = () => {
      if (!results) return;
      
      setIsSaving(true);
      
      // Simulate API call with timeout
      setTimeout(() => {
        try {
          // Update results timestamp to now
          const updatedResults = {
            ...results,
            date: new Date().toISOString()
          };
          
          // Save to context which will update localStorage
          saveResults(updatedResults);
          
          // Show success message and reset after delay
          setSaveSuccess(true);
          setTimeout(() => setSaveSuccess(false), 3000);
        } catch (error) {
          console.error('Error saving results', error);
          setSaveFailed(true);
          setTimeout(() => setSaveFailed(false), 3000);
        } finally {
          setIsSaving(false);
        }
      }, 800);
    };
  
    // Handle PDF generation and download
    const handleDownloadPDF = () => {
      setIsLoading(true);
      try {
        // Create a new window for the PDF content
        const pdfWindow = window.open('', '_blank', 'height=800,width=800');
        
        if (!pdfWindow) {
          alert('โปรดอนุญาตให้เปิดหน้าต่างป๊อปอัพเพื่อสร้าง PDF');
          setIsLoading(false);
          return;
        }
        
        // Generate HTML content for PDF
        pdfWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>รายงานผลการวิเคราะห์ ECG - WatJai</title>
              <style>
                body {
                  font-family: 'Sarabun', 'THSarabunNew', Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                  background-color: white;
                  color: #333;
                }
                .container {
                  max-width: 800px;
                  margin: 0 auto;
                }
                .header {
                  text-align: center;
                  margin-bottom: 20px;
                  border-bottom: 2px solid #e0e0e0;
                  padding-bottom: 10px;
                }
                .header h1 {
                  font-size: 24px;
                  margin-bottom: 5px;
                }
                .header p {
                  color: #666;
                  margin-top: 0;
                }
                .section {
                  margin-bottom: 20px;
                  page-break-inside: avoid;
                }
                .section-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  border-bottom: 1px solid #ddd;
                  padding-bottom: 5px;
                }
                .result-item {
                  margin-bottom: 8px;
                }
                .label {
                  font-weight: bold;
                  display: inline-block;
                  width: 140px;
                }
                .ecg-container {
                  margin: 15px 0;
                  border: 1px solid #ddd;
                  background-color: #f9f9f9;
                  padding: 10px;
                }
                .leads-grid {
                  display: grid;
                  grid-template-columns: 1fr 1fr;
                  gap: 15px;
                  margin-top: 15px;
                }
                .lead-item {
                  border: 1px solid #ddd;
                  padding: 5px;
                  background-color: #fff;
                }
                .lead-title {
                  font-weight: bold;
                  margin-bottom: 5px;
                  text-align: center;
                }
                .recommendations {
                  background-color: #f0f7ff;
                  padding: 15px;
                  border-radius: 5px;
                }
                .recommendations ul {
                  margin-top: 10px;
                  padding-left: 25px;
                }
                .recommendations li {
                  margin-bottom: 8px;
                }
                .footer {
                  margin-top: 30px;
                  text-align: center;
                  font-size: 12px;
                  color: #666;
                  border-top: 1px solid #ddd;
                  padding-top: 10px;
                }
                .buttons {
                  display: flex;
                  justify-content: center;
                  gap: 10px;
                  margin: 20px 0;
                }
                .btn {
                  padding: 10px 20px;
                  background-color: #4285f4;
                  color: white;
                  border: none;
                  border-radius: 5px;
                  cursor: pointer;
                  font-size: 14px;
                }
                .btn-secondary {
                  background-color: #757575;
                }
                
                @media print {
                  .no-print {
                    display: none;
                  }
                  body {
                    padding: 0;
                    margin: 0;
                  }
                  .container {
                    width: 100%;
                    max-width: none;
                  }
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>รายงานผลการวิเคราะห์คลื่นไฟฟ้าหัวใจ</h1>
                  <p>วันที่ออกรายงาน: ${new Date().toLocaleDateString()}</p>
                </div>
                
                <div class="section">
                  <div class="section-title">ข้อมูลการตรวจ</div>
                  <div class="result-item">
                    <span class="label">รหัสการตรวจ:</span>
                    <span>WJ-${Date.now().toString().slice(-6)}</span>
                  </div>
                  <div class="result-item">
                    <span class="label">วันที่ตรวจ:</span>
                    <span>${results?.date ? new Date(results.date).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  </div>
                  <div class="result-item">
                    <span class="label">เวลา:</span>
                    <span>${results?.date ? new Date(results.date).toLocaleTimeString() : new Date().toLocaleTimeString()}</span>
                  </div>
                </div>
                
                <div class="section">
                  <div class="section-title">ผลการวิเคราะห์</div>
                  <div class="result-item">
                    <span class="label">การวินิจฉัย:</span>
                    <span>${results?.prediction || 'Normal Sinus Rhythm'}</span>
                  </div>
                  <div class="result-item">
                    <span class="label">ความมั่นใจในผล:</span>
                    <span>${results?.confidence ? results.confidence.toFixed(1) : 95}%</span>
                  </div>
                  <div class="result-item">
                    <span class="label">ระดับความเสี่ยง:</span>
                    <span>${results?.risk_level || (isNormal() ? 'Low Risk' : 'High Risk')}</span>
                  </div>
                </div>
                
                <div class="section">
                  <div class="section-title">กราฟคลื่นไฟฟ้าหัวใจ Lead I</div>
                  <div class="ecg-container">
                    <canvas id="ecg-lead1" width="700" height="200"></canvas>
                  </div>
                </div>
                
                <div class="section">
                  <div class="section-title">12-Lead ECG</div>
                  <div class="leads-grid">
                    <div class="lead-item">
                      <div class="lead-title">Lead II</div>
                      <canvas id="ecg-lead2" width="320" height="150"></canvas>
                    </div>
                    <div class="lead-item">
                      <div class="lead-title">Lead III</div>
                      <canvas id="ecg-lead3" width="320" height="150"></canvas>
                    </div>
                    <div class="lead-item">
                      <div class="lead-title">aVR</div>
                      <canvas id="ecg-avr" width="320" height="150"></canvas>
                    </div>
                    <div class="lead-item">
                      <div class="lead-title">aVL</div>
                      <canvas id="ecg-avl" width="320" height="150"></canvas>
                    </div>
                    <div class="lead-item">
                      <div class="lead-title">aVF</div>
                      <canvas id="ecg-avf" width="320" height="150"></canvas>
                    </div>
                    <div class="lead-item">
                      <div class="lead-title">V1</div>
                      <canvas id="ecg-v1" width="320" height="150"></canvas>
                    </div>
                  </div>
                </div>
                
                <div class="section">
                  <div class="section-title">คำแนะนำ</div>
                  <div class="recommendations">
                    ${isNormal() ?
                      `<p>จากผลการตรวจวิเคราะห์ คลื่นไฟฟ้าหัวใจของคุณอยู่ในเกณฑ์ปกติ แต่เพื่อสุขภาพหัวใจที่ดีอย่างต่อเนื่อง ควรปฏิบัติดังนี้</p>
                      <ul>
                        <li>ควรตรวจสุขภาพประจำปีอย่างสม่ำเสมอ</li>
                        <li>รักษาน้ำหนักให้เหมาะสม</li>
                        <li>ออกกำลังกายสม่ำเสมออย่างน้อยสัปดาห์ละ 150 นาที</li>
                        <li>รับประทานอาหารที่มีประโยชน์ ลดอาหารที่มีไขมันและโซเดียมสูง</li>
                        <li>หลีกเลี่ยงการสูบบุหรี่และการดื่มแอลกอฮอล์เกินขนาด</li>
                        <li>ฝึกการจัดการความเครียด</li>
                      </ul>` :
                      `<p>จากผลการตรวจวิเคราะห์ พบความผิดปกติในคลื่นไฟฟ้าหัวใจ ควรปฏิบัติดังนี้</p>
                      <ul>
                        <li>ควรปรึกษาแพทย์เพื่อประเมินอาการเพิ่มเติม</li>
                        <li>ทำการตรวจวินิจฉัยเพิ่มเติมตามที่แพทย์แนะนำ</li>
                        <li>ติดตามการเปลี่ยนแปลงของอาการอย่างสม่ำเสมอ</li>
                        <li>ใช้ยาตามที่แพทย์สั่งอย่างเคร่งครัด</li>
                        <li>หลีกเลี่ยงการออกกำลังกายหนักจนกว่าจะได้รับการประเมินจากแพทย์</li>
                      </ul>`
                    }
                  </div>
                </div>
                
                <div class="footer">
                  <p>รายงานนี้เป็นการวิเคราะห์ด้วยระบบอัตโนมัติ ควรได้รับการตรวจสอบโดยแพทย์ผู้เชี่ยวชาญ</p>
                  <p>© WatJai ECG Analysis Platform</p>
                </div>
                
                <div class="buttons no-print">
                  <button class="btn" onclick="window.print()">พิมพ์รายงาน</button>
                  <button class="btn btn-secondary" onclick="window.close()">ปิด</button>
                </div>
              </div>
              
              <script>
                // วาดกราฟ ECG เมื่อโหลดหน้าเสร็จ
                window.onload = function() {
                  // ข้อมูลจากหน้าหลัก
                  const lead1Data = ${JSON.stringify(lead1Data?.slice(0, 400) || [])};
                  const lead2Data = ${JSON.stringify(lead2Data?.slice(0, 400) || derivedLeads.aVF.slice(0, 400) || [])};
                  const lead3Data = ${JSON.stringify(lead3Data?.slice(0, 400) || derivedLeads.aVF.slice(0, 400) || [])};
                  const avrData = ${JSON.stringify(derivedLeads.aVR?.slice(0, 400) || [])};
                  const avlData = ${JSON.stringify(derivedLeads.aVL?.slice(0, 400) || [])};
                  const avfData = ${JSON.stringify(derivedLeads.aVF?.slice(0, 400) || [])};
                  const v1Data = ${JSON.stringify(derivedLeads.V1?.slice(0, 400) || [])};
                  
                  // ฟังก์ชันสำหรับวาด ECG
                  function drawECG(canvasId, data, color = '#000000') {
                    const canvas = document.getElementById(canvasId);
                    if (!canvas) return;
                    
                    const ctx = canvas.getContext('2d');
                    
                    // วาดพื้นหลัง
                    ctx.fillStyle = '#f8f9fa';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    
                    // วาดเส้นกริด
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.1)';
                    
                    // เส้นแนวตั้ง
                    for (let x = 0; x <= canvas.width; x += 20) {
                      ctx.moveTo(x, 0);
                      ctx.lineTo(x, canvas.height);
                    }
                    
                    // เส้นแนวนอน
                    for (let y = 0; y <= canvas.height; y += 20) {
                      ctx.moveTo(0, y);
                      ctx.lineTo(canvas.width, y);
                    }
                    
                    ctx.stroke();
                    
                    // วาดเส้น ECG
                    if (data && data.length > 0) {
                      ctx.beginPath();
                      ctx.strokeStyle = color;
                      ctx.lineWidth = 1.5;
                      
                      const dataLength = Math.min(data.length, canvas.width);
                      const xScale = canvas.width / dataLength;
                      const yScale = canvasId === 'ecg-lead1' ? 40 : 30;
                      const yOffset = canvas.height / 2;
                      
                      ctx.moveTo(0, yOffset - data[0] / yScale);
                      
                      for (let i = 1; i < dataLength; i++) {
                        ctx.lineTo(i * xScale, yOffset - data[i] / yScale);
                      }
                      
                      ctx.stroke();
                    } else {
                      ctx.font = '12px Arial';
                      ctx.fillStyle = '#666';
                      ctx.fillText('ไม่มีข้อมูล ECG', canvas.width/2 - 40, canvas.height/2);
                    }
                  }
                  
                  // วาด ECG ทั้งหมด
                  drawECG('ecg-lead1', lead1Data, '#000000');
                  drawECG('ecg-lead2', lead2Data, '#000000');
                  drawECG('ecg-lead3', lead3Data, '#000000');
                  drawECG('ecg-avr', avrData, '#0066cc');
                  drawECG('ecg-avl', avlData, '#0066cc');
                  drawECG('ecg-avf', avfData, '#0066cc');
                  drawECG('ecg-v1', v1Data, '#009933');
                };
              </script>
            </body>
          </html>
        `);
        
        pdfWindow.document.close();
        
        // รอเวลาสักครู่ให้หน้าโหลดเสร็จก่อนแสดง
        setTimeout(() => {
          pdfWindow.focus();
          setIsLoading(false);
        }, 1000);
        
      } catch (error) {
        console.error('เกิดข้อผิดพลาดในการสร้าง PDF:', error);
        alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
        setIsLoading(false);
      }
    };
  
    // Handle direct printing
    const handlePrint = () => {
      setIsLoading(true);
      
      try {
        // Create iframe for printing
        const printContent = document.createElement('iframe');
        printContent.style.display = 'none';
        printContent.title = 'Print ECG Report';
        document.body.appendChild(printContent);
        printFrameRef.current = printContent;
        
        // Create print content
        printContent.contentDocument.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>รายงานผลการวิเคราะห์ ECG - WatJai</title>
              <style>
                body {
                  font-family: Arial, sans-serif;
                  margin: 0;
                  padding: 20px;
                }
                .report-container {
                  max-width: 800px;
                  margin: 0 auto;
                }
                .header {
                  text-align: center;
                  border-bottom: 2px solid #ddd;
                  padding-bottom: 10px;
                  margin-bottom: 20px;
                }
                .result-section {
                  margin-bottom: 25px;
                }
                .section-title {
                  font-size: 18px;
                  font-weight: bold;
                  margin-bottom: 10px;
                  border-bottom: 1px solid #eee;
                  padding-bottom: 5px;
                }
                .result-row { 
    display: flex; 
    margin-bottom: 8px;
  }
  
  .result-label {
    font-weight: bold;
    width: 160px;
  }
  
  .ecg-image {
    width: 100%;
    height: 200px;
    background-color: #f0f0f0;
    margin: 15px 0;
    border: 1px solid #ddd;
  }
  
  .footer {
    margin-top: 30px;
    text-align: center;
    font-size: 12px;
    color: #777;
    border-top: 1px solid #ddd;
    padding-top: 10px;
  }
  </style>
  </head>
  <body>
  <div class="report-container">
    <div class="header">
      <h1>รายงานผลการวิเคราะห์คลื่นไฟฟ้าหัวใจ</h1>
      <p>วันที่: ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div class="result-section">
      <div class="section-title">ผลการวิเคราะห์</div>
      <div class="result-row">
        <div class="result-label">การวินิจฉัย:</div>
        <div>${results?.prediction || 'Normal Sinus Rhythm'}</div>
      </div>
      <div class="result-row">
        <div class="result-label">ความมั่นใจในผล:</div>
        <div>${results?.confidence ? results.confidence.toFixed(1) : 95}%</div>
      </div>
      <div class="result-row">
        <div class="result-label">อัตราการเต้นของหัวใจ:</div>
        <div>${results?.bpm || 72} BPM</div>
      </div>
    </div>
    
    <div class="ecg-image"></div>
    
    <div class="footer">
      <p>รายงานนี้เป็นการวิเคราะห์ด้วยระบบอัตโนมัติ ควรได้รับการตรวจสอบโดยแพทย์</p>
      <p>© WatJai ECG Analysis Platform</p>
    </div>
  </div>
  </body>
  </html>
  `);
  
  printContent.contentDocument.close();
  
  // Wait a bit for content to render
  setTimeout(() => {
    printContent.contentWindow.focus();
    printContent.contentWindow.print();
    
    // Remove the frame once print dialog is closed or after a timeout
    setTimeout(() => {
      document.body.removeChild(printContent);
      setIsLoading(false);
    }, 2000);
  }, 500);
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการพิมพ์:', error);
    alert('เกิดข้อผิดพลาดในการพิมพ์ กรุณาลองใหม่อีกครั้ง');
    setIsLoading(false);
  }
  };
  
  // Function to check if result is normal
  
  // Configuration for lead display
  const leadConfigurations = {
  standard: [
    { data: lead1Data, label: 'I', color: '#000000' },
    { data: lead2Data, label: 'II', color: '#000000' },
    { data: lead3Data, label: 'III', color: '#000000' }
  ],
  augmented: [
    { data: derivedLeads.aVR, label: 'aVR', color: '#0066cc' },
    { data: derivedLeads.aVL, label: 'aVL', color: '#0066cc' },
    { data: derivedLeads.aVF, label: 'aVF', color: '#0066cc' }
  ],
  precordial: [
    { data: derivedLeads.V1, label: 'V1', color: '#009933' },
    { data: derivedLeads.V2, label: 'V2', color: '#009933' },
    { data: derivedLeads.V3, label: 'V3', color: '#009933' },
    { data: derivedLeads.V4, label: 'V4', color: '#009933' },
    { data: derivedLeads.V5, label: 'V5', color: '#009933' },
    { data: derivedLeads.V6, label: 'V6', color: '#009933' }
  ],
  all: [
    { data: lead1Data, label: 'I', color: '#000000' },
    { data: lead2Data, label: 'II', color: '#000000' },
    { data: lead3Data, label: 'III', color: '#000000' },
    { data: derivedLeads.aVR, label: 'aVR', color: '#0066cc' },
    { data: derivedLeads.aVL, label: 'aVL', color: '#0066cc' },
    { data: derivedLeads.aVF, label: 'aVF', color: '#0066cc' },
    { data: derivedLeads.V1, label: 'V1', color: '#009933' },
    { data: derivedLeads.V2, label: 'V2', color: '#009933' },
    { data: derivedLeads.V3, label: 'V3', color: '#009933' },
    { data: derivedLeads.V4, label: 'V4', color: '#009933' },
    { data: derivedLeads.V5, label: 'V5', color: '#009933' },
    { data: derivedLeads.V6, label: 'V6', color: '#009933' }
  ]
  };
  
  // Delete the current result
  const handleDeleteResult = () => {
  setIsLoading(true);
  
  // Simulate API call with timeout
  setTimeout(() => {
    navigate('/measure');
    setIsLoading(false);
    setShowDeleteConfirm(false);
  }, 800);
  };

  // Rest of your existing ResultsPage component...
  // (Keep your existing code here - the visualization and controls)

  return (
    <div className="results-page">
      <Container className="content-container">
        <h1 className="result-title">ECG Analysis Results</h1>
        
        <div className="last-analysis-info mb-4">
          <span className="date-badge">
            Analysis from: {new Date(results.date).toLocaleDateString()} 
            {new Date(results.date).toLocaleTimeString()}
          </span>
          <Button 
            variant="outline-primary" 
            size="sm" 
            className="new-btn"
            onClick={() => navigate('/measure')}
          >
            <FaHeartbeat className="me-2" />
            New Analysis
          </Button>
        </div>
        
        {/* Main content of your results page */}
        {/* ... your existing code ... */}
        
        {/* Example placeholder to show basic results */}
        <div className="prediction-card">
          <div className="prediction-header">
            <h2 className="prediction-title">{results?.prediction || "Normal Sinus Rhythm"}</h2>
            <div className="prediction-subtitle">Rhythm</div>
          </div>
          
          <div className="confidence-section">
            <div className="confidence-label">
              <span>Analysis Confidence:</span>
              <span className="confidence-value">{results?.confidence?.toFixed(1) || "92.5"}%</span>
            </div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${results?.confidence || 92.5}%` }}
              ></div>
            </div>
          </div>

          <div className="signal-section">
            <div className={`signal-badge ${isNormal() ? 'normal' : 'abnormal'}`}>
              {isNormal() ? 'Normal Signal' : 'Abnormal Signal'}
            </div>
          </div>
          
          {/* Display ECG Charts */}
          <div className="ecg-charts mt-4">
            <h3 className="charts-title">ECG Signals</h3>
            
            <div className="chart-container">
              <h4 className="lead-title">Lead I</h4>
              <ECGChart 
                data={lead1Data} 
                label="Lead I" 
                color="rgb(255, 99, 132)" 
                height={150}
              />
            </div>
            
            {lead2Data.length > 0 && (
              <div className="chart-container">
                <h4 className="lead-title">Lead II</h4>
                <ECGChart 
                  data={lead2Data} 
                  label="Lead II" 
                  color="rgb(54, 162, 235)" 
                  height={150}
                />
              </div>
            )}
            
            {lead3Data.length > 0 && (
              <div className="chart-container">
                <h4 className="lead-title">Lead III</h4>
                <ECGChart 
                  data={lead3Data} 
                  label="Lead III" 
                  color="rgb(75, 192, 192)" 
                  height={150}
                />
              </div>
            )}
          </div>
          
          {/* Recommendations based on result */}
          {isNormal() ? (
            <div className="recommendation-section">
              <h3 className="recommendation-title">Recommendations</h3>
              <div className="recommendation-content">
                <p>Your ECG analysis results appear normal. To maintain good heart health:</p>
                <ul>
                  <li>Continue with regular health check-ups</li>
                  <li>Maintain a healthy weight</li>
                  <li>Exercise regularly, at least 150 minutes per week</li>
                  <li>Eat a heart-healthy diet, low in sodium and saturated fats</li>
                  <li>Avoid smoking and limit alcohol consumption</li>
                  <li>Manage stress through relaxation techniques</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="recommendation-section abnormal">
              <h3 className="recommendation-title">Recommendations</h3>
              <div className="recommendation-content">
                <p className="warning-text">Your ECG analysis detected abnormalities. We recommend:</p>
                <ul>
                  <li>Consult with a healthcare provider for further evaluation</li>
                  <li>Complete additional diagnostic tests as recommended by your doctor</li>
                  <li>Monitor for any changes in symptoms</li>
                  <li>Take medications as prescribed</li>
                  <li>Avoid strenuous physical activity until evaluated by a healthcare provider</li>
                </ul>
              </div>
            </div>
          )}
          
          {/* Probabilities Section */}
          {results?.probabilities && (
            <div className="probabilities-section">
              <h3 className="probabilities-title">Classification Probabilities</h3>
              <div className="probabilities-container">
                {Object.entries(results.probabilities)
                  .sort(([, a], [, b]) => b - a)
                  .map(([className, probability]) => (
                    <div key={className} className="probability-item">
                      <div className="probability-header">
                        <span className="probability-class">{className}</span>
                        <span className="probability-percent">{(probability * 100).toFixed(1)}%</span>
                      </div>
                      <div className="probability-bar-container">
                        <div 
                          className="probability-bar"
                          style={{ 
                            width: `${probability * 100}%`,
                            backgroundColor: className === results.prediction ? '#4183f4' : '#6c757d'
                          }}
                        ></div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}
        </div>
      </Container>
      
      <style jsx>{`
        .results-page {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding: 30px 0;
        }
        
        .content-container {
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .result-title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 20px;
          color: #333;
          position: relative;
          padding-bottom: 12px;
        }
        
        .result-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 70px;
          height: 4px;
          background-color: #4183f4;
        }
        
        .last-analysis-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        
        .date-badge {
          background-color: #f0f7ff;
          padding: 8px 16px;
          border-radius: 20px;
          color: #4183f4;
          font-weight: 500;
        }
        
        .new-btn {
          border-radius: 8px;
          font-weight: 500;
          transition: all 0.3s ease;
        }
        
        .new-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .no-results-alert {
          border-radius: 16px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          padding: 30px;
          margin-top: 40px;
          text-align: center;
        }
        
        .heart-animation {
          margin: 30px 0;
        }
        
        .heartbeat-icon {
          font-size: 64px;
          color: #dc3545;
          animation: heartbeat 1.5s infinite;
        }
        
        .measure-button {
          padding: 12px 25px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 16px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .measure-button:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
        }
        
        /* Prediction Card */
        .prediction-card {
          background-color: white;
          border-radius: 16px;
          padding: 30px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          margin-bottom: 30px;
          transition: all 0.3s ease;
        }
        
        .prediction-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          transform: translateY(-3px);
        }
        
        .prediction-header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .prediction-title {
          font-size: 36px;
          font-weight: 700;
          margin: 0 0 10px 0;
          color: #333;
        }
        
        .prediction-subtitle {
          font-size: 18px;
          color: #666;
          font-weight: 500;
        }
        
        .confidence-section {
          margin-bottom: 30px;
        }
        
        .confidence-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 12px;
          font-size: 18px;
        }
        
        .confidence-value {
          font-weight: 700;
          color: #2c70e0;
        }
        
        .confidence-bar {
          height: 14px;
          background-color: #e9ecef;
          border-radius: 7px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .confidence-fill {
          height: 100%;
          background-color: #2c70e0;
          background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
          background-size: 1rem 1rem;
          border-radius: 7px;
          transition: width 1.5s ease;
          animation: progress-bar-stripes 1s linear infinite;
        }
        
        @keyframes progress-bar-stripes {
          from { background-position: 1rem 0; }
          to { background-position: 0 0; }
        }
        
        .signal-section {
          display: flex;
          justify-content: center;
          margin: 30px 0;
        }
        
        .signal-badge {
          display: inline-block;
          padding: 15px 40px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 18px;
          text-align: center;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .signal-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(0, 0, 0, 0.15);
        }
        
        .signal-badge.normal {
          background-color: #e6f7ec;
          color: #0d904f;
          border: 1px solid #0d904f;
        }
        
        .signal-badge.abnormal {
          background-color: #feeaea;
          color: #d32f2f;
          border: 1px solid #d32f2f;
        }
        
        /* ECG Charts */
        .ecg-charts {
          background-color: #f9f9f9;
          border-radius: 12px;
          padding: 20px;
          margin-top: 30px;
        }
        
        .charts-title {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 20px;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }
        
        .chart-container {
          margin-bottom: 20px;
        }
        
        .lead-title {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 10px;
          color: #555;
        }
        
        /* Recommendation Section */
        .recommendation-section {
          background-color: #f9f9f9;
          border-radius: 12px;
          padding: 25px;
          margin-top: 30px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .recommendation-section:hover {
          background-color: #f2f7ff;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }
        
        .recommendation-section.abnormal:hover {
          background-color: #fff7f7;
        }
        
        .recommendation-title {
          font-size: 24px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
          position: relative;
          padding-bottom: 10px;
        }
        
        .recommendation-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background-color: #0d904f;
        }
        
        .recommendation-section.abnormal .recommendation-title:after {
          background-color: #d32f2f;
        }
        
        .recommendation-content {
          font-size: 16px;
          line-height: 1.7;
          color: #444;
        }
        
        .recommendation-content ul {
          padding-left: 25px;
          margin-top: 15px;
        }
        
        .recommendation-content li {
          margin-bottom: 10px;
          position: relative;
        }
        
        .recommendation-content li::marker {
          color: #0d904f;
          font-weight: bold;
        }
        
        .recommendation-section.abnormal .recommendation-content li::marker {
          color: #d32f2f;
        }
        
        .warning-text {
          color: #d32f2f;
          font-weight: 500;
        }
        
        /* Probabilities Section */
        .probabilities-section {
          background-color: #f9f9f9;
          border-radius: 12px;
          padding: 25px;
          margin-top: 30px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .probabilities-title {
          font-size: 20px;
          font-weight: 700;
          margin-top: 0;
          margin-bottom: 20px;
          color: #333;
        }
        
        .probabilities-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }
        
        .probability-item {
          margin-bottom: 15px;
        }
        
        .probability-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }
        
        .probability-class {
          font-weight: 500;
          font-size: 16px;
        }
        
        .probability-percent {
          font-weight: 700;
          color: #333;
        }
        
        .probability-bar-container {
          height: 10px;
          background-color: #e9ecef;
          border-radius: 5px;
          overflow: hidden;
        }
        
        .probability-bar {
          height: 100%;
          background-color: #4183f4;
          border-radius: 5px;
          transition: width 1s ease;
        }
        
        @keyframes heartbeat {
          0% { transform: scale(1); }
          25% { transform: scale(1.1); }
          50% { transform: scale(1); }
          75% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
          .prediction-title {
            font-size: 28px;
          }
          
          .result-title {
            font-size: 28px;
          }
          
          .last-analysis-info {
            flex-direction: column;
            gap: 10px;
            align-items: flex-start;
          }
          
          .new-btn {
            width: 100%;
          }
          
          .probabilities-container {
            grid-template-columns: 1fr;
          }
        }
        
        @media (max-width: 576px) {
          .prediction-title {
            font-size: 24px;
          }
          
          .signal-badge {
            padding: 12px 25px;
            font-size: 16px;
          }
          
          .recommendation-title {
            font-size: 20px;
          }
          
          .recommendation-content {
            font-size: 15px;
          }
        }
      `}</style>
    </div>
  );
};

export default ResultsPage;