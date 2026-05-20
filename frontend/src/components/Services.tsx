import { motion } from "framer-motion";
import { 
  Home, 
  Sparkles, 
  User, 
  Tv, 
  Truck, 
  Car 
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const categories = [
  { name: "Home Services", icon: <Home />, color: "text-blue-500", bg: "bg-blue-500/10" },
  { name: "Household Work", icon: <Sparkles />, color: "text-green-500", bg: "bg-green-500/10" },
  { name: "Personal Assistance", icon: <User />, color: "text-purple-500", bg: "bg-purple-500/10" },
  { name: "Home Appliance Repair", icon: <Tv />, color: "text-red-500", bg: "bg-red-500/10" },
  { name: "Pick & Drop Services", icon: <Truck />, color: "text-yellow-500", bg: "bg-yellow-500/10" },
  { name: "Roadside Assistance", icon: <Car />, color: "text-orange-500", bg: "bg-orange-500/10" },
];

const Services = () => {
  const navigate = useNavigate();

  return (
    <section id="services" className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Services</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Choose from our wide range of professional services. Verified experts available for every task.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onClick={() => navigate(`/booking/broadcast?category=${cat.name}`)}
              className="card-premium cursor-pointer group flex flex-col items-center text-center justify-center p-8 h-full"
            >
              <div className={`p-4 rounded-2xl mb-4 transition-all duration-300 group-hover:scale-110 ${cat.bg} ${cat.color}`}>
                {cat.icon}
              </div>
              <h3 className="text-lg font-semibold group-hover:text-accent transition-colors">
                {cat.name}
              </h3>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;