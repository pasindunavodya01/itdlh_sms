import React from "react";

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-firebrick to-darkRed text-white py-8 px-6 rounded-lg shadow-lg flex flex-col md:flex-row items-center justify-between mb-8">
      {/* Left: Logo + Heading */}
      <div className="flex items-center space-x-4 max-w-3xl">
        <img
  src="/images/icons/LOGO.svg"
  alt="LMS Logo"
  className="w-32 h-32 rounded-lg bg-white border-2 border-gold shadow"
/>

        <h1 className="text-2xl md:text-3xl font-bold leading-tight">
          Welcome to the{" "}
          <span className="text-gold">
            Information Technology & Distance Learning Hub 
          </span>
         {" "} - Negombo
        </h1>
      </div>

      {/* Right: Tagline */}
      <div className="mt-4 md:mt-0">
        <span className="bg-gold text-firebrick px-4 py-2 rounded-full font-semibold shadow">
          Students Management System
        </span>
      </div>
    </div>
  );
}
