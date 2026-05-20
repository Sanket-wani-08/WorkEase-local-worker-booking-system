import { useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Ghost } from "lucide-react";
import { motion } from "framer-motion";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6 overflow-hidden">
      <div className="max-w-2xl w-full text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative mb-12"
          >
            <motion.div
              animate={{ 
                y: [0, -20, 0],
                rotate: [0, 5, -5, 0]
              }}
              transition={{ 
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="inline-block"
            >
              <Ghost className="w-32 h-32 text-accent/20" />
            </motion.div>
            
            <h1 className="text-[150px] font-black text-white leading-none tracking-tighter opacity-10 absolute inset-0 flex items-center justify-center pointer-events-none select-none">
              404
            </h1>
            <div className="relative z-10">
              <h2 className="text-5xl font-bold text-white mb-4">Page Not Found</h2>
              <p className="text-slate-400 text-lg max-w-md mx-auto">
                Oops! It seems the page you're looking for has vanished into thin air. Let's get you back on track.
              </p>
            </div>
          </motion.div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 px-8 py-4 bg-secondary text-white rounded-2xl border border-slate-800 hover:bg-slate-800 transition-all font-bold w-full sm:w-auto"
            >
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </button>
            
            <button
              onClick={() => navigate("/")}
              className="group flex items-center gap-2 px-8 py-4 bg-accent text-white rounded-2xl shadow-lg shadow-orange-500/20 hover:scale-105 transition-all font-bold w-full sm:w-auto"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>

          <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 opacity-50">
            <div className="p-6 rounded-2xl border border-slate-800 bg-secondary/20">
              <h3 className="text-white font-bold mb-2">Lost?</h3>
              <p className="text-slate-400 text-xs text-balance">Check our help center for common questions.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-800 bg-secondary/20">
              <h3 className="text-white font-bold mb-2">Broken Link?</h3>
              <p className="text-slate-400 text-xs text-balance">Report this error to our support team.</p>
            </div>
            <div className="p-6 rounded-2xl border border-slate-800 bg-secondary/20">
              <h3 className="text-white font-bold mb-2">Searching?</h3>
              <p className="text-slate-400 text-xs text-balance">Try using the search bar on our workers page.</p>
            </div>
          </div>
        </div>
      </div>
  );
};

export default NotFound;
