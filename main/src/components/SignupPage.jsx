import React, { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import googleLogo from "../assets/google_logo.png";
import facebookLogo from "../assets/facebook_logo.png";
import closeBtn from "../assets/close-btn-light.png";

export default function SignupPage() {
  const {
    showModal,
    setShowModal,
    handleSignup,
    user,
    setUser,
    error,
    setError,
    handleGoogleRegister,
    handleFacebookRegister,
  } = useOutletContext();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setUser({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
  }, [showModal]);

  // ✅ Input base style
  const inputStyle =
    "w-full text-[clamp(15px,1vw,20px)] px-4 py-3 rounded-xl border border-white/20 bg-white/10 text-white placeholder-white/50 outline-none focus:border-cyan-400 focus:shadow-[0_0_10px_rgba(0,255,200,0.5)] transition";

  return (
    <>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
        flex flex-col items-center justify-center gap-4
        min-w-[300px] max-w-[500px] min-h-[600px] p-5
        rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.3)]
        bg-white/10 backdrop-blur-lg z-50 animate-fade-in"
      >
        {/* Close Button */}
        <Link to="/" className="absolute top-2 right-2">
          <button className="bg-transparent border-0 cursor-pointer">
            <img src={closeBtn} alt="Close" className="w-8 h-8" />
          </button>
        </Link>

        {/* Title */}
        <h1 className="text-white text-3xl font-bold">
          Sign <span className="text-cyan-300">up</span>
        </h1>

        {/* Signup Form */}
        <form
          onSubmit={handleSignup}
          className={`flex flex-col gap-3 w-[min(350px,80vw)] ${
            showModal.signup ? "flex" : "hidden"
          }`}
        >
          <input
            type="text"
            placeholder="First Name"
            value={user.firstName || ""}
            onChange={(e) =>
              setUser((recent) => ({ ...recent, firstName: e.target.value }))
            }
            required
            className={inputStyle}
          />
          <input
            type="text"
            placeholder="Last Name"
            value={user.lastName || ""}
            onChange={(e) =>
              setUser((recent) => ({ ...recent, lastName: e.target.value }))
            }
            className={inputStyle}
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={user.email || ""}
            onChange={(e) =>
              setUser((recent) => ({ ...recent, email: e.target.value }))
            }
            className={inputStyle}
          />

          {/* Password */}
          <div className="relative w-full">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={user.password || ""}
              onChange={(e) =>
                setUser((recent) => ({ ...recent, password: e.target.value }))
              }
              required
              className={`${inputStyle} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative w-full">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={user.confirmPassword || ""}
              onChange={(e) =>
                setUser((recent) => ({
                  ...recent,
                  confirmPassword: e.target.value,
                }))
              }
              required
              className={`${inputStyle} pr-10`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm text-center mb-2">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 rounded-xl font-bold text-base bg-gradient-to-tr from-sky-400 to-teal-300 text-[#0b2132] shadow-lg shadow-teal-400/30 hover:translate-y-[-2px] hover:shadow-xl transition-all"
          >
            Sign Up
          </button>

          {/* Login Link */}
          <Link to="/login">
            <p className="text-white text-sm mt-2 hover:text-cyan-300 transition">
              Already have an account?{" "}
              <a className="text-cyan-400">Login here</a>
            </p>
          </Link>

          {/* Divider with text */}
          <div className="flex items-center gap-4 my-2">
            <hr className="flex-grow border-t border-white/30" />
            <span className="text-white/70 text-sm">or log in with</span>
            <hr className="flex-grow border-t border-white/30" />
          </div>

          {/* Social Register */}
          <div className="flex flex-row justify-center items-center gap-4 mt-2">
            <img
              src={googleLogo}
              onClick={handleGoogleRegister}
              className="w-8 h-8 cursor-pointer"
              alt="Google"
            />
            <img
              src={facebookLogo}
              onClick={handleFacebookRegister}
              className="w-8 h-8 cursor-pointer"
              alt="Facebook"
            />
          </div>
        </form>
      </div>
    </>
  );
}
