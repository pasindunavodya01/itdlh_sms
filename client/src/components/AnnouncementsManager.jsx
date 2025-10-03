import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function AnnouncementsManager() {
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState('all');
  const [priority, setPriority] = useState('medium');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');

  useEffect(() => {
    fetchAnnouncements();
    fetchStudents();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/announcements');
      setAnnouncements(response.data.announcements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      setStatusMessage('Failed to load announcements');
    }
  };

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students/all');
      setStudents(response.data.students);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        title,
        message,
        sender_id: 1, // Replace with actual admin ID
        sender_name: 'Admin', // Replace with actual admin name
        target_type: targetType,
        priority,
        selected_students: targetType === 'specific' ? selectedStudents : []
      };

      if (editingId) {
        await axios.put(`http://localhost:5000/api/announcements/${editingId}`, data);
        setStatusMessage('Announcement updated successfully');
      } else {
        await axios.post('http://localhost:5000/api/announcements', data);
        setStatusMessage('Announcement created successfully');
      }

      // Reset form
      setTitle('');
      setMessage('');
      setTargetType('all');
      setPriority('medium');
      setSelectedStudents([]);
      setEditingId(null);

      // Refresh announcements list
      fetchAnnouncements();
    } catch (error) {
      console.error('Error saving announcement:', error);
      setStatusMessage('Failed to save announcement');
    }
  };

  const handleEdit = (announcement) => {
    setTitle(announcement.title);
    setMessage(announcement.message);
    setTargetType(announcement.target_type);
    setPriority(announcement.priority);
    setEditingId(announcement.id);
    // You might need to fetch selected students if editing a specific announcement
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      try {
        await axios.delete(`http://localhost:5000/api/announcements/${id}`);
        setStatusMessage('Announcement deleted successfully');
        fetchAnnouncements();
      } catch (error) {
        console.error('Error deleting announcement:', error);
        setStatusMessage('Failed to delete announcement');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Manage Announcements</h1>
      
      {statusMessage && (
        <div className="mb-4 p-2 bg-blue-100 text-blue-700 rounded">
          {statusMessage}
        </div>
      )}

      {/* Announcement Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Announcement' : 'Create New Announcement'}
        </h2>
        
        <div className="mb-4">
          <label className="block mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full p-2 border rounded"
            rows="4"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-2">Target</label>
          <select
            value={targetType}
            onChange={(e) => setTargetType(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="all">All Students</option>
            <option value="specific">Specific Students</option>
          </select>
        </div>

        {targetType === 'specific' && (
          <div className="mb-4">
            <label className="block mb-2">Select Students</label>
            <select
              multiple
              value={selectedStudents}
              onChange={(e) => setSelectedStudents(
                Array.from(e.target.selectedOptions, option => option.value)
              )}
              className="w-full p-2 border rounded"
              size="5"
            >
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} ({student.admission_number})
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingId ? 'Update' : 'Create'} Announcement
          </button>
          {editingId && (
            <button
              type="button"
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setMessage('');
                setTargetType('all');
                setPriority('medium');
                setSelectedStudents([]);
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      {/* Announcements List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">All Announcements</h2>
        <div className="space-y-4">
          {announcements.map(announcement => (
            <div
              key={announcement.id}
              className="bg-white p-4 rounded shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{announcement.title}</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-gray-600 mb-2">{announcement.message}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>Priority: {announcement.priority}</span>
                <span>Target: {announcement.target_type}</span>
                <span>Recipients: {announcement.recipient_count || 'All'}</span>
                <span>Created: {new Date(announcement.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}