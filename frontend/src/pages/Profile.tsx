import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { User, Camera, Mail, Phone, Briefcase, Star, MapPin, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<any>(null);
    const [role, setRole] = useState<"worker" | "user" | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [form, setForm] = useState<any>({
        name: "",
        phone: "",
        category: "",
        subcategory: "",
        experience: ""
    });

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const userToken = localStorage.getItem("userToken");
                const workerToken = localStorage.getItem("workerToken");

                if (!userToken && !workerToken) {
                    navigate("/login");
                    return;
                }

                if (workerToken) {
                    const res = await API.get("/workers/me");
                    setProfile(res.data);
                    setRole("worker");
                    setForm({
                        name: res.data.name,
                        phone: res.data.phone,
                        subcategory: res.data.subcategory || ""
                    });
                } else {
                    const res = await API.get("/user/me");
                    setProfile(res.data);
                    setRole(res.data.role === "admin" ? "admin" as any : "user");
                    setForm((prev: any) => ({
                        ...prev,
                        name: res.data.name || "",
                        phone: res.data.phone || ""
                    }));
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [navigate]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("phone", form.phone);
            
            if (role === "worker") {
                formData.append("experience", form.experience);
                formData.append("category", form.category);
                formData.append("subcategory", form.subcategory);
            }

            if (imageFile) {
                formData.append("profileImage", imageFile);
            }

            const endpoint = role === "worker" ? "/workers/me" : "/user/me";
            await API.put(endpoint, formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            alert("Profile updated successfully!");
            window.location.reload();
        } catch (err: any) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-primary flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-accent animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary flex flex-col">
            <Navbar />
            
            <div className="flex-1 pt-32 pb-20 px-4 max-w-4xl mx-auto w-full">
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium relative overflow-hidden"
                >
                    {/* Background Accent */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-accent/20 to-blue-500/20" />

                    <form onSubmit={handleSubmit} className="relative z-10 p-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6 mb-12">
                            <div className="relative group">
                                <img 
                                    src={previewImage || profile?.profileImage || (role === "worker" ? "https://cdn-icons-png.flaticon.com/512/4333/4333609.png" : "https://cdn-icons-png.flaticon.com/512/4140/4140037.png")} 
                                    className="w-32 h-32 rounded-3xl object-cover border-4 border-secondary ring-4 ring-accent/20"
                                    alt="Profile"
                                />
                                <label className="absolute bottom-2 right-2 bg-accent p-2 rounded-xl cursor-pointer hover:scale-110 transition-transform shadow-xl">
                                    <Camera className="w-5 h-5 text-white" />
                                    <input type="file" hidden onChange={handleImageChange} accept="image/*" />
                                </label>
                            </div>
                            <div className="text-center md:text-left flex-1">
                                <h1 className="text-3xl font-black text-white mb-1">{profile?.name}</h1>
                                <p className="text-slate-400 font-medium capitalize">
                                    {role === "admin" ? (
                                        <span className="text-accent font-black uppercase tracking-widest text-xs">Administrator Control</span>
                                    ) : (
                                        `${role} Account`
                                    )}
                                </p>
                            </div>
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="btn-primary px-8 py-3 flex items-center gap-2"
                            >
                                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                {saving ? "Saving..." : "Save Changes"}
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Personal Info */}
                            <div className="space-y-6">
                                <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                    <User className="w-5 h-5 text-accent" />
                                    Personal Information
                                </h2>
                                
                                <div>
                                    <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Full Name</label>
                                    <input 
                                        type="text" 
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="input-premium w-full"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input 
                                            type="text" 
                                            value={form.phone}
                                            onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                            className="input-premium w-full pl-12"
                                        />
                                    </div>
                                </div>

                                {role === "user" && (
                                     <div>
                                        <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input 
                                                type="text" 
                                                disabled
                                                value={profile?.email}
                                                className="input-premium w-full pl-12 opacity-50 cursor-not-allowed"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Worker Specific Info */}
                            {role === "worker" && (
                                <div className="space-y-6">
                                    <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                        <Briefcase className="w-5 h-5 text-accent" />
                                        Work Details
                                    </h2>

                                    <div>
                                        <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Primary Category</label>
                                        <input 
                                            type="text" 
                                            value={form.category}
                                            onChange={(e) => setForm({ ...form, category: e.target.value })}
                                            className="input-premium w-full"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Specialization</label>
                                        <input 
                                            type="text" 
                                            value={form.subcategory}
                                            onChange={(e) => setForm({ ...form, subcategory: e.target.value })}
                                            className="input-premium w-full"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Extra Stats if Worker */}
                        {role === "worker" && (
                            <div className="mt-12 pt-8 border-t border-slate-800 grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div className="bg-secondary/30 p-4 rounded-2xl border border-slate-800/50">
                                    <div className="flex items-center gap-2 text-yellow-500 mb-1 text-sm font-bold">
                                        <Star className="w-4 h-4 fill-current" />
                                        Rating
                                    </div>
                                    <div className="text-2xl font-black text-white">{profile?.rating || "New"}</div>
                                </div>
                                <div className="bg-secondary/30 p-4 rounded-2xl border border-slate-800/50">
                                    <div className="flex items-center gap-2 text-green-500 mb-1 text-sm font-bold">
                                        <MapPin className="w-4 h-4" />
                                        Status
                                    </div>
                                    <div className="text-2xl font-black text-white">{profile?.verificationStatus}</div>
                                </div>
                            </div>
                        )}
                    </form>
                </motion.div>
            </div>

            <Footer />
        </div>
    );
};

export default Profile;
