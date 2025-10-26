import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import googleLogo from "../assets/google_logo.png";
import facebookLogo from "../assets/facebook_logo.png";
import closeBtn from "../assets/close-btn-light.png";
import { X } from "lucide-react";

export default function LoginPage() {
  const {
    showModal,
    setShowModal,
    login,
    setLogin,
    handleLogin,
    handleGoogleRegister,
    handleFacebookRegister,
    forgotPasswordModal,
    setForgotPasswordModal,
    handleForgotPassword,
    resetEmail,
    setResetEmail,
    error,
    setError,
  } = useOutletContext();

  useEffect(() => {
    setLogin({ email: "", password: "" });
  }, [showModal]);

  return (
    <>
      {/* Forgot Password Modal */}
      {forgotPasswordModal && (
        <div
          className="relative inset-0 z-[999] h-screen flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
          onClick={() => setForgotPasswordModal(false)}
        >
          <form
            onSubmit={handleForgotPassword}
            onClick={(e) => e.stopPropagation()}
            className="relative flex flex-col w-[90%] max-w-[380px] p-6 rounded-2xl bg-white/10 backdrop-blur-lg shadow-xl"
          >
            {/* Close (top-right) */}
            <X
              onClick={() => setForgotPasswordModal(false)}
              className="cursor-pointer absolute top-2 right-2 rounded-md p-1 text-white hover:text-cyan-300 focus:outline-none focus:ring-2 focus:ring-cyan-300 h-7 w-7"
            />

            <h2 id="forgot-title" className="text-2xl font-semibold text-white">
              Reset Password
            </h2>
            <p className="mt-2 text-sm text-white/70">
              Enter your email and we’ll send you a reset link.
            </p>

            {/* Input */}
            <div className="mt-6">
              <input
                id="reset-email"
                type="email"
                placeholder="Enter your email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                required
                autoFocus
                className="w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/50 outline-none transition focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,200,0.5)]"
              />
            </div>

            {/* Button */}
            <input
              type="submit"
              value="Send to Email"
              className="cursor-pointer mt-4 rounded-xl bg-gradient-to-r from-cyan-400 to-teal-300 px-6 py-3 font-semibold text-slate-900 shadow-lg hover:translate-y-[-2px] hover:shadow-xl transition-all"
            />
          </form>
        </div>
      )}

      {/* Main Login Form */}
      <form
        onSubmit={handleLogin}
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
         sm:w-[370px] min-w-[310px]  min-h-[500px] p-8 flex flex-col items-center gap-4 
        bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg z-20
        ${showModal.signup ? "hidden" : "flex"}`}
      >
        {/* Close button */}
        <Link to="/">
          <button className="cursor-pointer absolute top-2 right-2">
            <img className="h-7 w-7" src={closeBtn} alt="Close" />
          </button>
        </Link>

        <h1 className="text-white text-3xl font-bold">
          Log <span className="text-cyan-300">in</span>
        </h1>

        {/* Email Input */}
        <input
          type="text"
          placeholder="Email"
          value={login.email || ""}
          onChange={(e) =>
            setLogin((recent) => ({ ...recent, email: e.target.value }))
          }
          className="w-full text-[clamp(15px,1vw,20px)] px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,200,0.5)] transition"
          required
        />

        {/* Password Input */}
        <div className="w-full relative flex flex-col items-center mb-2">
          <input
            type="password"
            placeholder="Password"
            value={login.password || ""}
            onChange={(e) =>
              setLogin((recent) => ({ ...recent, password: e.target.value }))
            }
            className="w-full text-[clamp(15px,1vw,20px)] mb-1 px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,200,0.5)] transition"
            required
          />
          <p
            onClick={() => setForgotPasswordModal(true)}
            className="absolute bottom-[-1.5rem] right-1 text-white/70 text-sm cursor-pointer hover:text-cyan-400"
          >
            Forgot Password?
          </p>
        </div>

        {/* Error message */}
        {error && (
          <p className="text-red-500 text-sm mb-2 text-center">{error}</p>
        )}

        {/* Login Button */}
        <input
          type="submit"
          value="Log In"
          className="w-full px-6 py-3 mt-2 text-[clamp(16px,3.5vw,18px)]  rounded-xl font-bold bg-gradient-to-r from-cyan-400 to-teal-300 text-slate-900 shadow-lg hover:opacity-95 hover:translate-y-[-2px] transition-all"
        />
        {/* Signup Link */}
        <Link
          to="/signup"
          className="mt-6 text-white/80 hover:text-cyan-400 text-sm"
        >
          Don't have an account yet? <a className="text-cyan-400">Sign up</a>
        </Link>

        {/* Divider with text */}
        <div className="flex items-center gap-4 my-4 w-full">
          <hr className="flex-grow border-t border-white/30" />
          <span className="text-white/70 text-sm whitespace-nowrap">
            or log in with
          </span>
          <hr className="flex-grow border-t border-white/30" />
        </div>

        {/* Social Logins */}
        <div className="flex gap-6 mt-2">
          <img
            onClick={handleGoogleRegister}
            className="h-8 w-8 cursor-pointer"
            src={googleLogo}
            alt="Google Login"
          />
          <img
            onClick={handleFacebookRegister}
            className="h-8 w-8 cursor-pointer"
            src={facebookLogo}
            alt="Facebook Login"
          />
        </div>
      </form>
    </>
  );
}
