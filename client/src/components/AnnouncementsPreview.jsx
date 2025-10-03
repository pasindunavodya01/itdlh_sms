import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { auth } from '../firebase';
import { Link } from 'react-router-dom';

export default function AnnouncementsPreview() {
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

        const studentResponse = await axios.get(
          `http://localhost:5000/api/students/profile/${user.uid}`
        );

        if (!studentResponse.data || !studentResponse.data.student) {
          setError('Student profile not found');
          setLoading(false);
          return;
        }
        
        const studentId = studentResponse.data.student.id;

        const response = await axios.get(`http://localhost:5000/api/announcements`, {
          params: { studentId: studentId, limit: 3 } // Assuming the backend supports a limit
        });
        
        // If backend doesn't support limit, we slice it here.
        const limitedAnnouncements = response.data.announcements.slice(0, 3);

        setAnnouncements(limitedAnnouncements);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching announcements:', error);
        setError('Failed to load announcements');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  if (loading) {
    return <div className="p-4">Loading announcements...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Recent Announcements</h2>
        <Link to="/student/announcements" className="text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      <div className="space-y-4">
        {announcements.map(announcement => (
          <div 
            key={announcement.id}
            className={`p-3 rounded ${
              announcement.priority === 'high' 
                ? 'border-l-4 border-red-500 bg-red-50'
                : announcement.priority === 'medium'
                ? 'border-l-4 border-yellow-500 bg-yellow-50'
                : 'border-l-4 border-green-500 bg-green-50'
            }`}
          >
            <h3 className="text-md font-semibold">{announcement.title}</h3>
            <p className="text-gray-600 text-sm truncate">{announcement.message}</p>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>From: {announcement.sender_name}</span>
              <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        {announcements.length === 0 && (
          <div className="text-center text-gray-500 py-4">
            No recent announcements.
          </div>
        )}
      </div>
    </div>
  );
}
