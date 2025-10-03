import React, { useState, useEffect } from "react";
import { auth } from "../firebase";
import axios from "axios";
import Hero from "./Hero"; // Make sure this path is correct
import { Link } from "react-router-dom";
import AnnouncementsPreview from "./AnnouncementsPreview";

export default function StudentDashboard() {
  const [studentData, setStudentData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state for update request
  const [residentialTel, setResidentialTel] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [address, setAddress] = useState("");
  const [message, setMessage] = useState(""); // optional, for success/error

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          setError("No user logged in");
          setLoading(false);
          return;
        }

        // Get student data using Firebase UID
        const response = await axios.get(
          `http://localhost:5000/api/students/profile/${user.uid}`
        );
        setStudentData(response.data.student);
        setCourses(response.data.courses);
        setPayments(response.data.payments);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load student data");
        setLoading(false);
      }
    };

    fetchStudentData();
  }, []);

  // Submit profile update request
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentData) return;

    const requestData = {};
    if (whatsappNumber.trim() !== "")
      requestData.whatsapp_number = whatsappNumber;
    if (residentialTel.trim() !== "")
      requestData.residential_tel = residentialTel;
    if (address.trim() !== "") 
      requestData.address = address;


    if (Object.keys(requestData).length === 0) {
      setMessage("Enter at least one field to update");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/students/request-update/${studentData.uid}`,
        requestData
      );
      setMessage("Update request submitted successfully!");
      setWhatsappNumber("");
      setResidentialTel("");
      setAddress("");
    } catch (err) {
      console.error("Error submitting update request:", err);
      setMessage("Failed to submit update request");
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 p-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero full width */}
      <Hero />

      {/* Dashboard content */}
      <div className="max-w-7xl mx-auto mt-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome, {studentData?.name}
          </h1>
          <div className="flex items-center gap-3">
            <Link
              to="/student/marks"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
            >
              View Marks
            </Link>
            <Link
              to="/student/announcements"
              className="bg-green-600 text-white px-4 py-2 rounded-lg shadow hover:bg-green-700 transition-colors"
            >
              All Announcements
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-4 py-2 rounded-lg shadow hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Announcements Preview */}
            <AnnouncementsPreview />

            {/* Enrolled Courses and Payment History */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Enrolled Courses</h2>
                {courses.length > 0 ? (
                  <div className="space-y-3">
                    {courses.map((course) => (
                      <div key={course.course_id} className="border p-3 rounded-lg bg-gray-50">
                        <h3 className="font-semibold">{course.course_name}</h3>
                        <p className="text-gray-600">Amount: Rs. {course.amount}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No courses enrolled</p>
                )}
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Payment History</h2>
                {payments.length > 0 ? (
                  <div className="space-y-3">
                    {payments.map((payment, index) => (
                      <div key={index} className="border p-3 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold">
                              Course: {payment.course_name}
                            </p>
                            <p className="text-sm text-gray-600">
                              Type: {payment.payment_type}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              Paid: Rs. {payment.amount_paid}
                            </p>
                            <p className="text-sm text-gray-600">
                              Due: Rs. {payment.amount_due}
                            </p>
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

          {/* Right Column */}
          <div className="space-y-8">
            {/* Student Information */}
            {studentData && (
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Your Information</h2>
                <div className="space-y-3">
                    <p><strong>Name:</strong> {studentData.name}</p>
                    <p><strong>Admission No:</strong> {studentData.admission_number}</p>
                    <p><strong>Batch:</strong> {studentData.batch}</p>
                    <p><strong>Email:</strong> {studentData.email}</p>
                    <p><strong>WhatsApp:</strong> {studentData.whatsapp_number}</p>
                    <p><strong>Phone:</strong> {studentData.residential_tel}</p>
                    <p><strong>Gender:</strong> {studentData.gender}</p>
                    <p><strong>School:</strong> {studentData.school}</p>
                </div>
              </div>
            )}

            {/* Request Update Form */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Request Profile Update</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="New WhatsApp Number"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
                <input
                  type="text"
                  placeholder="New Residential Number"
                  value={residentialTel}
                  onChange={(e) => setResidentialTel(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
                 <input
                  type="text"
                  placeholder="New Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full border p-2 rounded-lg"
                />
                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit Request
                </button>
              </form>
              {message && <p className="mt-2 text-green-600">{message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
