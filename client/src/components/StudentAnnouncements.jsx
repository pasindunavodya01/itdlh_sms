import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBullhorn, FaEnvelopeOpen, FaEnvelope, FaExclamationCircle, FaInfoCircle, FaCheckCircle, FaTimes, FaClock } from 'react-icons/fa';
import axios from 'axios';
import { getAuthHeaders } from '../utils/auth';

const StudentAnnouncements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [pagination.page]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      const headers = await getAuthHeaders();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/announcements/student/my-announcements`, {
        headers,
        params: {
          page: pagination.page,
          limit: pagination.limit
        }
      });
      
      const data = response.data;
      if (data.success) {
        setAnnouncements(data.announcements);
        setUnreadCount(data.unreadCount);
        setPagination(prev => ({ ...prev, total: data.pagination.total }));
      }
    } catch (error) {
      console.error('Error fetching announcements:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (announcementId) => {
    try {
      const headers = await getAuthHeaders();
      const response = await axios.put(`${process.env.REACT_APP_API_URL}/api/announcements/student/${announcementId}/read`, {}, {
        headers
      });

      const data = response.data;
      if (data.success) {
        setAnnouncements(prev =>
          prev.map(a =>
            a.id === announcementId ? { ...a, is_read: true, read_at: new Date().toISOString() } : a
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking announcement as read:', error);
    }
  };

  const handleAnnouncementClick = async (announcement) => {
    setSelectedAnnouncement(announcement);
    
    if (!announcement.is_read) {
      await markAsRead(announcement.id);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <FaExclamationCircle className="text-red-600" />;
      case 'medium':
        return <FaInfoCircle className="text-yellow-600" />;
      case 'low':
        return <FaCheckCircle className="text-green-600" />;
      default:
        return <FaInfoCircle className="text-gray-600" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-4 border-red-500 bg-red-50';
      case 'medium': return 'border-l-4 border-yellow-500 bg-yellow-50';
      case 'low': return 'border-l-4 border-green-500 bg-green-50';
      default: return 'border-l-4 border-gray-500 bg-gray-50';
    }
  };

  const filteredAnnouncements = announcements.filter(a => {
    if (filter === 'unread') return !a.is_read;
    if (filter === 'read') return a.is_read;
    return true;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      if (diffHours === 0) {
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''} ago`;
      }
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <FaBullhorn className="text-red-600" />
            Announcements
          </h1>
          {unreadCount > 0 && (
            <div className="bg-red-600 text-white px-4 py-2 rounded-full font-bold flex items-center gap-2">
              <FaEnvelope />
              {unreadCount} Unread
            </div>
          )}
        </div>
        <p className="text-gray-600">Stay updated with the latest news and information</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200">
        <button
          onClick={() => setFilter('all')}
          className={`px-6 py-3 font-semibold transition ${
            filter === 'all'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          All ({announcements.length})
        </button>
        <button
          onClick={() => setFilter('unread')}
          className={`px-6 py-3 font-semibold transition ${
            filter === 'unread'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setFilter('read')}
          className={`px-6 py-3 font-semibold transition ${
            filter === 'read'
              ? 'text-red-600 border-b-2 border-red-600'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          Read ({announcements.length - unreadCount})
        </button>
      </div>

      {/* Announcements List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
        </div>
      ) : filteredAnnouncements.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FaBullhorn className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600">
            {filter === 'unread' ? 'No unread announcements' : filter === 'read' ? 'No read announcements' : 'No announcements yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement) => (
            <motion.div
              key={announcement.id}
              className={`rounded-lg shadow-md overflow-hidden hover:shadow-lg transition cursor-pointer ${getPriorityColor(announcement.priority)} ${
                !announcement.is_read ? 'bg-white' : ''
              }`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => handleAnnouncementClick(announcement)}
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="mt-1">
                      {getPriorityIcon(announcement.priority)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{announcement.title}</h3>
                        {!announcement.is_read && (
                          <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-gray-600 line-clamp-2 mb-3">{announcement.message}</p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <FaClock />
                          {formatDate(announcement.created_at)}
                        </span>
                        <span>•</span>
                        <span>From: {announcement.sender_name}</span>
                        {announcement.is_read && announcement.read_at && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1 text-green-600">
                              <FaEnvelopeOpen />
                              Read
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
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
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Previous
          </button>
          <span className="px-4 py-2 font-semibold">
            Page {pagination.page} of {Math.ceil(pagination.total / pagination.limit)}
          </span>
          <button
            onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
            className="px-4 py-2 bg-gray-200 rounded-lg disabled:opacity-50 hover:bg-gray-300 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* Announcement Detail Modal */}
      <AnimatePresence>
        {selectedAnnouncement && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <div className={`p-6 border-b border-gray-200 flex justify-between items-start ${getPriorityColor(selectedAnnouncement.priority)}`}>
                <div className="flex items-start gap-3 flex-1">
                  {getPriorityIcon(selectedAnnouncement.priority)}
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      {selectedAnnouncement.title}
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <span>From: {selectedAnnouncement.sender_name}</span>
                      <span>•</span>
                      <span>{new Date(selectedAnnouncement.created_at).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="text-gray-500 hover:text-gray-700 transition"
                >
                  <FaTimes size={24} />
                </button>
              </div>

              <div className="p-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap text-lg leading-relaxed">
                    {selectedAnnouncement.message}
                  </p>
                </div>

                {selectedAnnouncement.is_read && selectedAnnouncement.read_at && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <FaCheckCircle className="text-green-600" />
                      Read on {new Date(selectedAnnouncement.read_at).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end">
                <button
                  onClick={() => setSelectedAnnouncement(null)}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentAnnouncements;