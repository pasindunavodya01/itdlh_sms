import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const CourseSelectionForm = ({ prev, next, formData }) => {
  const [courses, setCourses] = useState([]);
  const [selectedCourses, setSelectedCourses] = useState(formData?.courses || []);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await axios.get("https://itdlhsms-production.up.railway.app/api/courses");
        setCourses(res.data);
      } catch (err) {
        console.error("Failed to fetch courses:", err);
      }
    };
    fetchCourses();
  }, []);

  const toggleCourse = (course) => {
    setSelectedCourses((prev) =>
      prev.some((c) => c.course_id === course.course_id)
        ? prev.filter((c) => c.course_id !== course.course_id)
        : [...prev, { course_id: course.course_id, class_id: null }]
    );
  };

  const handleClassChange = (course_id, class_id) => {
    setSelectedCourses((prev) =>
      prev.map((c) =>
        c.course_id === course_id ? { ...c, class_id } : c
      )
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const updatedFormData = { ...formData, courses: selectedCourses };
    next(updatedFormData);
  };

  if (courses.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-2xl mx-auto bg-white p-6 shadow-md rounded-md">
          <p className="text-red-500">No courses available to select.</p>
          <button
            type="button"
            className="mt-4 bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
            onClick={prev}
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="max-w-2xl w-full bg-white p-6 shadow-md rounded-md mx-auto relative">
        <button
          type="button"
          className="absolute top-4 right-4 bg-red-400 text-white px-4 py-2 rounded hover:bg-red-700"
          onClick={() => navigate('/admin/dashboard')}
        >
          Cancel
        </button>
        <h2 className="text-2xl font-bold mb-4 text-[#b30d0d] text-center">
          Select Courses
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {courses.map((course) => {
            const selected = selectedCourses.find((c) => c.course_id === course.course_id);
            return (
              <div key={course.course_id} className="flex flex-col gap-2 border p-3 rounded-md">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!selected}
                    onChange={() => toggleCourse(course)}
                  />
                  {course.course_name} - Rs.{course.amount}
                </label>

                {selected && course.classes.length > 0 && (
                  <select
                    value={selected.class_id || ""}
                    onChange={(e) => handleClassChange(course.course_id, e.target.value)}
                    className="border rounded px-2 py-1"
                  >
                    <option value="">Select class</option>
                    {course.classes.map((cls) => (
                      <option key={cls.class_id} value={cls.class_id}>
                        {cls.class_name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}

          <div className="flex justify-between mt-4">
            <button
              type="button"
              className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-700"
              onClick={prev}
            >
              Back
            </button>
            <button
              type="submit"
              className="bg-firebrick text-white px-4 py-2 rounded hover:bg-red-700"
            >
              Next: Payment →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourseSelectionForm;
