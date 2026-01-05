import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

export default function BatchCourseManager() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [structures, setStructures] = useState([]);
  const [batchCourses, setBatchCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    batch: '',
    course_id: '',
    class_id: '',
    structure_id: '',
    start_date: '',
    end_date: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [batchesRes, coursesRes, structuresRes, batchCoursesRes] = await Promise.all([
        axios.get('https://itdlhsms-production.up.railway.app/api/attendance/batches'),
        axios.get('https://itdlhsms-production.up.railway.app/api/attendance/courses'),
        axios.get('https://itdlhsms-production.up.railway.app/api/attendance/course-structures'),
        axios.get('https://itdlhsms-production.up.railway.app/api/attendance/batch-courses')
      ]);
      
      setBatches(batchesRes.data);
      setCourses(coursesRes.data);
      setStructures(structuresRes.data);
      setBatchCourses(batchCoursesRes.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setLoading(false);
    }
  };

  const fetchClasses = async (courseId) => {
    try {
      const res = await axios.get(`https://itdlhsms-production.up.railway.app/api/attendance/courses/${courseId}/classes`);
      setClasses(res.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      setClasses([]);
    }
  };

  const handleCourseChange = (courseId) => {
    setFormData({...formData, course_id: courseId, class_id: '', structure_id: ''});
    if (courseId) {
      fetchClasses(courseId);
      const courseStructures = structures.filter(s => s.course_id === parseInt(courseId));
      if (courseStructures.length === 1) {
        setFormData(prev => ({...prev, course_id: courseId, structure_id: courseStructures[0].structure_id}));
      }
    } else {
      setClasses([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        class_id: formData.class_id || null,
        end_date: formData.end_date || null
      };
      
      await axios.post('https://itdlhsms-production.up.railway.app/api/attendance/batch-course', payload);
      alert('Batch course created successfully!');
      
      setFormData({
        batch: '',
        course_id: '',
        class_id: '',
        structure_id: '',
        start_date: '',
        end_date: ''
      });
      setShowForm(false);
      fetchData();
    } catch (error) {
      console.error('Error creating batch course:', error);
      alert(error.response?.data?.error || 'Failed to create batch course');
    }
  };

  const handleDeactivate = async (batchCourseId) => {
    if (!window.confirm('Are you sure you want to deactivate this batch course?')) {
      return;
    }

    try {
      await axios.put(`https://itdlhsms-production.up.railway.app/api/attendance/batch-course/${batchCourseId}/deactivate`);
      alert('Batch course deactivated successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deactivating batch course:', error);
      alert('Failed to deactivate batch course');
    }
  };

  const goToAttendance = (batchCourseId) => {
    navigate(`/admin/attendance/manage/${batchCourseId}`);
  };

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading batch courses...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Batch Courses</h1>
              <p className="text-gray-600">Assign courses to batches and manage attendance</p>
            </div>
            <div className="flex gap-3">
              <Link 
                to="/admin/dashboard" 
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                Back
              </Link>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-firebrick text-white px-4 py-2 rounded-md hover:bg-darkRed"
              >
                {showForm ? 'Cancel' : 'Assign Course'}
              </button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Active Batch Courses</p>
              <p className="text-2xl font-bold">{batchCourses.filter(bc => bc.is_active).length}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Total Batches</p>
              <p className="text-2xl font-bold">{batches.length}</p>
            </div>
            <div className="bg-white p-4 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-500">Total Courses</p>
              <p className="text-2xl font-bold">{courses.length}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-white rounded-md border border-gray-200 p-6 mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Assign Course to Batch</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Batch *</label>
                  <select
                    value={formData.batch}
                    onChange={(e) => setFormData({...formData, batch: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Batch</option>
                    {batches.map(batch => (
                      <option key={batch} value={batch}>{batch}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course *</label>
                  <select
                    value={formData.course_id}
                    onChange={(e) => handleCourseChange(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select Course</option>
                    {courses.map(course => (
                      <option key={course.course_id} value={course.course_id}>
                        {course.course_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Class (Optional)</label>
                  <select
                    value={formData.class_id}
                    onChange={(e) => setFormData({...formData, class_id: e.target.value})}
                    disabled={!formData.course_id || classes.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  >
                    <option value="">No Specific Class</option>
                    {classes.map(cls => (
                      <option key={cls.class_id} value={cls.class_id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course Structure *</label>
                  <select
                    value={formData.structure_id}
                    onChange={(e) => setFormData({...formData, structure_id: e.target.value})}
                    required
                    disabled={!formData.course_id}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-100"
                  >
                    <option value="">Select Structure</option>
                    {structures
                      .filter(s => s.course_id === parseInt(formData.course_id))
                      .map(structure => (
                        <option key={structure.structure_id} value={structure.structure_id}>
                          {structure.total_sessions} weeks - {structure.minimum_attendance_percentage}% attendance
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                Assign Course to Batch
              </button>
            </form>
          </div>
        )}

        {/* Batch Courses List */}
        <div className="space-y-6">
          {batchCourses.length === 0 ? (
            <div className="bg-white rounded-md border border-gray-200 p-12 text-center">
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Batch Courses</h3>
              <p className="text-gray-600">Assign a course to a batch to get started.</p>
            </div>
          ) : (
            batchCourses.map(bc => (
              <div key={bc.batch_course_id} className="bg-white rounded-md border border-gray-200 overflow-hidden">
                <div className={`p-4 border-b border-gray-200 ${!bc.is_active ? 'bg-gray-50' : ''}`}>
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{bc.course_name}</h3>
                        {!bc.is_active && (
                          <span className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-200 rounded-full">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div><span className="font-semibold">Batch:</span> {bc.batch}</div>
                        {bc.class_name && <div><span className="font-semibold">Class:</span> {bc.class_name}</div>}
                        <div><span className="font-semibold">Start:</span> {new Date(bc.start_date).toLocaleDateString()}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => goToAttendance(bc.batch_course_id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                      >
                        Manage Attendance
                      </button>
                      {bc.is_active && (
                        <button
                          onClick={() => handleDeactivate(bc.batch_course_id)}
                          className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                        >
                          Deactivate
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-600 font-medium">Total Sessions</p>
                      <p className="text-lg font-bold text-gray-800">{bc.total_sessions}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-600 font-medium">Created Sessions</p>
                      <p className="text-lg font-bold text-gray-800">{bc.created_sessions}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-600 font-medium">Min. Attendance</p>
                      <p className="text-lg font-bold text-gray-800">{bc.minimum_attendance_percentage}%</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs text-gray-600 font-medium">Progress</p>
                      <p className="text-lg font-bold text-gray-800">
                        {bc.total_sessions > 0 ? Math.round((bc.created_sessions / bc.total_sessions) * 100) : 0}%
                      </p>
                    </div>
                  </div>

                  {bc.created_sessions < bc.total_sessions && bc.is_active && (
                    <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-md p-3 text-sm text-yellow-800">
                      <p><span className="font-semibold">Sessions Incomplete:</span> You need to create {bc.total_sessions - bc.created_sessions} more session(s).</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}