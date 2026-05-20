import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Lock, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const ResetPassword = () => {
    const { token } = useParams();
    const [searchParams] = useSearchParams();
    const role = searchParams.get("role") || "user";
    const navigate = useNavigate();

    const [form, setForm] = useState({ password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const endpoint = role === "worker" ? `/workers/reset-password/${token}` : `/auth/reset-password/${token}`;
            await API.put(endpoint, form);
            setSuccess(true);
            setTimeout(() => navigate("/login"), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid or expired token. Please request a new link.");
        } finally {
            setLoading(false);
        }
    };

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
                        <h1 className="text-4xl font-bold text-white mb-4">New Password</h1>
                        <p className="text-slate-400">Please enter your new password below</p>
                    </div>

                    <div className="card-premium">
                        {success ? (
                            <div className="text-center py-6">
                                <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-8 h-8 text-green-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Password Reset!</h3>
                                <p className="text-slate-400 text-sm mb-6">
                                    Your password has been successfully reset. Redirecting you to login...
                                </p>
                                <div className="flex justify-center">
                                    <Loader2 className="w-6 h-6 text-accent animate-spin" />
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-lg text-sm flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-accent" /> New Password
                                    </label>
                                    <input 
                                        type="password"
                                        placeholder="Min. 6 characters"
                                        required
                                        minLength={6}
                                        className="input-modern"
                                        value={form.password}
                                        onChange={e => setForm({...form, password: e.target.value})} 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-300 flex items-center">
                                        <Lock className="w-4 h-4 mr-2 text-accent" /> Confirm Password
                                    </label>
                                    <input 
                                        type="password"
                                        placeholder="Re-enter password"
                                        required
                                        className="input-modern"
                                        value={form.confirmPassword}
                                        onChange={e => setForm({...form, confirmPassword: e.target.value})} 
                                    />
                                </div>

                                <button 
                                    type="submit" 
                                    disabled={loading}
                                    className="btn-primary w-full py-3 text-lg flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : "Reset Password"}
                                </button>
                            </form>
                        )}
                    </div>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default ResetPassword;
