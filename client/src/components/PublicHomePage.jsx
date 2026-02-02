import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

// Import all required icons from react-icons
import {
  FaGraduationCap,
  FaCertificate,
  FaChalkboardTeacher,
  FaTrophy,
  FaAward,
  FaUsers,
  FaHandshake,
  FaBook,
  FaClock,
  FaRocket,
  FaUserGraduate,
  FaClipboardList,
  FaChartLine,
  FaFileAlt,
  FaCalendarAlt,
  FaLaptopCode,
  FaCheckCircle,
  FaStar,
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaSignInAlt,
  FaRobot,
  FaTimes,
  FaBars
} from "react-icons/fa";

const PublicHomePage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://itdlhsms-production.up.railway.app/api/chatbot/data");
        const jsonData = await res.json();
        setData(jsonData);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setData({
          greeting: "Hello! Welcome to ITDLH",
          courses: [],
          lecturers: [],
          facilities: [],
          contact: {
            email: "info@moha.gov.lk",
            phone: "+94 112 785 141",
            address: "ITDLH, Dalupotha, Negombo, Sri Lanka"
          }
        });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = [
    { icon: FaGraduationCap, value: "150+", label: "Students Enrolled per Year" },
    { icon: FaCertificate, value: data?.courses?.length || "8+", label: "Courses Offered" },
    { icon: FaChalkboardTeacher, value: data?.lecturers?.length || "15+", label: "Expert Instructors" },
    { icon: FaTrophy, value: "95%", label: "Success Rate" }
  ];

  const testimonials = [
    {
      name: "Kasun Perera",
      course: "Web Designing",
      text: "The web design course transformed my career. The instructors were knowledgeable and supportive throughout.",
      rating: 5
    },
    {
      name: "Dilini Fernando",
      course: "Python Programming",
      text: "Excellent learning environment with hands-on projects. I'm now working as a junior developer!",
      rating: 5
    },
    {
      name: "Nuwan Silva",
      course: "Office Applications",
      text: "Practical course that helped me improve my productivity at work. Highly recommended!",
      rating: 5
    }
  ];

  const whyChoose = [
    {
      icon: FaAward,
      title: "Government Institute",
      desc: "All our certificates are officially recognized by the government"
    },
    {
      icon: FaUsers,
      title: "Small Class Sizes",
      desc: "Personalized attention with limited students per batch"
    },
    {
      icon: FaHandshake,
      title: "Placement Support",
      desc: "Career counseling and job placement assistance"
    },
    {
      icon: FaBook,
      title: "Updated Curriculum",
      desc: "Industry-relevant content updated regularly"
    },
    {
      icon: FaClock,
      title: "Flexible Timings",
      desc: "Multiple batches available"
    },
    {
      icon: FaRocket,
      title: "Practical Training",
      desc: "Hands-on projects and real-world applications"
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 mx-auto mb-4"></div>
          <p className="text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="font-sans text-gray-800 scroll-smooth scroll-pt-20 relative overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <motion.div 
            className="text-2xl font-bold text-red-600 flex items-center gap-2"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
              <FaGraduationCap className="text-white" />
            </div>
            ITDLH Negombo
          </motion.div>
          <div className="space-x-6 hidden lg:flex items-center">
  <a href="#home" className="hover:text-red-600 transition font-medium">Home</a>
  <a href="#courses" className="hover:text-red-600 transition font-medium">Courses</a>
  <a href="#lecturers" className="hover:text-red-600 transition font-medium">Lecturers</a>
  <a href="#testimonials" className="hover:text-red-600 transition font-medium">Testimonials</a>
  <a href="#contact" className="hover:text-red-600 transition font-medium">Contact</a>

  

  {/* Enroll Now as simple link */}
  <button className="hover:text-red-600 transition font-medium">
    Enroll Now
  </button>
  {/* Login as red button */}
  <Link
    to="/login"
    className="bg-red-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-700 transition transform hover:scale-105"
  >
    Login
  </Link>
</div>
<div className="lg:hidden">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <FaTimes className="text-2xl text-red-600" /> : <FaBars className="text-2xl text-red-600" />}
            </button>
          </div>
 

        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="lg:hidden fixed top-20 left-0 w-full bg-white shadow-md z-40"
        >
          <div className="flex flex-col items-center space-y-4 py-4">
            <a href="#home" className="hover:text-red-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>Home</a>
            <a href="#courses" className="hover:text-red-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>Courses</a>
            <a href="#lecturers" className="hover:text-red-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>Lecturers</a>
            <a href="#testimonials" className="hover:text-red-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>Testimonials</a>
            <a href="#contact" className="hover:text-red-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>Contact</a>
            <button className="hover:text-red-600 transition font-medium" onClick={() => setIsMobileMenuOpen(false)}>
              Enroll Now
            </button>
            <Link
              to="/login"
              className="bg-red-600 text-white px-6 py-2 rounded-full shadow-lg hover:bg-red-700 transition transform hover:scale-105"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
          </div>
        </motion.div>
      )}

      {/* Hero Section - Enhanced */}
      <section id="home" className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-orange-900">
          <style>{`
            @keyframes gradientShift {
              0%, 100% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
            }
            @keyframes float {
              0%, 100% { transform: translate(0, 0); }
              25% { transform: translate(10px, -10px); }
              50% { transform: translate(-10px, -20px); }
              75% { transform: translate(-20px, 10px); }
            }
            @keyframes float2 {
              0%, 100% { transform: translate(0, 0) scale(1); }
              33% { transform: translate(15px, -15px) scale(1.1); }
              66% { transform: translate(-15px, 15px) scale(0.9); }
            }
            @keyframes float3 {
              0%, 100% { transform: translate(0, 0) rotate(0deg); }
              25% { transform: translate(-15px, 10px) rotate(90deg); }
              50% { transform: translate(15px, -10px) rotate(180deg); }
              75% { transform: translate(10px, 15px) rotate(270deg); }
            }
            .gradient-animate {
  background: linear-gradient(135deg, #b91c1c, #dc2626, #ea580c, #b91c1c);
  background-size: 400% 400%;
  animation: gradientShift 15s ease infinite;
}

          `}</style>
          <div className="absolute inset-0 gradient-animate"></div>
        </div>

        {/* Floating Circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Large blurred circles */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl opacity-10" 
               style={{ animation: 'float 20s ease-in-out infinite' }}></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl opacity-10"
               style={{ animation: 'float2 25s ease-in-out infinite' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-orange-400 rounded-full blur-3xl opacity-10"
               style={{ animation: 'float3 30s ease-in-out infinite' }}></div>

          {/* Small floating circles */}
          <div className="absolute top-1/4 left-1/4 w-4 h-4 bg-white rounded-full opacity-30"
               style={{ animation: 'float 8s ease-in-out infinite' }}></div>
          <div className="absolute top-1/3 right-1/4 w-3 h-3 bg-yellow-200 rounded-full opacity-40"
               style={{ animation: 'float2 10s ease-in-out infinite' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-5 h-5 bg-white rounded-full opacity-25"
               style={{ animation: 'float3 12s ease-in-out infinite' }}></div>
          <div className="absolute top-1/2 right-1/3 w-2 h-2 bg-orange-200 rounded-full opacity-35"
               style={{ animation: 'float 15s ease-in-out infinite' }}></div>
          <div className="absolute bottom-1/3 right-1/4 w-4 h-4 bg-white rounded-full opacity-30"
               style={{ animation: 'float2 18s ease-in-out infinite' }}></div>
          <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-yellow-300 rounded-full opacity-40"
               style={{ animation: 'float3 14s ease-in-out infinite' }}></div>
          <div className="absolute top-1/4 right-1/3 w-2 h-2 bg-white rounded-full opacity-20"
               style={{ animation: 'float 11s ease-in-out infinite' }}></div>
          <div className="absolute bottom-1/2 left-1/2 w-3 h-3 bg-orange-300 rounded-full opacity-30"
               style={{ animation: 'float2 16s ease-in-out infinite' }}></div>
          <div className="absolute top-3/4 right-1/2 w-4 h-4 bg-white rounded-full opacity-25"
               style={{ animation: 'float3 13s ease-in-out infinite' }}></div>
          <div className="absolute bottom-1/4 right-1/3 w-2 h-2 bg-yellow-200 rounded-full opacity-35"
               style={{ animation: 'float 17s ease-in-out infinite' }}></div>
          
          {/* More scattered circles */}
          <div className="absolute top-[15%] left-[60%] w-3 h-3 bg-white rounded-full opacity-20"
               style={{ animation: 'float2 19s ease-in-out infinite' }}></div>
          <div className="absolute top-[45%] left-[15%] w-2 h-2 bg-orange-200 rounded-full opacity-30"
               style={{ animation: 'float3 21s ease-in-out infinite' }}></div>
          <div className="absolute top-[70%] left-[80%] w-4 h-4 bg-white rounded-full opacity-25"
               style={{ animation: 'float 22s ease-in-out infinite' }}></div>
          <div className="absolute top-[35%] left-[70%] w-2 h-2 bg-yellow-300 rounded-full opacity-35"
               style={{ animation: 'float2 24s ease-in-out infinite' }}></div>
          <div className="absolute top-[85%] left-[25%] w-3 h-3 bg-white rounded-full opacity-30"
               style={{ animation: 'float3 20s ease-in-out infinite' }}></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div 
                className="inline-block mb-4 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white font-semibold"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
              >
                🎓 Government Institute
              </motion.div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
                Transform Your Future with
                <span className="block text-yellow-300 mt-2">Quality IT Education</span>
              </h1>
              
              <p className="text-xl text-white/90 mb-8 leading-relaxed">
                Join Sri Lanka's premier IT & Distance Learning Hub in Negombo. 
                Gain practical skills, industry certifications, and career opportunities.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <motion.a
                  href="#courses"
                  className="bg-white text-red-600 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition transform hover:scale-105 text-center"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Explore Courses
                </motion.a>
                <motion.a
                  href="#contact"
                  className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-red-600 transition text-center"
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Contact Us
                </motion.a>
              </div>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <div className="relative bg-white/10 backdrop-blur-lg rounded-3xl p-8 shadow-2xl">
                <div className="grid grid-cols-2 gap-6">
                  {stats.map((stat, idx) => (
                    <motion.div
                      key={idx}
                      className="bg-white rounded-2xl p-6 text-center shadow-lg"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 + idx * 0.1 }}
                    >
                      <stat.icon className="text-4xl text-red-600 mx-auto mb-3" />
                      <div className="text-3xl font-bold text-gray-800">{stat.value}</div>
                      <div className="text-sm text-gray-600 mt-1">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <main className="bg-gradient-to-b from-gray-50 to-white">
        {/* Student Management System Section */}
        <section id="sms" className="py-20 px-6 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Student <span className="text-red-600">Management System</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Access your courses, grades, attendance, and more through our comprehensive student portal
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* SMS Features */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaUserGraduate className="text-2xl text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Course Management</h3>
                      <p className="text-gray-600">View enrolled courses, schedules, and course materials in one place</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaClipboardList className="text-2xl text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Attendance Tracking</h3>
                      <p className="text-gray-600">Monitor your attendance records and receive notifications</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaChartLine className="text-2xl text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Grade Reports</h3>
                      <p className="text-gray-600">Access your grades, assignments, and academic progress reports</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaFileAlt className="text-2xl text-orange-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Documents & Certificates</h3>
                      <p className="text-gray-600">Download certificates, receipts, and official documents</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <FaCalendarAlt className="text-2xl text-red-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">Event Calendar</h3>
                      <p className="text-gray-600">Stay updated with exam schedules, holidays, and important dates</p>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Login Card */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
              >
                <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <FaUserGraduate className="text-4xl text-white" />
                    </div>
                    <h3 className="text-3xl font-bold text-gray-800 mb-2">SMS Login</h3>
                    <p className="text-gray-600">Access your student portal</p>
                  </div>

                  <SMSLoginForm />
                </div>
              </motion.div>
            </div>

            {/* SMS Benefits Banner */}
            <motion.div
              className="mt-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-3xl p-8 text-white text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl md:text-3xl font-bold mb-4">
                Manage Your Education Seamlessly
              </h3>
              <p className="text-lg text-white/90 max-w-3xl mx-auto mb-6">
                Our Student Management System provides 24/7 access to all your academic information, 
                making it easier to track your progress and stay organized.
              </p>
              <div className="grid md:grid-cols-4 gap-6 mt-8">
                <div>
                  <div className="text-3xl font-bold mb-1">24/7</div>
                  <div className="text-white/80">Access Anytime</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-white/80">Secure & Private</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">Real-time</div>
                  <div className="text-white/80">Updates</div>
                </div>
                <div>
                  <div className="text-3xl font-bold mb-1">Mobile</div>
                  <div className="text-white/80">Friendly</div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Why Choose <span className="text-red-600">ITDLH?</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                We provide world-class education with a focus on practical skills and career success
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {whyChoose.map((item, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mb-6">
                    <item.icon className="text-3xl text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Courses Section - Enhanced */}
        <section id="courses" className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Our <span className="text-red-600">Popular Courses</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Choose from our range of industry-focused courses designed to boost your career
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(data?.courses || []).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-xl text-gray-600">Courses will be announced soon.</p>
                </div>
              ) : (
                (data?.courses || []).map((course, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="bg-gradient-to-br from-red-500 to-orange-500 p-6 group-hover:from-red-600 group-hover:to-orange-600 transition-all">
                    <FaLaptopCode className="text-4xl text-white mb-3" />
                    <h3 className="text-xl font-bold text-white">{course.name}</h3>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">{course.description}</p>
                    
                    <div className="space-y-3 mb-6">
                      <div className="flex items-center text-gray-700">
                        <FaClock className="text-red-600 mr-3" />
                        <span className="font-semibold">Duration:</span>
                        <span className="ml-2">{course.duration}</span>
                      </div>
                      <div className="flex items-center text-gray-700">
                        <FaCheckCircle className="text-green-600 mr-3" />
                        <span className="font-semibold">Eligibility:</span>
                        <span className="ml-2 text-sm">{course.eligibility}</span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-4 flex items-center justify-between">
                      <div>
                        <div className="text-sm text-gray-500">Facility Fee</div>
                        <div className="text-2xl font-bold text-red-600">
                          Rs. {Number(course.price).toLocaleString()}
                        </div>
                      </div>
                      <button className="bg-red-600 text-white px-6 py-2 rounded-full hover:bg-red-700 transition transform hover:scale-105">
                        Enroll
                      </button>
                    </div>
                  </div>
                </motion.div>
              )))}
            </div>
          </div>
        </section>

        {/* Fee Information Section */}
        <section id="fees" className="py-8 px-6 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <motion.div
              className="bg-white border-l-8 border-red-500 rounded-2xl p-8 shadow-lg"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-start">
                <div className="pr-6 flex-shrink-0">
                  <FaAward className="text-5xl text-red-500" />
                </div>
                <div>
  <h2 className="text-4xl font-bold text-gray-800 mb-3">A Note on Our Fees</h2>
  <p className="text-m sm:text-xl text-gray-700 leading-relaxed">
    This is a <strong>government institute</strong>, and all the course fees are covered by the government. The fee is for the facilities given to you and to maintain the labs.
  </p>
</div>

              </div>
            </motion.div>
          </div>
        </section>

        {/* Lecturers Section - Enhanced */}

        <section id="lecturers" className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Meet Our <span className="text-red-600">Expert Instructors</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Learn from industry professionals with years of teaching and practical experience
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(data?.lecturers || []).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-xl text-gray-600">Lecturer information coming soon.</p>
                </div>
              ) : (
                (data?.lecturers || []).map((lecturer, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={lecturer.image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(lecturer.name)}&background=E53E3E&color=fff&size=400`}
                      alt={lecturer.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-2xl font-bold">{lecturer.name}</h3>
                      <p className="text-red-300 font-semibold">{lecturer.course} Expert</p>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <p className="text-gray-600 mb-4">
                      Experienced educator passionate about empowering students with practical skills
                      and industry knowledge.
                    </p>
                    <div className="flex items-center text-red-600">
                      <FaAward className="mr-2" />
                      <span className="text-sm font-semibold">10+ Years Experience</span>
                    </div>
                  </div>
                </motion.div>
              )))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Student <span className="text-red-600">Success Stories</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Hear what our students have to say about their learning journey
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaStar key={i} className="text-yellow-400 text-xl" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-lg mr-4">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{testimonial.name}</div>
                      <div className="text-sm text-gray-500">{testimonial.course}</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Facilities Section */}
        <section className="py-20 px-6">
          <div className="max-w-7xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                World-Class <span className="text-red-600">Facilities</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Study in a modern, comfortable environment equipped with the latest technology
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(data?.facilities || []).length === 0 ? (
                <div className="col-span-full text-center py-12">
                  <p className="text-xl text-gray-600">Facilities information coming soon.</p>
                </div>
              ) : (
                (data?.facilities || []).map((facility, idx) => (
                <motion.div
                  key={idx}
                  className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all text-center"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaCheckCircle className="text-3xl text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-800">{facility}</h3>
                </motion.div>
              )))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
<section className="relative py-20 px-6 overflow-hidden">
  {/* Animated Gradient Background */}
  <div className="absolute inset-0">
    <style>{`
      @keyframes ctaGradient {
        0%, 100% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
      }
      @keyframes ctaFloat {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(30px, -30px); }
      }
      @keyframes ctaFloat2 {
        0%, 100% { transform: translate(0, 0); }
        50% { transform: translate(-30px, 30px); }
      }
      .cta-gradient {
        background: linear-gradient(135deg, #991b1b, #c2410c, #b91c1c, #9a3412, #991b1b);
        background-size: 400% 400%;
        animation: ctaGradient 12s ease infinite;
      }
    `}</style>
    <div className="absolute inset-0 cta-gradient"></div>
  </div>

  {/* Floating Elements - Only large blurred circles */}
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl opacity-10"
         style={{ animation: 'ctaFloat 20s ease-in-out infinite' }}></div>
    <div className="absolute bottom-10 right-10 w-80 h-80 bg-orange-400 rounded-full blur-3xl opacity-10"
         style={{ animation: 'ctaFloat2 25s ease-in-out infinite' }}></div>
    <div className="absolute top-1/2 left-1/3 w-48 h-48 bg-red-400 rounded-full blur-3xl opacity-10"
         style={{ animation: 'ctaFloat 18s ease-in-out infinite' }}></div>
  </div>

  <div className="relative z-10 max-w-4xl mx-auto text-center text-white">
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <h2 className="text-4xl md:text-5xl font-bold mb-6">
        Ready to Start Your Learning Journey?
      </h2>
      <p className="text-xl mb-8 text-white/90">
        Join hundreds of students who have transformed their careers with ITDLH
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button className="bg-white text-red-600 px-8 py-4 rounded-full font-bold shadow-xl hover:shadow-2xl transition transform hover:scale-105">
          Enroll Now
        </button>
        <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-full font-bold hover:bg-white hover:text-red-600 transition">
          Download Brochure
        </button>
      </div>
    </motion.div>
  </div>
</section>
      </main>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <FaGraduationCap />
                </div>
                <h3 className="text-xl font-bold">ITDLH Negombo</h3>
              </div>
              <p className="text-gray-400 mb-4">
                Empowering students with quality IT education and professional training.
              </p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                  <FaFacebookF />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                  <FaInstagram />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition">
                  <FaLinkedinIn />
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#home" className="hover:text-red-400 transition">Home</a></li>
                <li><a href="#courses" className="hover:text-red-400 transition">Courses</a></li>
                <li><a href="#lecturers" className="hover:text-red-400 transition">Lecturers</a></li>
                <li><a href="#testimonials" className="hover:text-red-400 transition">Testimonials</a></li>
                <li><Link to="/login" className="hover:text-red-400 transition">Login</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Contact Info</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-3">
                  <FaMapMarkerAlt className="text-red-500 mt-1" />
                  <span>{data?.contact?.address || data?.location || "ITDLH, Dalupotha, Negombo"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaPhone className="text-red-500" />
                  <span>{data?.contact?.phone || "+94 112 785 141"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <FaEnvelope className="text-red-500" />
                  <span>{data?.contact?.email || "info@moha.gov.lk"}</span>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-bold mb-4">Office Hours</h3>
              <ul className="space-y-2 text-gray-400">
                <p>Monday - Saturday: 8:00 AM-1:30 PM</p>
                <li className="pt-4">
                  <span className="text-green-400">● Open Now</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ITDLH Negombo. All rights reserved. | Designed with ❤️ for education</p>
          </div>
        </div>
      </footer>

      {/* ChatBot */}
      <ChatBot />
    </div>
  );
};

const SMSLoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Fetch user role from backend
      const response = await fetch(`https://itdlhsms-production.up.railway.app/api/students/check-role/${user.uid}`);
      const data = await response.json();
      
      if (data.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (data.role === 'student') {
        navigate('/student/dashboard');
      } else {
        setError('Invalid user role');
        auth.signOut();
      }
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message.includes('auth/') 
        ? 'Invalid email or password'
        : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          required
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center">
          <input type="checkbox" className="mr-2" />
          <span className="text-gray-600">Remember me</span>
        </label>
        <a href="#" className="text-red-600 hover:text-red-700 font-semibold">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full bg-gradient-to-r from-red-600 to-orange-600 text-white py-4 rounded-xl font-bold shadow-lg hover:shadow-xl transition transform hover:scale-[1.02] flex items-center justify-center
          ${loading ? 'opacity-75 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
            Logging in...
          </>
        ) : (
          <>
            <FaSignInAlt className="inline mr-2" />
            Login to Portal
          </>
        )}
      </button>

      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-gray-600">
          New student?{" "}
          <a href="#contact" className="text-red-600 hover:text-red-700 font-semibold">
            Contact us to register
          </a>
        </p>
      </div>

      
    </form>
  );
};

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hello! How can I help you today? You can ask me about courses, fees, and more." }
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);
  const [showHighlight, setShowHighlight] = useState(true);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Hide the highlight bubble after a few seconds
    const timer = setTimeout(() => {
      setShowHighlight(false);
    }, 6000); // 6 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    setMessages(prev => [...prev, { from: "user", text: input }]);

    try {
      const res = await fetch("https://itdlhsms-production.up.railway.app/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ message: input })
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: "bot", text: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { from: "bot", text: "⚠️ Error connecting to server." }]);
    }

    setInput("");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-end gap-3">
      {/* Chat Window */}
      {open && (
        <motion.div
          className="w-full max-w-md sm:w-96 bg-white shadow-2xl rounded-2xl overflow-hidden mb-4 flex flex-col"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 sm:px-6 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <FaRobot className="text-xl" />
              </div>
              <div>
                <div className="font-bold text-sm sm:text-base">ITDLH Assistant</div>
                <div className="text-xs sm:text-sm text-white/80">● Online</div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 hover:bg-white/20 rounded-full flex items-center justify-center transition"
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-gray-50 max-h-[50vh] sm:max-h-96">
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                className={`mb-3 flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 sm:px-4 sm:py-3 ${
                    msg.from === "user" ? "bg-red-600 text-white" : "bg-white text-gray-800 shadow-md"
                  }`}
                  style={{ whiteSpace: "pre-wrap" }}
                >
                  {msg.text}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 sm:p-4 bg-white border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 border border-gray-300 rounded-full px-3 py-2 sm:px-4 sm:py-3 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm sm:text-base"
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
              <button
                onClick={handleSend}
                className="bg-red-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-red-700 transition font-semibold text-sm sm:text-base"
              >
                Send
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Highlight Bubble */}
      {showHighlight && !open && (
        <motion.div
          className="bg-white text-gray-800 px-4 py-2 rounded-lg shadow-lg text-sm font-semibold"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.3 }}
        >
          Chat with our agent!
        </motion.div>
      )}

      {/* Floating Button */}
      <div className="relative">
        <motion.button
          onClick={() => setOpen(!open)}
          className="w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition flex items-center justify-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          {open ? <FaTimes className="text-2xl" /> : <FaRobot className="text-2xl" />}
        </motion.button>
        {showHighlight && !open && (
          <div className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
        )}
      </div>
    </div>
  );
};

export default PublicHomePage;