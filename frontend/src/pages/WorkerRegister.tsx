import { useState, useEffect } from "react";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { User, Phone, Briefcase, FileText, Upload, CheckCircle2, Lock, CreditCard } from "lucide-react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

const WorkerRegister = () => {
  const [form, setForm] = useState<any>({
    securityQuestion: "What is your pet's name?",
    securityAnswer: "",
    name: "",
    phone: "",
    category: "",
    subcategory: "",
    experience: "",
    aadhaarNumber: "",
    password: ""
  });
  const [aadhaarImage, setAadhaarImage] = useState<File | null>(null);
  const [success, setSuccess] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [subcategories, setSubcategories] = useState<string[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);

  // fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/categories");
        setCategories(data);
        setLoadingCats(false);
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Failed to load categories");
        setLoadingCats(false);
      }
    };
    fetchCategories();
  }, []);

  const handleCategoryChange = (e: any) => {
    const value = e.target.value;
    setSelectedCategory(value);
    setForm({ ...form, category: value, subcategory: "" });

    const selected = categories.find((c: any) => c.name === value);
    setSubcategories(selected ? selected.subcategories : []);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(form).forEach(key => data.append(key, form[key]));

    if (aadhaarImage) data.append("aadhaarImage", aadhaarImage);

    try {
      await API.post("/workers/register", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Registration Successful!");
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Registration failed. Please check all fields.");
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
          <h2 className="text-3xl font-bold text-white mb-4">Registration Successful!</h2>
          <p className="text-slate-400 mb-8">Your application is under review. We will contact you shortly.</p>
          <button 
            onClick={() => window.location.href = "/"}
            className="btn-primary w-full"
          >
            Back to Home
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary">
      <Toaster position="top-center" reverseOrder={false} />
      <Navbar />
      
      <div className="pt-32 pb-20 max-w-2xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Join Our Expert Network</h1>
            <p className="text-slate-400">Provide your details to start receiving service requests in your area.</p>
          </div>

          <form onSubmit={handleSubmit} className="card-premium space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <User className="w-4 h-4 mr-2 text-accent" />
                  Full Name
                </label>
                <input 
                  placeholder="e.g. John Doe" 
                  required
                  className="input-modern"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})} 
                />
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
                  value={form.phone}
                  onChange={e => setForm({...form, phone: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-accent" />
                  Primary Category
                </label>
                <div className="relative">
                  <select 
                    required
                    className="input-modern appearance-none w-full"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    disabled={loadingCats}
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat: any) => (
                      <option key={cat._id || cat.name} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                  {loadingCats && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-accent animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <FileText className="w-4 h-4 mr-2 text-accent" />
                  Specialization
                </label>
                <select 
                  required 
                  className="input-modern appearance-none" 
                  disabled={!selectedCategory || subcategories.length === 0}
                  value={form.subcategory || ""}
                  onChange={e => setForm({ ...form, subcategory: e.target.value })}
                >
                  <option value="">Select Sub‑Category</option>
                  {subcategories.map((sub: string) => (
                    <option key={sub} value={sub}>{sub}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <Briefcase className="w-4 h-4 mr-2 text-accent" />
                  Experience (Years)
                </label>
                <input 
                  type="number"
                  placeholder="e.g. 5" 
                  min="0"
                  className="input-modern"
                  value={form.experience}
                  onChange={e => setForm({...form, experience: e.target.value})} 
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-accent" />
                  Aadhaar Number
                </label>
                <input 
                  placeholder="12-digit number" 
                  required
                  maxLength={12}
                  minLength={12}
                  className="input-modern"
                  value={form.aadhaarNumber}
                  onChange={e => setForm({...form, aadhaarNumber: e.target.value})} 
                />
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
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-accent" />
                  Security Question (Reset)
                </label>
                <select 
                  className="input-modern"
                  required
                  value={form.securityQuestion}
                  onChange={e => setForm({...form, securityQuestion: e.target.value})}
                >
                  <option>What is your pet's name?</option>
                  <option>What is your mother's maiden name?</option>
                  <option>What was the name of your first school?</option>
                  <option>What city were you born in?</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <Lock className="w-4 h-4 mr-2 text-accent" />
                  Secret Answer
                </label>
                <input 
                  placeholder="e.g. Fluffy" 
                  required
                  className="input-modern"
                  value={form.securityAnswer}
                  onChange={e => setForm({...form, securityAnswer: e.target.value})} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="space-y-4">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <Upload className="w-4 h-4 mr-2 text-accent" />
                  ID Proof (Aadhaar)
                </label>
                <div className="relative group border-2 border-dashed border-slate-700 rounded-xl p-4 hover:border-accent transition-colors text-center cursor-pointer overflow-hidden">
                  <input 
                    type="file" 
                    required
                    accept="image/*"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={e => setAadhaarImage(e.target.files?.[0] || null)} 
                  />
                  {aadhaarImage ? (
                    <div className="flex flex-col items-center">
                      <img 
                        src={URL.createObjectURL(aadhaarImage)} 
                        alt="Aadhaar Preview" 
                        className="h-32 object-contain rounded-lg mb-2"
                      />
                      <span className="text-xs text-accent font-medium">{aadhaarImage.name}</span>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500 flex flex-col items-center">
                      <Upload className="w-8 h-8 mb-2 text-slate-600" />
                      Click to upload ID (Image)
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full py-4 text-lg mt-4">
              Submit Application
            </button>
          </form>
        </motion.div>
      </div>
      
      <Footer />
    </div>
  );
};

export default WorkerRegister;