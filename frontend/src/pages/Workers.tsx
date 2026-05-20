import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../api/axios";
import WorkerCard from "../components/WorkerCard";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Search, Filter, Loader2, ArrowRight, X , Phone, Briefcase, CreditCard, ShieldCheck, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

const Workers = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [workers, setWorkers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [subcategory, setSubcategory] = useState(searchParams.get("subcategory") || "");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const res = await API.get("/user/me");
        if (res.data.role === "admin") {
          setIsAdmin(true);
        } else {
          navigate("/services");
        }
      } catch (err) {
        navigate("/services");
      }
    };
    checkAdmin();
  }, [navigate]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setSubcategory(searchParams.get("subcategory") || "");
  }, [searchParams]);

  useEffect(() => {
    fetchWorkers();
  }, [category, subcategory]);

  const fetchWorkers = async () => {
    setLoading(true);
    try {
      const res = await API.get("/workers/search", {
        params: { category, subcategory }
      });
      setWorkers(res.data);
    } catch (error) {
      // silently ignore error
    } finally {
      setLoading(false);
    }
  };

  const filteredWorkers = (workers || []).filter((w: any) =>
    w?.name?.toLowerCase().includes(search.toLowerCase()) ||
    w?.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      <div className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Find Your Expert</h1>
            <p className="text-slate-400">Browse through our verified professionals ready to help you.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-accent transition-colors" />
              <input
                type="text"
                placeholder="Search by name or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-modern pl-11 w-full sm:w-80"
              />
            </div>
            
            <div className="relative group">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-accent transition-colors" />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-modern pl-11 w-full sm:w-60 appearance-none"
              >
                <option value="">All Categories</option>
                {categories?.map(cat => (
                  <option key={cat?._id || cat?.name} value={cat?.name}>{cat?.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Categories Quick Filter */}
        <div className="flex overflow-x-auto space-x-3 pb-8 scrollbar-hide">
          <button
            onClick={() => setCategory("")}
            className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              category === "" 
                ? "bg-accent text-white shadow-lg shadow-orange-500/20" 
                : "bg-secondary text-slate-400 hover:text-white"
            }`}
          >
            All Workers
          </button>
          {categories?.map(cat => (
            <button
              key={cat?._id || cat?.name}
              onClick={() => setCategory(cat?.name || "")}
              className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === cat?.name 
                  ? "bg-accent text-white shadow-lg shadow-orange-500/20" 
                  : "bg-secondary text-slate-400 hover:text-white"
              }`}
            >
              {cat?.name}
            </button>
          ))}
        </div>

        {/* Broadcast Request Section */}
        {category && !loading && !isAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12 p-8 rounded-3xl bg-gradient-to-r from-accent/20 to-secondary/40 border border-accent/20 flex flex-col md:flex-row items-center justify-between gap-6"
          >
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-white mb-2">Can't decide? Request everyone!</h2>
              <p className="text-slate-400">Send a request to all available <span className="text-accent font-bold">{category}</span> experts. First to accept will come to help you.</p>
            </div>
            <button
              onClick={() => navigate(`/booking/broadcast?category=${encodeURIComponent(category)}`)}
              className="btn-primary whitespace-nowrap px-8 py-4 shadow-xl shadow-orange-500/20 flex items-center gap-2 group"
            >
              Request All Experts
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Finding available workers...</p>
          </div>
        ) : filteredWorkers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredWorkers.map((w: any, i: number) => (
              <motion.div
                key={w._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <WorkerCard 
                  worker={w} 
                  onClick={() => isAdmin ? setSelectedWorker(w) : navigate(`/booking/${w._id}`)}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-secondary/20 rounded-3xl border border-slate-800/50">
            <div className="bg-slate-800 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-slate-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No workers found</h3>
            <p className="text-slate-400">Try adjusting your filters or search terms.</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedWorker && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="card-premium w-full max-w-2xl max-h-[90vh] overflow-y-auto relative p-0"
            >
              {/* Modal Close */}
              <button 
                onClick={() => setSelectedWorker(null)}
                className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-all z-20"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Profile Header */}
              <div className="relative h-48 w-full">
                <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-blue-600/40 z-0" />
                <img 
                  src={selectedWorker.profileImage || "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"} 
                  className="absolute -bottom-12 left-8 w-32 h-32 rounded-3xl object-cover border-4 border-secondary shadow-2xl z-10"
                  alt={selectedWorker.name}
                />
              </div>

              <div className="pt-16 px-8 pb-10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                    <h2 className="text-3xl font-black text-white">{selectedWorker.name}</h2>
                    <div className="flex items-center gap-2 text-accent font-bold mt-1">
                      <Briefcase className="w-4 h-4" />
                      {selectedWorker.category} • {selectedWorker.subcategory}
                    </div>
                  </div>
                  <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2 ${selectedWorker.isVerified ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'}`}>
                    <ShieldCheck className="w-4 h-4" />
                    {selectedWorker.isVerified ? 'Verified Expert' : 'Pending Verification'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                  <div className="space-y-5">
                    <div className="flex items-center gap-4 group">
                      <div className="bg-slate-800/50 p-3 rounded-xl group-hover:bg-accent/20 transition-colors">
                        <Phone className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Phone Number</p>
                        <p className="text-white font-medium">{selectedWorker.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                      <div className="bg-slate-800/50 p-3 rounded-xl group-hover:bg-accent/20 transition-colors">
                        <Calendar className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Experience</p>
                        <p className="text-white font-medium">{selectedWorker.experience} Years</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex items-center gap-4 group">
                      <div className="bg-slate-800/50 p-3 rounded-xl group-hover:bg-accent/20 transition-colors">
                        <CreditCard className="w-5 h-5 text-accent" />
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">Aadhaar ID</p>
                        <p className="text-white font-medium">{selectedWorker.aadhaarNumber}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-accent" />
                    Identity Verification
                  </h3>
                  <div className="relative rounded-2xl overflow-hidden border-2 border-slate-800 group bg-slate-900/50">
                    {selectedWorker.aadhaarImage ? (
                      <img 
                        src={selectedWorker.aadhaarImage.startsWith('http') 
                          ? selectedWorker.aadhaarImage 
                          : `http://localhost:5000/${selectedWorker.aadhaarImage.replace(/\\/g, '/')}`} 
                        className="w-full h-auto grayscale group-hover:grayscale-0 transition-all duration-500 min-h-[200px] object-contain"
                        alt="Aadhaar ID Proof"
                        onError={(e: any) => {
                          e.target.src = "https://cdn-icons-png.flaticon.com/512/10149/10149363.png"; // fallback icon
                          e.target.className = "w-24 h-24 mx-auto my-12 opacity-20";
                        }}
                      />
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-600">
                         <CreditCard className="w-12 h-12 mb-2 opacity-20" />
                         <p className="text-xs uppercase font-bold tracking-tighter">No ID document uploaded</p>
                      </div>
                    )}
                    {selectedWorker.aadhaarImage && (
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <a 
                          href={selectedWorker.aadhaarImage.startsWith('http') 
                            ? selectedWorker.aadhaarImage 
                            : `http://localhost:5000/${selectedWorker.aadhaarImage.replace(/\\/g, '/')}`} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="btn-primary py-2 px-6 shadow-2xl"
                        >
                          View Full Document
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Workers;