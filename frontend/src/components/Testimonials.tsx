import { motion } from "framer-motion";
import { Quote } from "lucide-react";

const testimonials = [
  {
    name: "Alex Johnson",
    role: "Homeowner",
    content: "WorkEase made it so easy to find a reliable plumber. The worker arrived on time and fixed the issue perfectly. Highly recommended!",
    avatar: "https://i.pravatar.cc/150?u=alex",
  },
  {
    name: "Sarah Miller",
    role: "Real Estate Agent",
    content: "I use WorkEase for all my property maintenance needs. The quality of workers is consistently high, and the platform is very user-friendly.",
    avatar: "https://i.pravatar.cc/150?u=sarah",
  },
  {
    name: "Michael Chen",
    role: "Business Owner",
    content: "Fast, efficient, and professional. The technician who came to fix our AC was extremely knowledgeable. A lifesaver!",
    avatar: "https://i.pravatar.cc/150?u=michael",
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Clients Say</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Real stories from real users who have experienced the convenience of WorkEase.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-premium relative"
            >
              <Quote className="absolute top-6 right-6 w-10 h-10 text-accent/10" />
              <div className="flex items-center space-x-4 mb-6">
                <img src={t.avatar} alt={t.name} className="w-12 h-12 rounded-full border-2 border-accent/20" />
                <div>
                  <h4 className="font-bold text-white">{t.name}</h4>
                  <p className="text-xs text-accent font-medium uppercase tracking-wider">{t.role}</p>
                </div>
              </div>
              <p className="text-slate-400 italic leading-relaxed">
                "{t.content}"
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
