import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import socket from "../socket/socket";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Users, Briefcase, CalendarCheck, TrendingUp, IndianRupee,
  Loader2, CheckCircle2, Clock, XCircle, ChevronRight, Star, X, Plus, Layers, Trash2, MessageSquare,
  ShieldCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import ChatModal from "../components/ChatModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [role, setRole] = useState<"worker" | "user" | "admin" | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [userName, setUserName] = useState("User");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeChatBookingId, setActiveChatBookingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [pendingWorkers, setPendingWorkers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState({ name: "", subcategories: "" });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [editCategoryForm, setEditCategoryForm] = useState({ name: "", subcategories: "" });
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [selectedIdImage, setSelectedIdImage] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const userToken = localStorage.getItem("userToken");
        const workerToken = localStorage.getItem("workerToken");

        if (!userToken && !workerToken) {
          navigate("/login");
          return;
        }

        const profileRes = await API.get(workerToken && !userToken ? "/workers/me" : "/user/me");
        setCurrentUserId(profileRes.data._id);
        setUserName(profileRes.data.name || "User");

        const detectedRole = profileRes.data.role || (workerToken ? "worker" : "user");
        setRole(detectedRole);

        if (detectedRole === "admin") {
          const fetchItems = async (url: string, setter: (data: any) => void) => {
            try {
              const res = await API.get(url);
              setter(res.data);
            } catch (err) {
              console.error(`Error fetching ${url}:`, err);
            }
          };

          await Promise.all([
            fetchItems("/dashboard/stats", (data) => setStats((prev: any) => ({ ...(prev || {}), ...data }))),
            fetchItems("/dashboard/advanced", (data) => setStats((prev: any) => ({ ...(prev || {}), ...data }))),
            fetchItems("/workers/pending", setPendingWorkers),
            fetchItems("/bookings/all", setBookings),
            fetchItems("/categories", setCategories)
          ]);
        } else if (detectedRole === "worker") {
          const [bookingsRes, statsRes] = await Promise.all([
            API.get("/bookings/worker-bookings").catch(() => ({ data: [] })),
            API.get("/workers/stats").catch(() => ({ data: null }))
          ]);
          setBookings(bookingsRes.data);
          setStats(statsRes.data);
        } else {
          const res = await API.get("/bookings/my-bookings").catch(() => ({ data: [] }));
          setBookings(res.data);
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        toast.error("Failed to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const handleWorkerAction = async (id: string, action: "verify" | "reject") => {
    try {
      if (action === "verify") {
        await API.put(`/workers/verify/${id}`);
        toast.success("Worker approved successfully");
      } else {
        const reason = window.prompt("Enter rejection reason:", "Profile information is incomplete or invalid");
        if (reason === null) return; // cancelled by user

        await API.put(`/workers/reject/${id}`, { reason });
        toast.success("Worker rejected successfully");
      }
      setPendingWorkers(prev => prev.filter(w => w._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to update worker status");
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingCategory(true);
    try {
      const subArr = newCategory.subcategories.split(",").map(s => s.trim()).filter(s => s);
      const res = await API.post("/categories", { name: newCategory.name, subcategories: subArr });
      setCategories([...categories, res.data]);
      setNewCategory({ name: "", subcategories: "" });
      toast.success("Category added successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    try {
      const subArr = editCategoryForm.subcategories.split(",").map(s => s.trim()).filter(s => s);
      const res = await API.put(`/categories/${id}`, { name: editCategoryForm.name, subcategories: subArr });
      setCategories(prev => prev.map(c => c._id === id ? res.data.category : c));
      setEditingCategoryId(null);
      toast.success("Category updated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      setCategories(prev => prev.filter(c => c._id !== id));
      toast.success("Category deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete category");
    }
  };

  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await API.put(`/bookings/${id}/status`, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      toast.success(`Booking ${status}`);

      // notify other users about status change
      socket.emit("update-status", { bookingId: id, status });

      // navigate to tracking page on accept
      if (status === "Accepted" && role === "worker") {
        navigate(`/tracking/${id}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update booking status");
    }
  };

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;
    try {
      await API.put(`/bookings/${id}/cancel`);
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status: "Cancelled" } : b));
      toast.success("Booking cancelled");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel booking");
    }
  };

  const updatePaymentStatus = async (id: string, paymentStatus: string) => {
    try {
      await API.put(`/bookings/${id}/payment`, { paymentStatus });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, paymentStatus } : b));
      toast.success(`Payment marked as ${paymentStatus}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to update payment status");
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await API.post("/reviews", {
        bookingId: selectedBookingForReview._id,
        worker: selectedBookingForReview.worker?._id,
        rating: reviewForm.rating,
        comment: reviewForm.comment
      });
      setBookings(prev => prev.map(b => b._id === selectedBookingForReview._id ? { ...b, isReviewed: true } : b));
      toast.success("Review submitted!");
      setSelectedBookingForReview(null);
      setReviewForm({ rating: 5, comment: "" });
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
    }
  };


  const StatusIcon = ({ status }: { status: string }) => {
    switch (status) {
      case "Pending": return <Clock className="w-5 h-5 text-yellow-500" />;
      case "Completed": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "Cancelled": return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <CalendarCheck className="w-5 h-5 text-accent" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-accent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex flex-col">
      <Navbar />

      <div className="flex-1 pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 rounded-full bg-accent/20 text-accent text-[10px] font-black uppercase tracking-[0.2em] border border-accent/30">
                {role === "admin" ? "Admin Control" : role === "worker" ? "Expert Portal" : "User Dashboard"}
              </span>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-500 uppercase tracking-tighter">Live Sync</span>
              </div>
            </div>
            <h1 className="text-5xl font-black text-white tracking-tighter">
              {role === "admin" ? "Platform Control" : "Workspace"}
            </h1>
            <p className="text-slate-400 font-medium mt-2">Welcome back, {userName}. Monitoring performance in real-time.</p>
          </div>

          {role === "admin" && (
            <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-2xl border border-slate-800">
              <div className="px-4 py-2 text-center border-r border-slate-800">
                <p className="text-[10px] font-bold text-slate-500 uppercase">System Status</p>
                <p className="text-xs font-black text-green-500 uppercase tracking-wider">Optimal</p>
              </div>
              <div className="px-4 py-2 text-center">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Active Sessions</p>
                <p className="text-xs font-black text-white">42 Online</p>
              </div>
            </div>
          )}
        </div>

        {/* STATS CARDS */}
        {role === "admin" && stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-6">
              <div className="card-premium group hover:border-accent/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-accent/10 rounded-2xl text-accent group-hover:bg-accent group-hover:text-white transition-colors">
                    <Users className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Users</p>
                <h3 className="text-3xl font-black text-white">{stats.totalUsers || 0}</h3>
              </div>
              <div className="card-premium group hover:border-blue-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                    <Briefcase className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Verified Experts</p>
                <h3 className="text-3xl font-black text-white">{stats.totalWorkers || 0}</h3>
              </div>
              <div className="card-premium group hover:border-purple-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
                <h3 className="text-3xl font-black text-white">{stats.totalBookings || 0}</h3>
              </div>
              <div className="card-premium group hover:border-green-500/50 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-green-500/10 rounded-2xl text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Gross Revenue</p>
                <h3 className="text-3xl font-black text-white">₹{stats.totalRevenue?.toLocaleString() || 0}</h3>
              </div>
              <div className="card-premium group hover:border-orange-500/50 transition-all border-accent/30">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-orange-500/10 rounded-2xl text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                </div>
                <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Platform Fee (15%)</p>
                <h3 className="text-3xl font-black text-white">₹{stats.totalCommission?.toLocaleString() || 0}</h3>
              </div>
            </div>

            {/* Bookings By Status (Advanced Stats) */}
            {stats.bookingsByStatus && stats.bookingsByStatus.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-6">
                {stats.bookingsByStatus.map((statusItem: any, idx: number) => (
                  <div key={idx} className={`card-premium border-l-4 ${statusItem._id === 'Completed' ? 'border-green-500' :
                    statusItem._id === 'Pending' ? 'border-yellow-500' :
                      statusItem._id === 'Cancelled' ? 'border-red-500' :
                        statusItem._id === 'Accepted' ? 'border-blue-500' : 'border-slate-500'
                    }`}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-1">Status: {statusItem._id}</p>
                    <div className="flex items-end justify-between">
                      <h3 className="text-4xl font-black text-white">{statusItem.count}</h3>
                      {statusItem._id === 'Completed' && <CheckCircle2 className="w-8 h-8 text-green-500/20" />}
                      {statusItem._id === 'Pending' && <Clock className="w-8 h-8 text-yellow-500/20" />}
                      {statusItem._id === 'Cancelled' && <XCircle className="w-8 h-8 text-red-500/20" />}
                      {statusItem._id === 'Accepted' && <Briefcase className="w-8 h-8 text-blue-500/20" />}
                    </div>
                  </div>
                ))}
              </div>
            )}


          </>
        )}

        {/* WORKER VERIFICATION (ADMIN ONLY) */}
        {role === "admin" && pendingWorkers.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-accent" />
              Pending Verifications
              <span className="ml-2 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-xs font-bold">{pendingWorkers.length}</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingWorkers.map((worker) => (
                <motion.div
                  key={worker._id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card-premium border border-accent/20 flex flex-col sm:flex-row items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={worker.profileImage || "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"}
                      className="w-12 h-12 rounded-xl object-cover"
                      alt={worker.name}
                    />
                    <div>
                      <h3 className="text-white font-bold">{worker.name}</h3>
                      <p className="text-xs text-accent font-bold uppercase tracking-widest">{worker.category}</p>
                      <p className="text-xs text-slate-400 mt-1">Aadhaar: {worker.aadhaarNumber} • Exp: {worker.experience} yrs</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {worker.aadhaarImage && (
                      <button
                        onClick={() => {
                          const imageUrl = worker.aadhaarImage.startsWith("http")
                            ? worker.aadhaarImage
                            : `http://localhost:5000${worker.aadhaarImage}`;
                          setSelectedIdImage(imageUrl);
                        }}
                        className="px-4 py-2 bg-accent/20 text-accent hover:bg-accent/30 rounded-lg text-sm font-medium transition-colors"
                      >
                        View ID
                      </button>
                    )}
                    <button
                      onClick={() => handleWorkerAction(worker._id, "verify")}
                      className="px-4 py-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleWorkerAction(worker._id, "reject")}
                      className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* CATEGORY MANAGEMENT (ADMIN ONLY) */}
        {role === "admin" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Layers className="w-6 h-6 text-accent" />
              Manage Categories
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <div className="card-premium h-full">
                  <h3 className="text-lg font-bold text-white mb-4">Add New Category</h3>
                  <form onSubmit={handleAddCategory} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Category Name</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Home Cleaning"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                        className="input-premium w-full text-sm py-2 px-3"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase mb-2">Subcategories (Comma Separated)</label>
                      <textarea
                        required
                        rows={3}
                        placeholder="e.g. Deep Cleaning, Sofa Cleaning, Bathroom Cleaning"
                        value={newCategory.subcategories}
                        onChange={(e) => setNewCategory({ ...newCategory, subcategories: e.target.value })}
                        className="input-premium w-full text-sm py-2 px-3 resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isAddingCategory}
                      className="w-full btn-primary py-2.5 text-sm flex items-center justify-center gap-2"
                    >
                      {isAddingCategory ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Category
                    </button>
                  </form>
                </div>
              </div>

              <div className="lg:col-span-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {categories.map((category) => (
                    <div key={category._id} className="card-premium border border-slate-800/50 p-5 relative group">
                      {editingCategoryId === category._id ? (
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={editCategoryForm.name}
                            onChange={(e) => setEditCategoryForm({ ...editCategoryForm, name: e.target.value })}
                            className="input-premium w-full text-sm py-1.5 px-3"
                          />
                          <textarea
                            rows={2}
                            value={editCategoryForm.subcategories}
                            onChange={(e) => setEditCategoryForm({ ...editCategoryForm, subcategories: e.target.value })}
                            className="input-premium w-full text-sm py-1.5 px-3 resize-none"
                          />
                          <div className="flex gap-2 justify-end mt-2">
                            <button
                              onClick={() => setEditingCategoryId(null)}
                              className="px-3 py-1 bg-slate-800 text-slate-300 hover:text-white rounded text-xs font-medium"
                            >Cancel</button>
                            <button
                              onClick={() => handleUpdateCategory(category._id)}
                              className="px-3 py-1 bg-accent text-white rounded text-xs font-medium"
                            >Save</button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                            <button
                              onClick={() => {
                                setEditingCategoryId(category._id);
                                setEditCategoryForm({
                                  name: category.name,
                                  subcategories: category.subcategories.join(", ")
                                });
                              }}
                              className="text-xs font-bold text-slate-400 hover:text-accent px-2 py-1"
                            >
                              EDIT
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category._id)}
                              className="text-slate-400 hover:text-red-500 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <h4 className="text-lg font-bold text-white mb-3 text-accent pr-16">{category.name}</h4>
                          <div className="flex flex-wrap gap-2">
                            {category.subcategories.map((sub: string, index: number) => (
                              <span key={index} className="px-2.5 py-1 rounded-md bg-secondary/80 text-xs font-medium text-slate-300 border border-slate-700/50">
                                {sub}
                              </span>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* GLOBAL BOOKING HISTORY (ADMIN ONLY) */}
        {role === "admin" && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <CalendarCheck className="w-6 h-6 text-accent" />
              Global Booking History
            </h2>
            <div className="overflow-x-auto card-premium p-0 border border-slate-800">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-secondary/50 border-b border-slate-800">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Service</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Customer</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Expert</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {bookings.map((booking: any) => (
                    <tr key={booking._id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <p className="text-white font-bold text-sm">{booking.service}</p>
                        <p className="text-[10px] text-slate-500 font-medium">ID: {booking._id.slice(-6).toUpperCase()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-medium text-sm">{booking.user?.name || "N/A"}</p>
                        <p className="text-[10px] text-slate-500">{booking.phone}</p>
                      </td>
                      <td className="px-6 py-4">
                        {booking.worker ? (
                          <>
                            <p className="text-accent font-medium text-sm">{booking.worker.name}</p>
                            <p className="text-[10px] text-slate-500">{booking.worker.category}</p>
                          </>
                        ) : (
                          <span className="text-slate-600 italic text-xs">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-300 text-sm">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-bold text-sm">₹{booking.amount}</p>
                        <p className={`text-[10px] font-bold ${booking.paymentStatus === 'PAID' ? 'text-green-500' : 'text-accent'}`}>{booking.paymentStatus}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter
                          ${booking.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                            booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                              booking.status === 'Cancelled' ? 'bg-red-500/20 text-red-500' :
                                'bg-slate-500/20 text-slate-400'}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <div className="py-20 text-center">
                  <p className="text-slate-500 font-medium">No booking history found.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* USER STATS (ONLY FOR ROLE === 'USER') */}
        {role === "user" && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="card-premium border-l-4 border-blue-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500">
                    <Clock className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Active Bookings</p>
                    <h3 className="text-2xl font-black text-white">
                      {bookings.filter(b => b.status === "Pending" || b.status === "Accepted").length}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="card-premium border-l-4 border-green-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Completed</p>
                    <h3 className="text-2xl font-black text-white">
                      {bookings.filter(b => b.status === "Completed").length}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="card-premium border-l-4 border-accent">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-accent/10 rounded-xl text-accent">
                    <IndianRupee className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Spent</p>
                    <h3 className="text-2xl font-black text-white">
                      ₹{bookings.filter(b => b.paymentStatus === "PAID").reduce((acc, b) => acc + b.amount, 0).toLocaleString()}
                    </h3>
                  </div>
                </div>
              </div>
              <div className="card-premium border-l-4 border-slate-500">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-500/10 rounded-xl text-slate-400">
                    <CalendarCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase">Total Bookings</p>
                    <h3 className="text-2xl font-black text-white">{bookings.length}</h3>
                  </div>
                </div>
              </div>
            </div>

            {/* FAST ACTIONS */}
            <div className="mb-12">
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Fast Actions</h2>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/services")}
                  className="flex items-center gap-3 px-6 py-4 bg-accent text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-lg shadow-accent/20"
                >
                  <Plus className="w-5 h-5" /> Book New Service
                </button>
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center gap-3 px-6 py-4 bg-secondary border border-slate-800 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                >
                  <Users className="w-5 h-5" /> Manage Profile
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="flex items-center gap-3 px-6 py-4 bg-secondary border border-slate-800 text-white rounded-2xl font-bold hover:bg-slate-800 transition-colors"
                >
                  <ShieldCheck className="w-5 h-5" /> Get Support
                </button>
              </div>
            </div>
          </>
        )}
        {/* WORKER STATS (ONLY FOR ROLE === 'WORKER') */}
        {role === "worker" && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="card-premium border-l-4 border-accent">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-accent/10 rounded-xl text-accent">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Total Earnings</p>
                  <h3 className="text-2xl font-black text-white">₹{stats.totalEarnings?.toLocaleString() || 0}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">Net after 15% fee</p>
                </div>
              </div>
            </div>
            <div className="card-premium border-l-4 border-yellow-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-xl text-yellow-500">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Pending Jobs</p>
                  <h3 className="text-2xl font-black text-white">{stats.pendingBookings || 0}</h3>
                </div>
              </div>
            </div>
            <div className="card-premium border-l-4 border-green-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-xl text-green-500">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Completed</p>
                  <h3 className="text-2xl font-black text-white">{stats.completedBookings || 0}</h3>
                </div>
              </div>
            </div>
            <div className="card-premium border-l-4 border-orange-500">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 rounded-xl text-orange-500">
                  <Star className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase">Rating</p>
                  <h3 className="text-2xl font-black text-white">{stats.rating?.toFixed(1) || "5.0"}</h3>
                  <p className="text-[10px] text-slate-500 mt-1">from {stats.totalReviews || 0} reviews</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BOOKINGS LIST (ONLY FOR USERS AND WORKERS) */}
        {role !== "admin" && (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-20 bg-secondary/30 rounded-3xl border border-slate-800">
                <CalendarCheck className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">No bookings yet</h3>
                <p className="text-slate-400">When you have bookings, they will appear here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking: any) => (
                  <motion.div
                    key={booking._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-premium flex flex-col md:flex-row md:items-center justify-between gap-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="bg-secondary p-3 rounded-xl">
                        <StatusIcon status={booking.status} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-bold text-white">{booking.service}</h3>
                          {booking.isBroadcast && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30 uppercase tracking-tighter">
                              {booking.worker ? "Broadcast" : "New Request"}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-400 flex items-center gap-2">
                          <CalendarCheck className="w-4 h-4" />
                          {new Date(booking.bookingDate).toLocaleDateString()}
                          <span className="mx-2">•</span>
                          <IndianRupee className="w-4 h-4" />
                          ₹{booking.amount}
                        </p>
                        <div className="mt-3 text-sm text-slate-300">
                          <p><span className="text-slate-500">Location:</span> {booking.address}</p>
                          {role === "worker" && booking.user && (
                            <p><span className="text-slate-500">Customer:</span> {booking.user.name} ({booking.phone})</p>
                          )}
                          {role === "user" && booking.worker && (
                            <p><span className="text-slate-500">Worker:</span> {booking.worker.name} ({booking.worker.phone || "N/A"})</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:items-end gap-3 border-t md:border-t-0 border-slate-800 pt-4 md:pt-0">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                        ${booking.status === 'Completed' ? 'bg-green-500/20 text-green-500' :
                          booking.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-500' :
                            'bg-slate-500/20 text-slate-400'}`}
                      >
                        {booking.status}
                      </div>
                      <div className="text-sm font-medium text-slate-400 uppercase">
                        Payment: <span className={booking.paymentStatus === 'PAID' ? 'text-green-500' : 'text-accent'}>{booking.paymentStatus}</span>
                      </div>

                      {role === "worker" && booking.status !== "Cancelled" && (
                        <div className="flex gap-2 mt-2">
                          {booking.status === "Pending" && (
                            <button
                              onClick={() => updateBookingStatus(booking._id, "Accepted")}
                              className="px-4 py-2 bg-accent text-white hover:bg-orange-600 rounded-lg text-sm font-black transition-all shadow-lg shadow-accent/20 animate-pulse"
                            >
                              Accept Job
                            </button>
                          )}
                          {booking.status !== "Completed" && booking.status !== "Cancelled" && (
                            <button
                              onClick={() => updateBookingStatus(booking._id, "Cancelled")}
                              className="px-4 py-2 bg-red-500/20 text-red-500 hover:bg-red-500/30 rounded-lg text-sm font-medium transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          {booking.status !== "Completed" && booking.status !== "Cancelled" && (
                            <button
                              onClick={() => updateBookingStatus(booking._id, "Completed")}
                              className="px-4 py-2 bg-green-500/20 text-green-500 hover:bg-green-500/30 rounded-lg text-sm font-medium transition-colors"
                            >
                              Mark Done
                            </button>
                          )}
                          {booking.status === "Completed" && booking.paymentStatus === "PENDING" && (
                            <button
                              onClick={() => updatePaymentStatus(booking._id, "PAID")}
                              className="px-4 py-2 bg-green-500 text-white hover:bg-green-600 rounded-lg text-sm font-black transition-all shadow-lg shadow-green-500/20"
                            >
                              Confirm Payment
                            </button>
                          )}
                        </div>
                      )}

                      <div className="flex gap-4 mt-2">
                        <button
                          onClick={() => navigate(`/tracking/${booking._id}`)}
                          className="flex items-center text-sm font-medium text-accent hover:text-white transition-colors"
                        >
                          View Details <ChevronRight className="w-4 h-4 ml-1" />
                        </button>

                        {role === "user" && booking.status === "Completed" && !booking.isReviewed && (
                          <button
                            onClick={() => setSelectedBookingForReview(booking)}
                            className="flex items-center text-sm font-medium text-yellow-500 hover:text-yellow-400 transition-colors"
                          >
                            <Star className="w-4 h-4 mr-1" /> Rate Service
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setActiveChatBookingId(booking._id);
                            setIsChatOpen(true);
                          }}
                          className="flex items-center text-sm font-medium text-blue-500 hover:text-blue-400 transition-colors"
                        >
                          <MessageSquare className="w-4 h-4 mr-1" /> Chat
                        </button>

                        {role === "user" && booking.status !== "Cancelled" && booking.status !== "Completed" && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="flex items-center text-sm font-medium text-red-500 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4 mr-1" /> Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {selectedBookingForReview && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="card-premium w-full max-w-md p-8"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-white">Rate Service</h3>
                <button onClick={() => setSelectedBookingForReview(null)} className="text-slate-400 hover:text-white">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Rating</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                        className={`w-8 h-8 cursor-pointer transition-all ${star <= reviewForm.rating ? "text-yellow-500 fill-current" : "text-slate-700"
                          }`}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-400 mb-2 uppercase tracking-wider">Your Feedback</label>
                  <textarea
                    required
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="Tell others about your experience..."
                    className="input-premium w-full resize-none"
                  />
                </div>

                <button type="submit" className="btn-primary w-full py-3 text-lg">
                  Submit Review
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isChatOpen && activeChatBookingId && currentUserId && (
          <ChatModal
            bookingId={activeChatBookingId}
            isOpen={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            currentUserId={currentUserId}
            role={role === "worker" ? "Worker" : "User"}
          />
        )}
      </AnimatePresence>

      {/* ID IMAGE MODAL */}
      <AnimatePresence>
        {selectedIdImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-primary/90 backdrop-blur-md"
            onClick={() => setSelectedIdImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-4xl w-full"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedIdImage(null)}
                className="absolute -top-12 right-0 text-white hover:text-accent flex items-center gap-2 font-bold"
              >
                <X className="w-6 h-6" /> Close Preview
              </button>
              <div className="card-premium p-2 overflow-hidden border border-white/10">
                <img
                  src={selectedIdImage}
                  alt="Aadhaar Card"
                  className="w-full h-auto max-h-[80vh] object-contain rounded-xl"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x400?text=ID+Image+Not+Found";
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

export default Dashboard;
