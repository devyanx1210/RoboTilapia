import React, { useState } from "react";
import { FileDown, KeyRound, User2 } from "lucide-react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [age, setAge] = useState("");

  const handleAgeChange = (e) => {
    const value = e.target.value;

    // Allow empty input for smooth typing
    if (value === "") {
      setAge("");
      return;
    }

    // Convert to number
    const numericValue = Number(value);

    // Restrict negative and >120
    if (numericValue < 0) {
      setAge(0);
    } else if (numericValue > 120) {
      setAge(120);
    } else {
      setAge(numericValue);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white/30 backdrop-blur-3xl overflow-hidden md:overflow-auto">
      {/* Sidebar / Topbar */}
      <aside className="sticky top-0 z-10 w-full md:w-64 bg-white/30 backdrop-blur-md border-b md:border-b-0 md:border-r shadow-sm flex flex-row md:flex-col items-center justify-between md:justify-start p-2 md:p-6 gap-1 md:gap-4 overflow-x-auto">
        <h2 className="hidden md:block text-lg font-semibold text-gray-700 mb-2">
          Settings
        </h2>

        <div className="flex flex-1 justify-evenly md:flex-col md:justify-start gap-1 md:gap-3 ">
          <button
            onClick={() => setActiveSection("profile")}
            className={`flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg text-sm font-medium transition w-full ${
              activeSection === "profile"
                ? "bg-cyan-50/70 text-cyan-700 border border-cyan-300 shadow-sm"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <User2 size={18} />
            <span className="hidden sm:inline">Profile</span>
          </button>

          <button
            onClick={() => setActiveSection("password")}
            className={`flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg text-sm font-medium transition w-full ${
              activeSection === "password"
                ? "bg-cyan-50/70 text-cyan-700 border border-cyan-300 shadow-sm"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <KeyRound size={18} />
            <span className="hidden sm:inline">Password</span>
          </button>

          <button
            onClick={() => setActiveSection("download")}
            className={`flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg text-sm font-medium transition w-full ${
              activeSection === "download"
                ? "bg-cyan-50/70 text-cyan-700 border border-cyan-300 shadow-sm"
                : "text-gray-600 hover:bg-white/50"
            }`}
          >
            <FileDown size={18} />
            <span className="hidden sm:inline">Download</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg max-h-[80vh] bg-white/60 backdrop-blur-xl border mb-30 border-white/50 rounded-2xl shadow-md p-5 sm:p-6 mx-auto transition-all duration-300">
          {activeSection === "profile" && (
            <section>
              <h1 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <User2 className="h-6 w-6 mr-2 text-cyan-700" />
                Update Information
              </h1>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (age < 1 || age > 120) {
                    alert("Please enter a valid age (1–120).");
                    return;
                  }
                  alert("Profile saved successfully!");
                }}
                className="flex flex-col gap-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full p-2 border border-gray-300 rounded-md bg-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    value={age}
                    onChange={handleAgeChange}
                    placeholder="Enter your age"
                    className="w-full p-2 border border-gray-300 rounded-md bg-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    min="0"
                    max="120"
                  />
                  {age > 120 && (
                    <p className="text-xs text-red-500 mt-1">
                      Age cannot exceed 120 years.
                    </p>
                  )}
                  {age < 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Age cannot be negative.
                    </p>
                  )}
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-700 text-white text-sm font-medium rounded-md shadow hover:bg-cyan-800 transition"
                  >
                    Save
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeSection === "password" && (
            <section>
              <h1 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <KeyRound className="h-6 w-6 mr-2 text-cyan-700" />
                Change Password
              </h1>
              <form className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Current Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter current password"
                    className="w-full p-2 border border-gray-300 rounded-md bg-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    className="w-full p-2 border border-gray-300 rounded-md bg-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 bg-cyan-700 text-white text-sm font-medium rounded-md shadow hover:bg-cyan-800 transition"
                  >
                    Update
                  </button>
                </div>
              </form>
            </section>
          )}

          {activeSection === "download" && (
            <section>
              <h1 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <FileDown className="h-6 w-6 mr-2 text-cyan-700" />
                Download PDF
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                Please download the analytics of the water parameters sensor
                reading in PDF.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => alert("Downloading PDF...")}
                  className="px-4 py-2 bg-cyan-700 text-white text-sm font-medium rounded-md shadow hover:bg-cyan-800 transition flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Download
                </button>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
