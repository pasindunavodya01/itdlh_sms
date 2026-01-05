import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StudentUpdateRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const res = await axios.get("https://itdlhsms-production.up.railway.app/api/students/requests");
        setRequests(res.data.requests);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching requests:", err);
        setError("Failed to load requests");
        setLoading(false);
      }
    };
    fetchRequests();
  }, []);

  const handleAction = async (id, action) => {
    try {
      const endpoint =
        action === "approved"
          ? `https://itdlhsms-production.up.railway.app/api/students/requests/${id}/approve`
          : `https://itdlhsms-production.up.railway.app/api/students/requests/${id}/reject`;

      await axios.put(endpoint);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, status: action } : r
        )
      );
    } catch (err) {
      console.error(`Failed to ${action} request:`, err);
      alert(`Error: Could not ${action} request`);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-6 shadow-md rounded-md mt-6">
        <p>Loading requests...</p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-10">
      <div className="max-w-4xl w-full bg-white p-6 shadow-md rounded-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#b30d0d]">
            Student Update Requests
          </h2>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="bg-deepRed text-white px-4 py-2 rounded hover:bg-darkRed"
          >
            Back to Dashboard
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {requests.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No requests found.
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((req) => (
              <div key={req.id} className="bg-white p-4 rounded shadow">
                <p>
                  <strong>Student:</strong> {req.name} ({req.admission_number})
                </p>
                <p>
                  <strong>Email:</strong> {req.email}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`ml-2 ${
                      req.status === "pending"
                        ? "text-yellow-500"
                        : req.status === "approved"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {req.status}
                  </span>
                </p>
                <p>
                  <strong>Requested Changes:</strong>
                </p>
                <pre className="bg-gray-100 p-2 rounded text-sm">
                  {JSON.stringify(JSON.parse(req.requested_data), null, 2)}
                </pre>

                {req.status === "pending" && (
                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => handleAction(req.id, "approved")}
                      className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req.id, "rejected")}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
