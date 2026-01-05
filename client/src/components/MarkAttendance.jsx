import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MarkAttendance = ({ sessionId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch students for the session
  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);

    axios
      .get(`http://itdlhsms-production.up.railway.app/api/attendance/session/${sessionId}/students`)
      .then(res => {
        if (Array.isArray(res.data)) {
          const unique = res.data.reduce((acc, curr) => {
            if (!acc.some(s => s.id === curr.id)) acc.push(curr);
            return acc;
          }, []);

          // Set initial attendance status
          setStudents(unique.map(s => ({ 
            ...s, 
            present: s.status === 'present' || s.status === 'Present' 
          })));
        } else {
          setStudents([]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [sessionId]);

  // Toggle attendance for a student
  const toggleAttendance = id => {
    setStudents(prev =>
      prev.map(s => (s.id === id ? { ...s, present: !s.present } : s))
    );
  };

  // Save attendance to backend
  const handleSave = async () => {
    setLoading(true);
    try {
      const payload = students.map(s => ({
        student_id: s.id,
        status: s.present ? 'present' : 'absent',
      }));
      await axios.post(
        `http://itdlhsms-production.up.railway.app/api/attendance/session/${sessionId}/attendance`,
        { attendance: payload }
      );
      alert('Attendance updated successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to update attendance');
    } finally {
      setLoading(false);
    }
  };

  // Attendance statistics
  const totalStudents = students.length;
  const presentCount = students.filter(s => s.present).length;
  const attendancePercentage = totalStudents > 0 ? Math.round((presentCount / totalStudents) * 100) : 0;

  if (!sessionId) return null;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-bold mb-4 text-firebrick">Mark Attendance</h2>

      {loading && <p>Loading students...</p>}

      {!loading && students.length === 0 && (
        <p className="text-gray-500">No students found for this session.</p>
      )}

      {!loading && students.length > 0 && (
        <>
          {/* Attendance Statistics */}
          <div className="mb-4">
            <p className="text-gray-700 font-medium mb-1">
              Attendance: {presentCount} / {totalStudents} ({attendancePercentage}%)
            </p>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-blue-400 h-4 rounded-full transition-all duration-300"
                style={{ width: `${attendancePercentage}%` }}
              ></div>
            </div>
          </div>

          {/* Students Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map(student => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.admission_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={student.present}
                          onChange={() => toggleAttendance(student.id)}
                          className="w-4 h-4 accent-blue-600"
                        />
                        <span>{student.present ? 'Present' : 'Absent'}</span>
                      </label>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full mt-4 p-2 bg-firebrick text-white rounded hover:bg-darkRed"
            >
              {loading ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default MarkAttendance;
