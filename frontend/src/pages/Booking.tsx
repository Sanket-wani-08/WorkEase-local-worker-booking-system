import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAppSelector } from "../hooks/storeHooks";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { bookingService } from "../services/booking.service";
import { workerService } from "../services/worker.service";
import { categoryService } from "../services/category.service";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  Calendar,
  Phone,
  MapPin,
  CreditCard,
  ChevronRight,
  CheckCircle2,
  Navigation,
  Map as MapIcon,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// use 3d marker url
const customIcon = L.icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
  iconSize: [45, 45],
  iconAnchor: [22, 45],
  popupAnchor: [0, -45],
});

const LocationMarker = ({
  position,
  setPosition,
  setAddress,
}: {
  position: [number, number];
  setPosition: (pos: [number, number]) => void;
  setAddress: (addr: string) => void;
}) => {
  const map = useMapEvents({
    click(e) {
      const newPos: [number, number] = [e.latlng.lat, e.latlng.lng];
      setPosition(newPos);
      map.flyTo(e.latlng, map.getZoom());
      setAddress(
        `Map Location: ${newPos[0].toFixed(4)}, ${newPos[1].toFixed(4)}`,
      );
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
};

// fix leaflet gray map issue
const MapRefresher = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 500); // wait for height animation to finish
  }, [map]);
  return null;
};

const CenterMap = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15);
    }
  }, [center, map]);
  return null;
};

const subcategoryPrices: Record<string, number> = {
  Electrician: 150,
  Plumber: 200,
  "AC Service": 450,
  Carpenter: 250,
  "Gas Repair": 200,
  "Sewage Cleaning": 600,
  "Deep Cleaning": 1800,
  "Pest Control": 900,
  "Maid Service": 250,
  "Cooking Help": 300,
  "Laundry / Ironing": 150,
  "General House Cleaning": 400,
  "Parcel Delivery": 60,
  "Grocery Pickup": 80,
  "Document Delivery": 60,
  "Emergency Item Pickup": 120,
  "Driver (with user's car)": 600,
  "Elder Care Support": 800,
  "Helper for Small Tasks": 200,
  "Home Visit Assistance": 400,
  "Tyre Puncture Repair": 100,
  "Battery Jump Start": 200,
  "Minor Car Breakdown Help": 400,
  "Emergency Fuel Support": 250,
  "Washing Machine Repair": 300,
  "Refrigerator Repair": 350,
  "TV Repair": 500,
  "Microwave Repair": 300,
  "Water Purifier Repair": 250,
  "Geyser Repair": 200,
};

