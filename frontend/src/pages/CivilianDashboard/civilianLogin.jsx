import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

// Google OAuth
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "your-google-client-id";

const CivilianLogin = () => {
  const navigate = useNavigate();

  // States
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

  // ----------------------
  // Validation functions
  // ----------------------
  const validateName = (name) => /^[a-zA-Z\s\.\-]{2,50}$/.test(name);
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
  const validatePassword = (pw) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(pw);
  const validatePhone = (phone) => /^0\d{9}$/.test(phone);
  const validateUsername = (username) => /^[a-zA-Z0-9_\.]{4,20}$/.test(username);

  // ----------------------
  // Input handlers
  // ----------------------
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

  // ----------------------
  // Google OAuth
  // ----------------------
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError("");

    try {
      if (!window.google) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
        await new Promise((resolve) => (script.onload = resolve));
      }

      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });

      window.google.accounts.id.prompt();
    } catch (err) {
      console.error("Google OAuth error:", err);
      setError("Failed to initialize Google authentication");
      setLoading(false);
    }
  };

  const handleGoogleCallback = async (response) => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/civilian-auth/google-login`,
        { credential: response.credential },
        { withCredentials: true }
      );

      if (data.success) {
        setSuccess("Google authentication successful! Redirecting...");
        setTimeout(() => navigate("/civilian-dashboard"), 1000);
      } else {
        setError(data.message || "Google authentication failed");
      }
    } catch (err) {
      console.error("Google callback error:", err);
      setError("Google authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // Form submissions
  // ----------------------
  const handleLogin = async (e) => {
    e.preventDefault();
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
        setTimeout(() => navigate("/civilian-dashboard"), 1000);
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
    setLoading(true);
    setError("");

    // Validation
    if (!validateName(signupData.firstName)) return setError("Invalid first name");
    if (!validateName(signupData.lastName)) return setError("Invalid last name");
    if (!validateEmail(signupData.email)) return setError("Invalid email");
    if (!validateUsername(signupData.username)) return setError("Invalid username");
    if (!validatePassword(signupData.password)) return setError("Invalid password");
    if (signupData.password !== signupData.confirmPassword) return setError("Passwords do not match");
    if (!validatePhone(signupData.phoneNumber)) return setError("Invalid phone number");

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/civilian-auth/register`,
        signupData,
        { withCredentials: true }
      );

      if (data.success) {
        setSuccess("Account created successfully! Please log in.");
        setIsSignup(false);
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

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateEmail(forgotEmail)) {
      setError("Invalid email");
      setLoading(false);
      return;
    }

    try {
      const { data } = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api/v1"}/civilian-auth/forgot-password`,
        { email: forgotEmail }
      );

      if (data.success) {
        setSuccess("Password reset link sent! Check your email.");
        setForgotEmail("");
      } else {
        setError(data.message || "Failed to send reset link");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send reset link");
    } finally {
      setLoading(false);
    }
  };

  // ----------------------
  // Auto redirect if logged in
  // ----------------------
  useEffect(() => {
    if (localStorage.getItem("accessToken")) navigate("/civilian-dashboard");
  }, [navigate]);

  // ----------------------
  // JSX
  // ----------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Civilian Portal</h2>
        </div>

        {/* Error / Success Messages */}
        {error && <div className="mb-4 text-red-700 bg-red-50 px-4 py-2 rounded">{error}</div>}
        {success && <div className="mb-4 text-green-700 bg-green-50 px-4 py-2 rounded">{success}</div>}

        {/* Forms */}
        {isForgotPassword ? (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <input
              type="email"
              placeholder="Enter your email"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-2 rounded-lg">
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
            <div className="text-center">
              <button type="button" onClick={() => setIsForgotPassword(false)} className="text-blue-600 underline">
                ← Back to Sign In
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-4">
            {isSignup && (
              <>
                <input
                  name="firstName"
                  placeholder="First Name"
                  value={signupData.firstName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={loading}
                />
                <input
                  name="lastName"
                  placeholder="Last Name"
                  value={signupData.lastName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={loading}
                />
                <input
                  name="username"
                  placeholder="Username"
                  value={signupData.username}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={loading}
                />
                <input
                  name="phoneNumber"
                  placeholder="Phone Number"
                  value={signupData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={loading}
                />
                <textarea
                  name="address"
                  placeholder="Address"
                  value={signupData.address}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={loading}
                />
                <input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={signupData.password}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={loading}
                />
                <input
                  name="confirmPassword"
                  type="password"
                  placeholder="Confirm Password"
                  value={signupData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg"
                  disabled={loading}
                />
              </>
            )}

            <input
              name="email"
              type="email"
              placeholder="Email"
              value={isSignup ? signupData.email : formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
              disabled={loading}
            />
            {!isSignup && (
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg"
                disabled={loading}
              />
            )}

            {!isSignup && (
              <div className="text-right">
                <button type="button" onClick={() => setIsForgotPassword(true)} className="text-blue-600 underline text-sm">
                  Forgot password?
                </button>
              </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-gray-900 text-white py-2 rounded-lg">
              {loading ? (isSignup ? "Creating..." : "Signing in...") : isSignup ? "Sign Up" : "Login"}
            </button>
          </form>
        )}

        {/* Google Login */}
        {!isForgotPassword && (
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full mt-4 flex justify-center items-center py-2 border rounded-lg bg-white text-gray-700"
          >
            Login with Google
          </button>
        )}

        {/* Switch Login/Signup */}
        <div className="mt-4 text-center">
          {isSignup ? (
            <p>
              Already have an account?{" "}
              <button type="button" onClick={() => setIsSignup(false)} className="text-blue-600 underline">
                Login
              </button>
            </p>
          ) : (
            <p>
              Don't have an account?{" "}
              <button type="button" onClick={() => setIsSignup(true)} className="text-blue-600 underline">
                Sign Up
              </button>
            </p>
          )}
        </div>

        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-500 underline">
            ← Back to Staff Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CivilianLogin;
