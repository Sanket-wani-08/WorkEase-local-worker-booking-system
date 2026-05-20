import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Mail, Phone, ArrowLeft, CheckCircle2, AlertCircle, Lock, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";

const ForgotPassword = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<"user" | "worker">("user");
    const [step, setStep] = useState(1); // 1: identify, 2: answer & reset
    
    // step 1 fields
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    
    // step 2 fields
    const [question, setQuestion] = useState("");
    const [answer, setAnswer] = useState("");
    const [newPassword, setNewPassword] = useState("");
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    // fetch security question
    const handleIdentify = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const endpoint = activeTab === "user" ? "/auth/forgot-password" : "/workers/forgot-password";
            const payload = activeTab === "user" ? { email } : { phone };
            
            const res = await API.post(endpoint, payload);
            setQuestion(res.data.question);
            setStep(2);
        } catch (err: any) {
            setError(err.response?.data?.message || "Account not found.");
        } finally {
            setLoading(false);
        }
    };

    // verify answer and reset password
    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const endpoint = activeTab === "user" ? "/auth/reset-password-answer" : "/workers/reset-password-answer";
            const payload = activeTab === "user" 
                ? { email, answer, newPassword } 
                : { phone, answer, newPassword };
            
            await API.post(endpoint, payload);
            setSuccess(true);
            toast.success("Password reset successful!");
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Incorrect answer or reset failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-primary">
            <Toaster position="top-center" />
            <Navbar />
            
            <div className="pt-32 pb-20 flex justify-center px-4 sm:px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md"
                >
                    <Link to="/login" className="inline-flex items-center text-slate-400 hover:text-white mb-8 transition-colors group">
                        <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
                        Back to Login
                    </Link>

                    <div className="text-center mb-8">
                        <h1 className="text-4xl font-bold text-white mb-4">Reset Password</h1>
                        <p className="text-slate-400">
                            {step === 1 ? "Identify your account" : "Answer your security question"}
                        </p>
                    </div>

                    <div className="card-premium">
                        {step === 1 && (
                            <div className="flex bg-secondary/50 p-1 rounded-xl mb-6">
                                <button
                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex items-center justify-center transition-all ${
                                        activeTab === "user" ? "bg-accent text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:text-white"
                                    }`}
                                    onClick={() => { setActiveTab("user"); setError(""); }}
                                >
                                    User
                                </button>
                                <button
                                    className={`flex-1 py-2.5 text-sm font-medium rounded-lg flex items-center justify-center transition-all ${
                                        activeTab === "worker" ? "bg-accent text-white shadow-lg shadow-orange-500/20" : "text-slate-400 hover:text-white"
                                    }`}
                                    onClick={() => { setActiveTab("worker"); setError(""); }}
                                >
                                    Worker
                                </button>
                            </div>
                        )}

                        {success ? (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="text-center py-6"
                            >
                                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Success!</h3>
                                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                                    Your password has been reset. Redirecting to login...
                                </p>
                            </motion.div>
                        ) : (
                            <div className="space-y-6">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                {step === 1 ? (
                                    <form onSubmit={handleIdentify} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center">
                                                {activeTab === "user" ? (
                                                    <><Mail className="w-4 h-4 mr-2 text-accent" /> Email Address</>
                                                ) : (
                                                    <><Phone className="w-4 h-4 mr-2 text-accent" /> Phone Number</>
                                                )}
                                            </label>
                                            <input 
                                                type={activeTab === "user" ? "email" : "text"}
                                                placeholder={activeTab === "user" ? "john@example.com" : "10-digit phone number"}
                                                required
                                                className="input-modern"
                                                value={activeTab === "user" ? email : phone}
                                                onChange={e => activeTab === "user" ? setEmail(e.target.value) : setPhone(e.target.value)} 
                                            />
                                        </div>

                                        <button 
                                            type="submit" 
                                            disabled={loading}
                                            className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                                        >
                                            {loading ? "Searching..." : "Find Account"}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleReset} className="space-y-6">
                                        <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl">
                                            <label className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">
                                                Security Question
                                            </label>
                                            <p className="text-white font-medium flex items-start gap-2">
                                                <HelpCircle className="w-5 h-5 shrink-0 text-accent" />
                                                {question}
                                            </p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center">
                                                <Lock className="w-4 h-4 mr-2 text-accent" />
                                                Your Answer
                                            </label>
                                            <input 
                                                placeholder="Enter your secret answer" 
                                                required
                                                className="input-modern"
                                                value={answer}
                                                onChange={e => setAnswer(e.target.value)} 
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center">
                                                <Lock className="w-4 h-4 mr-2 text-accent" />
                                                New Password
                                            </label>
                                            <input 
                                                type="password"
                                                placeholder="Min 6 characters" 
                                                required
                                                minLength={6}
                                                className="input-modern"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)} 
                                            />
                                        </div>

                                        <div className="flex gap-3">
                                            <button 
                                                type="button"
                                                onClick={() => setStep(1)}
                                                className="flex-1 py-3 bg-slate-800 text-white rounded-xl font-medium hover:bg-slate-700 transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button 
                                                type="submit" 
                                                disabled={loading}
                                                className="flex-[2] btn-primary py-3 text-lg"
                                            >
                                                {loading ? "Resetting..." : "Reset Password"}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default ForgotPassword;
