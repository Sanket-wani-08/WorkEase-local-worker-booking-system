import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { authService } from "../services/auth.service";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { User, Mail, Phone, Lock, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const Register = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      securityQuestion: "What is your pet's name?",
      securityAnswer: ""
    }
  });

  const registerMutation = useMutation({
    mutationFn: authService.registerUser,
    onSuccess: () => {
      setSuccess(true);
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    },
    onError: (err: any) => {
      console.error(err);
      setError(err.response?.data?.message || "Registration failed. Please check all fields.");
    }
  });

  const onSubmit = (data: any) => {
    setError("");

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    registerMutation.mutate(data);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-primary flex flex-col items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="card-premium max-w-md w-full text-center py-12"
        >
          <div className="bg-green-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Registration Successful!</h2>
          <p className="text-slate-400 mb-8">Welcome to WorkEase. Redirecting to login...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      
      <div className="pt-32 pb-20 flex justify-center px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Create an Account</h1>
            <p className="text-slate-400">Join WorkEase to book local services easily</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="card-premium space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <User className="w-4 h-4 mr-2 text-accent" />
                Full Name
              </label>
              <input 
                placeholder="e.g. John Doe" 
                required
                className="input-modern"
                {...register("name", { required: "Name is required" })}
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Mail className="w-4 h-4 mr-2 text-accent" />
                Email Address
              </label>
              <input 
                type="email"
                placeholder="john@example.com" 
                required
                className="input-modern"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address"
                  }
                })}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Phone className="w-4 h-4 mr-2 text-accent" />
                Phone Number
              </label>
              <input 
                placeholder="10-digit number" 
                required
                className="input-modern"
                {...register("phone", {
                  required: "Phone number is required",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "Please enter a valid 10-digit phone number"
                  }
                })}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-accent" />
                Password
              </label>
              <input 
                type="password"
                placeholder="Min 6 characters" 
                required
                minLength={6}
                className="input-modern"
                {...register("password", {
                  required: "Password is required",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters"
                  }
                })}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-accent" />
                Confirm Password
              </label>
              <input 
                type="password"
                placeholder="Re-enter password" 
                required
                minLength={6}
                className="input-modern"
                {...register("confirmPassword", {
                  required: "Confirm password is required",
                  validate: (val) => {
                    if (watch('password') !== val) {
                      return "Your passwords do not match";
                    }
                  }
                })}
              />
              {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-accent" />
                Security Question (For Password Reset)
              </label>
              <select 
                className="input-modern"
                required
                {...register("securityQuestion", { required: "Security question is required" })}
              >
                <option>What is your pet's name?</option>
                <option>What is your mother's maiden name?</option>
                <option>What was the name of your first school?</option>
                <option>What city were you born in?</option>
              </select>
              {errors.securityQuestion && <p className="text-xs text-red-500">{errors.securityQuestion.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center">
                <Lock className="w-4 h-4 mr-2 text-accent" />
                Your Secret Answer
              </label>
              <input 
                placeholder="e.g. Fluffy" 
                required
                className="input-modern"
                {...register("securityAnswer", { required: "Security answer is required" })}
              />
              {errors.securityAnswer && <p className="text-xs text-red-500">{errors.securityAnswer.message}</p>}
            </div>

            <button type="submit" className="btn-primary w-full py-3 text-lg mt-4">
              Register
            </button>
            
            <div className="text-center mt-4">
              <p className="text-sm text-slate-400">
                Already have an account? <span onClick={() => navigate("/login")} className="text-accent cursor-pointer hover:underline">Login here</span>
              </p>
            </div>
          </form>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Register;
