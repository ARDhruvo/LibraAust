import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useState, useEffect } from "react";
import PasswordField from "../components/PasswordField";
import toast from "react-hot-toast";
import serv from "../services/serv";

const ResetPasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one number")
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character",
    )
    .required("Password is required"),
  password_confirmation: Yup.string()
    .oneOf([Yup.ref("password"), null], "Passwords must match")
    .required("Please confirm your password"),
});

const ResetPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const email = sessionStorage.getItem("reset_email");
  const otpVerified = sessionStorage.getItem("otp_verified");

  useEffect(() => {
    if (!email || !otpVerified) {
      navigate("/forgot-password");
    }
  }, [email, otpVerified, navigate]);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const otp = sessionStorage.getItem("reset_otp"); // Get the stored OTP

      const response = await serv.post("/api/forgot-password/reset", {
        email,
        otp: otp, // Use the actual OTP
        password: values.password,
        password_confirmation: values.password_confirmation,
      });

      toast.success(response.data.message || "Password reset successfully!");

      // Clear session storage
      sessionStorage.removeItem("reset_email");
      sessionStorage.removeItem("otp_verified");
      sessionStorage.removeItem("reset_otp"); // Clear OTP too

      navigate("/signin");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to reset password. Try again.",
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">LibraAust</h1>
          <h2 className="text-2xl font-semibold text-gray-800">
            Reset Password
          </h2>
          <p className="text-gray-600 mt-2">
            Enter your new password for {email}
          </p>
        </div>

        <Formik
          initialValues={{
            password: "",
            password_confirmation: "",
          }}
          validationSchema={ResetPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <PasswordField
                name="password"
                label="New Password"
                placeholder="Enter new password"
              />

              <PasswordField
                name="password_confirmation"
                label="Confirm Password"
                placeholder="Confirm new password"
              />

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default ResetPassword;
