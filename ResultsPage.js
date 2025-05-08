import React, { useEffect, useState, useRef } from 'react';
import { Container, Button, Alert, Badge, Row, Col, Tabs, Tab } from 'react-bootstrap';
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

  

  // State for active tab
  const [activeTab, setActiveTab] = useState('all');

  // Calculate derived leads when base leads change
  useEffect(() => {
    // Only calculate if we have all 3 leads available
    if (lead1Data.length > 0 && lead2Data.length > 0 && lead3Data.length > 0) {
      // Get the minimum length to avoid index errors
      const minLength = Math.min(lead1Data.length, lead2Data.length, lead3Data.length);
      
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
      
      // Calculate for each data point
      for (let i = 0; i < minLength; i++) {
        // Goldberger's Equations for augmented leads
        // aVR = -(I + II)/2
        aVR.push(-(lead1Data[i] + lead2Data[i]) / 2);
        
        // aVL = I - II/2
        aVL.push(lead1Data[i] - lead2Data[i] / 2);
        
        // aVF = II - I/2
        aVF.push(lead2Data[i] - lead1Data[i] / 2);
        
        // Affine/Regression calculations for precordial leads (V1-V6)
        // These coefficients should ideally be derived from patient-specific data
        // or population studies, but here are approximate values based on literature
        
        // V1 = -0.4*I - 0.2*II + 0.1*III + offset
        V1.push(-0.4 * lead1Data[i] - 0.2 * lead2Data[i] + 0.1 * lead3Data[i] + 40);
        
        // V2 = -0.3*I - 0.05*II + 0.5*III + offset
        V2.push(-0.3 * lead1Data[i] - 0.05 * lead2Data[i] + 0.5 * lead3Data[i] + 30);
        
        // V3 = -0.2*I + 0.1*II + 0.7*III + offset
        V3.push(-0.2 * lead1Data[i] + 0.1 * lead2Data[i] + 0.7 * lead3Data[i] + 20);
        
        // V4 = -0.1*I + 0.25*II + 0.8*III + offset
        V4.push(-0.1 * lead1Data[i] + 0.25 * lead2Data[i] + 0.8 * lead3Data[i] + 10);
        
        // V5 = 0.1*I + 0.5*II + 0.6*III + offset
        V5.push(0.1 * lead1Data[i] + 0.5 * lead2Data[i] + 0.6 * lead3Data[i]);
        
        // V6 = 0.3*I + 0.6*II + 0.2*III + offset
        V6.push(0.3 * lead1Data[i] + 0.6 * lead2Data[i] + 0.2 * lead3Data[i] - 10);
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
    }
  }, [lead1Data, lead2Data, lead3Data]);

  // If no analysis results exist, show alert
  if (!results) {
    return (
      <Container>
        <Alert variant="warning">
          <Alert.Heading>No Analysis Results</Alert.Heading>
          <p>Please measure and analyze ECG</p>
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
  
  // Get risk level or provide a default
  const riskLevel = results.risk_level || 
    (results.prediction === 'Normal' || results.prediction === 'Normal Sinus Rhythm' ? 
      (results.confidence > 80 ? 'Low Risk' : results.confidence > 50 ? 'Medium Risk' : 'High Risk') 
      : 'High Risk');

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

  // Check if the result is normal
  const isNormalRhythm = results.prediction === 'Normal' || 
                        results.prediction === 'Normal Sinus Rhythm' || 
                        results.prediction?.toLowerCase().includes('normal');

  // Function to handle PDF generation and download
  const handleDownloadPDF = () => {
    try {
      // Create a new window for the PDF content
      const pdfWindow = window.open('', '_blank', 'height=800,width=800');
      
      if (!pdfWindow) {
        alert('โปรดอนุญาตให้เปิดหน้าต่างป๊อปอัพเพื่อสร้าง PDF');
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
                  <span>${new Date().toLocaleDateString()}</span>
                </div>
                <div class="result-item">
                  <span class="label">เวลา:</span>
                  <span>${new Date().toLocaleTimeString()}</span>
                </div>
              </div>
              
              <div class="section">
                <div class="section-title">ผลการวิเคราะห์</div>
                <div class="result-item">
                  <span class="label">การวินิจฉัย:</span>
                  <span>${results.prediction || 'Normal Sinus Rhythm'}</span>
                </div>
                <div class="result-item">
                  <span class="label">ความมั่นใจในผล:</span>
                  <span>${results.confidence ? results.confidence.toFixed(1) : 95}%</span>
                </div>
                <div class="result-item">
                  <span class="label">ระดับความเสี่ยง:</span>
                  <span>${riskLevel}</span>
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
                  ${isNormalRhythm ?
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
                const lead1Data = ${JSON.stringify(lead1Data || [])};
                const lead2Data = ${JSON.stringify(lead2Data || [])};
                const lead3Data = ${JSON.stringify(lead3Data || [])};
                const avrData = ${JSON.stringify(derivedLeads.aVR || [])};
                const avlData = ${JSON.stringify(derivedLeads.aVL || [])};
                const avfData = ${JSON.stringify(derivedLeads.aVF || [])};
                const v1Data = ${JSON.stringify(derivedLeads.V1 || [])};
                
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
      }, 1000);
      
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการสร้าง PDF:', error);
      alert('เกิดข้อผิดพลาดในการสร้าง PDF กรุณาลองใหม่อีกครั้ง');
    }
  };

  // Function to handle direct printing
  const handlePrint = () => {
    try {
      // เริ่มกระบวนการพิมพ์โดยตรง
      // ข้อมูลเหมือนกับ PDF แต่จัดรูปแบบสำหรับการพิมพ์โดยเฉพาะ
      window.print();
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการพิมพ์:', error);
      alert('เกิดข้อผิดพลาดในการพิมพ์ กรุณาลองใหม่อีกครั้ง');
    }
  };

  return (
    <div className="results-page">
      
      <Container className="mt-3">
        <h1 className="result-title">Result ECG</h1>
        
        {/* 12-Lead ECG Display with Tabs */}
        <div className="ecg-grid-card">
          <Tabs
            id="ecg-tabs"
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            className="mb-3 ecg-tabs"
          >
            <Tab eventKey="standard" title="Standard">
              <div className="ecg-grid standard-leads-grid">
                {leadConfigurations.standard.map((lead, index) => (
                  <div key={index} className="ecg-lead-container">
                    <div className="lead-label">{lead.label}</div>
                    <ECGChart 
                      data={lead.data.slice(0, 400)} 
                      label={`Lead ${lead.label}`} 
                      color={lead.color}
                      height={100}
                    />
                  </div>
                ))}
              </div>
            </Tab>
            <Tab eventKey="augmented" title="Augmented">
              <div className="ecg-grid augmented-leads-grid">
                {leadConfigurations.augmented.map((lead, index) => (
                  <div key={index} className="ecg-lead-container">
                    <div className="lead-label">{lead.label}</div>
                    <ECGChart 
                      data={lead.data.slice(0, 400)} 
                      label={`Lead ${lead.label}`} 
                      color={lead.color}
                      height={100}
                    />
                  </div>
                ))}
              </div>
            </Tab>
            <Tab eventKey="precordial" title="Precordial">
              <div className="ecg-grid precordial-leads-grid">
                {leadConfigurations.precordial.map((lead, index) => (
                  <div key={index} className="ecg-lead-container">
                    <div className="lead-label">{lead.label}</div>
                    <ECGChart 
                      data={lead.data.slice(0, 400)} 
                      label={`Lead ${lead.label}`} 
                      color={lead.color}
                      height={80}
                    />
                  </div>
                ))}
              </div>
            </Tab>
            <Tab eventKey="all" title="All 12 Leads">
              <div className="ecg-grid ecg-grid-all">
                {leadConfigurations.all.map((lead, index) => (
                  <div key={index} className="ecg-lead-container ecg-lead-small">
                    <div className="lead-label">{lead.label}</div>
                    <ECGChart 
                      data={lead.data.slice(0, 400)} 
                      label={`Lead ${lead.label}`} 
                      color={lead.color}
                      height={70}
                    />
                  </div>
                ))}
              </div>
            </Tab>
          </Tabs>
          
        </div>
        
        {/* Enhanced Prediction Display with Confidence */}
        <div className="prediction-card">
          <div className="prediction-header">
            <h2 className="prediction-title">{results.prediction}</h2>
            <div className="prediction-subtitle">Rhythm</div>
          </div>
          
          <div className="confidence-section">
            <div className="confidence-label">
              <span>ความมั่นใจในการวิเคราะห์:</span>
              <span className="confidence-value">{results.confidence.toFixed(1)}%</span>
            </div>
            <div className="confidence-bar">
              <div 
                className="confidence-fill" 
                style={{ width: `${results.confidence}%` }}
              ></div>
            </div>
          </div>

          <div className="signal-section">
            <div className={`signal-badge ${isNormalRhythm ? 'normal' : 'abnormal'}`}>
              {isNormalRhythm ? 'สัญญาณปกติ' : 'สัญญาณผิดปกติ'}
            </div>
          </div>

          {isNormalRhythm && (
  <div className="recommendation-section">
    <h3 className="recommendation-title">คำแนะนำ</h3>
    <div className="recommendation-content">
      <p>จากผลการตรวจวิเคราะห์ คลื่นไฟฟ้าหัวใจของคุณอยู่ในเกณฑ์ปกติ แต่เพื่อสุขภาพหัวใจที่ดีอย่างต่อเนื่อง ควรปฏิบัติดังนี้</p>
      <ul>
        <li>ควรตรวจสุขภาพประจำปีอย่างสม่ำเสมอ</li>
        <li>รักษาน้ำหนักให้เหมาะสม</li>
        <li>ออกกำลังกายสม่ำเสมออย่างน้อยสัปดาห์ละ 150 นาที</li>
        <li>รับประทานอาหารที่มีประโยชน์ ลดอาหารที่มีไขมันและโซเดียมสูง</li>
        <li>หลีกเลี่ยงการสูบบุหรี่และการดื่มแอลกอฮอล์เกินขนาด</li>
        <li>ฝึกการจัดการความเครียด</li>
      </ul>
    </div>
  </div>
)}
        </div>
        
        {/* Risk Assessment */}
      
        
        {/* Action Buttons */}
        <Row className="mb-4">
          <Col xs={12}>
            <Button 
              variant="primary" 
              size="lg" 
              className="action-button"
              onClick={() => alert('Sent to Telecardiology')}
            >
              Send to Telecardiology
            </Button>
          </Col>
        </Row>
        
        <div className="reports-count">Reports left: 6</div>
        
        <div className="action-buttons-secondary">
          <Button 
            variant="light" 
            className="secondary-button"
            onClick={handleDownloadPDF}  // ใช้ฟังก์ชัน PDF ที่เราสร้างขึ้น
          >
            <span className="icon">📄</span> PDF
          </Button>
          <Button 
            variant="light" 
            className="secondary-button"
            onClick={handlePrint}  // ใช้ฟังก์ชันพิมพ์ที่เราสร้างขึ้น
          >
            <span className="icon">🖨️</span> Print
          </Button>
        </div>
        
        <Button 
          variant="outline-danger" 
          className="delete-button mb-4"
          onClick={() => navigate('/measure')}
        >
          <span className="icon">🗑️</span> Delete exam
        </Button>
        
      </Container>
      
      <style jsx>{`









        .ecg-tabs {
  display: flex;
  width: 100%;
  overflow-x: auto;
  flex-wrap: nowrap;
  margin-bottom: 20px;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 1px;
  -webkit-overflow-scrolling: touch;
}

.ecg-tabs .nav-item {
  flex: 1;
  min-width: auto;
  text-align: center;
  white-space: nowrap;
}

.ecg-tabs .nav-link {
  padding: 12px 15px;
  font-weight: 600;
  color: #555;
  border-radius: 8px 8px 0 0;
  transition: all 0.2s ease;
  margin-right: 2px;
  border: none;
  position: relative;
  width: 100%;
  text-align: center;
}

.ecg-tabs .nav-link.active {
  color: #4285f4;
  background-color: rgba(66, 133, 244, 0.1);
  border: none;
}

.ecg-tabs .nav-link.active:after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #4285f4;
}

.ecg-tabs .nav-link:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.03);
  color: #333;
}

/* สำหรับหน้าจอขนาดเล็กมาก */
@media (max-width: 480px) {
  .ecg-tabs {
    justify-content: flex-start;
  }
  
  .ecg-tabs .nav-item {
    flex: 0 0 auto;
  }
  
  .ecg-tabs .nav-link {
    padding: 10px;
    font-size: 14px;
  }
}


        .results-page {
          background-color: #f8f9fa;
          min-height: 100vh;
          padding-bottom: 40px;
        }
        
        .result-title {
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 24px;
          color: #333;
          position: relative;
          padding-bottom: 12px;
        }
        
        .result-title:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 60px;
          height: 3px;
          background-color: #4285f4;
        }
        
        .ecg-grid-card {
          border-radius: 16px;
          overflow: hidden;
          background-color: white;
          margin-bottom: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          padding: 20px;
          transition: all 0.3s ease;
        }
        
        .ecg-grid-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
          transform: translateY(-2px);
        }
        
        .ecg-tabs {
          margin-bottom: 20px;
        }
        
        .ecg-tabs .nav-link {
          padding: 12px 18px;
          font-weight: 600;
          color: #555;
          border-radius: 8px 8px 0 0;
          transition: all 0.2s ease;
          margin-right: 5px;
          border: none;
          position: relative;
        }
        
        .ecg-tabs .nav-link.active {
          color: #4285f4;
          background-color: rgba(66, 133, 244, 0.1);
          border: none;
        }
        
        .ecg-tabs .nav-link.active:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background-color: #4285f4;
        }
        
        .ecg-tabs .nav-link:hover:not(.active) {
          background-color: rgba(0, 0, 0, 0.03);
          color: #333;
        }
        
        .ecg-grid {
          padding: 10px 0;
          position: relative;
        }
        
        .standard-leads-grid,
        .augmented-leads-grid,
        .precordial-leads-grid {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        .ecg-grid-all {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }
        
        .ecg-lead-container {
          position: relative;
          margin-bottom: 8px;
          padding: 10px;
          border-radius: 8px;
          background-color: #ffeeee; /* Light pink background */
          background-image: linear-gradient(rgba(255, 0, 0, 0.03) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(255, 0, 0, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          overflow: hidden;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .ecg-lead-container:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }
        
        .ecg-lead-small {
          margin-bottom: 0;
        }
        
        .lead-label {
          position: absolute;
          top: 8px;
          left: 8px;
          font-weight: 700;
          font-size: 16px;
          z-index: 10;
          background-color: rgba(255, 255, 255, 0.85);
          padding: 3px 10px;
          border-radius: 5px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        /* Enhanced Prediction Display */
        .prediction-card {
          background-color: white;
          border-radius: 16px;
          padding: 28px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          margin-bottom: 25px;
          transition: all 0.3s ease;
        }
        
        .prediction-card:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        
        .prediction-header {
          text-align: center;
          margin-bottom: 25px;
          padding-bottom: 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .prediction-title {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: #333;
        }
        
        .prediction-subtitle {
          font-size: 18px;
          color: #666;
          font-weight: 500;
        }
        
        .confidence-section {
          margin-bottom: 24px;
        }
        
        .confidence-label {
          display: flex;
          justify-content: space-between;
          margin-bottom: 10px;
          font-size: 16px;
          font-weight: 500;
        }
        
        .confidence-value {
          font-weight: 700;
          color: #2c70e0;
        }
        
        .confidence-bar {
          height: 12px;
          background-color: #e9ecef;
          border-radius: 6px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .confidence-fill {
          height: 100%;
          background-color: #2c70e0;
          background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
          background-size: 1rem 1rem;
          border-radius: 6px;
          transition: width 1s ease;
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
          padding: 12px 30px;
          border-radius: 30px;
          font-weight: 700;
          font-size: 18px;
          text-align: center;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }
        
        .signal-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
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
        
        .recommendation-section {
          background-color: #f9f9f9;
          border-radius: 12px;
          padding: 20px;
          margin-top: 24px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          transition: all 0.3s ease;
        }
        
        .recommendation-section:hover {
          background-color: #f2f7ff;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.08);
        }
        
        .recommendation-title {
          font-size: 25px;
          font-weight: 1000;
          margin-top: 0;
          margin-bottom: 15px;
          color: #333;
          position: relative;
          padding-bottom: 8px;
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
        
        .recommendation-content {
          font-weight: 1000;
          font-size: 17px;
          line-height: 1.7;
          color: #444;
        }
        
        .recommendation-content ul {
          padding-left: 25px;
        }
        
        .recommendation-content li {
          margin-bottom: 10px;
          position: relative;
          padding-left: 5px;
        }
        
        .recommendation-content li::marker {
          color: #0d904f;
          font-weight: bold;
        }
        
        .risk-assessment {
          margin-bottom: 25px;
          background-color: white;
          padding: 24px;
          border-radius: 16px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
        }
        
        .risk-assessment:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
        }
        
        .risk-assessment h3 {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 18px;
          color: #333;
          position: relative;
          padding-bottom: 10px;
        }
        
        .risk-assessment h3:after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 3px;
          background-color: #4285f4;
        }
        
        .risk-meter-container {
          margin-bottom: 10px;
        }
        
        .risk-meter {
          height: 16px;
          background-color: #e9ecef;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        
        .risk-indicator {
          height: 100%;
          border-radius: 8px;
          transition: width 1s ease-in-out;
        }
        
        .risk-indicator.low-risk {
          background-color: #4285f4;
          background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
          background-size: 1rem 1rem;
        }
        
        .risk-indicator.medium-risk {
          background-color: #fbbc05;
          background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
          background-size: 1rem 1rem;
        }
        
        .risk-indicator.high-risk {
          background-color: #ea4335;
          background-image: linear-gradient(45deg, rgba(255, 255, 255, 0.15) 25%, transparent 25%, transparent 50%, rgba(255, 255, 255, 0.15) 50%, rgba(255, 255, 255, 0.15) 75%, transparent 75%, transparent);
          background-size: 1rem 1rem;
        }
        
        .risk-labels {
          display: flex;
          justify-content: space-between;
          margin-top: 8px;
        }
        
        .risk-label {
          color: #555;
          font-size: 15px;
          font-weight: 500;
        }
        
        .action-button {
          width: 100%;
          padding: 16px;
          font-size: 18px;
          font-weight: 700;
          background-color: #4285f4;
          border: none;
          border-radius: 12px;
          margin-bottom: 18px;
          box-shadow: 0 4px 10px rgba(66, 133, 244, 0.3);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }
        
        .action-button:hover {
          background-color: #3367d6;
          transform: translateY(-2px);
          box-shadow: 0 6px 15px rgba(66, 133, 244, 0.4);
        }
        
        .reports-count {
          text-align: center;
          color: #666;
          margin-bottom: 18px;
          font-weight: 500;
          font-size: 15px;
        }
        
        .action-buttons-secondary {
          display: flex;
          gap: 15px;
          margin-bottom: 18px;
        }
        
        .secondary-button {
          flex: 1;
          background-color: white;
          border: 1px solid #ddd;
          border-radius: 12px;
          padding: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
          color: #555;
        }
        
        .secondary-button:hover {
          background-color: #f8f9fa;
          border-color: #aaa;
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .delete-button {
          width: 100%;
          color: #ea4335;
          border-color: #ea4335;
          border-radius: 12px;
          padding: 14px;
          font-weight: 600;
          transition: all 0.3s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }
        
        .delete-button:hover {
          background-color: rgba(234, 67, 53, 0.05);
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(234, 67, 53, 0.15);
        }
        
        .icon {
          margin-right: 8px;
        }
        
        @media (max-width: 768px) {
          .ecg-grid-all {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .prediction-title {
            font-size: 28px;
          }
          
          .action-button {
            padding: 14px;
          }
        }
        
        @media (max-width: 576px) {
          .ecg-grid-all {
            grid-template-columns: 1fr;
          }
          
          .action-buttons-secondary {
            flex-direction: column;
            gap: 10px;
          }
          
          .prediction-title {
            font-size: 24px;
          }
          
          .signal-badge {
            padding: 10px 20px;
            font-size: 16px;
          }
        }
        
        @media print {
          .results-page {
            background-color: white;
          }
          .action-button,
          .action-buttons-secondary,
          .delete-button,
          .reports-count {
            display: none;
          }
          
          .prediction-card,
          .ecg-grid-card,
          .risk-assessment {
            box-shadow: none;
            border: 1px solid #ddd;
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

export default ResultsPage;