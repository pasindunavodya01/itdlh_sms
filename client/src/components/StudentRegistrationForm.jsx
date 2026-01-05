import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
 // For sending data to backend if needed

const StudentRegistrationForm = ({ next }) => {
  const [formData, setFormData] = useState({
    admission_number: "",
    batch: "",
    name: "",
    gender: "",
    nic_number: "",
    email: "",
    whatsapp_number: "",
    residential_tel: "",
    address: "",
    school: "",
    password: "", 
  });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Optional: Save student info immediately to backend
      // const response = await axios.post('https://itdlhsms-production.up.railway.app/api/students/register', formData);
      // console.log('Saved:', response.data);

      // Pass data to MultiStep wrapper to go to next step
      next(formData);
    } catch (error) {
      console.error("Error saving student:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-2xl w-full bg-white p-6 shadow-md rounded-md mx-auto relative">
       
        <h2 className="text-2xl font-bold mb-4 text-[#b30d0d] text-center">Student Registration</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="admission_number"
            value={formData.admission_number}
            onChange={handleChange}
            placeholder="Admission Number"
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="batch"
            value={formData.batch}
            onChange={handleChange}
            placeholder="Batch"
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full border p-2 rounded"
          />

          <div className="flex gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={formData.gender === "Male"}
                onChange={handleChange}
              /> Male
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={formData.gender === "Female"}
                onChange={handleChange}
              /> Female
            </label>
          </div>

          <input
            type="text"
            name="nic_number"
            value={formData.nic_number}
            onChange={handleChange}
            placeholder="NIC Number"
            className="w-full border p-2 rounded"
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="whatsapp_number"
            value={formData.whatsapp_number}
            onChange={handleChange}
            placeholder="WhatsApp Number"
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="residential_tel"
            value={formData.residential_tel}
            onChange={handleChange}
            placeholder="Residential Telephone"
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full border p-2 rounded"
          />
          <input
            type="text"
            name="school"
            value={formData.school}
            onChange={handleChange}
            placeholder="School"
            className="w-full border p-2 rounded"
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password || ""}
              onChange={handleChange}
              placeholder="Password"
              className="w-full border p-2 rounded pr-10"
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m1.675-2.325A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-1.675 2.325A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675m1.675-2.325A9.956 9.956 0 0112 3c5.523 0 10 4.477 10 10 0 1.657-.336 3.234-.938 4.675m-1.675 2.325A9.956 9.956 0 0112 21c-5.523 0-10-4.477-10-10 0-1.657.336-3.234.938-4.675" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3l18 18" /></svg>
              )}
            </button>
          </div>

          <div className="flex gap-2 mt-4 justify-between">
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
              onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/admin/dashboard')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-firebrick text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Next: Select Courses →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentRegistrationForm;
