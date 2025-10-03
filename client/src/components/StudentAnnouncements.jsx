import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';

export default function StudentAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError('No authenticated user found');
          setLoading(false);
          return;
        }

        // Get student data to get their ID
        const studentResponse = await axios.get(
          `http://localhost:5000/api/students/profile/${user.uid}`
        );

        if (!studentResponse.data) {
          setError('Student profile not found');
          setLoading(false);
          return;
        }

        // Fetch announcements for this student
        const response = await axios.get(`http://localhost:5000/api/announcements`, {
          params: { studentId: studentResponse.data.id }
        });

        setAnnouncements(response.data.announcements);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('Failed to load announcements');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  const markAsRead = async (announcementId) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      const studentResponse = await axios.get(
        `http://localhost:5000/api/students/profile/${user.uid}`
      );

      await axios.post(`http://localhost:5000/api/announcements/${announcementId}/read`, {
        studentId: studentResponse.data.id
      });

      // Update the local state to reflect the change
      setAnnouncements(announcements.map(announcement => {
        if (announcement.id === announcementId) {
          return { ...announcement, is_read: true };
        }
        return announcement;
      }));
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  if (loading) {
    return <div className="p-4 sm:p-6">Loading announcements...</div>;
  }

  if (error) {
    return <div className="p-4 sm:p-6 text-red-500">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">Announcements</h1>
      
      <div className="space-y-4">
        {announcements.map(announcement => (
          <div 
            key={announcement.id}
            className={`bg-white p-4 rounded-lg shadow-md ${
              announcement.priority === 'high' 
                ? 'border-l-4 border-red-500'
                : announcement.priority === 'medium'
                ? 'border-l-4 border-yellow-500'
                : 'border-l-4 border-green-500'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
              <h3 className="text-lg font-semibold mb-2 sm:mb-0">{announcement.title}</h3>
              {!announcement.is_read && (
                <button
                  onClick={() => markAsRead(announcement.id)}
                  className="text-sm bg-blue-100 text-blue-600 px-3 py-1 rounded-full hover:bg-blue-200 self-start sm:self-center"
                >
                  Mark as read
                </button>
              )}
            </div>
            
            <p className="text-gray-700 mb-3">{announcement.message}</p>
            
            <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-gray-500">
              <span className={`font-medium ${
                announcement.priority === 'high' 
                  ? 'text-red-500'
                  : announcement.priority === 'medium'
                  ? 'text-yellow-600'
                  : 'text-green-500'
              }`}>
                {announcement.priority.charAt(0).toUpperCase() + announcement.priority.slice(1)} Priority
              </span>
              <span>From: {announcement.sender_name}</span>
              <span>
                Target: {announcement.target_display === 'all' ? 'All Students' : 'You'}
              </span>
              <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
              {announcement.is_read && (
                <span className="text-green-500 font-semibold">✓ Read</span>
              )}
            </div>
          </div>
        ))}
        
        {announcements.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No announcements available
          </div>
        )}
      </div>
    </div>
  );
}
