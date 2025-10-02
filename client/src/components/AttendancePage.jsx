import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import CreateSession from './CreateSession';
import MarkAttendance from './MarkAttendance';

const AttendancePage = () => {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchSessions = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/attendance/sessions');
      setSessions(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError('Failed to load sessions');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleSessionCreated = (sessionData) => {
    setSessions(prev => [sessionData, ...prev]);
    setSelectedSession(sessionData);
    setShowCreate(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <p>Loading sessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/admin/dashboard"
            className="bg-firebrick text-white px-4 py-2 rounded hover:bg-darkRed"
          >
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-firebrick">Attendance Management</h1>
          <button
            onClick={() => setShowCreate(prev => !prev)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            {showCreate ? 'Cancel' : 'Create New Session'}
          </button>
        </div>

        {/* Create Session Form */}
        {showCreate && <CreateSession onSessionCreated={handleSessionCreated} onClose={() => setShowCreate(false)} />}

        {/* Session Selection */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <label className="block mb-2 font-semibold text-gray-700">Select Session:</label>
          <select
            className="w-full border p-2 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
            value={selectedSession?.session_id || ''}
            onChange={e => {
              const session = sessions.find(s => s.session_id === parseInt(e.target.value));
              setSelectedSession(session || null);
            }}
          >
            <option value="">-- Select Session --</option>
        

{sessions.map(s => (
  <option key={s.session_id} value={s.session_id}>
    {new Date(s.date).toISOString().split('T')[0]} | {s.batch} | {s.course_name}
    {s.class_name ? ` | Class: ${s.class_name}` : ''} | {s.topic}
  </option>
))}




          </select>
          <p className="text-sm text-gray-500 mt-2">
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {/* Attendance Marking */}
        {selectedSession ? (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
           <h2 className="text-xl font-semibold mb-4 text-firebrick">
  Attendance for {selectedSession.course_name} - {selectedSession.batch}
  {selectedSession.class_name ? ` - Class: ${selectedSession.class_name}` : ""}
</h2>

            <MarkAttendance
              sessionId={selectedSession.session_id}
              batch={selectedSession.batch}
              course_id={selectedSession.course_id}
              class_id={selectedSession.class_id}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 mb-6 text-gray-600 text-center">
            Please select a session to view and mark attendance.
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendancePage;
