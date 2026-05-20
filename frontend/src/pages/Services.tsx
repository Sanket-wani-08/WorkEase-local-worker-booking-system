import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { 
  Home, 
  Sparkles, 
  User, 
  Tv, 
  Truck, 
  Car,
  Loader2,
  ChevronRight,
  Zap,
  Clock
} from "lucide-react";
import { motion } from "framer-motion";

// get icon based on category name
const getCategoryIcon = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("home service")) return <Home className="w-8 h-8" />;
  if (n.includes("household") || n.includes("cleaning")) return <Sparkles className="w-8 h-8" />;
  if (n.includes("personal") || n.includes("assistance")) return <User className="w-8 h-8" />;
  if (n.includes("appliance")) return <Tv className="w-8 h-8" />;
  if (n.includes("pick") || n.includes("drop") || n.includes("delivery")) return <Truck className="w-8 h-8" />;
  if (n.includes("roadside") || n.includes("car")) return <Car className="w-8 h-8" />;
  return <Zap className="w-8 h-8" />;
};

// get color theme based on category
const getCategoryTheme = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes("home service")) return "text-blue-500 bg-blue-500/10 border-blue-500/20";
  if (n.includes("household")) return "text-green-500 bg-green-500/10 border-green-500/20";
  if (n.includes("personal")) return "text-purple-500 bg-purple-500/10 border-purple-500/20";
  if (n.includes("appliance")) return "text-red-500 bg-red-500/10 border-red-500/20";
  if (n.includes("pick")) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
  if (n.includes("roadside")) return "text-orange-500 bg-orange-500/10 border-orange-500/20";
  return "text-accent bg-accent/10 border-accent/20";
};

const Services = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await API.get("/categories");
        setCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-accent/10 blur-[120px] rounded-full -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-accent text-sm font-bold mb-6"
          >
            <Sparkles className="w-4 h-4" />
            <span>EXPERT SERVICES AT YOUR DOORSTEP</span>
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight"
          >
            Our Professional <span className="text-accent">Services</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-400 text-lg max-w-2xl mx-auto mb-10"
          >
            Discover a wide range of verified professional services tailored to your needs. 
            From home repairs to personal assistance, we've got you covered.
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-accent animate-spin mb-4" />
            <p className="text-slate-500 font-medium">Loading our services...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={cat._id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/booking/broadcast?category=${cat.name}`)}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl -z-10 blur-xl" />
                <div className="card-premium h-full cursor-pointer border-slate-800/50 hover:border-accent/50 group transition-all duration-500 p-8">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 ${getCategoryTheme(cat.name)}`}>
                    {getCategoryIcon(cat.name)}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-accent transition-colors">
                    {cat.name}
                  </h3>
                  
                  <div className="flex flex-wrap gap-2 mb-8">
                    {cat.subcategories?.slice(0, 4).map((sub: string, idx: number) => (
                      <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 text-slate-400 border border-white/5">
                        {sub}
                      </span>
                    ))}
                    {cat.subcategories?.length > 4 && (
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 text-slate-500">
                        +{cat.subcategories.length - 4} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-accent font-bold text-sm">
                    Book Now <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Trust Badges */}
      <section className="py-20 bg-secondary/20 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-center max-w-4xl mx-auto">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold mb-2">Fast Response</h4>
              <p className="text-slate-500 text-sm">Get connected with available workers in your area within minutes.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h4 className="text-white font-bold mb-2">Quality Service</h4>
              <p className="text-slate-500 text-sm">We ensure top-notch quality for every service booked through our platform.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
