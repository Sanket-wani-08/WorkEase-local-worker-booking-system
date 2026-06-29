import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { userService } from "../services/user.service";
import { workerService } from "../services/worker.service";
import toast from "react-hot-toast";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { User, Camera, Mail, Phone, Briefcase, Star, MapPin, Loader2, Save } from "lucide-react";
import { motion } from "framer-motion";
import { useAppSelector } from "../hooks/storeHooks";

const Profile = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [profile, setProfile] = useState<any>(null);
    const [role, setRole] = useState<"worker" | "user" | null>(null);
    const [saving, setSaving] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        defaultValues: {
            name: "",
            phone: "",
            category: "",
            subcategory: "",
            experience: ""
        }
    });

    const { isAuthenticated, role: reduxRole } = useAppSelector((state) => state.auth);

    const isWorker = reduxRole === 'worker';

    const { data: profileRes, isLoading: loading } = useQuery({
        queryKey: ["profile", reduxRole],
        queryFn: isWorker ? workerService.getWorkerProfile : userService.getUserProfile,
        enabled: !!isAuthenticated && !!reduxRole,
    });

    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/login");
            return;
        }

        if (profileRes) {
            setProfile(profileRes);
            if (isWorker) {
                setRole("worker");
                reset({
                    name: profileRes.name || "",
                    phone: profileRes.phone || "",
                    category: profileRes.category || "",
                    subcategory: profileRes.subcategory || "",
                    experience: profileRes.experience || ""
                });
            } else {
                setRole(profileRes.role === "admin" ? "admin" : "user");
                reset({
                    name: profileRes.name || "",
                    phone: profileRes.phone || "",
                    category: "",
                    subcategory: "",
                    experience: ""
                });
            }
        }
    }, [profileRes, isAuthenticated, navigate, isWorker, reset]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const updateProfileMutation = useMutation({
        mutationFn: (formData: FormData) => {
            return isWorker ? workerService.updateWorkerProfile(formData) : userService.updateUserProfile(formData);
        },
        onSuccess: () => {
            toast.success("Profile updated successfully!");
            queryClient.invalidateQueries({ queryKey: ["profile", reduxRole] });
            setSaving(false);
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || "Update failed");
            setSaving(false);
        }
    });

    const onSubmit = (data: any) => {
        setSaving(true);
        
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("phone", data.phone);
        
        if (role === "worker") {
            formData.append("experience", data.experience);
            formData.append("category", data.category);
            formData.append("subcategory", data.subcategory);
        }

        if (imageFile) {
            formData.append("profileImage", imageFile);
        }

        updateProfileMutation.mutate(formData);
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

                    <form onSubmit={handleSubmit(onSubmit)} className="relative z-10 p-8">
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
                                    {String(role) === "admin" ? (
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
                                        className="input-premium w-full"
                                        {...register("name", { required: "Name is required" })}
                                    />
                                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                                </div>

                                <div>
                                    <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input 
                                            type="text" 
                                            className="input-premium w-full pl-12"
                                            {...register("phone", {
                                                required: "Phone is required",
                                                pattern: {
                                                    value: /^[0-9]{10}$/,
                                                    message: "Please enter a valid 10-digit phone number"
                                                }
                                            })}
                                        />
                                    </div>
                                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                                </div>

                                {role === "user" && (
                                     <div>
                                        <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                            <input 
                                                type="text" 
                                                disabled
                                                value={profile?.email || ""}
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
                                            className="input-premium w-full"
                                            {...register("category", { required: "Category is required" })}
                                        />
                                        {errors.category && <p className="text-xs text-red-500">{errors.category.message}</p>}
                                    </div>

                                    <div>
                                        <label className="text-sm font-bold text-slate-400 mb-2 block uppercase tracking-wider">Specialization</label>
                                        <input 
                                            type="text" 
                                            className="input-premium w-full"
                                            {...register("subcategory", { required: "Specialization is required" })}
                                        />
                                        {errors.subcategory && <p className="text-xs text-red-500">{errors.subcategory.message}</p>}
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
