import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaBookOpen, FaClipboardList, FaSpinner } from 'react-icons/fa';
import { BsEmojiFrown } from 'react-icons/bs';

const LessonBasedExamManagement = () => {
  const [activeTab, setActiveTab] = useState('lessons');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [lessonStudents, setLessonStudents] = useState([]);
  const [finalGrades, setFinalGrades] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState('');
  const [batches, setBatches] = useState([]);

  // Form states
  const [showLessonForm, setShowLessonForm] = useState(false);
  const [showMarkForm, setShowMarkForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [lessonForm, setLessonForm] = useState({
    lesson_name: '',
    lesson_type: 'assignment',
    weightage: '',
    max_marks: '100',
    description: '',
    due_date: '',
    class_id: ''
  });

  const [markForm, setMarkForm] = useState({
    admission_number: '',
    marks_obtained: '',
    grade: '',
    remarks: ''
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourse) {
      fetchClasses();
      fetchLessons();
      if (activeTab === 'grades') {
        fetchFinalGrades();
        fetchStatistics();
      }
    }
  }, [selectedCourse, selectedClass]);

  const fetchCourses = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get('http://itdlhsms-production.up.railway.app/api/courses');
      setCourses(response.data?.courses || response.data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setInitialLoading(false);
    }
  };

  const fetchClasses = async () => {
    if (!selectedCourse) return;
    try {
      const response = await axios.get(`http://itdlhsms-production.up.railway.app/api/attendance/courses/${selectedCourse}/classes`);
      setClasses(response.data || []);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const fetchLessons = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const params = selectedClass ? `?classId=${selectedClass}` : '';
      const response = await axios.get(`http://itdlhsms-production.up.railway.app/api/marks/courses/${selectedCourse}/lessons${params}`);
      setLessons(response.data.lessons || []);
    } catch (error) {
      console.error('Error fetching lessons:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLessonStudents = async (lessonId) => {
    if (!lessonId) return;
    setLoading(true);
    try {
      const response = await axios.get(`http://itdlhsms-production.up.railway.app/api/marks/lessons/${lessonId}/students`);
      setLessonStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching lesson students:', error);
      setLessonStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchFinalGrades = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const params = selectedClass ? `?classId=${selectedClass}` : '';
      const response = await axios.get(`http://itdlhsms-production.up.railway.app/api/marks/courses/${selectedCourse}/final-grades${params}`);
      setFinalGrades(response.data.grades || []);
    } catch (error) {
      console.error('Error fetching final grades:', error);
      setFinalGrades([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (!selectedCourse) return;
    try {
      const params = selectedClass ? `?classId=${selectedClass}` : '';
      const response = await axios.get(`http://itdlhsms-production.up.railway.app/api/marks/courses/${selectedCourse}/statistics${params}`);
      setStatistics(response.data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      setStatistics(null);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSelectedLesson(null);
    setLessonStudents([]);
    
    if (tab === 'grades' && selectedCourse) {
      fetchFinalGrades();
      fetchStatistics();
    }
  };

  const handleLessonSelect = (lesson) => {
    setSelectedLesson(lesson);
    fetchLessonStudents(lesson.lesson_id);
  };

  const handleAddLesson = () => {
    setLessonForm({
      lesson_name: '',
      lesson_type: 'assignment',
      weightage: '',
      max_marks: '100',
      description: '',
      due_date: '',
      class_id: selectedClass || ''
    });
    setEditingLesson(null);
    setShowLessonForm(true);
  };

  const handleEditLesson = (lesson) => {
    setLessonForm({
      lesson_name: lesson.lesson_name,
      lesson_type: lesson.lesson_type,
      weightage: lesson.weightage,
      max_marks: lesson.max_marks,
      description: lesson.description || '',
      due_date: lesson.due_date ? lesson.due_date.split('T')[0] : '',
      class_id: lesson.class_id || ''
    });
    setEditingLesson(lesson);
    setShowLessonForm(true);
  };

  const handleLessonSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = editingLesson 
        ? `/api/marks/lessons/${editingLesson.lesson_id}`
        : `/api/marks/courses/${selectedCourse}/lessons`;
      
      const method = editingLesson ? 'put' : 'post';
      
      await axios[method](`http://itdlhsms-production.up.railway.app${endpoint}`, lessonForm);
      
      alert(editingLesson ? 'Lesson updated successfully!' : 'Lesson created successfully!');
      setShowLessonForm(false);
      fetchLessons();
    } catch (error) {
      console.error('Error saving lesson:', error);
      alert(error.response?.data?.message || 'Error saving lesson');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteLesson = async (lesson) => {
    if (!window.confirm('Are you sure you want to delete this lesson? This action cannot be undone.')) return;

    try {
      await axios.delete(`http://itdlhsms-production.up.railway.app/api/marks/lessons/${lesson.lesson_id}`);
      alert('Lesson deleted successfully!');
      fetchLessons();
      if (selectedLesson && selectedLesson.lesson_id === lesson.lesson_id) {
        setSelectedLesson(null);
        setLessonStudents([]);
      }
    } catch (error) {
      console.error('Error deleting lesson:', error);
      alert(error.response?.data?.message || 'Error deleting lesson');
    }
  };

  const handleAddMark = (student) => {
    setSelectedStudent(student);
    setMarkForm({
      admission_number: student.admission_number,
      marks_obtained: student.marks_obtained || '',
      grade: student.grade || '',
      remarks: student.remarks || ''
    });
    setShowMarkForm(true);
  };

  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    if (!selectedLesson) return;

    setLoading(true);
    try {
      await axios.post(`http://itdlhsms-production.up.railway.app/api/marks/lessons/${selectedLesson.lesson_id}/marks`, markForm);
      alert('Marks saved successfully!');
      setShowMarkForm(false);
      fetchLessonStudents(selectedLesson.lesson_id);
      
      // Refresh final grades if on grades tab
      if (activeTab === 'grades') {
        fetchFinalGrades();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error saving marks:', error);
      alert(error.response?.data?.message || 'Error saving marks');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMark = async (student) => {
    if (!window.confirm('Are you sure you want to delete this mark?')) return;

    try {
      await axios.delete(`http://itdlhsms-production.up.railway.app/api/marks/lessons/${selectedLesson.lesson_id}/marks/${student.admission_number}`);
      alert('Mark deleted successfully!');
      fetchLessonStudents(selectedLesson.lesson_id);
      
      if (activeTab === 'grades') {
        fetchFinalGrades();
        fetchStatistics();
      }
    } catch (error) {
      console.error('Error deleting mark:', error);
      alert('Error deleting mark');
    }
  };

  const handleRecalculateGrades = async () => {
    if (!selectedCourse) return;
    
    if (!window.confirm('This will recalculate all final grades for this course. Continue?')) return;

    setLoading(true);
    try {
      const params = selectedClass ? `?classId=${selectedClass}` : '';
      await axios.post(`http://itdlhsms-production.up.railway.app/api/marks/courses/${selectedCourse}/recalculate-grades${params}`);
      alert('Grades recalculated successfully!');
      fetchFinalGrades();
      fetchStatistics();
    } catch (error) {
      console.error('Error recalculating grades:', error);
      alert('Error recalculating grades');
    } finally {
      setLoading(false);
    }
  };

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

  const getWeightageColor = (totalWeightage) => {
    if (totalWeightage === 100) return 'text-green-600';
    if (totalWeightage > 100) return 'text-red-600';
    return 'text-yellow-600';
  };

  // Loading state
  if (initialLoading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <FaSpinner className="animate-spin text-4xl text-firebrick mb-4" />
        <div className="text-lg text-gray-600">Loading course information...</div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <BsEmojiFrown className="text-4xl text-red-500 mb-4" />
        <div className="text-lg text-gray-600 mb-2">{error}</div>
        <button 
          onClick={fetchCourses} 
          className="px-4 py-2 bg-firebrick text-white rounded hover:bg-darkRed transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  // Empty courses state
  if (!initialLoading && courses.length === 0) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
        <FaBookOpen className="text-4xl text-gray-400 mb-4" />
        <div className="text-lg text-gray-600 mb-2">No courses available</div>
        <div className="text-sm text-gray-500">Please add courses first</div>
      </div>
    );
  }

  const totalWeightage = lessons.reduce((sum, lesson) => sum + parseFloat(lesson.weightage || 0), 0);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="relative flex items-center mb-6">
          <Link
            to="/admin/dashboard"
            className="bg-firebrick text-white px-4 py-2 rounded hover:bg-darkRed"
          >
            Back to Dashboard
          </Link>
          <h1 className="absolute left-1/2 transform -translate-x-1/2 text-3xl font-bold text-firebrick">
            Lesson-based Grading System
          </h1>
        </div>

        {/* Course and Class Selection */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
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
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!selectedCourse}
              >
                <option value="">All Classes</option>
                {classes.map(cls => (
                  <option key={cls.class_id} value={cls.class_id}>
                    Class {cls.class}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {!selectedCourse ? (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <FaClipboardList className="mx-auto text-5xl text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Course Selected</h3>
            <p className="text-gray-500 mb-4">Please select a course to view and manage marks</p>
            <div className="text-sm text-gray-400">
              You can:
              <ul className="mt-2 list-disc list-inside">
                <li>View and manage lesson-based assessments</li>
                <li>Record and update student marks</li>
                <li>Generate final grades and statistics</li>
              </ul>
            </div>
          </div>
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  <button
                    onClick={() => handleTabChange('lessons')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'lessons'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Lesson Management
                  </button>
                  <button
                    onClick={() => handleTabChange('grades')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'grades'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Final Grades & Statistics
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {loading && (
                  <div className="flex justify-center items-center py-8">
                    <div className="text-lg text-gray-600">Loading...</div>
                  </div>
                )}

                {/* Lessons Tab */}
                {activeTab === 'lessons' && !loading && (
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Lessons List */}
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <h2 className="text-xl font-semibold">Lessons & Assessments</h2>
                          <p className={`text-sm ${getWeightageColor(totalWeightage)}`}>
                            Total Weightage: {totalWeightage.toFixed(1)}% 
                            {totalWeightage !== 100 && (
                              <span className="ml-2">
                                ({totalWeightage > 100 ? 'Exceeds' : 'Under'} 100%)
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={handleAddLesson}
                          className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                        >
                          Add Lesson
                        </button>
                      </div>

                      <div className="space-y-3">
                        {lessons.map(lesson => (
                          <div 
                            key={lesson.lesson_id}
                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                              selectedLesson?.lesson_id === lesson.lesson_id
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => handleLessonSelect(lesson)}
                          >
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h3 className="font-medium text-gray-900">{lesson.lesson_name}</h3>
                                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                                  <span className="capitalize">{lesson.lesson_type}</span>
                                  <span>{lesson.weightage}% weight</span>
                                  <span>{lesson.max_marks} marks</span>
                                  {lesson.due_date && (
                                    <span>Due: {new Date(lesson.due_date).toLocaleDateString()}</span>
                                  )}
                                </div>
                                <div className="mt-2 text-sm text-blue-600">
                                  {lesson.marked_students}/{lesson.total_students} students marked
                                </div>
                              </div>
                              <div className="flex space-x-2 ml-4">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditLesson(lesson);
                                  }}
                                  className="text-blue-600 hover:text-blue-800"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteLesson(lesson);
                                  }}
                                  className="text-red-600 hover:text-red-800"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                        {lessons.length === 0 && (
                          <p className="text-gray-500 text-center py-8">No lessons created yet</p>
                        )}
                      </div>
                    </div>

                    {/* Student Marks for Selected Lesson */}
                    <div className="lg:col-span-2">
                      {selectedLesson ? (
                        <div>
                          <div className="flex justify-between items-center mb-4">
                            <div>
                              <h3 className="text-lg font-semibold">{selectedLesson.lesson_name}</h3>
                              <p className="text-sm text-gray-500">
                                {selectedLesson.lesson_type} • {selectedLesson.weightage}% • Max: {selectedLesson.max_marks} marks
                              </p>
                            </div>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Student
                                  </th>
                                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Marks
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
                                {lessonStudents.map(student => (
                                  <tr key={student.admission_number}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div>
                                        <div className="text-sm font-medium text-gray-900">{student.student_name}</div>
                                        <div className="text-sm text-gray-500">{student.admission_number}</div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {student.marks_obtained !== null ? (
                                        <div>
                                          <span>{student.marks_obtained}/{selectedLesson.max_marks}</span>
                                          <div className="text-xs text-gray-400">
                                            {(((student.marks_obtained || 0) / (selectedLesson.max_marks || 100)) * 100).toFixed(1)}%
                                          </div>
                                        </div>
                                      ) : (
                                        <span className="text-gray-400 italic">Not marked</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {student.grade ? (
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(student.grade)}`}>
                                          {student.grade}
                                        </span>
                                      ) : (
                                        <span className="text-gray-400">-</span>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                      <div className="flex space-x-2">
                                        <button
                                          onClick={() => handleAddMark(student)}
                                          className="text-blue-600 hover:text-blue-900"
                                        >
                                          {student.marks_obtained !== null ? 'Edit' : 'Add'} Marks
                                        </button>
                                        {student.marks_obtained !== null && (
                                          <button
                                            onClick={() => handleDeleteMark(student)}
                                            className="text-red-600 hover:text-red-900"
                                          >
                                            Delete
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            {lessonStudents.length === 0 && (
                              <p className="text-gray-500 text-center py-8">No students found for this lesson</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-gray-500 py-8">
                          <p>Select a lesson to view and manage student marks</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Grades Tab */}
                {activeTab === 'grades' && !loading && (
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Final Grades & Course Statistics</h2>
                      <button
                        onClick={handleRecalculateGrades}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                      >
                        Recalculate All Grades
                      </button>
                    </div>

                    {/* Statistics */}
                    {statistics && statistics.overall_stats && (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <h3 className="font-medium text-blue-900">Total Students</h3>
                            <p className="text-2xl font-bold text-blue-600">
                              {statistics.overall_stats.total_students || 0}
                            </p>
                          </div>
                          <div className="bg-green-50 p-4 rounded-lg">
                            <h3 className="font-medium text-green-900">Class Average</h3>
                            <p className="text-2xl font-bold text-green-600">
                              {Number(statistics.overall_stats.overall_avg || 0).toFixed(1)}%
                            </p>
                          </div>
                          <div className="bg-purple-50 p-4 rounded-lg">
                            <h3 className="font-medium text-purple-900">Average GPA</h3>
                            <p className="text-2xl font-bold text-purple-600">
                              {statistics.overall_stats.avg_gpa?.toFixed(2) || 0}
                            </p>
                          </div>
                          <div className="bg-yellow-50 p-4 rounded-lg">
                            <h3 className="font-medium text-yellow-900">Pass Rate</h3>
                            <p className="text-2xl font-bold text-yellow-600">
                              {statistics.overall_stats.pass_rate?.toFixed(1) || 0}%
                            </p>
                          </div>
                        </div>

                        {/* Grade Distribution */}
                        {statistics.grade_distribution && statistics.grade_distribution.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3">Grade Distribution</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                              {statistics.grade_distribution.map(grade => (
                                <div key={grade.final_grade} className={`p-3 rounded-lg ${getGradeColor(grade.final_grade)}`}>
                                  <div className="text-center">
                                    <div className="text-lg font-bold">{grade.final_grade}</div>
                                    <div className="text-sm">{grade.count} students</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Lesson Statistics */}
                        {statistics.lesson_statistics && statistics.lesson_statistics.length > 0 && (
                          <div className="mb-6">
                            <h3 className="text-lg font-medium mb-3">Lesson Performance</h3>
                            <div className="overflow-x-auto">
                              <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                  <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Lesson
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Type
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Weight
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Submissions
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Average
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                      Pass Rate
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                  {statistics.lesson_statistics.map(lesson => (
                                    <tr key={lesson.lesson_id}>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {lesson.lesson_name}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                        {lesson.lesson_type}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {lesson.weightage}%
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {lesson.submissions || 0}
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {Number(lesson.avg_percentage || 0).toFixed(1)}%
                                      </td>
                                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {lesson.submissions ? 
                                          ((lesson.passed_submissions || 0) / lesson.submissions * 100).toFixed(1) : '0'}%
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Final Grades Table */}
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
                              Progress
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Final %
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Grade
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              GPA Points
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {finalGrades.map(grade => (
                            <tr key={grade.grade_id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {grade.student_name}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {grade.admission_number}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex items-center">
                                  <div className="flex-1 mr-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                      <div
                                        className="bg-blue-500 h-2 rounded-full"
                                        style={{ width: `${Math.min(grade.completion_percentage || 0, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                  <span className="text-xs">
                                    {grade.completed_lessons || 0}/{grade.total_lessons || 0}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {Number(grade.final_percentage || 0).toFixed(1)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getGradeColor(grade.final_grade)}`}>
                                  {grade.final_grade}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {grade.gpa_points?.toFixed(2) || 0}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {finalGrades.length === 0 && (
                        <p className="text-gray-500 text-center py-8">No final grades calculated yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Lesson Form Modal */}
        {showLessonForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
                </h3>
                <form onSubmit={handleLessonSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Name *
                    </label>
                    <input
                      type="text"
                      value={lessonForm.lesson_name}
                      onChange={(e) => setLessonForm({...lessonForm, lesson_name: e.target.value})}
                      required
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Lesson Type
                    </label>
                    <select
                      value={lessonForm.lesson_type}
                      onChange={(e) => setLessonForm({...lessonForm, lesson_type: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="assignment">Assignment</option>
                      <option value="quiz">Quiz</option>
                      <option value="midterm">Midterm Exam</option>
                      <option value="final">Final Exam</option>
                      <option value="project">Project</option>
                      <option value="presentation">Presentation</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Weightage (%) *
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={lessonForm.weightage}
                        onChange={(e) => setLessonForm({...lessonForm, weightage: e.target.value})}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Marks *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={lessonForm.max_marks}
                        onChange={(e) => setLessonForm({...lessonForm, max_marks: e.target.value})}
                        required
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Class (Optional)
                    </label>
                    <select
                      value={lessonForm.class_id}
                      onChange={(e) => setLessonForm({...lessonForm, class_id: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">All Classes</option>
                      {classes.map(cls => (
                        <option key={cls.class_id} value={cls.class_id}>
                          Class {cls.class}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Due Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={lessonForm.due_date}
                      onChange={(e) => setLessonForm({...lessonForm, due_date: e.target.value})}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={lessonForm.description}
                      onChange={(e) => setLessonForm({...lessonForm, description: e.target.value})}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowLessonForm(false)}
                      className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : (editingLesson ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Mark Form Modal */}
        {showMarkForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Add/Edit Marks - {selectedStudent?.student_name}
                </h3>
                <form onSubmit={handleMarkSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Marks Obtained (Max: {selectedLesson?.max_marks}) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      max={selectedLesson?.max_marks || 100}
                      step="0.1"
                      value={markForm.marks_obtained}
                      onChange={(e) => setMarkForm({...markForm, marks_obtained: e.target.value})}
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
                      <option value="A-">A-</option>
                      <option value="B+">B+</option>
                      <option value="B">B</option>
                      <option value="B-">B-</option>
                      <option value="C+">C+</option>
                      <option value="C">C</option>
                      <option value="C-">C-</option>
                      <option value="D+">D+</option>
                      <option value="D">D</option>
                      <option value="F">F</option>
                    </select>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Remarks (Optional)
                    </label>
                    <textarea
                      value={markForm.remarks}
                      onChange={(e) => setMarkForm({...markForm, remarks: e.target.value})}
                      rows="3"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                      {loading ? 'Saving...' : 'Save Marks'}
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

export default LessonBasedExamManagement;