import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import { FaUserAlt, FaLock, FaEnvelope, FaPhoneAlt, FaUser } from "react-icons/fa";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id";

const CivilianLogin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    address: "",
    username: "",
    newsletterSubscription: false,
  });
  const [isSignup, setIsSignup] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [googleDebug, setGoogleDebug] = useState(null);

  // ---------------------- Validation functions ----------------------
  const validateName = (name) => /^[a-zA-Z\s\.\-]{2,50}$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const validatePassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pw);
  const validatePhone = (phone) => /^0\d{9}$/.test(phone);
  const validateUsername = (username) => /^[a-zA-Z0-9_\.]{4,20}$/.test(username);

  const isLoginFormValid = () => formData.email && formData.password && validateEmail(formData.email);
  const isSignupFormValid = () =>
    signupData.firstName &&
    signupData.lastName &&
    signupData.username &&
    signupData.phoneNumber &&
    signupData.address &&
    signupData.email &&
    signupData.password &&
    signupData.confirmPassword &&
    signupData.password === signupData.confirmPassword &&
    validateEmail(signupData.email) &&
    validatePhone(signupData.phoneNumber) &&
    validatePassword(signupData.password);

  // ---------------------- Input handlers ----------------------
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (isSignup) {
      setSignupData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setError("");
    setSuccess("");
  };

  // ---------------------- Form submissions ----------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!isLoginFormValid()) return;
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/civilian-auth/login`,
        formData,
        { withCredentials: true }
      );

      if (data.success) {
        setSuccess("Login successful! Redirecting...");
        // store token if provided
        if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
        // set a simple logged-in flag so client routes can detect login even when auth uses cookies
        localStorage.setItem("civilianLoggedIn", "true");
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        // short delay to show message, then navigate; fallback to window.location if navigate fails
        setTimeout(() => {
          try {
            navigate("/civilian-dashboard", { replace: true });
          } catch (err) {
            // fallback
            window.location.href = "/civilian-dashboard";
          }
        }, 800);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      setError("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!isSignupFormValid()) {
      setError("Please fill all fields correctly");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/civilian-auth/register`,
        signupData,
        { withCredentials: true }
      );

      if (data.success) {
        // Show success and auto-redirect to the login page
        setSuccess("Account created successfully! Redirecting to login...");
        // clear form
        setSignupData({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          phoneNumber: "",
          address: "",
          username: "",
          newsletterSubscription: false,
        });
        // briefly show message then redirect to login route
        setTimeout(() => {
          setIsSignup(false);
          navigate("/civilian-login");
        }, 1200);
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      setError("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------- Google Login ----------------------
  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google login failed. No credential returned.");
      return;
    }
    setLoading(true);
    setError("");
    // quick debug info for developer
    setGoogleDebug({ credentialPreview: credentialResponse.credential?.slice(0, 40) });
    console.debug("Google credential (preview):", credentialResponse.credential?.slice(0, 80));

    try {
      const payload = { credential: credentialResponse.credential, id_token: credentialResponse.credential };
      console.debug("Sending Google login payload:", payload);
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/civilian-auth/google-login`,
        // send both common keys some backends expect
        payload,
        { withCredentials: true }
      );

      if (data.success) {
        setSuccess("Login successful! Redirecting...");
        if (data.accessToken) localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("civilianLoggedIn", "true");
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
        setTimeout(() => {
          try {
            navigate("/civilian-dashboard", { replace: true });
          } catch (err) {
            window.location.href = "/civilian-dashboard";
          }
        }, 800);
      } else {
        setError(data.message || "Google login failed");
        setGoogleDebug((prev) => ({ ...prev, server: data }));
      }
    } catch (err) {
      console.error(err);
      // Axios error handling: prefer server message if available
      const status = err?.response?.status;
      const serverMsg = err?.response?.data?.message || err?.response?.data || err?.message;
      if (status === 400) {
        setError(
          `Google login failed (400): ${serverMsg}. This often means the request is malformed or your Google OAuth client is misconfigured. Check VITE_GOOGLE_CLIENT_ID, and ensure your OAuth origin (e.g. http://localhost:5173) is added in Google Cloud Console.`
        );
        setGoogleDebug((prev) => ({ ...prev, status, server: serverMsg }));
      } else {
        setError(serverMsg || "Google login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto redirect if logged in
  useEffect(() => {
    if (localStorage.getItem("accessToken") || localStorage.getItem("civilianLoggedIn")) navigate("/civilian-dashboard");
  }, [navigate]);

  // ---------------------- JSX ----------------------
  return (
    <div className="min-h-screen bg-[#1E2A38] flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-4xl font-bold text-[#C62828] mb-2 text-center">
          Civilian Portal
        </h2>
        <p className="text-center text-gray-500 mb-6">
          {isSignup ? "Create your account" : "Enter your credentials to login"}
        </p>

        {error && <div className="mb-4 text-red-700 bg-red-50 px-4 py-2 rounded">{error}</div>}
        {success && <div className="mb-4 text-green-700 bg-green-50 px-4 py-2 rounded">{success}</div>}

        <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
          {isSignup && (
            <>
              <div className="relative">
                <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="firstName"
                  placeholder="First Name"
                  value={signupData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.firstName && !validateName(signupData.firstName)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition`}
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <FaUserAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="lastName"
                  placeholder="Last Name"
                  value={signupData.lastName}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.lastName && !validateName(signupData.lastName)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition`}
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={signupData.username}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.username && !validateUsername(signupData.username)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition`}
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <FaPhoneAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={signupData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.phoneNumber && !validatePhone(signupData.phoneNumber)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition`}
                  disabled={loading}
                />
              </div>
              <textarea
                name="address"
                placeholder="Address"
                value={signupData.address}
                onChange={handleChange}
                className="w-full p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition"
                disabled={loading}
              />
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.password && !validatePassword(signupData.password)
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition`}
                  disabled={loading}
                />
              </div>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 p-3 rounded-xl border ${
                    signupData.confirmPassword &&
                    signupData.confirmPassword !== signupData.password
                      ? "border-red-500"
                      : "border-gray-300"
                  } focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition`}
                  disabled={loading}
                />
              </div>
            </>
          )}

          {/* Email & Password for Login */}
          <div className="relative">
            <FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={isSignup ? signupData.email : formData.email}
              onChange={handleChange}
              className={`w-full pl-10 p-3 rounded-xl border ${
                (isSignup ? signupData.email : formData.email) &&
                !validateEmail(isSignup ? signupData.email : formData.email)
                  ? "border-red-500"
                  : "border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition`}
              disabled={loading}
            />
          </div>

          {!isSignup && (
            <div className="relative">
              <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 p-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#FF9800] transition"
                disabled={loading}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (isSignup ? !isSignupFormValid() : !isLoginFormValid())}
            className={`w-full p-3 font-semibold rounded-xl shadow-lg transition ${
              isSignup
                ? isSignupFormValid()
                  ? "bg-[#FF9800] text-white hover:shadow-xl"
                  : "bg-gray-400 text-gray-200 cursor-not-allowed"
                : isLoginFormValid()
                ? "bg-[#FF9800] text-white hover:shadow-xl"
                : "bg-gray-400 text-gray-200 cursor-not-allowed"
            }`}
          >
            {loading ? (isSignup ? "Creating..." : "Logging in...") : isSignup ? "Sign Up" : "Login"}
          </button>
        </form>

        {/* Google Login Button (only show on login view) */}
        {!isSignup && (
          <div className="mt-4 flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleLogin}
              onError={() => setError("Google login failed. Please try again.")}
            />
          </div>
        )}

        <div className="mt-4 text-center">
          {isSignup ? (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setIsSignup(false)} className="text-[#C62828] underline">
                Login
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button type="button" onClick={() => setIsSignup(true)} className="text-[#C62828] underline">
                Sign Up
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-gray-500 underline text-sm">
            ← Back to Staff Login
                    {/* Debug panel for Google OAuth issues */}
                    {googleDebug && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-sm text-yellow-800 rounded">
                        <div><strong>Google Debug:</strong></div>
                        <div>Client ID: {import.meta.env.VITE_GOOGLE_CLIENT_ID || "(not set)"}</div>
                        <div>Origin: {window.location.origin}</div>
                        {googleDebug.credentialPreview && (
                          <div>Credential (preview): {googleDebug.credentialPreview}...</div>
                        )}
                        {googleDebug.status && <div>Server status: {googleDebug.status}</div>}
                        {googleDebug.server && (
                          <div className="mt-2 whitespace-pre-wrap">Server response: {JSON.stringify(googleDebug.server)}</div>
                        )}
                      </div>
                    )}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CivilianLogin;
