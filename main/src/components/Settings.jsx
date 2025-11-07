import React, { useState, useEffect } from "react";
import { User2, LockKeyhole, Bell, Info } from "lucide-react";
import { auth } from "../firebase.js";
import { updateProfile } from "firebase/auth";
import { useUpdateUserInfo, useReadDatabase } from "./utils.jsx";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const { updateUserInfo } = useUpdateUserInfo();

  const userId = auth.currentUser?.uid;
  const { readings, loading } = useReadDatabase(
    userId ? `/users/${userId}` : null
  );

  const [profile, setProfile] = useState({
    fullName: "",
    phone: "",
  });

  const [smsAlert, setSmsAlert] = useState(false);

  // Sync Firebase value for smsAlert
  useEffect(() => {
    if (readings && typeof readings.smsAlert === "boolean") {
      setSmsAlert(readings.smsAlert);
    }
  }, [readings]);

  // Handle toggle of SMS alert
  const handleSmsToggle = async () => {
    const newStatus = !smsAlert;
    setSmsAlert(newStatus);

    if (userId) {
      try {
        await updateUserInfo(userId, {
          smsAlert: newStatus,
          updatedAt: new Date().toISOString(),
        });
        console.log("SMS Alert updated:", newStatus);
      } catch (error) {
        console.error("Error updating SMS alert:", error);
      }
    }
  };

  // Handle input change for profile
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const isValidPhone = (number) => /^09\d{9}$/.test(number);

  // Handle profile save
  const handleSubmitPersonalInfo = async (e) => {
    e.preventDefault();

    if (!profile.fullName && !profile.phone) {
      alert("Please input full name and/or phone number.");
      return;
    }

    try {
      await updateProfile(auth.currentUser, {
        displayName: profile.fullName || auth.currentUser.displayName,
      });

      await updateUserInfo(auth.currentUser.uid, {
        displayName: profile.fullName,
        phone: profile.phone,
        updatedAt: new Date().toISOString(),
      });

      alert("Profile updated successfully!");

      // Reset fields after saving
      setProfile({ fullName: "", phone: "" });
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

        <div className="flex flex-1 justify-evenly md:flex-col md:justify-start gap-1 md:gap-3">
          {[
            { key: "profile", label: "Profile", icon: User2 },
            { key: "security", label: "Account Security", icon: LockKeyhole },
            { key: "notifications", label: "Notifications", icon: Bell },
            { key: "about", label: "About", icon: Info },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveSection(tab.key)}
              className={`flex items-center justify-center md:justify-start gap-2 px-3 py-2 rounded-lg text-sm font-medium transition w-full ${
                activeSection === tab.key
                  ? "bg-cyan-50/70 text-cyan-700 border border-cyan-300 shadow-sm"
                  : "text-gray-600 hover:bg-white/50"
              }`}
            >
              <tab.icon size={18} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-lg max-h-[80vh] bg-white/60 backdrop-blur-xl border border-white/50 rounded-2xl shadow-md p-5 sm:p-6 mx-auto transition-all duration-300">
          {/* PROFILE */}
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

          {/* SECURITY */}
          {activeSection === "security" && (
            <section>
              <h1 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <LockKeyhole className="h-6 w-6 mr-2 text-cyan-700" />
                Change Password
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                Secure your account by updating your password regularly.
              </p>
              <button
                onClick={() => alert("Password change modal coming soon.")}
                className="px-4 py-2 bg-cyan-700 text-white text-sm font-medium rounded-md shadow hover:bg-cyan-800 transition"
              >
                Open Change Password
              </button>
            </section>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <section>
              <h1 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <Bell className="h-6 w-6 mr-2 text-cyan-700" />
                Notifications
              </h1>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-gray-700">SMS Alerts</span>
                  <label className="inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={smsAlert}
                      onChange={handleSmsToggle}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-400 rounded-full peer peer-checked:bg-cyan-600 relative transition">
                      <span
                        className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                          smsAlert ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </section>
          )}

          {/* ABOUT */}
          {activeSection === "about" && (
            <section>
              <h1 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
                <Info className="h-6 w-6 mr-2 text-cyan-700" />
                About
              </h1>

              <p className="text-sm text-gray-700 mb-2">
                RoboTilapia: An intelligent web-based system designed to manage
                feeding, aeration, and water parameter monitoring in tilapia
                fishponds.
              </p>

              <p className="text-sm text-gray-500 mb-4">
                Version 1.0.0 — Developed by Noel Christian L. Soberano, Sweert
                Kylah M. Soberano, and Yrral-Ben M. Rosales
              </p>

              <p className="text-sm text-gray-600">
                This application serves as part of the thesis project titled{" "}
                <span className="italic">
                  "Autonomous Robot for Targeted Aeration and Feeding in Tilapia
                  Fishponds to Mitigate Ammonia Build-Up"
                </span>
                . It integrates Image Processing for detecting surface
                respiration behavior in tilapia and IoT-based data analytics to
                optimize pond conditions, reduce ammonia accumulation, and
                promote sustainable fish farming practices.
              </p>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
