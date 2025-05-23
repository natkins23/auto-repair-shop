// Mock Twilio service for development

// Initialize mock Twilio client
let twilioClient = null;

// Log that we're using a mock implementation
console.log('Twilio credentials not provided. SMS functionality will be mocked.');

/**
 * Send SMS notification
 * @param {string} to - Recipient phone number
 * @param {string} body - Message content
 * @returns {Promise<object>} - Message details
 */
async function sendSMS(to, body) {
  // In development mode without Twilio credentials, mock the SMS sending
  if (!twilioClient || process.env.NODE_ENV === 'development') {
    console.log(`[MOCK SMS] To: ${to}, Message: ${body}`);
    return {
      sid: `mock-${Date.now()}`,
      to,
      body,
      status: 'sent',
      dateCreated: new Date().toISOString()
    };
  }
  
  try {
    // Send actual SMS via Twilio
    const message = await twilioClient.messages.create({
      to,
      from: process.env.TWILIO_PHONE_NUMBER,
      body
    });
    
    return message;
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error;
  }
}

module.exports = {
  sendSMS
};
