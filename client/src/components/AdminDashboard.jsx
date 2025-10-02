import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";
import Hero from "./Hero"; 
import axios from "axios"; // ✅ import axios
 

export default function AdminDashboard() {
  const [pendingCount, setPendingCount] = useState(0); // ✅ state for bubble

  const handleLogout = async () => {
    try {
      await auth.signOut();
      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  useEffect(() => {
    const fetchPendingRequests = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/students/requests");
        const pending = res.data.requests.filter((r) => r.status === "pending").length;
        setPendingCount(pending);
      } catch (err) {
        console.error("Error fetching pending requests:", err);
      }
    };

    fetchPendingRequests();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      {/* ✅ Hero Section */}
      <Hero
        title="Welcome, Admin!"
        subtitle="Manage students, courses, and payments all in one place."
      />

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-firebrick">Admin Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Other cards... */}
        

    
        <Link to="/admin/register-student">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Register Students</h2>
            <p className="text-gray-600">Add new students to the system.</p>
          </div>
        </Link>

        <Link to="/admin/view-students">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Manage Students</h2>
            <p className="text-gray-600">Browse and search student records.</p>
          </div>
        </Link>

        <Link to="/admin/manage-payments">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Manage Payments</h2>
            <p className="text-gray-600">Add and track student payments.</p>
          </div>
        </Link>

        <Link to="/admin/attendance">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Attendance</h2>
            <p className="text-gray-600">Mark and track student attendance.</p>
          </div>
        </Link>

        <Link to="/admin/marks">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Marks & Eligibility</h2>
            <p className="text-gray-600">Check eligibility and update marks.</p>
          </div>
        </Link>

        
        <Link to="/admin/manage-courses">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Manage Courses</h2>
            <p className="text-gray-600">Add, edit courses and update prices.</p>
          </div>
        </Link>

        <Link to="/admin/view-admins">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Manage Admins</h2>
            <p className="text-gray-600">View/Add admin users in the system.</p>
          </div>
        </Link>

        <Link to="/admin/view-students-requests">
          <div className="relative bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Students Update Requests</h2>
            <p className="text-gray-600">List of all student update requests.</p>

            {/* 🔴 Notification Bubble */}
            {pendingCount > 0 && (
              <span className="absolute top-3 right-3 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                {pendingCount}
              </span>
            )}
          </div>
        </Link>

        {/* New Manage Chatbot card */}
        <Link to="/admin/manage-chatbot">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Manage WebPage & Chatbot</h2>
            <p className="text-gray-600">Update chatbot responses and webpage content.</p>
          </div>
        </Link>

        <Link to="/admin/announcements">
          <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition cursor-pointer">
            <h2 className="text-xl font-semibold mb-2">Announcements</h2>
            <p className="text-gray-600">View and manage announcements.</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
