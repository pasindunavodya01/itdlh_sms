import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBullhorn, FaPlus, FaEdit, FaTrash, FaUsers, FaUser, FaEye, FaCheckCircle, FaTimes } from 'react-icons/fa';
import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AdminAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [viewMode, setViewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    targetType: 'all',
    priority: 'medium',
    studentIds: []
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchAnnouncements();
    fetchStudents();
  }, [pagination.page]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/announcements/admin/all`, {
        headers
      });
      if (response.data.success) {
        setAnnouncements(response.data.announcements);
        setPagination(prev => ({ ...prev, total: response.data.pagination.total }));
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/announcements/admin/students/list`, {
        headers
      });
      if (response.data.success) {
        setStudents(response.data.students);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = selectedAnnouncement 
        ? `${API_URL}/api/announcements/${selectedAnnouncement.id}`
        : `${API_URL}/api/announcements`;
      
      const method = selectedAnnouncement ? 'put' : 'post';
      const headers = await getAuthHeaders();
      
      const response = await axios[method](url, formData, {
        headers
      });

      if (response.data.success) {
        window.alert(selectedAnnouncement ? 'Announcement updated!' : 'Announcement created!');
        setShowModal(false);
        resetForm();
        fetchAnnouncements();
      } else {
        window.alert(response.data.error || 'Failed to save announcement');
      }
    } catch (error) {
      console.error('Error saving announcement:', error);
      window.alert('Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    
    try {
      const headers = await getAuthHeaders();
      const response = await axios.delete(`${API_URL}/api/announcements/${id}`, {
        headers
      });

      if (response.data.success) {
        window.alert('Announcement deleted!');
        fetchAnnouncements();
      } else {
        window.alert(response.data.error || 'Failed to delete announcement');
      }
    } catch (error) {
      console.error('Error deleting announcement:', error);
      window.alert('Failed to delete announcement');
    }
  };

  const handleEdit = (announcement) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      message: announcement.message,
      targetType: announcement.target_type,
      priority: announcement.priority,
      studentIds: []
    });
    setViewMode(false);
    setShowModal(true);
  };

  const handleView = async (announcement) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.get(`${API_URL}/api/announcements/admin/${announcement.id}`, {
        headers
      });
      
      if (response.data.success) {
        setSelectedAnnouncement(response.data.announcement);
        setViewMode(true);
        setShowModal(true);
      }
    } catch (error) {
      console.error('Error fetching announcement details:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      targetType: 'all',
      priority: 'medium',
      studentIds: []
    });
    setSelectedAnnouncement(null);
    setViewMode(false);
  };

  const handleStudentToggle = (studentId) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaBullhorn className="text-red-600" />
            Announcements
          </h1>
          <p className="text-gray-600 mt-2">Send announcements to all students or specific students</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-red-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-red-700 transition"
        >
          <FaPlus />
          New Announcement
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaBullhorn className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">No announcements yet. Create your first one!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <motion.div
              key={announcement.id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(announcement.priority)}`}>
                      {announcement.priority.toUpperCase()}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {announcement.target_type === 'all' ? (
                        <><FaUsers className="inline mr-1" /> All Students</>
                      ) : (
                        <><FaUser className="inline mr-1" /> Specific Students</>
                      )}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-3 line-clamp-2">{announcement.message}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span>By: {announcement.sender_name}</span>
                    <span>•</span>
                    <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    {announcement.target_type === 'specific' && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaCheckCircle className="text-green-600" />
                          {announcement.read_count}/{announcement.recipient_count} read
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleView(announcement)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    title="View Details"
                  >
                    <FaEye />
                  </button>
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total > pagination.limit && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            disabled={pagination.page === 1}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h2 className="text-2xl font-bold text-gray-800">
                {viewMode ? 'Announcement Details' : selectedAnnouncement ? 'Edit Announcement' : 'New Announcement'}
              </h2>
              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {viewMode ? (
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700">Title</label>
                  <p className="text-lg font-bold mt-1">{selectedAnnouncement?.title}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-700">Message</label>
                  <p className="mt-1 text-gray-700 whitespace-pre-wrap">{selectedAnnouncement?.message}</p>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Priority</label>
                    <p className="mt-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(selectedAnnouncement?.priority)}`}>
                        {selectedAnnouncement?.priority?.toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Target</label>
                    <p className="mt-1">{selectedAnnouncement?.target_type === 'all' ? 'All Students' : 'Specific Students'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Created</label>
                    <p className="mt-1">{new Date(selectedAnnouncement?.created_at).toLocaleString()}</p>
                  </div>
                </div>
                {selectedAnnouncement?.recipients && (
                  <div>
                    <label className="text-sm font-semibold text-gray-700">Recipients</label>
                    <div className="mt-2 space-y-2">
                      {selectedAnnouncement.recipients.map(recipient => (
                        <div key={recipient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-semibold">{recipient.first_name} {recipient.last_name}</p>
                            <p className="text-sm text-gray-600">{recipient.email}</p>
                          </div>
                          {recipient.is_read ? (
                            <span className="text-green-600 flex items-center gap-1">
                              <FaCheckCircle /> Read
                            </span>
                          ) : (
                            <span className="text-gray-400">Unread</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Target Audience
                    </label>
                    <select
                      value={formData.targetType}
                      onChange={(e) => setFormData({ ...formData, targetType: e.target.value, studentIds: [] })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      disabled={!!selectedAnnouncement}
                    >
                      <option value="all">All Students</option>
                      <option value="specific">Specific Students</option>
                    </select>
                  </div>
                </div>

                {formData.targetType === 'specific' && !selectedAnnouncement && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Select Students ({formData.studentIds.length} selected)
                    </label>
                    <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto p-4 space-y-2">
                      {students.map(student => (
                        <label
                          key={student.id}
                          className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.studentIds.includes(student.id)}
                            onChange={() => handleStudentToggle(student.id)}
                            className="w-5 h-5 text-red-600"
                          />
                          <div className="flex-1">
                            <p className="font-semibold">
                              {student.first_name} {student.last_name}
                            </p>
                            <p className="text-sm text-gray-600">{student.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    {selectedAnnouncement ? 'Update Announcement' : 'Send Announcement'}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminAnnouncements;