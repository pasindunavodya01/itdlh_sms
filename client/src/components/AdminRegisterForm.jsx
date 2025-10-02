import { useState } from "react";
import axios from "axios";

export default function AdminRegisterForm() {
  const [form, setForm] = useState({
    name: "",
    admission_number: "",
    batch: "",
    residential_tel: "",
    whatsapp_number: "",
    gender: "",
    nic_number: "",
    email: "",
    address: "",
    school: "",
    password: "", // temporary password for Firebase
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://localhost:5000/api/users/register", form);
      alert("User registered successfully!");
      setForm({ ...form, password: "" });
    } catch (error) {
      console.error(error);
      alert("Registration failed.");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto mt-8">
      <h2 className="text-xl font-bold">Register New Student</h2>
      {Object.entries(form).map(([key, value]) => (
        key !== "password" ? (
          <input
            key={key}
            name={key}
            value={value}
            onChange={handleChange}
            placeholder={key.replaceAll("_", " ")}
            required
            className="w-full p-2 border rounded"
          />
        ) : null
      ))}
      <input
        type="password"
        name="password"
        value={form.password}
        onChange={handleChange}
        placeholder="Temporary Password"
        required
        className="w-full p-2 border rounded"
      />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
        Register
      </button>
    </form>
  );
}
