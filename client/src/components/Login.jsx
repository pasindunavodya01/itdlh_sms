import React, { useState } from 'react';
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase';
// eslint-disable-next-line
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // First, authenticate with Firebase
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      console.log('Firebase authentication successful. UID:', user.uid);

      // Then check user role in our database
      try {
        const roleResponse = await axios.get(`https://itdlhsms-production.up.railway.app/api/students/check-role/${user.uid}`);
        console.log('Role check response:', roleResponse.data);
        
        const { role } = roleResponse.data;

        // Redirect based on role
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else if (role === 'student') {
          navigate('/student/dashboard');
        } else {
          setError('User role not found');
        }
      } catch (roleError) {
        console.error('Role check error:', roleError);
        if (roleError.response?.status === 404) {
          setError('User not found in system database. Please contact administrator.');
        } else {
          setError('Failed to verify user role. Please try again.');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Please try again later.');
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    setError('');
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
      setShowResetForm(false);
    } catch (err) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many password reset attempts. Please try again later.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowResetForm(false);
    setResetEmailSent(false);
    setError('');
  };

  if (showResetForm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white p-8 shadow-md rounded-xl">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">Reset Password</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleForgotPassword} className="space-y-5">
            <div>
              <label className="block text-gray-600 mb-1">Email Address</label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring focus:border-blue-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="Enter your email address"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-firebrick text-white py-2 rounded-lg hover:bg-deepRed transition duration-200 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={resetForm}
              className="text-blue-600 hover:text-blue-800 underline text-sm"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetEmailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-md w-full bg-white p-8 shadow-md rounded-xl text-center">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email</h2>
            <p className="text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </p>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <p className="text-sm text-blue-800">
              Click the link in your email to reset your password. The link will expire in 1 hour.
            </p>
          </div>

          <button
            onClick={resetForm}
            className="w-full bg-firebrick text-white py-2 rounded-lg hover:bg-deepRed transition duration-200"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-darkRed to-deepRed">
    
    {/* Branding Header + Login Card */}
    <div className="w-full max-w-md mx-4">
      
      {/* Branding Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">
          Student Management System
        </h1>
        <p className="text-lg text-gold mt-2">
          Information Technology & Distance Learning Hub (ITDLH - Negombo)
        </p>
      </div>

      {/* Login Card */}
      <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-firebrick">
        <h2 className="text-2xl font-bold text-center mb-6 text-darkRed">
          Login
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-firebrick/10 border border-firebrick text-firebrick rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-firebrick"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-firebrick"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-firebrick text-white font-bold py-2 rounded-lg shadow-md hover:bg-deepRed transition duration-200 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        {/* Extra Actions */}
        <div className="mt-6 text-center space-y-3">
          <button
            onClick={() => setShowResetForm(true)}
            className="text-firebrick hover:text-deepRed underline text-sm block w-full"
          >
            Forgot Password?
          </button>
          <p className="text-xs text-gray-600">
            Access for <span className="font-semibold text-darkRed">Students</span> & <span className="font-semibold text-darkRed">Admins</span>
          </p>
        </div>
      </div>
    </div>
  </div>
);


};

export default Login;
