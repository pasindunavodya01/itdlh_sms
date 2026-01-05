import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';

export default function AttendanceManager() {
  const { batchCourseId } = useParams();
  const [batchCourse, setBatchCourse] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sessionType, setSessionType] = useState('regular');
  const [studentsNeedingSupport, setStudentsNeedingSupport] = useState([]);
  
  const [formData, setFormData] = useState({
    date: '',
    topic: '',
    session_number: '',
    session_type: 'regular',
    is_mandatory: true
  });

  useEffect(() => {
    if (batchCourseId) {
      fetchData();
    }
  }, [batchCourseId]);

  const fetchData = async () => {
    try {
      const [bcRes, sessionsRes, summaryRes, supportRes] = await Promise.all([
        axios.get(`http://itdlhsms-production.up.railway.app/api/attendance/batch-course/${batchCourseId}`),
        axios.get(`http://itdlhsms-production.up.railway.app/api/attendance/sessions?batch_course_id=${batchCourseId}`),
        axios.get(`http://itdlhsms-production.up.railway.app/api/attendance/attendance-summary/${batchCourseId}`),
        axios.get(`http://itdlhsms-production.up.railway.app/api/attendance/students-needing-support/${batchCourseId}`)
      ]);
      
      setBatchCourse(bcRes.data);
      setSessions(sessionsRes.data);
      setAttendanceSummary(summaryRes.data);
      setStudentsNeedingSupport(supportRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchStudents = async (sessionId) => {
    try {
      const res = await axios.get(`http://itdlhsms-production.up.railway.app/api/attendance/session/${sessionId}/students`);
      setStudents(res.data.map(s => ({
        ...s,
        present: s.status === 'present' || s.status === 'Present'
      })));
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSessionSelect = (session) => {
    setSelectedSession(session);
    fetchStudents(session.session_id);
  };

  const handleCreateSession = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        batch_course_id: batchCourseId,
        ...formData
      };
      
      await axios.post('http://itdlhsms-production.up.railway.app/api/attendance/session', payload);
      alert('Session created successfully!');
      
      setFormData({
        date: '',
        topic: '',
        session_number: '',
        session_type: 'regular',
        is_mandatory: true
      });
      setShowCreateForm(false);
      fetchData();
    } catch (error) {
      console.error('Error creating session:', error);
      alert('Failed to create session');
    }
  };

  const toggleAttendance = (studentId) => {
    setStudents(prev =>
      prev.map(s => (s.id === studentId ? { ...s, present: !s.present } : s))
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedSession) return;

    try {
      const payload = students.map(s => ({
        student_id: s.id,
        status: s.present ? 'present' : 'absent'
      }));

      await axios.post(
        `http://itdlhsms-production.up.railway.app/api/attendance/session/${selectedSession.session_id}/attendance`,
        { attendance: payload }
      );
      
      alert('Attendance saved successfully!');
      fetchData();
    } catch (error) {
      console.error('Error saving attendance:', error);
      alert('Failed to save attendance');
    }
  };

  const getEligibilityBadge = (status) => {
    if (status === 'eligible') {
      return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">Eligible</span>;
    } else if (status === 'eligible_via_supporting') {
      return <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">Eligible (Support)</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-200 rounded-full">Not Eligible</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading attendance data...</p>
      </div>
    );
  }

  if (!batchCourse) {
    return (
      <div className="p-6">
        <p className="text-red-600">Batch course not found</p>
        <Link to="/admin/batch-courses" className="text-blue-600 hover:underline">
          Back to Batch Courses
        </Link>
      </div>
    );
  }

  const regularSessions = sessions.filter(s => s.session_type === 'regular');
  const supportingSessions = sessions.filter(s => s.session_type === 'supporting');
  const presentCount = students.filter(s => s.present).length;
  const attendancePercentage = students.length > 0 ? Math.round((presentCount / students.length) * 100) : 0;

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{batchCourse.course_name}</h1>
              <p className="text-gray-600">
                Batch: {batchCourse.batch} {batchCourse.class_name && `• Class: ${batchCourse.class_name}`}
              </p>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/admin/batch-courses" 
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Back
              </Link>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
              >
                {showCreateForm ? 'Cancel' : 'Create Session'}
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Total Required</p>
              <p className="text-2xl font-bold">{batchCourse.total_sessions}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Regular Sessions</p>
              <p className="text-2xl font-bold">{regularSessions.length}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Supporting Sessions</p>
              <p className="text-2xl font-bold">{supportingSessions.length}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Need Support</p>
              <p className="text-2xl font-bold">{studentsNeedingSupport.length}</p>
            </div>
          </div>
        </div>

        {/* Create Session Form */}
        {showCreateForm && (
          <div className="bg-white rounded-md border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Create New Session</h2>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Number</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.session_number}
                    onChange={(e) => setFormData({...formData, session_number: e.target.value})}
                    placeholder="e.g., 1, 2, 3..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Type *</label>
                  <select
                    value={formData.session_type}
                    onChange={(e) => setFormData({...formData, session_type: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="regular">Regular Session</option>
                    <option value="supporting">Supporting Session</option>
                    <option value="makeup">Makeup Session</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Topic</label>
                  <input
                    type="text"
                    value={formData.topic}
                    onChange={(e) => setFormData({...formData, topic: e.target.value})}
                    placeholder="Session topic"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_mandatory"
                  checked={formData.is_mandatory}
                  onChange={(e) => setFormData({...formData, is_mandatory: e.target.checked})}
                  className="w-4 h-4 accent-blue-600"
                />
                <label htmlFor="is_mandatory" className="ml-2 text-sm text-gray-700">
                  Mandatory session (counts towards attendance requirement)
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Create Session
              </button>
            </form>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Sessions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Session Type Filter */}
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter Sessions:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSessionType('all')}
                  className={`px-3 py-1 rounded-md ${sessionType === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  All ({sessions.length})
                </button>
                <button
                  onClick={() => setSessionType('regular')}
                  className={`px-3 py-1 rounded-md ${sessionType === 'regular' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  Regular ({regularSessions.length})
                </button>
                <button
                  onClick={() => setSessionType('supporting')}
                  className={`px-3 py-1 rounded-md ${sessionType === 'supporting' ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                  Supporting ({supportingSessions.length})
                </button>
              </div>
            </div>

            {/* Sessions List */}
            <div className="bg-white rounded-md border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Sessions</h2>
              </div>
              <div className="p-4">
                {sessions.filter(s => sessionType === 'all' || s.session_type === sessionType).length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No sessions found</p>
                ) : (
                  <div className="space-y-3">
                    {sessions
                      .filter(s => sessionType === 'all' || s.session_type === sessionType)
                      .map(session => (
                        <button
                          key={session.session_id}
                          onClick={() => handleSessionSelect(session)}
                          className={`w-full text-left p-3 rounded-md border ${selectedSession?.session_id === session.session_id ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                          <div className="flex justify-between items-start mb-1">
                            <div>
                              <p className="font-semibold text-gray-800">
                                {session.session_number ? `Session ${session.session_number}` : 'Unnumbered Session'}
                              </p>
                              <p className="text-sm text-gray-600">{session.topic || 'No topic'}</p>
                            </div>
                            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${session.session_type === 'regular' ? 'bg-green-100 text-green-800' : session.session_type === 'supporting' ? 'bg-purple-100 text-purple-800' : 'bg-orange-100 text-orange-800'}`}>
                              {session.session_type}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-sm text-gray-500">
                            <span>{new Date(session.date).toLocaleDateString()}</span>
                            <span>{session.present_count}/{session.attendance_count} present</span>
                          </div>
                        </button>
                      ))}
                  </div>
                )}
              </div>
            </div>

            {/* Mark Attendance */}
            {selectedSession && (
              <div className="bg-white rounded-md border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Mark Attendance</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(selectedSession.date).toLocaleDateString()} • {selectedSession.topic || 'No topic'}
                  </p>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-1">
                      <p className="text-sm font-medium text-gray-700">
                        Present: {presentCount} / {students.length} ({attendancePercentage}%)
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-green-500 h-2.5 rounded-full"
                        style={{ width: `${attendancePercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {students.map(student => (
                      <label
                        key={student.id}
                        className={`flex items-center p-2 rounded-md border ${student.present ? 'border-green-500 bg-green-50' : 'border-gray-300 hover:bg-gray-50'}`}>
                        <input
                          type="checkbox"
                          checked={student.present}
                          onChange={() => toggleAttendance(student.id)}
                          className="w-4 h-4 accent-green-600 mr-3"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-800">{student.name}</p>
                          <p className="text-sm text-gray-600">{student.admission_number}</p>
                        </div>
                      </label>
                    ))}
                  </div>

                  <button
                    onClick={handleSaveAttendance}
                    className="w-full mt-4 bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                  >
                    Save Attendance
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            {/* Students Needing Support */}
            {studentsNeedingSupport.length > 0 && (
              <div className="bg-white rounded-md border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Need Support</h2>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {studentsNeedingSupport.slice(0, 5).map(student => (
                      <div key={student.student_id} className="border-l-4 border-orange-400 bg-orange-50 p-3">
                        <p className="font-semibold text-gray-800">{student.student_name}</p>
                        <p className="text-sm text-gray-600">{student.admission_number}</p>
                        <p className="text-sm text-orange-700 font-medium mt-1">
                          {(parseFloat(student.regular_attendance_percentage) || 0).toFixed(1)}% attendance
                        </p>
                      </div>
                    ))}
                  </div>
                  {studentsNeedingSupport.length > 5 && (
                    <p className="text-sm text-gray-500 mt-3 text-center">
                      +{studentsNeedingSupport.length - 5} more students
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Overall Attendance Summary */}
            <div className="bg-white rounded-md border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Attendance Summary</h2>
              </div>
              <div className="p-4">
                {attendanceSummary.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No attendance data yet</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {attendanceSummary.map(student => (
                      <div key={student.student_id} className="border rounded-md p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-semibold text-gray-800 text-sm">{student.student_name}</p>
                            <p className="text-xs text-gray-600">{student.admission_number}</p>
                          </div>
                          {getEligibilityBadge(student.exam_eligibility)}
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="bg-green-50 p-2 rounded">
                            <p className="text-green-600 font-medium">Regular</p>
                            <p className="font-bold">
                              {student.attended_regular_sessions}/{student.total_regular_sessions}
                            </p>
                            <p>{(parseFloat(student.regular_attendance_percentage) || 0).toFixed(1)}%</p>
                          </div>
                          <div className="bg-purple-50 p-2 rounded">
                            <p className="text-purple-600 font-medium">Support</p>
                            <p className="font-bold">
                              {student.attended_supporting_sessions}/{student.total_supporting_sessions}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-md border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Quick Actions</h2>
              </div>
              <div className="p-4 space-y-3">
                <button
                  onClick={() => {
                    setShowCreateForm(true);
                    setFormData({...formData, session_type: 'supporting'});
                  }}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                >
                  Create Supporting Session
                </button>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">About Supporting Sessions</p>
                    <p>Students below {batchCourse.minimum_attendance_percentage}% can attend supporting sessions to become eligible for exams.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}