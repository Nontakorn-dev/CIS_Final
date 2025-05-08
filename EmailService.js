// src/services/EmailService.js

/**
 * Service for handling email-related functionality
 * Uses EmailJS for frontend email sending
 * 
 * To implement this in a production environment:
 * 1. Sign up for EmailJS (https://www.emailjs.com/)
 * 2. Set up your email template
 * 3. Replace the SERVICE_ID, TEMPLATE_ID, and USER_ID with your own credentials
 */

// Replace these with your EmailJS credentials
const EMAIL_SERVICE_ID = 'your_service_id';
const EMAIL_TEMPLATE_ID = 'your_template_id';
const EMAIL_USER_ID = 'your_user_id';

/**
 * Send ECG data to a doctor via email
 * @param {Object} data - The data to send
 * @param {string} data.recipientEmail - Doctor's email address
 * @param {string} data.patientName - Patient's name
 * @param {Object} data.ecgRecord - ECG record data
 * @param {string} data.notes - Additional notes from patient
 * @returns {Promise} - Promise resolving to the email send result
 */
const sendECGToDoctor = async (data) => {
  try {
    // Validate required data
    if (!data.recipientEmail || !data.ecgRecord) {
      throw new Error('Missing required data for email');
    }
    
    // Format the ECG data for the email
    const formattedRecord = {
      recordId: data.ecgRecord.id,
      date: new Date(data.ecgRecord.date).toLocaleString(),
      result: data.ecgRecord.prediction,
      confidence: `${data.ecgRecord.confidence.toFixed(1)}%`,
      heartRate: data.ecgRecord.bpm || 'N/A',
      notes: data.notes || 'No additional notes provided'
    };
    
    // Prepare the unique link for secure viewing
    const secureViewLink = `https://watjai-ecg.com/secure-view/${data.ecgRecord.id}?token=${generateSecureToken()}`;
    
    // Prepare the email parameters
    const emailParams = {
      to_email: data.recipientEmail,
      to_name: 'Doctor',
      from_name: data.patientName || 'WatJai Patient',
      subject: 'ECG Analysis Results for Review',
      record_id: formattedRecord.recordId,
      record_date: formattedRecord.date,
      diagnosis: formattedRecord.result,
      confidence: formattedRecord.confidence,
      heart_rate: formattedRecord.heartRate,
      patient_notes: formattedRecord.notes,
      secure_link: secureViewLink
    };
    
    // For demonstration purposes - log what would be sent
    console.log('Email would be sent with params:', emailParams);
    
    // In a real implementation, you would use EmailJS as follows:
    /*
    const result = await emailjs.send(
      EMAIL_SERVICE_ID,
      EMAIL_TEMPLATE_ID,
      emailParams,
      EMAIL_USER_ID
    );
    return result;
    */
    
    // Simulate API call for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 200, text: 'Email sent successfully' });
      }, 1500);
    });
  } catch (error) {
    console.error('Error sending ECG via email:', error);
    throw error;
  }
};

/**
 * Send appointment confirmation email
 * @param {Object} data - Appointment data
 * @returns {Promise} - Promise resolving to the email send result
 */
const sendAppointmentConfirmation = async (data) => {
  try {
    const appointmentDate = new Date(data.date);
    
    const emailParams = {
      to_email: data.patientEmail,
      to_name: data.patientName,
      doctor_name: data.doctorName,
      appointment_date: appointmentDate.toLocaleDateString(),
      appointment_time: appointmentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      appointment_type: data.type,
      consultation_link: data.type === 'video' ? 'https://watjai-ecg.com/video-call/session123' : null,
      phone_number: data.type === 'phone' ? '+66 2-123-4567' : null
    };
    
    // For demonstration purposes
    console.log('Appointment confirmation would be sent with params:', emailParams);
    
    // Simulate API call for demo
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ status: 200, text: 'Confirmation email sent successfully' });
      }, 1000);
    });
  } catch (error) {
    console.error('Error sending appointment confirmation:', error);
    throw error;
  }
};

/**
 * Generate a secure token for ECG viewing links
 * @returns {string} - Secure random token
 */
const generateSecureToken = () => {
  // In a real implementation, use a proper secure token generator
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
};

/**
 * Generate an ECG report as PDF and prepare for email attachment
 * @param {Object} ecgRecord - The ECG record data
 * @returns {Promise<string>} - Base64 encoded PDF
 */
const generateECGReportPDF = async (ecgRecord) => {
  // In a real implementation, you would use a PDF generation library
  // This is just a placeholder function
  console.log('Generating PDF for ECG record:', ecgRecord.id);
  
  // Simulate PDF generation
  return new Promise((resolve) => {
    setTimeout(() => {
      // Return a dummy base64 string
      resolve('JVBERi0xLjMNCiXi48/TDQoNCjEgMCBvYmoNCjw8DQovVHlwZSAvQ2F0YWxvZw0KL091dGxpbmVzIDIgMCBSDQovUGFnZXMgMyAwIFINCj4+DQplbmRvYmoNCg0KMiAwIG9iag0KPDwNCi9UeXBlIC9PdXRsaW5lcw0KL0NvdW50IDANCj4+DQplbmRvYmoNCg0KMyAwIG9iag0KPDwNCi9UeXBlIC9QYWdlcw0KL0NvdW50IDINCi9LaWRzIFsgNCAwIFIgNiAwIFIgXSANCj4+DQplbmRvYmoNCg0KNCAwIG9iag0KPDwNCi9UeXBlIC9QYWdlDQovUGFyZW50IDMgMCBSDQovUmVzb3VyY2VzIDw8DQovRm9udCA8PA0KL0YxIDkgMCBSIA0KPj4NCi9Qcm9jU2V0IDggMCBSDQo+Pg0KL01lZGlhQm94IFswIDAgNjEyLjAwMDAgNzkyLjAwMDBdDQovQ29udGVudHMgNSAwIFINCj4+DQplbmRvYmoNCg==');
    }, 2000);
  });
};

export default {
  sendECGToDoctor,
  sendAppointmentConfirmation,
  generateECGReportPDF
};