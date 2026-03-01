import { Formik, Form } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from "yup";
import { useState } from "react";
import TextField from "../components/TextField";
import toast from "react-hot-toast";
import serv from "../services/serv";

const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email("Invalid email")
    .matches(/@aust\.edu$/i, "Must be an AUST email address (@aust.edu)")
    .required("Email is required"),
});

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    try {
      const response = await serv.post("/api/forgot-password/send-otp", values);
      toast.success(response.data.message || "OTP sent to your email!");

      // Store email in session storage for the next step
      sessionStorage.setItem("reset_email", values.email);

      // Navigate to OTP verification page
      navigate("/verify-otp");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to send OTP. Try again.",
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
            Forgot Password
          </h2>
          <p className="text-gray-600 mt-2">
            Enter your email to receive a verification code
          </p>
        </div>

        <Formik
          initialValues={{ email: "" }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <TextField
                name="email"
                label="Email"
                type="email"
                placeholder="Enter your AUST email"
              />

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send Code"}
              </button>
            </Form>
          )}
        </Formik>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/signin")}
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            Back to Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
