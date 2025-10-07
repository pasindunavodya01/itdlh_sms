import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

export default function StudentMarks() {
  const [marks, setMarks] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");

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
        const marksRes = await axios.get(
          `http://localhost:5000/api/marks/students/marks/summary`,
          { params: { admission_number: studentData.admission_number } }
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
      'A+': 'text-green-700 bg-green-100 border-green-300',
      'A': 'text-green-600 bg-green-100 border-green-300',
      'A-': 'text-green-600 bg-green-100 border-green-300',
      'B+': 'text-blue-700 bg-blue-100 border-blue-300',
      'B': 'text-blue-600 bg-blue-100 border-blue-300',
      'B-': 'text-blue-600 bg-blue-100 border-blue-300',
      'C+': 'text-yellow-700 bg-yellow-100 border-yellow-300',
      'C': 'text-yellow-600 bg-yellow-100 border-yellow-300',
      'C-': 'text-yellow-600 bg-yellow-100 border-yellow-300',
      'D+': 'text-orange-700 bg-orange-100 border-orange-300',
      'D': 'text-orange-600 bg-orange-100 border-orange-300',
      'F': 'text-red-700 bg-red-100 border-red-300'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100 border-gray-300';
  };

  const groupedMarks = marks.reduce((acc, mark) => {
    if (!acc[mark.course_name]) {
      acc[mark.course_name] = [];
    }
    acc[mark.course_name].push(mark);
    return acc;
  }, {});

  const courseNames = Object.keys(groupedMarks);

  // Calculate overall statistics
  const calculateStats = (courseMarks) => {
    const total = courseMarks.length;
    const avgPercentage = courseMarks.reduce((sum, m) => sum + Number(m.percentage), 0) / total;
    const totalObtained = courseMarks.reduce((sum, m) => sum + Number(m.marks_obtained), 0);
    const totalMax = courseMarks.reduce((sum, m) => sum + Number(m.total_marks), 0);
    
    return {
      total,
      avgPercentage: avgPercentage.toFixed(2),
      totalObtained,
      totalMax
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your marks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <p className="text-red-600 font-semibold text-lg text-center mb-4">{error}</p>
          <Link 
            to="/student/dashboard" 
            className="block w-full bg-blue-600 text-white text-center px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2 flex items-center">
                <svg className="w-10 h-10 mr-3 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
                Academic Performance
              </h1>
              <p className="text-gray-600">Track your progress and grades</p>
            </div>
            <Link 
              to="/student/dashboard" 
              className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-lg shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Dashboard
            </Link>
          </div>

          {/* Student Info Card */}
          {student && (
            <div className="bg-gradient-to-r from-firebrick to-darkRed text-white p-6 rounded-xl shadow-lg">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-lg mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Student Name</p>
                    <p className="font-bold text-lg">{student.name}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-lg mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Admission Number</p>
                    <p className="font-bold text-lg">{student.admission_number}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-white/20 p-3 rounded-lg mr-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Batch</p>
                    <p className="font-bold text-lg">{student.batch}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Course Filter */}
        {courseNames.length > 1 && (
          <div className="mb-6">
            <div className="bg-white p-4 rounded-lg shadow-md">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Course:</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Courses</option>
                {courseNames.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Marks Display */}
        <div className="space-y-8">
          {Object.entries(groupedMarks)
            .filter(([courseName]) => selectedCourse === "all" || selectedCourse === courseName)
            .map(([courseName, courseMarks]) => {
              const stats = calculateStats(courseMarks);
              
              return (
                <div key={courseName} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Course Header */}
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{courseName}</h2>
                        <p className="text-purple-100">{stats.total} assessment(s)</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                          <p className="text-purple-100 text-xs mb-1">Average</p>
                          <p className="text-white text-xl font-bold">{stats.avgPercentage}%</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm px-4 py-3 rounded-lg">
                          <p className="text-purple-100 text-xs mb-1">Total Score</p>
                          <p className="text-white text-xl font-bold">{stats.totalObtained}/{stats.totalMax}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Marks Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Lesson
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Class
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Marks Obtained
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Percentage
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-gray-600 uppercase tracking-wider">
                            Grade
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {courseMarks.map((m, idx) => (
                          <tr key={m.mark_id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                              <div className="flex items-center">
                                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                                  </svg>
                                </div>
                                {m.lesson_name}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600">
                              {m.class_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800">
                                {m.marks_obtained} / {m.total_marks}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center">
                                <div className="w-full max-w-xs">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-sm font-semibold text-gray-700">{Number(m.percentage).toFixed(2)}%</span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                      className={`h-2 rounded-full ${
                                        m.percentage >= 75 ? 'bg-green-500' :
                                        m.percentage >= 60 ? 'bg-blue-500' :
                                        m.percentage >= 50 ? 'bg-yellow-500' :
                                        m.percentage >= 40 ? 'bg-orange-500' :
                                        'bg-red-500'
                                      }`}
                                      style={{ width: `${m.percentage}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold border-2 ${getGradeColor(m.grade)}`}>
                                {m.grade}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}

          {marks.length === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Marks Available</h3>
              <p className="text-gray-600">Your assessment results will appear here once they are published.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}