const axios = require('axios');

const testAnnouncements = async () => {
  try {
    console.log('Testing announcements API...');
    
    // Test the root endpoint first
    const rootResponse = await axios.get('http://itdlhsms-production.up.railway.app/');
    console.log('Root endpoint response:', rootResponse.data);
    
    // Test announcements endpoint (this should fail with 401 since no auth)
    try {
      const announcementsResponse = await axios.get('http://itdlhsms-production.up.railway.app/api/announcements/admin/all');
      console.log('Announcements response:', announcementsResponse.data);
    } catch (error) {
      console.log('Expected 401 error for announcements:', error.response?.status, error.response?.data);
    }
    
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
};

testAnnouncements();
