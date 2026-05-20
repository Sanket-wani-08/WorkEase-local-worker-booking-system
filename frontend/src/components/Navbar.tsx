import { Link, useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Hammer, User as Bell, ChevronDown, LogOut, LayoutDashboard, UserCircle, Check } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import API from "../api/axios";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userName, setUserName] = useState("User");
  const [userRole, setUserRole] = useState("User");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    const workerToken = localStorage.getItem("workerToken");
    if (userToken || workerToken) {
      setIsLoggedIn(true);
      fetchUnreadCount();
      fetchUserInfo();
    }
  }, []);

  const fetchUserInfo = async () => {
    try {
      const isWorker = !!localStorage.getItem("workerToken");
      const endpoint = isWorker ? "/workers/me" : "/user/me";
      const res = await API.get(endpoint);
      setUserName(res.data.name);
      setUserRole(isWorker ? "Worker" : res.data.role);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const res = await API.get("/notifications/unread-count");
      setUnreadCount(res.data.unreadCount);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n._id === id ? { ...n, isRead: true } : n));
      fetchUnreadCount();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (showNotifications) {
      fetchNotifications();
    }
  }, [showNotifications]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("workerToken");
    localStorage.removeItem("workerId");
    setIsLoggedIn(false);
    navigate("/login");
  };

  const navLinks = [
    ...(userRole !== "admin" && userRole !== "Worker" ? [{ name: "Home", path: "/" }] : []),
    ...(userRole === "admin" ? [{ name: "Workers", path: "/workers" }] : []),
    ...(userRole !== "admin" && userRole !== "Worker" ? [{ name: "Book Now", path: "/services" }] : []),
    ...(userRole !== "admin" && userRole !== "Worker" ? [{ name: "About Us", path: "/about" }] : []),
  ];

  const secondaryLinks = [
    { name: "About", path: "/about" },
    { name: "Contact", path: "/#contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "glass py-3" : "bg-transparent py-5"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={userRole === "admin" || userRole === "Worker" ? "/dashboard" : "/"} className="flex items-center space-x-2.5 group">
            <div className="bg-accent p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-orange-500/20">
              <Hammer className="text-white w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-white tracking-tighter">
              Work<span className="text-accent">Ease</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <div className="hidden lg:flex items-center space-x-8">
            <div className="flex items-center space-x-1 bg-slate-800/40 rounded-full px-1 py-1 border border-white/5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    location.pathname === link.path || (link.path.startsWith("/#") && location.pathname === "/")
                      ? "bg-accent text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="h-6 w-px bg-slate-800" />

            {isLoggedIn ? (
              <div className="flex items-center space-x-6">
                {/* Notification Bell */}
                <div className="relative">
                  <div 
                    className="p-2 rounded-full hover:bg-slate-800 transition-colors cursor-pointer group"
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      setShowUserMenu(false);
                    }}
                  >
                    <Bell className="w-5 h-5 text-slate-400 group-hover:text-accent transition-colors" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full ring-2 ring-primary flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </div>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 glass rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/10"
                      >
                        <div className="px-4 py-3 border-b border-white/5 flex justify-between items-center bg-slate-800/50">
                          <h3 className="font-bold text-white">Notifications</h3>
                          {unreadCount > 0 && (
                            <button onClick={markAllAsRead} className="text-xs text-accent hover:text-white transition-colors flex items-center gap-1 font-medium">
                              <Check className="w-3 h-3" /> Mark all read
                            </button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length === 0 ? (
                            <div className="px-4 py-6 text-center text-sm text-slate-500">
                              No notifications yet.
                            </div>
                          ) : (
                            notifications.map((notif: any) => (
                              <div 
                                key={notif._id} 
                                onClick={() => !notif.isRead && markAsRead(notif._id)}
                                className={`px-4 py-3 border-b border-white/5 transition-colors cursor-pointer ${!notif.isRead ? 'bg-accent/5 hover:bg-accent/10' : 'hover:bg-white/5'}`}
                              >
                                <div className="flex gap-3 items-start">
                                  <div className={`p-2 rounded-full shrink-0 ${!notif.isRead ? 'bg-accent/20 text-accent' : 'bg-slate-800 text-slate-400'}`}>
                                    <Bell className="w-4 h-4" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm leading-tight ${!notif.isRead ? 'text-white font-medium' : 'text-slate-400'}`}>
                                      {notif.message}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                      {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </p>
                                  </div>
                                  {!notif.isRead && (
                                    <div className="w-2 h-2 rounded-full bg-accent mt-2 shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button 
                    onClick={() => {
                      setShowUserMenu(!showUserMenu);
                      setShowNotifications(false);
                    }}
                    className="flex items-center space-x-3 bg-secondary/50 border border-slate-700/50 hover:border-accent/50 rounded-full pl-1.5 pr-3 py-1.5 transition-all group"
                  >
                    <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-accent/20 group-hover:border-accent/50 transition-colors bg-secondary/50">
                      <img 
                        src="https://cdn-icons-png.flaticon.com/512/4140/4140037.png" 
                        className="w-full h-full object-cover p-1" 
                        alt="User" 
                      />
                    </div>
                    <span className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors">Account</span>
                    <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showUserMenu && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-56 glass rounded-2xl p-2 shadow-2xl overflow-hidden"
                      >
                        <div className="px-4 py-3 border-b border-white/5 mb-1">
                          <p className="text-xs text-slate-500 font-medium capitalize">Signed in as {userRole}</p>
                          <p className="text-sm font-semibold text-white truncate">{userName}</p>
                        </div>
                        <button 
                          onClick={() => { navigate("/dashboard"); setShowUserMenu(false); }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-accent/10 rounded-xl transition-all"
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          <span>Dashboard</span>
                        </button>
                        <button 
                          onClick={() => { navigate("/profile"); setShowUserMenu(false); }}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-slate-400 hover:text-white hover:bg-accent/10 rounded-xl transition-all"
                        >
                          <UserCircle className="w-4 h-4" />
                          <span>My Profile</span>
                        </button>
                        <div className="my-1 h-px bg-white/5" />
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>Logout</span>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-slate-400 hover:text-white font-medium text-sm transition-colors">
                  Sign In
                </Link>
                <Link to="/register" className="bg-slate-800 text-white hover:bg-slate-700 text-sm font-semibold py-2 px-6 rounded-full transition-all border border-slate-700">
                  Register
                </Link>
                <Link to="/worker-register" className="btn-primary text-sm py-2 px-6 rounded-full">
                  Become a Worker
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white p-2 focus:outline-none bg-slate-800/50 rounded-lg border border-white/10"
            >
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden glass border-t border-glass-border overflow-hidden mt-4 rounded-3xl mx-4 shadow-2xl"
          >
            <div className="px-4 pt-4 pb-8 space-y-2">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mb-2">Navigation</p>
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-4 py-3 text-lg font-medium text-slate-300 hover:text-accent hover:bg-white/5 rounded-2xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-4 mt-6 mb-2">Company</p>
              {secondaryLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className="block px-4 py-3 text-lg font-medium text-slate-300 hover:text-accent hover:bg-white/5 rounded-2xl transition-all"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}

              <div className="my-6 h-px bg-white/5 mx-4" />

              {isLoggedIn ? (
                <div className="space-y-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-3 px-4 py-4 text-lg font-medium text-slate-300 hover:text-accent hover:bg-white/5 rounded-2xl transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <LayoutDashboard className="w-5 h-5" />
                    <span>Dashboard</span>
                  </Link>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-3 px-4 py-4 text-lg font-medium text-slate-300 hover:text-accent hover:bg-white/5 rounded-2xl transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    <UserCircle className="w-5 h-5" />
                    <span>My Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="flex items-center space-x-3 w-full text-left px-4 py-4 text-lg font-medium text-red-500 hover:bg-red-500/5 rounded-2xl transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-4 pt-2">
                  <Link
                    to="/login"
                    className="block px-4 py-4 text-center text-lg font-medium text-slate-300 border border-white/10 rounded-2xl hover:bg-white/5 transition-all"
                    onClick={() => setIsOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="block px-4 py-4 text-center text-lg font-medium text-white bg-slate-800 rounded-2xl hover:bg-slate-700 transition-all shadow-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    Create Account
                  </Link>
                  <Link
                    to="/worker-register"
                    className="block w-full btn-primary text-center py-4 rounded-2xl shadow-xl shadow-orange-500/20"
                    onClick={() => setIsOpen(false)}
                  >
                    Become a Worker
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;