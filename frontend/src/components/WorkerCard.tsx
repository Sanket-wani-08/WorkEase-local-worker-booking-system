import { useNavigate } from "react-router-dom";
import { Star, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

const WorkerCard = ({ worker, onClick }: any) => {
  const navigate = useNavigate();
  
  const handleAction = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/booking/${worker._id}`);
    }
  };
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card-premium flex flex-col h-full"
    >
      <div className="relative mb-6">
        <img
          src={worker.profileImage || "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"}
          className="w-full h-48 object-cover rounded-xl"
          alt={worker.name}
          loading="lazy"
        />
        <div className="absolute top-3 right-3 glass px-2 py-1 rounded-lg flex items-center space-x-1 shadow-lg">
          <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
          <span className="text-xs font-bold text-white">{worker.rating?.toFixed(1) || "4.8"}</span>
        </div>
        {worker.isVerified && (
          <div className="absolute bottom-3 left-3 bg-blue-500/90 text-white px-2 py-1 rounded-lg flex items-center space-x-1 text-[10px] font-bold uppercase tracking-wider">
            <ShieldCheck className="w-3 h-3" />
            <span>Verified</span>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-4">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent mb-1 block">
            {worker.category}
          </span>
          <h3 className="text-xl font-bold text-white group-hover:text-accent transition-colors">
            {worker.name}
          </h3>
          <div className="flex items-center text-slate-400 text-xs mt-1">
            <MapPin className="w-3 h-3 mr-1" />
            {typeof worker.location === "string" 
              ? worker.location 
              : worker.location?.address || "Nearby Area"}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-800">
          <button
            onClick={handleAction}
            className="w-full py-3 bg-accent/10 text-accent rounded-xl hover:bg-accent hover:text-white transition-all duration-300 font-bold flex items-center justify-center space-x-2 group"
          >
            <span>Worker Info</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default WorkerCard;