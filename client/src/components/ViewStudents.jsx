import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [noteEditing, setNoteEditing] = useState(false);
  const [noteValue, setNoteValue] = useState('');
  const [showNotesList, setShowNotesList] = useState(false);
  const [studentsWithNotes, setStudentsWithNotes] = useState([]);

  // Function to fetch students with notes
  const fetchStudentsWithNotes = async () => {
    try {
      const response = await axios.get('http://itdlhsms-production.up.railway.app/api/students/with-notes');
      setStudentsWithNotes(response.data.students || []);
      setShowNotesList(true);
    } catch (err) {
      console.error('Error fetching students with notes:', err);
      alert('Failed to load students with notes');
    }
  };

  // Whenever a student is selected, load the note
  useEffect(() => {
    if (selectedStudent && selectedStudent.student) {
      setNoteValue(selectedStudent.student.special_note || '');
    }
  }, [selectedStudent]);

  // Function to save note
  const saveNote = async () => {
    try {
      await axios.put(
        `http://itdlhsms-production.up.railway.app/api/students/${selectedStudent.student.uid}/note`,
        { special_note: noteValue }
      );
      alert('Note saved successfully');
      // Refresh student details
      handleStudentClick(selectedStudent.student);
      setNoteEditing(false);
    } catch (err) {
      console.error('Error saving note:', err);
      alert('Failed to save note');
    }
  };

  useEffect(() => {
    if (selectedStudent && isEditing) {
      setEditForm(selectedStudent.student);
    }
  }, [isEditing, selectedStudent]);

  useEffect(() => {
    fetchAllStudents();
  }, []);

  useEffect(() => {
    // Filter students based on search term
    if (searchTerm.trim() === '') {
      setFilteredStudents(students);
    } else {
      const filtered = students.filter(student =>
        student.admission_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [searchTerm, students]);

  const fetchAllStudents = async () => {
    try {
      const response = await axios.get('http://itdlhsms-production.up.railway.app/api/students/all');
      setStudents(response.data.students || []);
      setFilteredStudents(response.data.students || []);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
      setLoading(false);
    }
  };

  const handleStudentClick = async (student) => {
    try {
      // Fetch detailed student information including courses and payments
      const response = await axios.get(`http://itdlhsms-production.up.railway.app/api/students/profile/${student.uid}`);
      
      // Ensure we have default empty arrays if properties are undefined
      const studentData = {
        student: response.data.student || {},
        courses: response.data.courses || [],
        payments: response.data.payments || []
      };
      
      setSelectedStudent(studentData);
      setShowStudentDetails(true);
    } catch (err) {
      console.error('Error fetching student details:', err);
      setError('Failed to load student details');
    }
  };

  const closeStudentDetails = () => {
    setShowStudentDetails(false);
    setSelectedStudent(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <p>Loading students...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <Link
            to="/admin/dashboard"
            className="bg-firebrick text-white px-4 py-2 rounded hover:bg-darkRed"
          >
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-firebrick">View All Students</h1>
          <button
            onClick={fetchStudentsWithNotes}
            className="bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 ml-4"
          >
            View Students with Notes
          </button>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-gray-600 mb-2">Search Students</label>
              <input
                type="text"
                placeholder="Search by admission number, name, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setSearchTerm('')}
                className="bg-deepRed text-white px-4 py-2 rounded hover:bg-firebrick"
              >
                Clear
              </button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Students List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Admission Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Batch
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.map((student) => (
                  <tr key={student.uid} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {student.admission_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {student.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.batch}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {student.whatsapp_number}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleStudentClick(student)}
                        className="text-firebrick hover:text-deepRed font-semibold"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Students with Notes List */}
        {showNotesList && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-firebrick">Students with Notes</h2>
                <button
                  onClick={() => setShowNotesList(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>
              {studentsWithNotes.length > 0 ? (
                <div className="space-y-3">
                  {studentsWithNotes.map((student) => (
                    <div key={student.uid} className="bg-yellow-50 p-4 rounded-lg">
                      <p><strong>Name:</strong> {student.name}</p>
                      <p><strong>Admission Number:</strong> {student.admission_number}</p>
                      <p><strong>Email:</strong> {student.email}</p>
                      <p><strong>Batch:</strong> {student.batch}</p>
                      <p><strong>Phone:</strong> {student.whatsapp_number}</p>
                      <p><strong>Note:</strong> {student.special_note}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>No students with notes found.</p>
              )}
            </div>
          </div>
        )}

        {/* Student Details Modal */}
        {showStudentDetails && selectedStudent && selectedStudent.student && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-firebrick">
                    Student Details - {selectedStudent.student.name}
                  </h2>
                  <button
                    onClick={closeStudentDetails}
                    className="text-gray-500 hover:text-gray-700 text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Student Information */}
                {isEditing ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      try {
                        await axios.put(
                          `http://itdlhsms-production.up.railway.app/api/students/update/${selectedStudent.student.uid}`,
                          editForm
                        );
                        alert("Student updated successfully!");
                        setIsEditing(false);
                        fetchAllStudents(); // refresh list
                        handleStudentClick(selectedStudent.student); // refresh details
                      } catch (err) {
                        console.error("Update error:", err);
                        alert("Failed to update student.");
                      }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6"
                  >
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <label className="block">
                        <span className="text-gray-700">Name</span>
                        <input
                          type="text"
                          value={editForm.name || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, name: e.target.value })
                          }
                          className="mt-1 block w-full border rounded p-2"
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Admission Number</span>
                        <input
                          type="text"
                          value={editForm.admission_number || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, admission_number: e.target.value })
                          }
                          className="mt-1 block w-full border rounded p-2"
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Email</span>
                        <input
                          type="email"
                          value={editForm.email || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, email: e.target.value })
                          }
                          className="mt-1 block w-full border rounded p-2"
                        />
                      </label>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <label className="block">
                        <span className="text-gray-700">WhatsApp No</span>
                        <input
                          type="text"
                          value={editForm.whatsapp_number || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, whatsapp_number: e.target.value })
                          }
                          className="mt-1 block w-full border rounded p-2"
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Residential No</span>
                        <input
                          type="text"
                          value={editForm.residential_tel || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, residential_tel: e.target.value })
                          }
                          className="mt-1 block w-full border rounded p-2"
                        />
                      </label>
                      <label className="block">
                        <span className="text-gray-700">Address</span>
                        <input
                          type="text"
                          value={editForm.address || ""}
                          onChange={(e) =>
                            setEditForm({ ...editForm, address: e.target.value })
                          }
                          className="mt-1 block w-full border rounded p-2"
                        />
                      </label>
                    </div>

                    <div className="col-span-2 flex justify-end gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditing(false)}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Personal Information</h3>
                      <div className="space-y-2">
                        <p><strong>Name:</strong> {selectedStudent.student.name}</p>
                        <p><strong>Admission Number:</strong> {selectedStudent.student.admission_number}</p>
                        <p><strong>Email:</strong> {selectedStudent.student.email}</p>
                        <p><strong>Batch:</strong> {selectedStudent.student.batch}</p>
                        <p><strong>Gender:</strong> {selectedStudent.student.gender}</p>
                        <p><strong>NIC Number:</strong> {selectedStudent.student.nic_number}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                      <div className="space-y-2">
                        <p><strong>WhatsApp:</strong> {selectedStudent.student.whatsapp_number}</p>
                        <p><strong>Phone:</strong> {selectedStudent.student.residential_tel}</p>
                        <p><strong>School:</strong> {selectedStudent.student.school}</p>
                        <p><strong>Address:</strong> {selectedStudent.student.address}</p>
                      </div>
                    </div>
                    <div className="col-span-2 flex justify-end mt-4">
                      <button
                        onClick={() => setIsEditing(true)}
                        className="bg-deepRed text-white px-4 py-2 rounded hover:bg-darkRed"
                      >
                        Edit Student
                      </button>
                    </div>
                  </div>
                )}

                {/* Special Note */}
                <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                  <h3 className="text-lg font-semibold mb-2">Special Note</h3>
                  {noteEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={noteValue}
                        onChange={(e) => setNoteValue(e.target.value)}
                        className="w-full border rounded p-2"
                        rows={4}
                      ></textarea>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setNoteEditing(false)}
                          className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={saveNote}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                          Save Note
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <p>{noteValue || 'No special note added.'}</p>
                      <button
                        onClick={() => setNoteEditing(true)}
                        className="bg-gold text-white px-3 py-1 rounded hover:bg-firebrick"
                      >
                        Edit Note
                      </button>
                    </div>
                  )}
                </div>

                {/* Enrolled Courses */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-3">Enrolled Courses</h3>
                  {selectedStudent.courses && selectedStudent.courses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedStudent.courses.map((course) => (
                        <div key={course.course_id} className="bg-blue-50 p-4 rounded-lg">
                          <h4 className="font-semibold">{course.course_name}</h4>
                          <p className="text-gray-600">Amount: Rs. {course.amount}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No courses enrolled</p>
                  )}
                </div>

              {/* Assigned Classes */}
<div className="mb-6">
  <h3 className="text-lg font-semibold mb-3">Assigned Classes</h3>
  {selectedStudent.courses && selectedStudent.courses.length > 0 ? (
    <div className="space-y-3">
      {selectedStudent.courses
        .filter(course => course.availableClasses && course.availableClasses.length > 0)
        .map(course => (
          <div
            key={course.course_id}
            className="bg-purple-50 p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <p><strong>Course:</strong> {course.course_name}</p>
              <p><strong>Class:</strong> {course.class_name || "Not Assigned"}</p>
            </div>
            <select
              value={course.class_id || ""}
              onChange={async (e) => {
                const newClassId = e.target.value || null;
                await axios.put(
                  `http://itdlhsms-production.up.railway.app/api/students/classes/${selectedStudent.student.uid}/${course.course_id}`,
                  { class_id: newClassId }
                );
                alert("Class updated!");
                handleStudentClick(selectedStudent.student); // refresh modal
              }}
              className="border p-2 rounded"
            >
              <option value="">No Class</option>
              {course.availableClasses.map((cls) => (
                <option key={cls.class_id} value={cls.class_id}>
                  {cls.class_name}
                </option>
              ))}
            </select>
          </div>
        ))}
    </div>
  ) : (
    <p className="text-gray-500">No courses enrolled</p>
  )}
</div>



                {/* Payment History */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment History</h3>
                  {selectedStudent.payments && selectedStudent.payments.length > 0 ? (
                    <div className="space-y-3">
                      {selectedStudent.payments.map((payment, index) => (
                        <div key={index} className="bg-green-50 p-4 rounded-lg">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="font-semibold">Course: {payment.course_name}</p>
                              <p className="text-sm text-gray-600">Type: {payment.payment_type}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">Paid: Rs. {payment.amount_paid}</p>
                              <p className="text-sm text-gray-600">Due: Rs. {payment.amount_due}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No payment history available</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}