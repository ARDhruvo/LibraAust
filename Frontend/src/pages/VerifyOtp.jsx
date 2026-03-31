import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import serv from "../services/serv";

const VerifyOtp = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(90); // 1:30 in seconds
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const email = sessionStorage.getItem("reset_email");

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  // Timer logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [timer]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }

    // If all fields are filled, auto-submit
    if (newOtp.every((digit) => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      // Move to previous input on backspace
      inputRefs.current[index - 1].focus();
    }
  };

  const handleVerify = async (otpCode) => {
    setLoading(true);
    try {
      const response = await serv.post("/api/forgot-password/verify-otp", {
        email,
        otp: otpCode,
      });

      toast.success("OTP verified successfully!");

      // Store both verified status AND the OTP
      sessionStorage.setItem("otp_verified", "true");
      sessionStorage.setItem("reset_otp", otpCode); // Add this line

      navigate("/reset-password");
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP. Try again.");
      // Clear OTP fields
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setTimer(90);

    try {
      await serv.post("/api/forgot-password/send-otp", { email });
      toast.success("New OTP sent to your email!");

      // Clear OTP fields
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0].focus();
    } catch (error) {
      toast.error("Failed to resend OTP. Try again.");
      setCanResend(true);
      setTimer(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LibraAust</h1>
          <h2 className="text-2xl font-semibold text-gray-800">Verify OTP</h2>
          <p className="text-gray-600 mt-2">
            Enter the 6-digit code sent to {email}
          </p>
        </div>

        <div className="space-y-6">
          {/* OTP Input Fields */}
          <div className="flex justify-center gap-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-12 h-12 text-center text-2xl font-semibold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition"
                disabled={loading}
              />
            ))}
          </div>

          {/* Timer and Resend */}
          <div className="text-center">
            {timer > 0 ? (
              <p className="text-gray-600">
                Code expires in{" "}
                <span className="font-semibold text-blue-600">
                  {formatTime(timer)}
                </span>
              </p>
            ) : (
              <button
                onClick={handleResend}
                disabled={!canResend || loading}
                className="text-blue-600 hover:text-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Resend Code
              </button>
            )}
          </div>

          <button
            onClick={() => handleVerify(otp.join(""))}
            disabled={otp.some((digit) => digit === "") || loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
