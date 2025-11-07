import React, { useState } from "react";
import { FileDown, KeyRound, User2 } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { currentUser } from "./Dashboard.jsx";
import { auth } from "../firebase.js";
import { updateProfile } from "firebase/auth";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  console.log(auth.currentUser);
  // Profile object state
  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
  });

  // Handle profile input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Validate phone number (PH format)
  const isValidPhone = (number) => /^09\d{9}$/.test(number);

  const handleProfileSubmit = (e) => {
    e.preventDefault();

    if (!profile.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    if (!isValidPhone(profile.phone)) {
      alert(
        "Please enter a valid Philippine phone number (e.g., 09123456789)."
      );
      return;
    }

    alert("Profile updated successfully!");
  };

  const handleSubmitPersonalInfo = async (e) => {
    e.preventDefault();

    if (!profile.fullName && !profile.phone) {
      alert("Please input full name and/or phone number.");
      return;
    }

    try {
      await updateProfile(auth.currentUser, {
        displayName: profile.fullName || auth.currentUser.displayName,
        // ⚠️ Note: Firebase Auth does not directly store phone number here.
        // You can only store it in Firestore or Realtime DB manually.
      });

      alert("Profile updated successfully!");
      console.log("Updated user:", auth.currentUser);
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile.");
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-white/30 backdrop-blur-3xl md:overflow-auto">
      {/* Sidebar */}
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
        <div className="w-full max-w-lg max-h-[80vh] bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-md p-5 sm:p-6 mx-auto transition-all duration-300">
          {activeSection === "profile" && (
            <section>
              <h1 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <User2 className="h-6 w-6 mr-2 text-cyan-700" />
                Personal Information
              </h1>
              <form
                onSubmit={handleSubmitPersonalInfo}
                className="flex flex-col gap-4"
              >
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={profile.fullName}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full p-2 border border-gray-300 rounded-md bg-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Phone Number (PH)
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={profile.phone}
                    onChange={handleChange}
                    placeholder="09123456789"
                    className="w-full p-2 border border-gray-300 rounded-md bg-white/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                    maxLength={11}
                  />
                  {!isValidPhone(profile.phone) && profile.phone.length > 0 && (
                    <p className="text-xs text-red-500 mt-1">
                      Must be a valid PH number (09XXXXXXXXX).
                    </p>
                  )}
                </div>

                {/* Submit */}
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
