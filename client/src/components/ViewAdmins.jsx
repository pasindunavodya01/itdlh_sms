import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ViewAdmins = () => {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/admins");
        setAdmins(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to load admins");
        setLoading(false);
      }
    };
    fetchAdmins();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-md mt-6">
        <p>Loading admins...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-gray-50">
      <div className="max-w-4xl w-full bg-white p-6 shadow-md rounded-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#b30d0d]">All Admins</h2>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/register-admin")}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              + Add Admin
            </button>
            <button
              onClick={() => navigate("/admin/dashboard")}
              className="bg-deepRed text-white px-4 py-2 rounded hover:bg-darkRed"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin ID
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 border-b text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {admins.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            No admins found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewAdmins;
