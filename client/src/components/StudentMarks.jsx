import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

export default function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMarks = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("No user logged in");
          setLoading(false);
          return;
        }

        // Fetch student profile to get admission number
        const profileRes = await axios.get(
          `http://localhost:5000/api/students/profile/${user.uid}`
        );
        const studentData = profileRes.data?.student;
        if (!studentData?.admission_number) {
          setError("Admission number not found");
          setLoading(false);
          return;
        }
        setStudent(studentData);

        // Fetch marks summary
        const encodedAdmission = encodeURIComponent(studentData.admission_number);
        const marksRes = await axios.get(
          `http://localhost:5000/api/marks/students/${encodedAdmission}/marks/summary`
        );
        setMarks(marksRes.data?.marks || []);
      } catch (err) {
        console.error("Error loading marks:", err);
        setError(err.response?.data?.message || "Failed to load marks");
      } finally {
        setLoading(false);
      }
    };

    fetchMarks();
  }, []);

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'A-': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'B-': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'C-': 'text-yellow-600 bg-yellow-100',
      'D+': 'text-orange-600 bg-orange-100',
      'D': 'text-orange-600 bg-orange-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-5xl mx-auto">
          <div className="mb-4">
            <Link to="/student/dashboard" className="text-blue-600 hover:underline">Back to Dashboard</Link>
          </div>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-firebrick">My Marks</h1>
          <Link to="/student/dashboard" className="bg-firebrick text-white px-4 py-2 rounded hover:bg-darkRed">Back</Link>
        </div>

        {student && (
          <div className="bg-white p-4 rounded-lg shadow mb-6">
            <p className="text-sm text-gray-600">Name: <span className="font-medium text-gray-900">{student.name}</span></p>
            <p className="text-sm text-gray-600">Admission No: <span className="font-medium text-gray-900">{student.admission_number}</span></p>
            <p className="text-sm text-gray-600">Batch: <span className="font-medium text-gray-900">{student.batch}</span></p>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Marks</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Grade</th>
                 </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {marks.map((m) => (
                <tr key={m.mark_id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{m.course_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.class_name || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{m.marks_obtained}/{m.total_marks}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{Number(m.percentage).toFixed(2)}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(m.grade)}`}>{m.grade}</span>
                  </td>
                   </tr>
              ))}
            </tbody>
          </table>
          {marks.length === 0 && (
            <p className="text-gray-500 text-center py-8">No marks available yet</p>
          )}
        </div>
      </div>
    </div>
  );
}


