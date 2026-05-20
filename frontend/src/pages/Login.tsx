import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Phone, Lock, CheckCircle2, Mail, User, Briefcase, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Login = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"user" | "worker">("user");
  const [form, setForm] = useState({ phone: "", email: "", password: "" });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [rejectionModal, setRejectionModal] = useState<{ show: boolean, reason: string }>({ show: false, reason: "" });

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setError("");
    try {
      if (activeTab === "worker") {
        const res = await API.post("/workers/login", { phone: form.phone, password: form.password });
        localStorage.setItem("workerToken", res.data.token);
        localStorage.setItem("workerId", res.data.worker.id);
        localStorage.removeItem("userToken");
        localStorage.removeItem("userId");
      } else {
        const res = await API.post("/auth/login", { email: form.email, password: form.password });
        localStorage.setItem("userToken", res.data.token);
        localStorage.setItem("userId", res.data.user._id || res.data.user.id);
        localStorage.removeItem("workerToken");
        localStorage.removeItem("workerId");
      }
      setSuccess(true);
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (err: any) {
      const msg = err.response?.data?.message || "Login failed. Please check your credentials.";
      setError(msg);
      
      if (msg.includes("Account Rejected")) {
        setRejectionModal({ show: true, reason: msg.split(": ")[1] || "Please contact admin for more details." });
      }
    }
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
          <h2 className="text-3xl font-bold text-white mb-4">Login Successful!</h2>
          <p className="text-slate-400 mb-8">Redirecting you to dashboard...</p>
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
            <h1 className="text-4xl font-bold text-white mb-4">Welcome Back</h1>
            <p className="text-slate-400">Login to your account to continue</p>
          </div>

          <div className="card-premium">
            <div className="flex bg-secondary/50 p-1 rounded-xl mb-6">
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex items-center justify-center transition-all ${
                  activeTab === "user" ? "bg-accent text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:text-white"
                }`}
                onClick={() => { setActiveTab("user"); setError(""); }}
              >
                <User className="w-4 h-4 mr-2" />
                User Login
              </button>
              <button
                type="button"
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex items-center justify-center transition-all ${
                  activeTab === "worker" ? "bg-accent text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:text-white"
                }`}
                onClick={() => { setActiveTab("worker"); setError(""); }}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Worker Login
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm text-center">
                  {error}
                </div>
              )}
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {activeTab === "worker" ? (
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300 flex items-center">
                        <Phone className="w-4 h-4 mr-2 text-accent" />
                        Phone Number
                      </label>
                      <input 
                        placeholder="10-digit number" 
                        required
                        className="input-modern"
                        value={form.phone}
                        onChange={e => setForm({...form, phone: e.target.value})} 
                      />
                    </div>
                  ) : (
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
                        value={form.email}
                        onChange={e => setForm({...form, email: e.target.value})} 
                      />
                    </div>
                  )}

                    <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center">
                      <Lock className="w-4 h-4 mr-2 text-accent" />
                      Password
                    </label>
                    <input 
                      type="password"
                      placeholder="Enter password" 
                      required
                      className="input-modern"
                      value={form.password}
                      onChange={e => setForm({...form, password: e.target.value})} 
                    />
                    <div className="flex justify-end">
                      <Link to="/forgot-password" title="Forgot Password" className="text-xs text-slate-400 hover:text-accent transition-colors">
                        Forgot Password?
                      </Link>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              <button type="submit" className="btn-primary w-full py-3 text-lg mt-4">
                Login as {activeTab === "user" ? "User" : "Worker"}
              </button>
            </form>

            <div className="text-center mt-6 pt-6 border-t border-slate-800">
              <p className="text-sm text-slate-400">
                Don't have an account?{" "}
                <span 
                  onClick={() => navigate(activeTab === "user" ? "/register" : "/worker-register")} 
                  className="text-accent cursor-pointer hover:underline"
                >
                  Register here
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      <Footer />
      
      {/* Rejection Modal */}
      <AnimatePresence>
        {rejectionModal.show && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-premium max-w-md w-full p-8 border-red-500/30 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500" />
              
              <button 
                onClick={() => setRejectionModal({ ...rejectionModal, show: false })}
                className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="flex flex-col items-center text-center">
                <div className="bg-red-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2">Registration Rejected</h2>
                <p className="text-slate-400 mb-6 italic">" {rejectionModal.reason} "</p>
                
                <div className="bg-secondary/50 p-4 rounded-xl text-sm text-slate-300 mb-8 w-full">
                  <p>Unfortunately, your application was not approved by our verification team. You can contact our support team for more information or clarification.</p>
                </div>
                
                <button 
                  onClick={() => setRejectionModal({ ...rejectionModal, show: false })}
                  className="btn-primary w-full py-3 bg-red-600 hover:bg-red-700 shadow-red-600/20"
                >
                  Understood
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;
