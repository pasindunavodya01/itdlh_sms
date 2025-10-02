import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

export default function ManagePayments() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentType, setPaymentType] = useState('full');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [studentCourses, setStudentCourses] = useState([]);
  const [currentPayment, setCurrentPayment] = useState(null);

  useEffect(() => {
    fetchStudents();
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchStudentCourses(selectedStudent);
    }
  }, [selectedStudent]);

  const fetchStudents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/students/all');
      setStudents(response.data.students);
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Failed to load students');
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/courses');
      setCourses(response.data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    }
  };

  const fetchStudentCourses = async (admissionNumber) => {
    try {
      const res = await axios.get(`http://localhost:5000/api/students/courses/${admissionNumber}`);
      setStudentCourses(res.data.courses);
    } catch (err) {
      console.error('Error fetching student courses:', err);
      setStudentCourses([]);
    }
  };

  const fetchCurrentPayment = useCallback(async () => {
    if (!selectedStudent || !selectedCourse) return;
    try {
      const response = await axios.get(`http://localhost:5000/api/payments/current/${selectedStudent}/${selectedCourse}`);
      if (response.data.payment) {
        setCurrentPayment(response.data.payment);
      } else {
        setCurrentPayment(null);
      }
    } catch (err) {
      console.error('Error fetching current payment:', err);
      setCurrentPayment(null);
    }
  }, [selectedStudent, selectedCourse]);

  useEffect(() => {
    if (selectedStudent && selectedCourse) {
      fetchCurrentPayment();
    }
  }, [selectedStudent, selectedCourse, fetchCurrentPayment]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!selectedStudent || !selectedCourse || !amountPaid) {
      setError('Please fill in all required fields');
      setLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5000/api/payments/add-for-student', {
        admission_number: selectedStudent,
        course_id: selectedCourse,
        amount_paid: parseFloat(amountPaid),
        payment_type: paymentType
      });

      setSuccess(`Payment of Rs. ${amountPaid} added successfully!`);
      setAmountPaid('');
      fetchCurrentPayment(); // Refresh current payment info
    } catch (err) {
      console.error('Error adding payment:', err);
      setError(err.response?.data?.error || 'Failed to add payment');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedStudentName = () => {
    const student = students.find(s => s.admission_number === selectedStudent);
    return student ? student.name : '';
  };

  const getSelectedCourseName = () => {
    const course = courses.find(c => c.course_id === parseInt(selectedCourse));
    return course ? course.course_name : '';
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-firebrick">Manage Payments</h1>
          <Link
            to="/admin/dashboard"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Dashboard
          </Link>
        </div>

        {/* Payment Form */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Add Payment</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-100 text-green-700 rounded text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Student Selection */}
            <div>
              <label className="block text-gray-600 mb-2">Select Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                required
              >
                <option value="">Choose a student...</option>
                {students.map((student) => (
                  <option key={student.uid} value={student.admission_number}>
                    {student.admission_number} - {student.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Course Selection */}
            <div>
              <label className="block text-gray-600 mb-2">Select Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                required
                disabled={!selectedStudent}
              >
                <option value="">Choose a course...</option>
                {studentCourses.map((course) => (
                  <option key={course.course_id} value={course.course_id}>
                    {course.course_name} - Rs. {course.amount}
                  </option>
                ))}
              </select>
            </div>

            {/* Current Payment Status */}
            {currentPayment && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Current Payment Status</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>Amount Paid:</strong> Rs. {currentPayment.amount_paid}</p>
                    <p><strong>Amount Due:</strong> Rs. {currentPayment.amount_due}</p>
                  </div>
                  <div>
                    <p><strong>Payment Type:</strong> {currentPayment.payment_type}</p>
                    <p><strong>Last Updated:</strong> {new Date(currentPayment.created_at || Date.now()).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Amount Input */}
            <div>
              <label className="block text-gray-600 mb-2">Amount Paid (Rs.)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                placeholder="Enter amount"
                required
              />
            </div>

            {/* Payment Type */}
            <div>
              <label className="block text-gray-600 mb-2">Payment Type</label>
              <select
                value={paymentType}
                onChange={(e) => setPaymentType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                required
              >
                <option value="full">Full Payment</option>
                <option value="half">Half Payment</option>
                <option value="partial">Partial Payment</option>
              </select>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-firebrick text-white py-2 rounded-lg hover:bg-deepRed transition duration-200 disabled:opacity-50"
            >
              {loading ? 'Adding Payment...' : 'Add Payment'}
            </button>
          </form>
        </div>

        {/* Selected Student and Course Info */}
        {selectedStudent && selectedCourse && (
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><strong>Student:</strong> {getSelectedStudentName()}</p>
                <p><strong>Admission Number:</strong> {selectedStudent}</p>
              </div>
              <div>
                <p><strong>Course:</strong> {getSelectedCourseName()}</p>
                <p><strong>Course Amount:</strong> Rs. {courses.find(c => c.course_id === parseInt(selectedCourse))?.amount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
