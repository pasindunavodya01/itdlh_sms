import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AddPaymentForm = ({ prev, formData: previousFormData }) => {
  const navigate = useNavigate();
  // Add courses state
  const [courses, setCourses] = useState([]);
  const [formData, setFormData] = useState({
    admission_number: previousFormData?.admission_number || '',
    course_id: '',
    amount_due: '',
    amount_paid: '',
    payment_type: 'full',
    receipt_no: '', // Added receipt_no
  });

  const [selectedCourses, setSelectedCourses] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [totalAmount, setTotalAmount] = useState(0);

  // Modified useEffect to properly handle selected courses
  useEffect(() => {
    console.log('Previous Form Data:', previousFormData); // Debug log

    if (!previousFormData?.courses?.length) {
      setError('No courses selected');
      setLoading(false);
      return;
    }

    axios.get('https://itdlhsms-production.up.railway.app/api/courses')
      .then(res => {
        setCourses(res.data); // Set all courses
        // Filter only the courses that were selected in the previous step
        const selected = res.data.filter(course =>
          previousFormData.courses.some(sel => sel.course_id === course.course_id)
        ).map(course => {
          const sel = previousFormData.courses.find(s => s.course_id === course.course_id);
          return { ...course, class_id: sel.class_id };

        });
        console.log('Selected Courses:', selected); // Debug log

        setSelectedCourses(selected);

        // Calculate total amount from selected courses
        const total = selected.reduce((sum, course) =>
          sum + (parseFloat(course.amount) || 0), 0
        );

        setTotalAmount(total);
        setFormData(prev => ({
          ...prev,
          amount_due: total.toString()
        }));
        setLoading(false);
      })
      .catch(err => {
        console.error('Error loading courses:', err);
        setError('Failed to load courses');
        setLoading(false);
      });
  }, [previousFormData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'course_id') {
      const selectedCourse = courses.find(course => course.course_id === parseInt(value));
      setFormData(prev => ({
        ...prev,
        [name]: value,
        amount_due: selectedCourse ? selectedCourse.amount : ''
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');

  try {
    // Calculate proportional payment for each course
    const totalDue = selectedCourses.reduce((sum, course) => sum + parseFloat(course.amount), 0);
    const paid = parseFloat(formData.amount_paid);

    // Distribute paid amount proportionally
    let remainingPaid = paid;
    let payments = selectedCourses.map((course, idx) => {
      // For last course, assign all remaining to avoid rounding errors
      let coursePaid;
      if (idx === selectedCourses.length - 1) {
        coursePaid = remainingPaid;
      } else {
        coursePaid = Math.round((paid * parseFloat(course.amount) / totalDue) * 100) / 100;
        remainingPaid -= coursePaid;
      }

      // Calculate remaining due amount for this course
      const courseAmount = parseFloat(course.amount);
      const remainingDue = Math.max(0, courseAmount - coursePaid);

      return {
        course_id: course.course_id,
        amount_due: remainingDue,
        amount_paid: coursePaid,
        payment_type: formData.payment_type,
        receipt_no: formData.receipt_no, // Pass receipt_no
      };
    });

    const registrationData = {
      student: { ...previousFormData },
      courses: selectedCourses.map(course => ({ course_id: course.course_id, class_id: course.class_id })),

      payments,
      password: previousFormData.password || "TempPassword123",
    };

    await axios.post('https://itdlhsms-production.up.railway.app/api/registration/full-register', registrationData);

    alert('Student fully registered!');
    navigate('/admin/dashboard');
  } catch (err) {
    console.error(err);
    setError(err.response?.data?.error || 'Registration failed');
  }
};


  const handleBack = () => {
    // Try using prev function first
    if (typeof prev === 'function') {
      prev();
    } else {
      // Fallback to navigation if prev is not available
      navigate('/admin/register-student', {
        state: {
          step: 2,  // Go back to course selection
          formData: formData
        }
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-md">
        <p>Loading courses...</p>
      </div>
    );
  }

  if (error) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="max-w-4xl w-full bg-white p-8 shadow-lg rounded-lg mx-4">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
        <p className="text-red-700 mb-6">{error}</p>
        <div className="flex justify-start">
          <button
            type="button"
            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={handleBack}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}


  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="max-w-2xl w-full bg-white p-6 shadow-md rounded-md mx-auto relative">
        <button
          type="button"
          className="absolute top-4 right-4 bg-red-400 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => navigate('/admin/dashboard')}
        >
          Cancel
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#b30d0d] text-center">Add Payment</h2>

      {/* Debug section - remove after testing */}
      <div className="mb-4 text-sm text-gray-500">
        <p>Selected Course IDs: {JSON.stringify(previousFormData?.courses)}</p>
      </div>

      {/* Selected Courses Section */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Selected Courses:</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          {selectedCourses.length > 0 ? (
            <>
              {selectedCourses.map(course => (
                <div key={course.course_id} className="flex justify-between py-2 border-b last:border-0">
                  <span>{course.course_name}</span>
                  <span className="font-semibold">Rs.{parseFloat(course.amount).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-4 font-bold">
                <span>Total Amount:</span>
                <span>Rs.{totalAmount.toFixed(2)}</span>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No courses selected</p>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="admission_number"
          value={formData.admission_number}
          onChange={handleChange}
          placeholder="Admission Number"
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <input
          name="receipt_no"
          value={formData.receipt_no}
          onChange={handleChange}
          placeholder="Receipt No"
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <input
          name="amount_due"
          type="number"
          value={formData.amount_due}
          placeholder="Amount Due"
          className="w-full px-4 py-2 border rounded-lg"
          readOnly
          required
        />

        <input
          name="amount_paid"
          type="number"
          value={formData.amount_paid}
          onChange={handleChange}
          placeholder="Amount Paid"
          className="w-full px-4 py-2 border rounded-lg"
          required
        />

        <select
          name="payment_type"
          value={formData.payment_type}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg"
          required
        >
          <option value="full">Full Payment</option>
          <option value="half">Half Payment</option>
        </select>

        <div className="flex justify-between mt-4">
          <button
            type="button"
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={handleBack}
          >
            Back
          </button>
          <button
            type="submit"
            className="bg-firebrick text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Submit Payment
          </button>
        </div>
      </form>
    </div>
    </div>
  );
};

export default AddPaymentForm;


