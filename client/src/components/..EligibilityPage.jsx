import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ExamManagement = () => {
  const [activeTab, setActiveTab] = useState('eligibility');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [eligibilityData, setEligibilityData] = useState(null);
  const [marksData, setMarksData] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [editingMark, setEditingMark] = useState(null);
  const [stats, setStats] = useState(null);

  // Form states
  const [markForm, setMarkForm] = useState({
    admission_number: '',
    course_id: '',
    class_id: '',
    marks_obtained: '',
    total_marks: '',
    grade: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchClasses();
    } else {
      setClasses([]); // Clear classes if no course is selected
    }
  }, [selectedCourse]);

  const fetchCourses = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get('https://itdlhsms-production.up.railway.app/api/courses');
      setCourses(response.data?.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      setCourses([]);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchClasses = async () => {
    if (!selectedCourse) return;
    try {
      const response = await axios.get(`https://itdlhsms-production.up.railway.app/api/attendance/courses/${selectedCourse}/classes`);
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const fetchEligibility = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const params = selectedClass ? `?classId=${selectedClass}` : '';
      const response = await axios.get(`https://itdlhsms-production.up.railway.app/api/eligibility/course/${selectedCourse}${params}`);
      setEligibilityData(response.data);
    } catch (error) {
      console.error('Error fetching eligibility:', error);
      setEligibilityData(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchMarks = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const params = selectedClass ? `?classId=${selectedClass}` : '';
      const response = await axios.get(`https://itdlhsms-production.up.railway.app/api/marks/course/${selectedCourse}${params}`);
      setMarksData(response.data?.marks || []);
    } catch (error) {
      console.error('Error fetching marks:', error);
      setMarksData([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedCourse) return;
    try {
      const params = selectedClass ? `?classId=${selectedClass}` : '';
      const response = await axios.get(`https://itdlhsms-production.up.railway.app/api/marks/stats/course/${selectedCourse}${params}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStats(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'eligibility' && selectedCourse) {
      fetchEligibility();
    } else if (tab === 'marks' && selectedCourse) {
      fetchMarks();
      fetchStats();
    }
  };

  const handleCourseChange = (courseId) => {
    setSelectedCourse(courseId);
    setSelectedClass('');
    setEligibilityData(null);
    setMarksData([]);
    setStats(null);
  };

  const handleClassChange = (classId) => {
    setSelectedClass(classId);
    if (activeTab === 'eligibility') {
      fetchEligibility();
    } else if (activeTab === 'marks') {
      fetchMarks();
      fetchStats();
    }
  };

  const handleAddMark = (student = null) => {
    if (student) {
      setMarkForm({
        admission_number: student.admission_number,
        course_id: selectedCourse,
        class_id: selectedClass || '',
        marks_obtained: '',
        total_marks: '100',
        grade: ''
      });
    } else {
      setMarkForm({
        admission_number: '',
        course_id: selectedCourse,
        class_id: selectedClass || '',
        marks_obtained: '',
        total_marks: '100',
        grade: ''
      });
    }
    setEditingMark(null);
    setShowMarkForm(true);
  };

  const handleEditMark = (mark) => {
    setMarkForm({
      admission_number: mark.admission_number,
      course_id: mark.course_id,
      class_id: mark.class_id || '',
      marks_obtained: mark.marks_obtained,
      total_marks: mark.total_marks,
      grade: mark.grade
    });
    setEditingMark(mark);
    setShowMarkForm(true);
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingMark) {
        await axios.put(`https://itdlhsms-production.up.railway.app/api/marks/${editingMark.mark_id}`, markForm);
        alert('Marks updated successfully!');
      } else {
        await axios.post('https://itdlhsms-production.up.railway.app/api/marks', markForm);
        alert('Marks added successfully!');
      }
      setShowMarkForm(false);
      fetchMarks();
      fetchStats();
    } catch (error) {
      console.error('Error saving marks:', error);
      alert(error.response?.data?.error || 'Error saving marks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMark = async (markId) => {
    if (!window.confirm('Are you sure you want to delete this mark?')) return;

    try {
      await axios.delete(`https://itdlhsms-production.up.railway.app/api/marks/${markId}`);
      alert('Mark deleted successfully!');
      fetchMarks();
      fetchStats();
    } catch (error) {
      console.error('Error deleting mark:', error);
      alert('Error deleting mark');
    }
  };

  const getGradeColor = (grade) => {
    const colors = {
      'A+': 'text-green-600 bg-green-100',
      'A': 'text-green-600 bg-green-100',
      'B+': 'text-blue-600 bg-blue-100',
      'B': 'text-blue-600 bg-blue-100',
      'C+': 'text-yellow-600 bg-yellow-100',
      'C': 'text-yellow-600 bg-yellow-100',
      'F': 'text-red-600 bg-red-100'
    };
    return colors[grade] || 'text-gray-600 bg-gray-100';
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Exam Management</h1>

        {/* Course and Class Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a course</option>
                {courses.map(course => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Class (Optional)</label>
              <select
                value={selectedClass}
                onChange={(e) => handleClassChange(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => handleTabChange('eligibility')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'eligibility'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Exam Eligibility (80% Attendance)
              </button>
              <button
                onClick={() => handleTabChange('marks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'marks'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Marks Management
              </button>
            </nav>
          </div>

          <div className="p-6">
            {!selectedCourse && (
              <p className="text-gray-500 text-center py-8">Please select a course to continue</p>
            )}

            {/* Eligibility Tab */}
            {activeTab === 'eligibility' && selectedCourse && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Exam Eligibility Check</h2>
                  <button
                    onClick={fetchEligibility}
                    disabled={loading}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                  >
                    {loading ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {eligibilityData && (
                  <>
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h3 className="font-medium text-blue-900">Total Students</h3>
                        <p className="text-2xl font-bold text-blue-600">
                          {eligibilityData.summary?.total_students || 0}
                        </p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <h3 className="font-medium text-green-900">Eligible</h3>
                        <p className="text-2xl font-bold text-green-600">
                          {eligibilityData.summary?.eligible_students || 0}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg">
                        <h3 className="font-medium text-red-900">Not Eligible</h3>
                        <p className="text-2xl font-bold text-red-600">
                          {eligibilityData.summary?.not_eligible_students || 0}
                        </p>
                      </div>
                    </div>

                    {/* Students Table */}
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Admission No.
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Class
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Attendance
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Status
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {eligibilityData.students && eligibilityData.students.map(student => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {student.name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.admission_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.class || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <div className="flex-1 mr-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className={`h-2 rounded-full ${
                                          student.attendance_percentage >= 80
                                            ? 'bg-green-500'
                                            : 'bg-red-500'
                                        }`}
                                        style={{ width: `${Math.min(student.attendance_percentage || 0, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className="text-xs">
                                    {student.attendance_percentage || 0}% ({student.present_sessions || 0}/{student.total_sessions || 0})
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  student.exam_eligibility === 'eligible'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {student.exam_eligibility === 'eligible' ? 'Eligible' : 'Not Eligible'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {student.exam_eligibility === 'eligible' && (
                                  <button
                                    onClick={() => handleAddMark(student)}
                                    className="text-blue-600 hover:text-blue-900"
                                  >
                                    Add Marks
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {(!eligibilityData.students || eligibilityData.students.length === 0) && (
                        <p className="text-gray-500 text-center py-8">No students found for this course</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Marks Tab */}
            {activeTab === 'marks' && selectedCourse && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Marks Management</h2>
                  <div className="flex space-x-2">
                    <button
                      onClick={fetchMarks}
                      disabled={loading}
                      className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? 'Loading...' : 'Refresh'}
                    </button>
                    <button
                      onClick={() => handleAddMark()}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                    >
                      Add Marks
                    </button>
                  </div>
                </div>

                {/* Statistics */}
                {stats && stats.overall_stats && (
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h3 className="font-medium text-blue-900">Total Students</h3>
                      <p className="text-2xl font-bold text-blue-600">
                        {stats.overall_stats.total_students || 0}
                      </p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h3 className="font-medium text-green-900">Average</h3>
                      <p className="text-2xl font-bold text-green-600">
                        {stats.overall_stats.overall_avg?.toFixed(1) || 0}%
                      </p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h3 className="font-medium text-yellow-900">Highest</h3>
                      <p className="text-2xl font-bold text-yellow-600">
                        {stats.overall_stats.overall_max || 0}%
                      </p>
                    </div>
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h3 className="font-medium text-red-900">Lowest</h3>
                      <p className="text-2xl font-bold text-red-600">
                        {stats.overall_stats.overall_min || 0}%
                      </p>
                    </div>
                  </div>
                )}

                {/* Grade Distribution */}
                {stats && stats.grade_distribution && stats.grade_distribution.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-medium mb-3">Grade Distribution</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                      {stats.grade_distribution.map(grade => (
                        <div key={grade.grade} className={`p-3 rounded-lg ${getGradeColor(grade.grade)}`}>
                          <div className="text-center">
                            <div className="text-lg font-bold">{grade.grade}</div>
                            <div className="text-sm">{grade.count} students</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Marks Table */}
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Admission No.
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Class
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Percentage
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Grade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {marksData && marksData.map(mark => (
                        <tr key={mark.mark_id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {mark.student_name}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {mark.admission_number}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {mark.class_name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {mark.marks_obtained}/{mark.total_marks}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {mark.percentage}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(mark.grade)}`}>
                              {mark.grade}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEditMark(mark)}
                                className="text-blue-600 hover:text-blue-900"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMark(mark.mark_id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(!marksData || marksData.length === 0) && (
                    <p className="text-gray-500 text-center py-8">No marks recorded yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mark Form Modal */}
        {showMarkForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingMark ? 'Edit Marks' : 'Add Marks'}
                </h3>
                <form onSubmit={handleMarkSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Admission Number
                    </label>
                    <input
                      type="text"
                      value={markForm.admission_number}
                      onChange={(e) => setMarkForm({...markForm, admission_number: e.target.value})}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks Obtained
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={markForm.total_marks}
                      value={markForm.marks_obtained}
                      onChange={(e) => setMarkForm({...markForm, marks_obtained: e.target.value})}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Marks
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={markForm.total_marks}
                      onChange={(e) => setMarkForm({...markForm, total_marks: e.target.value})}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Grade (Optional - will be calculated automatically)
                    </label>
                    <select
                      value={markForm.grade}
                      onChange={(e) => setMarkForm({...markForm, grade: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Auto Calculate</option>
                      <option value="A+">A+</option>
                      <option value="A">A</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="F">F</option>
                    </select>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowMarkForm(false)}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (editingMark ? 'Update' : 'Save')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamManagement; 