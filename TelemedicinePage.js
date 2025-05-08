import React, { useState } from 'react';

const ShareECGRecord = () => {
  // State for the page
  const [shareMethod, setShareMethod] = useState('email'); // 'email' or 'pdf'
  const [doctorEmail, setDoctorEmail] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  
  // Current ECG record data
  const currentRecord = {
    date: '02/05/2025',
    prediction: 'Normal Sinus Rhythm'
  };
  
  // Handle email input change
  const handleEmailChange = (e) => {
    setDoctorEmail(e.target.value);
  };
  
  // Handle notes input change
  const handleNotesChange = (e) => {
    setAdditionalNotes(e.target.value);
  };
  
  // Handle share method change
  const handleShareMethodChange = (method) => {
    setShareMethod(method);
  };
  
  // Handle cancel button - Navigate to home page
  const handleCancel = () => {
    // In a real app, this would navigate to the home page
    window.location.href = '/'; // Use react-router in a real app: navigate('/')
  };
  
  // Handle share button
  const handleShare = () => {
    if (!doctorEmail.trim()) {
      alert('Please enter doctor\'s email address');
      return;
    }
    
    // In a real app, this would send the data to the server
    alert(`ECG record shared with ${doctorEmail}`);
  };
  
  return (
    <div className="share-ecg-container">
      <div className="share-ecg-header">
        <h1>Share ECG Record</h1>
      
      </div>
      
      <div className="content-container">
        <div className="section">
          <h2>Share Method</h2>
          <div className="share-method-buttons">
            <button 
              className={`method-button email-button ${shareMethod === 'email' ? 'active' : ''}`}
              onClick={() => handleShareMethodChange('email')}
            >
              <span className="button-icon email-icon">✉️</span> Email
            </button>
            <button 
              className={`method-button pdf-button ${shareMethod === 'pdf' ? 'active' : ''}`}
              onClick={() => handleShareMethodChange('pdf')}
            >
              <span className="button-icon pdf-icon">📄</span> Download PDF
            </button>
          </div>
        </div>
        
        {shareMethod === 'email' && (
          <>
            <div className="section">
              <h2>Doctor's Email Address</h2>
              <input 
                type="email" 
                className="email-input"
                placeholder="Enter your doctor's email address"
                value={doctorEmail}
                onChange={handleEmailChange}
              />
              <p className="helper-text">The doctor will receive a secure link to view your ECG record.</p>
            </div>
            
            <div className="section">
              <h2>Select ECG Record to Share</h2>
              <div className="record-selection">
                <div className="record-item selected">
                  <div className="date-container">
                    <span className="calendar-icon">📅</span>
                    <span className="record-date">{currentRecord.date}</span>
                  </div>
                  <div className="record-result">{currentRecord.prediction}</div>
                  <div className="radio-container">
                    <input type="radio" checked readOnly />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section">
              <h2>Additional Notes</h2>
              <textarea 
                className="notes-textarea"
                placeholder="Add any notes for your doctor..."
                value={additionalNotes}
                onChange={handleNotesChange}
              ></textarea>
            </div>
            
            {showInfo && (
              <div className="info-section">
                <span className="info-icon">ℹ️</span>
                <p>Your ECG data will be shared securely. The recipient will be able to view all 12 leads and the analysis results.</p>
              </div>
            )}
            
            <div className="action-buttons">
              <button className="cancel-button" onClick={() => window.location.href = '/'}>Cancel</button>
              <button className="share-button" onClick={handleShare}>Share via Email</button>
            </div>
          </>
        )}
        
        {shareMethod === 'pdf' && (
          <>
            <div className="section">
              <h2>PDF Download Options</h2>
              <div className="pdf-options">
                <div className="option-item">
                  <input type="checkbox" id="includeMetadata" defaultChecked />
                  <label htmlFor="includeMetadata">Include patient metadata</label>
                </div>
                <div className="option-item">
                  <input type="checkbox" id="includeAllLeads" defaultChecked />
                  <label htmlFor="includeAllLeads">Include all 12 leads</label>
                </div>
                <div className="option-item">
                  <input type="checkbox" id="includeAnalysis" defaultChecked />
                  <label htmlFor="includeAnalysis">Include analysis results</label>
                </div>
              </div>
            </div>
            
            <div className="section">
              <h2>Select ECG Record</h2>
              <div className="record-selection">
                <div className="record-item selected">
                  <div className="date-container">
                    <span className="calendar-icon">📅</span>
                    <span className="record-date">{currentRecord.date}</span>
                  </div>
                  <div className="record-result">{currentRecord.prediction}</div>
                  <div className="radio-container">
                    <input type="radio" checked readOnly />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="section">
              <h2>Additional Notes for PDF</h2>
              <textarea 
                className="notes-textarea"
                placeholder="Add any notes to include in the PDF..."
                value={additionalNotes}
                onChange={handleNotesChange}
              ></textarea>
            </div>
            
            <div className="action-buttons">
              <button className="cancel-button" onClick={handleCancel}>Cancel</button>
              <button className="download-button">Download PDF</button>
            </div>
          </>
        )}
      </div>
      
      <style jsx>{`
        .share-ecg-container {
          font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
          max-width: 960px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .share-ecg-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #eee;
          background-color: #fff;
        }
        
        .share-ecg-header h1 {
          font-size: 24px;
          font-weight: 600;
          margin: 0;
          color: #333;
          letter-spacing: -0.5px;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 28px;
          color: #666;
          cursor: pointer;
          transition: color 0.2s ease;
        }
        
        .close-button:hover {
          color: #333;
        }
        
        .content-container {
          padding: 0;
        }
        
        .section {
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .section h2 {
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 16px 0;
          color: #333;
          letter-spacing: -0.3px;
        }
        
        .share-method-buttons {
          display: flex;
          gap: 0;
          width: 100%;
        }
        
        .method-button {
          flex: 1;
          padding: 16px;
          font-size: 16px;
          border: none;
          background: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          color: #666;
          transition: all 0.2s ease;
          font-weight: 500;
          letter-spacing: -0.2px;
        }
        
        .method-button.active {
          color: white;
          font-weight: 500;
        }
        
        .email-button {
          border-radius: 5px 0 0 5px;
        }
        
        .pdf-button {
          border-radius: 0 5px 5px 0;
          border-left: 1px solid #ddd;
        }
        
        .email-button.active {
          background-color: #4285f4;
        }
        
        .pdf-button.active {
          background-color: white;
          color: #4285f4;
          border: 1px solid #4285f4;
        }
        
        .button-icon {
          font-size: 20px;
        }
        
        .email-input {
          width: 100%;
          padding: 12px 15px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 5px;
          margin-bottom: 8px;
          font-family: inherit;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        
        .email-input:focus {
          outline: none;
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
        }
        
        .helper-text {
          font-size: 14px;
          color: #666;
          margin: 5px 0 0 0;
          line-height: 1.4;
        }
        
        .record-selection {
          border: 1px solid #ddd;
          border-radius: 5px;
          transition: border-color 0.2s ease;
        }
        
        .record-selection:hover {
          border-color: #b3b3b3;
        }
        
        .record-item {
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
          transition: background-color 0.2s ease;
        }
        
        .record-item.selected {
          background-color: #f0f7ff;
          border-left: 4px solid #4285f4;
        }
        
        .date-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .calendar-icon {
          font-size: 18px;
          color: #666;
        }
        
        .record-date {
          font-size: 16px;
          color: #333;
          font-weight: 500;
        }
        
        .record-result {
          font-size: 16px;
          color: #4285f4;
          font-weight: 600;
        }
        
        .radio-container {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .notes-textarea {
          width: 100%;
          padding: 12px 15px;
          font-size: 16px;
          border: 1px solid #ddd;
          border-radius: 5px;
          min-height: 120px;
          resize: vertical;
          font-family: inherit;
          line-height: 1.5;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        
        .notes-textarea:focus {
          outline: none;
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
        }
        
        .info-section {
          margin: 0;
          padding: 15px 20px;
          background-color: #e8f4fd;
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }
        
        .info-icon {
          font-size: 18px;
          margin-top: 2px;
        }
        
        .info-section p {
          margin: 0;
          font-size: 14px;
          color: #333;
          line-height: 1.5;
        }
        
        .action-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 20px;
        }
        
        .cancel-button {
          padding: 12px 24px;
          font-size: 15px;
          border: none;
          border-radius: 5px;
          background-color: #6c757d;
          color: white;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s ease, transform 0.1s ease;
          font-family: inherit;
        }
        
        .cancel-button:hover {
          background-color: #5a6268;
        }
        
        .cancel-button:active {
          transform: translateY(1px);
        }
        
        .share-button, .download-button {
          padding: 12px 24px;
          font-size: 15px;
          font-weight: 500;
          border: none;
          border-radius: 5px;
          background-color: #4285f4;
          color: white;
          cursor: pointer;
          transition: background-color 0.2s ease, transform 0.1s ease, box-shadow 0.2s ease;
          font-family: inherit;
          letter-spacing: 0.2px;
        }
        
        .share-button:hover, .download-button:hover {
          background-color: #3367d6;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .share-button:active, .download-button:active {
          transform: translateY(1px);
          box-shadow: none;
        }
        
        .pdf-options {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        
        .option-item {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        
        .option-item input[type="checkbox"] {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        
        .option-item label {
          font-size: 15px;
          color: #333;
          cursor: pointer;
        }
        
        /* Responsive Styles */
        @media (max-width: 768px) {
          .share-ecg-header h1 {
            font-size: 20px;
          }
          
          .section h2 {
            font-size: 16px;
          }
          
          .method-button {
            padding: 12px;
            font-size: 14px;
          }
          
          .action-buttons {
            flex-direction: column-reverse;
          }
          
          .cancel-button, .share-button, .download-button {
            width: 100%;
            text-align: center;
          }
        }
        
        /* Animation for smoother transitions */
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .section {
          animation: fadeIn 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default ShareECGRecord;