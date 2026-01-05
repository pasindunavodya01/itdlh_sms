
import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import Hero from "./Hero";
import { Link } from "react-router-dom";

const StudentAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentData, setStudentData] = useState(null);

  useEffect(() => {
    const fetchStudentAndAttendanceData = async () => {
      try {
        const user = auth.currentUser;
        console.log("User:", user);
        if (!user) {
          setError("No user logged in");
          setLoading(false);
          return;
        }

        // First, get the student's profile to get the student ID
        const profileResponse = await axios.get(
          `http://itdlhsms-production.up.railway.app/api/students/profile/${user.uid}`
        );
        const student = profileResponse.data.student;
        setStudentData(student);
        console.log("Student Data:", student);

        if (student && student.id) {
          console.log("Fetching attendance for student ID:", student.id);
          // Then, fetch the attendance data using the student ID
          const attendanceResponse = await axios.get(
            `http://itdlhsms-production.up.railway.app/api/attendance/student-attendance/${student.id}`
          );
          setAttendanceData(attendanceResponse.data);
          console.log("Attendance API Response:", attendanceResponse.data);
        } else {
          setError("Could not find student profile or student ID.");
          console.error("Could not find student profile or student ID.");
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load attendance data.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndAttendanceData();
  }, []);

  const getProgressColor = (percentage) => {
    if (!percentage || percentage < 50) return "bg-red-500";
    if (percentage < 80) return "bg-yellow-500";
    return "bg-green-500";
  };

  const getEligibilityBadge = (status) => {
    switch(status) {
      case 'eligible':
        return (
          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
            Eligible
          </span>
        );
      case 'eligible_via_supporting':
        return (
          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
            Eligible (via Support)
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
            Not Eligible
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center text-center">
        <div>
          <p className="text-red-600 text-lg">{error}</p>
          <Link to="/student/dashboard" className="text-blue-600 hover:underline mt-4 inline-block">
            Go back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Hero
        title="My Attendance"
        subtitle={`Hi ${studentData?.name || 'Student'}, here is your attendance summary.`}
      />
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800">Attendance Progress</h2>
            <p className="text-gray-600 mt-1">
              Review your attendance for each course and stay on track.
            </p>
          </div>
          <div className="overflow-x-auto">
            {attendanceData.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Attendance
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sessions
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attendanceData.map((item) => (
                    <tr key={item.batch_course_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">{item.course_name}</div>
                        <div className="text-sm text-gray-500">
                          {item.class_name || 'No Class'} • {item.batch}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-32 bg-gray-200 rounded-full h-4 mr-4">
                            <div
                              className={`h-4 rounded-full ${getProgressColor(item.regular_attendance_percentage)}`}
                              style={{ width: `${typeof item.regular_attendance_percentage === 'number' ? item.regular_attendance_percentage : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {typeof item.regular_attendance_percentage === 'number' 
                              ? item.regular_attendance_percentage.toFixed(1) 
                              : '0.0'}%
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <span className="font-medium">{item.attended_sessions}</span>
                          <span className="text-gray-500"> / </span>
                          <span className="font-medium">{item.total_conducted_sessions}</span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {item.supporting_sessions_attended > 0 && 
                            `+${item.supporting_sessions_attended} support sessions`}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getEligibilityBadge(item.exam_eligibility)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No attendance data available yet.</p>
              </div>
            )}
          </div>
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">≥80% (Eligible)</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">60-79%</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                  <span className="text-sm text-gray-600">&lt;60%</span>
                </div>
              </div>
              <Link 
                to="/student/dashboard" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendance;
