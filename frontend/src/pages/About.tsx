import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { motion } from "framer-motion";
import { Shield , Target, Rocket, Heart, Star, CheckCircle2, Hammer } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: <Shield className="w-8 h-8 text-accent" />,
      title: "Trust & Safety",
      description: "Every worker on our platform undergoes a rigorous background check and identity verification process."
    },
    {
      icon: <Star className="w-8 h-8 text-accent" />,
      title: "Quality Service",
      description: "We maintain high standards by monitoring ratings and feedback to ensure you get the best professionals."
    },
    {
      icon: <Heart className="w-8 h-8 text-accent" />,
      title: "Community First",
      description: "Empowering local skilled workers by providing them with a steady stream of opportunities and fair pay."
    }
  ];



  return (
    <div className="min-h-screen bg-primary">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-from)_0%,_transparent_70%)] from-orange-500/10 blur-3xl -z-10" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="text-left"
          >
            <span className="bg-accent/10 text-accent px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              Our Story
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tighter leading-tight">
              Redefining Local <br /><span className="text-accent">Services</span>
            </h1>
            <p className="text-xl text-slate-400 leading-relaxed mb-8">
              WorkEase was born from a simple idea: making it effortless to find trusted, skilled professionals for your everyday needs while empowering local workers with better opportunities.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-accent/20 blur-3xl rounded-full -z-10" />
            <img 
              src="/about-team.png" 
              alt="WorkEase Team" 
              className="rounded-[2.5rem] shadow-2xl border-2 border-white/10 w-full h-[450px] object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-premium p-10 border-l-4 border-accent"
          >
            <div className="bg-accent/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-accent" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Our Mission</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              To build the most reliable bridge between skilled service providers and households, ensuring transparency, fair pricing, and exceptional quality in every interaction.
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="card-premium p-10 border-l-4 border-blue-500"
          >
            <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
              <Rocket className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Our Vision</h2>
            <p className="text-slate-400 leading-relaxed text-lg">
              To be the default platform for local services globally, fostering a community where skill is valued and service is delivered with pride and professionalism.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">Values That Drive Us</h2>
            <p className="text-slate-400">The core principles behind every booking on WorkEase.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card-premium text-center p-8 hover:bg-white/5 transition-colors group"
              >
                <div className="mb-6 flex justify-center group-hover:scale-110 transition-transform">
                  {value.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-slate-400 leading-relaxed">
                  {value.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why We Are Different */}
      <section className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">What Makes WorkEase Different?</h2>
              <div className="space-y-6">
                {[
                  "Real-time tracking of your service provider.",
                  "Transparent pricing with no hidden visiting charges.",
                  "24/7 priority support for all our users.",
                  "Strict 10-point verification process for every worker.",
                  "Instant booking with secure online payment options."
                ].map((item, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="bg-green-500/20 p-1 rounded-full">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                    </div>
                    <span className="text-lg text-slate-300">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-accent/20 blur-2xl rounded-full -z-10 animate-pulse" />
              <img 
                src="/about-hero.png" 
                alt="Professional Service" 
                className="rounded-3xl shadow-2xl border-2 border-white/5 object-cover h-[500px] w-full"
              />
              <div className="absolute bottom-6 left-6 right-6 glass p-6 rounded-2xl border border-white/10">
                <div className="flex items-center space-x-4">
                  <div className="bg-accent p-3 rounded-xl">
                    <Hammer className="text-white w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-lg">WorkEase Standard</p>
                    <p className="text-slate-400 text-sm">Professionalism in every pixel and person.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
