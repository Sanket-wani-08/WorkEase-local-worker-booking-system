import { ShieldCheck, Clock, Star, Users } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    title: "Fast Booking",
    description: "Book a service in less than 60 seconds and get instant confirmation.",
    icon: <Clock className="w-8 h-8" />,
    color: "bg-orange-500/10 text-orange-500",
  },
  {
    title: "Top Rated",
    description: "Only the highest-rated workers are recommended for your services.",
    icon: <Star className="w-8 h-8" />,
    color: "bg-yellow-500/10 text-yellow-500",
  },
  {
    title: "Expert Support",
    description: "Our customer support team is available 24/7 to assist you.",
    icon: <Users className="w-8 h-8" />,
    color: "bg-purple-500/10 text-purple-500",
  },
];

const WhyChooseUs = () => {
  return (
    <section id="how-it-works" className="py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose WorkEase?</h2>
          <p className="text-slate-400 max-w-2xl mx-auto">
            We prioritize your safety and convenience. Here's why thousands trust us for their home needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="card-premium"
            >
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${feature.color}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-slate-400 leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
