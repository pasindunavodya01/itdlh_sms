import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./components/Login";
import PublicHomePage from "./components/PublicHomePage";
import AdminDashboard from "./components/AdminDashboard";
import StudentDashboard from "./components/StudentDashboard";
import MultiStepRegistration from "./components/MultiStepRegistration";
import AddPaymentForm from "./components/AddPaymentForm";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRegister from "./pages/AdminRegister";
import ViewStudents from "./components/ViewStudents";
import ManagePayments from "./components/ManagePayments";
import ManageCourses from "./components/ManageCourses";
import AdminRegisterAdmin from "./pages/AdminRegisterAdmin";
import ViewAdmins from "./components/ViewAdmins";
import StudentUpdateRequests from "./components/StudentUpdateRequests";
import AttendancePage from "./components/AttendancePage";
import MarksPage from "./components/Marks";
import StudentMarks from "./components/StudentMarks";
import ChatbotManager from "./components/ChatbotManager";
import AdminAnnouncements from "./components/AdminAnnouncements";
import StudentAnnouncements from "./components/StudentAnnouncements";
import CourseStructureManager from "./components/CourseStructureManager";
import BatchCourseManager from "./components/BatchCourseManager";

function App() {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <div className={isLoginPage ? "min-h-screen" : "bg-gray-100 min-h-screen"}>
      <Routes>
        {/* Public Homepage */}
        <Route path="/" element={<PublicHomePage />} />
        {/* Login Page */}
        <Route path="/login" element={<Login />} />
        {/* Admin Registration (for testing) */}
        <Route path="/admin/register" element={<AdminRegister />} />

        {/* Admin Dashboard */}
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />

        {/* View All Students */}
        <Route 
          path="/admin/view-students" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ViewStudents />
            </ProtectedRoute>
          } 
        />

        {/* Manage Payments */}
        <Route 
          path="/admin/manage-payments" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManagePayments />
            </ProtectedRoute>
          } 
        />

        {/* Manage Courses */}
        <Route 
          path="/admin/manage-courses" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ManageCourses />
            </ProtectedRoute>
          } 
        />

        {/* Student Dashboard */}
        <Route 
          path="/student/dashboard" 
          element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } 
        />

      {/* Student Marks */}
      <Route 
        path="/student/marks" 
        element={
          <ProtectedRoute requiredRole="student">
            <StudentMarks />
          </ProtectedRoute>
        }
      />

        {/* Multi-Step Student Registration */}
        <Route 
          path="/admin/register-student" 
          element={
            <ProtectedRoute requiredRole="admin">
              <MultiStepRegistration />
            </ProtectedRoute>
          } 
        />

        {/* Add Payment Form */}
        <Route 
          path="/admin/payments/add" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AddPaymentForm />
            </ProtectedRoute>
          } 
        />

        {/* Admin Register New Admin */}
        <Route 
          path="/admin/register-admin" 
          element={
            <ProtectedRoute requiredRole="admin">
              <AdminRegisterAdmin />
            </ProtectedRoute>
          } 
        />

        {/* Admin View All Admins */}
        <Route
          path="/admin/view-admins"
          element={
            <ProtectedRoute requiredRole="admin">
              <ViewAdmins />
            </ProtectedRoute>
          }
        />

        {/* Student Update Requests */}
        <Route
          path="/admin/view-students-requests"
          element={
            <ProtectedRoute requiredRole="admin">
              <StudentUpdateRequests />
            </ProtectedRoute>
          }
        />

        {/* Course Structure Manager */}
        <Route
          path="/admin/course-structure"
          element={
            <ProtectedRoute requiredRole="admin">
              <CourseStructureManager />
            </ProtectedRoute>
          }
        />

        {/* Attendance Page */}
        <Route
          path="/admin/attendance"
          element={
            <ProtectedRoute requiredRole="admin">
              <AttendancePage />
            </ProtectedRoute>
          }
        />

       {/* Admin Announcements Page */}
<Route
  path="/admin/announcements"
  element={
    <ProtectedRoute requiredRole="admin">
      <AdminAnnouncements />
    </ProtectedRoute>
  }
/>

{/* Student Announcements Page */}
<Route
  path="/student/announcements"
  element={
    <ProtectedRoute requiredRole="student">
      <StudentAnnouncements />
    </ProtectedRoute>
  }
/>
        {/* Marks Page */}
        <Route
          path="/admin/marks"
          element={
            <ProtectedRoute requiredRole="admin">
              <MarksPage />
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
<Route
  path="/admin/course-structures"
  element={
    <ProtectedRoute requiredRole="admin">
      <CourseStructureManager />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/batch-courses"
  element={
    <ProtectedRoute requiredRole="admin">
      <BatchCourseManager />
    </ProtectedRoute>
  }
/>

<Route
  path="/admin/attendance/manage/:batchCourseId"
  element={
    <ProtectedRoute requiredRole="admin">
      <AttendancePage />
    </ProtectedRoute>
  }
/>


        {/* Manage Chatbot */}
        <Route 
          path="/admin/manage-chatbot" 
          element={
            <ProtectedRoute requiredRole="admin">
              <ChatbotManager />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
}

export default App;
