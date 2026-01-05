import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateSession = ({ onSessionCreated, onClose }) => {
  const [batches, setBatches] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [formData, setFormData] = useState({
    batch: '',
    course_id: '',
    class_id: '',
    date: '',
    topic: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    axios.get('http://itdlhsms-production.up.railway.app/api/courses')
      .then(res => setCourses(res.data))
      .catch(err => console.error(err));

    axios.get('http://itdlhsms-production.up.railway.app/api/attendance/batches')
      .then(res => setBatches(res.data))
      .catch(err => console.error(err));
  }, []);

  // In CreateSession.js - Update the useEffect for classes
useEffect(() => {
  if (formData.course_id) {
    // Fetch classes for the selected course from student_courses table
    axios.get(`http://itdlhsms-production.up.railway.app/api/courses/${formData.course_id}/classes`)
      .then(res => setClasses(res.data))
      .catch(err => console.error('Error fetching classes:', err));
  } else {
    setClasses([]);
  }
}, [formData.course_id]);




  useEffect(() => {
    const course = courses.find(c => c.course_id === parseInt(formData.course_id));
    if (course?.classes?.length) {
      setClasses(course.classes);
    } else {
      setClasses([]);
      setFormData(prev => ({ ...prev, class_id: '' }));
    }
  }, [formData.course_id, courses]);

  const handleChange = e => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  // In CreateSession.js - Update the session creation to pass class_id
const handleSubmit = async e => {
  e.preventDefault();
  setLoading(true);
  try {
    const payload = {
      ...formData,
      class_id: formData.class_id || null // Ensure class_id is passed even if empty
    };
    const res = await axios.post('http://itdlhsms-production.up.railway.app/api/attendance/session', payload);
    onSessionCreated(res.data);
    setFormData({ batch: '', course_id: '', class_id: '', date: '', topic: '' });
    alert('Session created successfully!');
  } catch (err) {
    console.error(err);
    alert('Failed to create session');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded relative">
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl font-bold"
        >
          ×
        </button>
      )}

      <h2 className="text-xl font-bold mb-4">Create Session</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        <select
          name="batch"
          value={formData.batch}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Batch</option>
          {batches.map(b => <option key={b} value={b}>{b}</option>)}
        </select>

        <select
          name="course_id"
          value={formData.course_id}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Course</option>
          {courses.map(c => <option key={c.course_id} value={c.course_id}>{c.course_name}</option>)}
        </select>

        {classes.length > 0 && (
          <select
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded"
          >
            <option value="">Select Class</option>
            {classes.map(cl => <option key={cl.class_id} value={cl.class_id}>{cl.class_name}</option>)}
          </select>
        )}

        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="topic"
          value={formData.topic}
          onChange={handleChange}
          placeholder="Topic"
          className="w-full border p-2 rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className={`w-full p-2 rounded text-white ${loading ? 'bg-gray-400' : 'bg-firebrick hover:bg-darkRed'}`}
        >
          {loading ? 'Creating...' : 'Create Session'}
        </button>
      </form>
    </div>
  );
};

export default CreateSession;