import { yupResolver } from "@hookform/resolvers/yup";
import { bookingSchema } from "../utils/validationSchemas";

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isBroadcast = id === "broadcast";
  const categoryParam = searchParams.get("category");

  const [subcategories, setSubcategories] = useState<string[]>([]);
  const { isAuthenticated, role: reduxRole } = useAppSelector((state) => state.auth);

  const [worker, setWorker] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState("");
  const [gettingLocation, setGettingLocation] = useState(false);
  const [showMap, setShowMap] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: yupResolver(bookingSchema),
    defaultValues: {
      address: "",
      phone: "",
      bookingDate: "",
      paymentMethod: "COD",
      subcategory: "",
      totalAmount: 199,
    }
  });

  const watchAddress = watch("address");
  const watchSubcategory = watch("subcategory");
  const watchTotalAmount = watch("totalAmount");
  const watchPaymentMethod = watch("paymentMethod");
  const watchPhone = watch("phone");

  const [selectedLocation, setSelectedLocation] = useState<[number, number]>([
    23.0225, 72.5714,
  ]);

  const { data: workers = [] } = useQuery({
    queryKey: ["workers"],
    queryFn: () => workerService.searchWorkers({}),
    enabled: !isBroadcast,
  });

  const { data: keyRes } = useQuery({
    queryKey: ["razorpayKey"],
    queryFn: bookingService.getRazorpayKey,
  });

  const { data: catRes = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: categoryService.getCategories,
  });

  useEffect(() => {
    if (!isAuthenticated || reduxRole !== 'user') {
      alert("Please login as a user to book a worker");
      navigate("/login");
      return;
    }

    if (keyRes) {
      setRazorpayKey(keyRes.key);
    }

    if (catRes.length > 0) {
      if (!isBroadcast && workers.length > 0) {
        const foundWorker = workers.find((w: any) => w._id === id);
        setWorker(foundWorker);
        setValue("totalAmount", foundWorker?.price || 199);
        
        const workerCat = catRes.find((c: any) => c.name === foundWorker?.category);
        if (workerCat) setSubcategories(workerCat.subcategories || []);
      } else if (isBroadcast) {
        const price = subcategoryPrices[categoryParam || ""] || 199;
        setWorker({
          name: `All ${categoryParam} Experts`,
          category: categoryParam,
          price: price,
        });
        setValue("totalAmount", price);
        
        const cat = catRes.find((c: any) => c.name === categoryParam);
        if (cat) setSubcategories(cat.subcategories || []);
      }
    }
  }, [id, navigate, isBroadcast, categoryParam, keyRes, catRes, workers, isAuthenticated, reduxRole, setValue]);

  // Update totalAmount when subcategory changes
  useEffect(() => {
    if (watchSubcategory) {
      const newPrice =
        subcategoryPrices[watchSubcategory] ||
        subcategoryPrices[categoryParam || ""] ||
        199;
      setValue("totalAmount", newPrice);
    }
  }, [watchSubcategory, categoryParam, setValue]);

  // auto-geocoding
  useEffect(() => {
    if (
      !watchAddress ||
      watchAddress.length < 5 ||
      watchAddress === "Current GPS Location Detected"
    )
      return;

    const delayDebounceFn = setTimeout(async () => {
      try {
        // add user-agent as per nominatim usage policy
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(watchAddress)}&limit=1`,
          {
            headers: {
              "User-Agent": "WorkEase-App",
            },
          },
        );
        const data = await response.json();
        if (data && data.length > 0) {
          const { lat, lon } = data[0];
          const newPos: [number, number] = [parseFloat(lat), parseFloat(lon)];
          setSelectedLocation(newPos);
          if (!showMap) setShowMap(true);
        }
      } catch (error) {
        console.error("Geocoding error:", error);
      }
    }, 1200);

    return () => clearTimeout(delayDebounceFn);
  }, [watchAddress]);

  const handleGetCurrentLocation = useCallback(() => {
    setGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setSelectedLocation([latitude, longitude]);
        setValue("address", "Current GPS Location Detected");
        setGettingLocation(false);
        toast.success("Location captured!");
      },
      (err) => {
        console.error(err);
        setGettingLocation(false);
        toast.error("Failed to get location. Please enable GPS.");
      },
      { enableHighAccuracy: true },
    );
  }, [setValue]);
  const verifyPaymentMutation = useMutation({
    mutationFn: (data: { response: any, bookingId: string }) => bookingService.verifyPayment({
      ...data.response,
      bookingId: data.bookingId
    }),
    onSuccess: (_, variables) => {
      toast.success("Payment Successful!");
      setLoading(false);
      navigate(`/tracking/${variables.bookingId}`);
    },
    onError: (err: any) => {
      console.error(err);
      toast.error(err.response?.data?.message || "Payment verification failed");
      setLoading(false);
    }
  });

  const verifyPayment = useCallback(
    (response: any, bookingId: string) => {
      setLoading(true);
      verifyPaymentMutation.mutate({ response, bookingId });
    },
    [verifyPaymentMutation],
  );

  const bookingMutation = useMutation({
    mutationFn: bookingService.createBooking,
    onSuccess: (data) => {
      if (watchPaymentMethod === "COD") {
        toast.success("Booking successful!");
        setLoading(false);
        navigate(`/tracking/${data.booking._id}`);
        return;
      }

      // handle online payment
      const options = {
        key: razorpayKey,
        amount: data.order.amount,
        currency: "INR",
        name: "WorkEase",
        description: "Service Booking Payment",
        order_id: data.order.id,
        handler: function (response: any) {
          verifyPayment(response, data.booking._id);
        },
        prefill: {
          name: "User",
          contact: watchPhone,
        },
        theme: {
          color: "#3b82f6",
        },
        modal: {
          ondismiss: function() {
            setLoading(false);
            toast.error("Payment cancelled");
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    },
    onError: (err: any) => {
      setLoading(false);
      toast.error(err.response?.data?.message || "Booking failed");
    }
  });

  const onSubmit = useCallback((data: any) => {
    setLoading(true);

    bookingMutation.mutate({
      worker: isBroadcast ? null : id,
      ...data,
      service:
        data.subcategory ||
        categoryParam ||
        worker?.category ||
        "General Service",
      amount: data.totalAmount + 49, // price + visiting charge
      userLocation: {
        type: "Point",
        coordinates: [selectedLocation[1], selectedLocation[0]], // [lng, lat] format for geojson
      },
      category: categoryParam || worker?.category,
    });
  }, [isBroadcast, id, categoryParam, worker, selectedLocation, bookingMutation]);

  return (
    <div className="min-h-screen bg-primary">
      <Navbar />

      <div className="pt-32 pb-20 max-w-4xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Booking Summary */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Complete Your Booking
              </h1>
              <p className="text-slate-400">
                Fill in the details to confirm your professional service
                appointment.
              </p>
            </div>

            {worker && (
              <div className="card-premium border-accent/20 border">
                <h3 className="text-lg font-bold mb-4 flex items-center">
                  <CheckCircle2 className="w-5 h-5 text-accent mr-2" />
                  Service Summary
                </h3>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 rounded-xl bg-accent/20 flex items-center justify-center">
                    {isBroadcast ? (
                      <CheckCircle2 className="w-8 h-8 text-accent" />
                    ) : (
                      <img
                        src={
                          worker.profileImage ||
                          "https://images.unsplash.com/photo-1540339832862-4745591f2138"
                        }
                        className="w-full h-full rounded-xl object-cover"
                      />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-white">
                      {isBroadcast ? "Broadcast Request" : worker.name}
                    </h4>
                    <p className="text-sm text-accent uppercase tracking-wider font-bold">
                      {worker.category}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">
                      Service Charge ({watchSubcategory || "Base"})
                    </span>
                    <span className="text-white font-bold">
                      ₹{watchTotalAmount}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Visiting Charges</span>
                    <span className="text-white font-bold text-green-500">
                      ₹49
                    </span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-slate-800/50">
                    <span className="text-white font-bold">Total Amount</span>
                    <span className="text-accent font-extrabold text-xl">
                      ₹{(Number(watchTotalAmount) || 0) + 49}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-secondary/30 p-6 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-3 mb-4">
                <Navigation className="w-5 h-5 text-accent" />
                <h3 className="text-lg font-bold text-white">
                  Location Sharing
                </h3>
              </div>
              <p className="text-sm text-slate-400 mb-6">
                Sharing your precise location helps our experts reach you faster
                and ensures accurate real-time tracking.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={handleGetCurrentLocation}
                  disabled={gettingLocation}
                  className="flex items-center justify-center gap-2 bg-accent/10 hover:bg-accent/20 text-accent py-3 rounded-xl border border-accent/30 transition-all font-bold"
                >
                  {gettingLocation ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Navigation className="w-4 h-4" />
                  )}
                  {gettingLocation ? "Detecting..." : "Use Current Location"}
                </button>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="flex items-center justify-center gap-2 bg-secondary hover:bg-slate-800 text-white py-3 rounded-xl border border-slate-700 transition-all font-bold"
                >
                  <MapIcon className="w-4 h-4" />
                  {showMap ? "Hide Map Picker" : "Pick on Map"}
                </button>
              </div>
            </div>
          </motion.div>

          {/* Booking Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card-premium"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <AnimatePresence>
                {showMap && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 300 }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full rounded-2xl overflow-hidden border border-slate-800 mb-6"
                  >
                    <MapContainer
                      center={selectedLocation}
                      zoom={13}
                      style={{ height: "100%", width: "100%" }}
                    >
                      <TileLayer url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
                      <LocationMarker
                        position={selectedLocation}
                        setPosition={setSelectedLocation}
                        setAddress={(addr) =>
                          setValue("address", addr)
                        }
                      />
                      <MapRefresher />
                      <CenterMap center={selectedLocation} />
                    </MapContainer>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-2 text-accent" />
                  Select Specific Service
                </label>
                <select
                  required
                  className="input-modern appearance-none"
                  {...register("subcategory")}
                >
                  <option value="">-- Choose Type of Task --</option>
                  {subcategories.map((sub) => (
                    <option key={sub} value={sub}>
                      {sub}
                    </option>
                  ))}
                  <option value="Other / General">Other / General</option>
                </select>
                {errors.subcategory && <p className="text-xs text-red-500">{errors.subcategory.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <MapPin className="w-4 h-4 mr-2 text-accent" />
                  Service Address
                </label>
                <input
                  type="text"
                  placeholder="Street, Landmark, City"
                  required
                  className="input-modern"
                  {...register("address")}
                />
                {errors.address && <p className="text-xs text-red-500">{errors.address.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <Phone className="w-4 h-4 mr-2 text-accent" />
                  Contact Number
                </label>
                <input
                  type="tel"
                  placeholder="10-digit phone number"
                  required
                  className="input-modern"
                  {...register("phone")}
                />
                {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <Calendar className="w-4 h-4 mr-2 text-accent" />
                  Preferred Date
                </label>
                <input
                  type="date"
                  required
                  className="input-modern"
                  {...register("bookingDate")}
                />
                {errors.bookingDate && <p className="text-xs text-red-500">{errors.bookingDate.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300 flex items-center">
                  <CreditCard className="w-4 h-4 mr-2 text-accent" />
                  Payment Method
                </label>
                <select
                  className="input-modern appearance-none"
                  {...register("paymentMethod")}
                >
                  <option value="COD">Cash After Service</option>
                  <option value="ONLINE">Online Payment (Razorpay)</option>
                </select>
                {errors.paymentMethod && <p className="text-xs text-red-500">{errors.paymentMethod.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center space-x-2 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? "Processing..." : "Confirm & Pay"}</span>
                {!loading && <ChevronRight className="w-5 h-5" />}
              </button>

              <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest">
                Secure 256-bit SSL encrypted booking
              </p>
            </form>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Booking;
