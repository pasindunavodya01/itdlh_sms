import React, { useState, useEffect } from 'react';
import {Link} from 'react-router-dom'

const ChatbotManager = () => {
  const [data, setData] = useState(null);        // Original server data
  const [localData, setLocalData] = useState(null); // Local editable copy
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('basic');
  const [hasChanges, setHasChanges] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchChatbotData();
  }, []);

  // Track changes by comparing local data with original data
  useEffect(() => {
    if (data && localData) {
      const hasChanges = JSON.stringify(data) !== JSON.stringify(localData);
      setHasChanges(hasChanges);
    }
  }, [data, localData]);

  const fetchChatbotData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/chatbot/data');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      setData(result);
      setLocalData(JSON.parse(JSON.stringify(result))); // Deep copy for local editing
      setError(null);
    } catch (err) {
      setError(`Failed to load chatbot data: ${err.message}`);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generic function to update nested values locally
  const updateLocal = (section, key, value) => {
    setLocalData(prev => {
      const newData = { ...prev };
      
      if (section === 'basic' || section === 'contact') {
        newData[key] = value;
      } else if (section === 'socials') {
        newData.socials = { ...prev.socials, [key]: value };
      } else if (section === 'faqs') {
        newData.faqs = { ...prev.faqs, [key]: value };
      }
      
      return newData;
    });
  };

  const updateLocalArray = (section, index, value) => {
    setLocalData(prev => {
      const newData = { ...prev };
      const arr = [...prev[section]];
      arr[index] = value;
      newData[section] = arr;
      return newData;
    });
  };

  const addLocalArrayItem = (section, defaultValue = '') => {
    setLocalData(prev => {
      const newData = { ...prev };
      const arr = [...prev[section], defaultValue];
      newData[section] = arr;
      return newData;
    });
  };

  const deleteLocalArrayItem = (section, index) => {
    setLocalData(prev => {
      const newData = { ...prev };
      const arr = [...prev[section]];
      arr.splice(index, 1);
      newData[section] = arr;
      return newData;
    });
  };

  const saveChanges = async () => {
    if (!hasChanges) {
      setSuccessMessage('No changes to save!');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }

    try {
      setSaving(true);
      setError(null);
      
      const response = await fetch('http://localhost:5000/api/chatbot/data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(localData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      // Update original data to match what was saved
      setData(JSON.parse(JSON.stringify(localData)));
      setSuccessMessage('Changes saved successfully!');
      setTimeout(() => setSuccessMessage(''), 5000);
      
    } catch (err) {
      setError(`Failed to save changes: ${err.message}`);
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const discardChanges = () => {
    if (data) {
      setLocalData(JSON.parse(JSON.stringify(data)));
      setSuccessMessage('Changes discarded!');
      setTimeout(() => setSuccessMessage(''), 3000);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg">Loading chatbot data...</div>
    </div>
  );
  
  if (error) return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
        <h2 className="font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button 
          onClick={fetchChatbotData}
          className="mt-3 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    </div>
  );
  
  if (!localData) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg">No data available</div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">WebPage and Chatbot Data Management</h1>
        <div className="flex items-center space-x-4">
          {hasChanges && (
            <span className="text-amber-600 font-medium">• Unsaved changes</span>
          )}

          <Link
          to="/admin/dashboard"
          className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700" >
            Back to Dashboard
            </Link>

          <button
            onClick={discardChanges}
            disabled={!hasChanges || saving}
            className={`px-4 py-2 rounded ${
              hasChanges && !saving 
                ? 'bg-gray-500 text-white hover:bg-gray-600' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Discard Changes
          </button>
          <button
            onClick={saveChanges}
            disabled={!hasChanges || saving}
            className={`px-6 py-2 rounded ${
              hasChanges && !saving
                ? 'bg-blue-600 text-white hover:bg-blue-700' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-100 text-green-700 p-3 rounded mb-4">{successMessage}</div>
      )}

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['basic', 'courses', 'lecturers', , 'facilities', 'contact', 'faqs'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded ${
              activeTab === tab ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Basic Info */}
        {activeTab === 'basic' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              {['greeting', 'institute_type', 'location', 'website', 'notes'].map(field => (
                <div key={field}>
                  <label className="block mb-2 font-medium capitalize">{field.replace('_', ' ')}</label>
                  {field === 'notes' ? (
                    <textarea
                      className="w-full p-2 border rounded"
                      value={localData[field] || ''}
                      onChange={e => updateLocal('basic', field, e.target.value)}
                      rows="3"
                    />
                  ) : (
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={localData[field] || ''}
                      onChange={e => updateLocal('basic', field, e.target.value)}
                    />
                  )}
                </div>
              ))}

              <h3 className="text-lg font-semibold mt-6 mb-3">Social Media</h3>
              {Object.entries(localData.socials || {}).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block mb-2 font-medium capitalize">{platform}</label>
                  <input
                    type="url"
                    className="w-full p-2 border rounded"
                    value={url}
                    onChange={e => updateLocal('socials', platform, e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>
        )}

       {/* Courses */}
{activeTab === 'courses' && (
  <section>
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-semibold">Courses</h2>
      <button
        onClick={() =>
          addLocalArrayItem('courses', {
            name: 'New Course',
            price: 0,
            start_date: new Date().toISOString().split('T')[0],
            duration: '4 weeks',
            eligibility: '',
            description: '',
            mode: 'On-campus',
            intake_month: ''
          })
        }
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add New Course
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(localData.courses || []).map((course, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow space-y-3 border">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg">{course.name || 'New Course'}</h3>
            <button
              onClick={() => deleteLocalArrayItem('courses', index)}
              className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>

          {/* Course Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={course.name}
              onChange={e =>
                updateLocalArray('courses', index, { ...course, name: e.target.value })
              }
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium mb-1">Price (Rs.)</label>
            <input
              type="number"
              className="w-full p-2 border rounded"
              value={course.price}
              onChange={e =>
                updateLocalArray('courses', index, { ...course, price: parseInt(e.target.value) || 0 })
              }
            />
          </div>

          {/* Duration & Start Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Duration</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={course.duration}
                onChange={e => updateLocalArray('courses', index, { ...course, duration: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className="w-full p-2 border rounded"
                value={course.start_date}
                onChange={e => updateLocalArray('courses', index, { ...course, start_date: e.target.value })}
              />
            </div>
          </div>

          {/* Intake & Mode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Intake Month</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={course.intake_month}
                onChange={e => updateLocalArray('courses', index, { ...course, intake_month: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Mode</label>
              <select
                className="w-full p-2 border rounded"
                value={course.mode}
                onChange={e => updateLocalArray('courses', index, { ...course, mode: e.target.value })}
              >
                <option value="On-campus">On-campus</option>
                <option value="Online">Online</option>
                <option value="Hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* Eligibility */}
          <div>
            <label className="block text-sm font-medium mb-1">Eligibility</label>
            <input
              type="text"
              className="w-full p-2 border rounded"
              value={course.eligibility}
              onChange={e => updateLocalArray('courses', index, { ...course, eligibility: e.target.value })}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              rows="3"
              className="w-full p-2 border rounded"
              value={course.description}
              onChange={e => updateLocalArray('courses', index, { ...course, description: e.target.value })}
            />
          </div>
        </div>
      ))}
    </div>
  </section>
)}


        {/* Lecturers */}
        {activeTab === 'lecturers' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Lecturers</h2>
              <button
                onClick={() => addLocalArrayItem('lecturers', { name: '', course: '' })}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add Lecturer
              </button>
            </div>
            <div className="space-y-4">
              {(localData.lecturers || []).map((lecturer, index) => (
                <div key={index} className="flex items-center space-x-4 p-4 border rounded">
                  <input
                    type="text"
                    placeholder="Name"
                    className="p-2 border rounded flex-1"
                    value={lecturer.name}
                    onChange={e => updateLocalArray('lecturers', index, { ...lecturer, name: e.target.value })}
                  />
                  <input
                    type="text"
                    placeholder="Course/Subject"
                    className="p-2 border rounded flex-1"
                    value={lecturer.course}
                    onChange={e => updateLocalArray('lecturers', index, { ...lecturer, course: e.target.value })}
                  />
                  <button
                    onClick={() => deleteLocalArrayItem('lecturers', index)}
                    className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Facilities */}
{activeTab === 'facilities' && (
  <section>
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Facilities</h2>
      <button
        onClick={() => addLocalArrayItem('facilities')}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
      >
        Add Facility
      </button>
    </div>
    <div className="space-y-4">
      {(localData['facilities'] || []).map((item, index) => (
        <div key={index} className="flex items-center space-x-4">
          <input
            type="text"
            className="p-2 border rounded flex-1"
            value={item}
            onChange={e => updateLocalArray('facilities', index, e.target.value)}
          />
          <button
            onClick={() => deleteLocalArrayItem('facilities', index)}
            className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  </section>
)}


        {/* Contact */}
        {activeTab === 'contact' && (
          <section>
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4">
              {Object.entries(localData.contact || {}).map(([field, value]) => (
                <div key={field}>
                  <label className="block mb-2 font-medium capitalize">{field}</label>
                  {field === 'address' ? (
                    <textarea
                      className="w-full p-2 border rounded"
                      value={value}
                      onChange={e => updateLocal('contact', field, e.target.value)}
                      rows="3"
                    />
                  ) : (
                    <input
                      type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      className="w-full p-2 border rounded"
                      value={value}
                      onChange={e => updateLocal('contact', field, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {activeTab === 'faqs' && (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">FAQs</h2>
              <button
                onClick={() => updateLocal('faqs', `New Question ${Object.keys(localData.faqs || {}).length + 1}`, '')}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Add FAQ
              </button>
            </div>
            <div className="space-y-6">
              {Object.entries(localData.faqs || {}).map(([question, answer], index) => (
                <div key={index} className="space-y-2 p-4 border rounded">
                  <div>
                    <label className="block mb-2 font-medium">Question:</label>
                    <input
                      type="text"
                      className="w-full p-2 border rounded"
                      value={question}
                      onChange={e => {
                        const newFaqs = { ...localData.faqs };
                        delete newFaqs[question];
                        newFaqs[e.target.value] = answer;
                        setLocalData(prev => ({ ...prev, faqs: newFaqs }));
                      }}
                      placeholder="Enter question"
                    />
                  </div>
                  <div>
                    <label className="block mb-2 font-medium">Answer:</label>
                    <textarea
                      className="w-full p-2 border rounded"
                      value={answer}
                      onChange={e => updateLocal('faqs', question, e.target.value)}
                      placeholder="Enter answer"
                      rows="3"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const newFaqs = { ...localData.faqs };
                      delete newFaqs[question];
                      setLocalData(prev => ({ ...prev, faqs: newFaqs }));
                    }}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete FAQ
                  </button>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Save Button Footer */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {hasChanges ? '⚠️ You have unsaved changes' : '✅ All changes saved'}
          </div>
          <div className="space-x-4">
            <button
              onClick={discardChanges}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 rounded ${
                hasChanges && !saving 
                  ? 'bg-gray-500 text-white hover:bg-gray-600' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Discard Changes
            </button>
            <button
              onClick={saveChanges}
              disabled={!hasChanges || saving}
              className={`px-6 py-3 rounded font-medium ${
                hasChanges && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Save All Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotManager;