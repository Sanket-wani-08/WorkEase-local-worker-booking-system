import { Link } from "react-router-dom";
import { Hammer, Mail, Phone, MapPin, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contact" className="bg-primary border-t border-slate-800 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <div className="bg-accent p-2 rounded-lg">
                <Hammer className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tighter">
                Work<span className="text-accent">Ease</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Your one-stop destination for all home services. We connect you with verified professionals instantly.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center text-slate-400 hover:text-accent hover:bg-accent/10 transition-all">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-bold mb-6">Quick Links</h4>
            <ul className="space-y-4">
              {[
                { name: "About Us", path: "/about" },
                { name: "Our Services", path: "/services" },
                { name: "How it Works", path: "/#how-it-works" },
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.path} className="text-slate-400 hover:text-accent transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-white font-bold mb-6">Popular Services</h4>
            <ul className="space-y-4">
              {["Electrician", "Plumber", "AC Service", "Maid Service", "Deep Cleaning"].map((service) => (
                <li key={service}>
                  <Link to={`/services`} className="text-slate-400 hover:text-accent transition-colors text-sm">
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white font-bold mb-6">Contact Us</h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href="https://www.google.com/maps/search/Tirupati+Empire+Panchvati+Kalol+382721+Gandhinagar" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start space-x-3 text-sm text-slate-400 hover:text-accent transition-colors"
                >
                  <MapPin className="w-5 h-5 text-accent shrink-0" />
                  <span>Tirupati Empire, Panchvati<br />Kalol-382721, Gandhinagar</span>
                </a>
              </li>
              <li>
                <a 
                  href="mailto:workeaseofficial@gmail.com" 
                  className="flex items-center space-x-3 text-sm text-slate-400 hover:text-accent transition-colors"
                >
                  <Mail className="w-5 h-5 text-accent shrink-0" />
                  <span>workeaseofficial@gmail.com</span>
                </a>
              </li>
              <li>
                <a 
                  href="tel:+919313592025" 
                  className="flex items-center space-x-3 text-sm text-slate-400 hover:text-accent transition-colors"
                >
                  <Phone className="w-5 h-5 text-accent shrink-0" />
                  <span>+91 9313592025</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
          <p>© 2026 WorkEase. All rights reserved.</p>
          <div className="flex space-x-8">
            <Link to="/about" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link to="/about" className="hover:text-accent transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
