import React, { useState } from "react";
import { FileDown, KeyRound, User2 } from "lucide-react";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("profile");

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Sidebar / Topbar */}
      <aside className="w-full md:w-64 bg-white border-b md:border-b-0 md:border-r shadow-md p-4 md:p-6 flex flex-row md:flex-col gap-2 md:gap-4 overflow-x-auto md:overflow-visible">
        <h2 className="hidden md:block text-lg font-semibold text-gray-700 mb-2">
          Settings
        </h2>

        <button
          onClick={() => setActiveSection("profile")}
          className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
            activeSection === "profile"
              ? "bg-cyan-50 text-cyan-700 border border-cyan-300"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <User2 size={18} />
          Profile
        </button>
        <button
          onClick={() => setActiveSection("password")}
          className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
            activeSection === "password"
              ? "bg-cyan-50 text-cyan-700 border border-cyan-300"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <KeyRound size={18} />
          Password
        </button>
        <button
          onClick={() => setActiveSection("download")}
          className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition whitespace-nowrap ${
            activeSection === "download"
              ? "bg-cyan-50 text-cyan-700 border border-cyan-300"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <FileDown size={18} />
          Download
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8">
        {activeSection === "profile" && (
          <section className="w-full max-w-lg bg-white rounded-xl shadow-md p-6">
            <h1 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
              <User2 className="h-6 w-6 mr-2 text-cyan-700" />
              Update Information
            </h1>
            <form className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Enter your full name"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Age
                </label>
                <input
                  type="number"
                  placeholder="Enter your age"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
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
          <section className="w-full max-w-lg bg-white rounded-xl shadow-md p-6">
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
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-400"
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
          <section className="w-full max-w-lg bg-white rounded-xl shadow-md p-6">
            <h1 className="flex items-center text-lg font-semibold text-gray-700 mb-4">
              <FileDown className="h-6 w-6 mr-2 text-cyan-700" />
              Download PDF
            </h1>
            <p className="text-sm text-gray-600 mb-4">
              Please download the analytics of the water parameters sensor reading in PDF.
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
      </main>
    </div>
  );
}
