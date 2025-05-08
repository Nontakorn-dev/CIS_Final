// src/services/ECGSharingService.js

import EmailService from './EmailService';

/**
 * Service for sharing ECG records with doctors through various methods
 */
class ECGSharingService {
  /**
   * Share ECG record via email
   * @param {Object} params - Sharing parameters
   * @param {string} params.doctorEmail - Recipient doctor's email
   * @param {Object} params.ecgRecord - The ECG record to share
   * @param {string} params.patientName - Patient's name
   * @param {string} params.notes - Additional notes from patient
   * @returns {Promise<Object>} - Result of sharing operation
   */
  async shareViaEmail(params) {
    try {
      if (!params.doctorEmail || !params.ecgRecord) {
        throw new Error('Missing required parameters');
      }
      
      // Format the sharing data for email
      const emailData = {
        recipientEmail: params.doctorEmail,
        patientName: params.patientName || 'Patient',
        ecgRecord: params.ecgRecord,
        notes: params.notes || ''
      };
      
      // Send email using EmailService
      const result = await EmailService.sendECGToDoctor(emailData);
      
      // Log the sharing event in history (in a real app, this would save to database)
      this._logSharingEvent({
        type: 'email',
        recipient: params.doctorEmail,
        recordId: params.ecgRecord.id,
        timestamp: new Date(),
        status: 'success'
      });
      
      return {
        success: true,
        message: 'ECG record shared successfully',
        method: 'email',
        result
      };
    } catch (error) {
      console.error('Error sharing ECG record via email:', error);
      
      // Log the failed sharing attempt
      this._logSharingEvent({
        type: 'email',
        recipient: params.doctorEmail,
        recordId: params.ecgRecord?.id,
        timestamp: new Date(),
        status: 'failed',
        error: error.message
      });
      
      return {
        success: false,
        message: `Failed to share ECG: ${error.message}`,
        method: 'email'
      };
    }
  }
  
  /**
   * Generate and download a PDF report of the ECG record
   * @param {Object} ecgRecord - The ECG record to generate PDF for
   * @returns {Promise<Object>} - Result of PDF generation
   */
  async downloadPDF(ecgRecord) {
    try {
      if (!ecgRecord) {
        throw new Error('No ECG record provided');
      }
      
      // Generate PDF data using EmailService utility
      const pdfBase64 = await EmailService.generateECGReportPDF(ecgRecord);
      
      // In a real app, this would create a download link
      // Here we just simulate it
      console.log('PDF generated successfully, ready for download');
      
      // Log the download event
      this._logSharingEvent({
        type: 'pdf_download',
        recordId: ecgRecord.id,
        timestamp: new Date(),
        status: 'success'
      });
      
      // This would normally return a URL or blob for download
      return {
        success: true,
        message: 'PDF generated successfully',
        method: 'pdf',
        data: pdfBase64.substring(0, 50) + '...' // Truncated for display
      };
    } catch (error) {
      console.error('Error generating PDF:', error);
      
      // Log the failed attempt
      this._logSharingEvent({
        type: 'pdf_download',
        recordId: ecgRecord?.id,
        timestamp: new Date(),
        status: 'failed',
        error: error.message
      });
      
      return {
        success: false,
        message: `Failed to generate PDF: ${error.message}`,
        method: 'pdf'
      };
    }
  }
  
  /**
   * Share ECG record with a telemedicine doctor
   * @param {Object} params - Sharing parameters
   * @param {string} params.doctorId - Doctor's ID in the system
   * @param {Object} params.ecgRecord - The ECG record to share
   * @param {string} params.sessionId - Telemedicine session ID
   * @returns {Promise<Object>} - Result of sharing operation
   */
  async shareWithTelemedDoctor(params) {
    try {
      if (!params.doctorId || !params.ecgRecord || !params.sessionId) {
        throw new Error('Missing required parameters');
      }
      
      // In a real app, this would call an API to share the record
      // with the doctor in the active telemedicine session
      console.log(`Sharing ECG record ${params.ecgRecord.id} with doctor ${params.doctorId} in session ${params.sessionId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Log the sharing event
      this._logSharingEvent({
        type: 'telemed',
        recipient: params.doctorId,
        recordId: params.ecgRecord.id,
        sessionId: params.sessionId,
        timestamp: new Date(),
        status: 'success'
      });
      
      return {
        success: true,
        message: 'ECG record shared with doctor in session',
        method: 'telemed'
      };
    } catch (error) {
      console.error('Error sharing with telemedicine doctor:', error);
      
      // Log the failed attempt
      this._logSharingEvent({
        type: 'telemed',
        recipient: params.doctorId,
        recordId: params.ecgRecord?.id,
        sessionId: params.sessionId,
        timestamp: new Date(),
        status: 'failed',
        error: error.message
      });
      
      return {
        success: false,
        message: `Failed to share with doctor: ${error.message}`,
        method: 'telemed'
      };
    }
  }
  
  /**
   * Create a secure shareable link for the ECG record
   * @param {Object} ecgRecord - The ECG record to create link for
   * @param {number} expiryDays - Number of days until link expires (default: 7)
   * @returns {Object} - Sharing link information
   */
  createShareableLink(ecgRecord, expiryDays = 7) {
    try {
      if (!ecgRecord) {
        throw new Error('No ECG record provided');
      }
      
      // Generate a secure token (in a real app, this would be more sophisticated)
      const secureToken = Math.random().toString(36).substring(2, 15) + 
                         Math.random().toString(36).substring(2, 15);
      
      // Calculate expiry date
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiryDays);
      
      // Create the shareable link
      const shareableLink = `https://watjai-ecg.com/shared/${ecgRecord.id}?token=${secureToken}`;
      
      // In a real app, this would save the token and expiry to database
      console.log(`Created shareable link for ECG record ${ecgRecord.id}, expires on ${expiryDate.toISOString()}`);
      
      // Log the link creation
      this._logSharingEvent({
        type: 'link',
        recordId: ecgRecord.id,
        timestamp: new Date(),
        expiryDate,
        status: 'created'
      });
      
      return {
        success: true,
        link: shareableLink,
        expiryDate,
        recordId: ecgRecord.id
      };
    } catch (error) {
      console.error('Error creating shareable link:', error);
      return {
        success: false,
        message: `Failed to create link: ${error.message}`
      };
    }
  }
  
  /**
   * Log ECG sharing events (for auditing and history)
   * @param {Object} event - The sharing event details
   * @private
   */
  _logSharingEvent(event) {
    // In a real app, this would save to a database
    // For this demo, we just log to console
    console.log('ECG Sharing Event:', event);
    
    // You could implement storing these in localStorage for persistence
    // const sharingHistory = JSON.parse(localStorage.getItem('ecgSharingHistory') || '[]');
    // sharingHistory.push(event);
    // localStorage.setItem('ecgSharingHistory', JSON.stringify(sharingHistory));
  }
}

export default new ECGSharingService();