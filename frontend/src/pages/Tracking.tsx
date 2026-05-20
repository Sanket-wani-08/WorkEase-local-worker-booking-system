import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import socket from "../socket/socket";
import { Navigation, Clock, Shield, ArrowLeft, Phone, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import Navbar from "../components/Navbar";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ChatModal from "../components/ChatModal";
import API from "../api/axios";
import toast from "react-hot-toast";

// map marker icons
const workerIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/4140/4140037.png",
    iconSize: [60, 60],
    iconAnchor: [30, 60]
});

const userIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/9131/9131529.png",
    iconSize: [55, 55],
    iconAnchor: [27, 55]
});

// recenters map when position changes
const RecenterMap = ({ center }: { center: [number, number] }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView(center, map.getZoom());
        }
    }, [center, map]);
    return null;
};

const Tracking = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [workerLocation, setWorkerLocation] = useState<[number, number] | null>(null);
    const workerLocRef = useRef<[number, number] | null>(null);
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
    const [route, setRoute] = useState<[number, number][]>([]);
    const [eta, setEta] = useState("Awaiting Expert...");
    const [distance, setDistance] = useState("Pending...");
    const [isWorker, setIsWorker] = useState(false);
    const [isSharing, setIsSharing] = useState(false);
    const [watchId, setWatchId] = useState<number | null>(null);
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [bookingData, setBookingData] = useState<any>(null);
    const [lastSocketLocation, setLastSocketLocation] = useState<[number, number] | null>(null);


    const fetchBooking = useCallback(async () => {
        try {
            const res = await API.get(`/bookings/${id}`);
            setBookingData(res.data);

            if (res.data.worker && res.data.worker.location) {
                const [lng, lat] = res.data.worker.location.coordinates;
                if (lat && lng) {
                    setWorkerLocation([lat, lng]);
                }
            }
        } catch (err) {
            console.error("Failed to fetch booking details:", err);
        }
    }, [id]);

    useEffect(() => {
        if (id) fetchBooking();
    }, [id, fetchBooking]);

    // figure out if current user is the worker or customer
    useEffect(() => {
        const workerId = localStorage.getItem("workerId");
        const userId = localStorage.getItem("userId");

        if (bookingData) {
            if (workerId && bookingData.worker?._id === workerId) {
                setIsWorker(true);
                setCurrentUserId(workerId);
            } else {
                setIsWorker(false);
                setCurrentUserId(userId || "");
            }
        }
    }, [bookingData]);

    // get user location from booking or fallback to GPS
    useEffect(() => {
        if (bookingData?.userLocation?.coordinates) {
            const [lng, lat] = bookingData.userLocation.coordinates;

            if (lat !== 0 && lng !== 0) {
                setUserLocation([lat, lng]);
                return;
            }
        }
        
        // fallback to GPS if no location in booking
        if (!bookingData) return;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setUserLocation([pos.coords.latitude, pos.coords.longitude]);
            },
            () => {
                console.warn("GPS Access denied, using default center");
                setUserLocation([23.0225, 72.5714]);
            }
        );
    }, [bookingData]);

    // socket listeners
    useEffect(() => {
        if (!id) return;

        socket.emit("join-booking", id);

        socket.on("receive-location", (data: any) => {
            setLastSocketLocation([data.lat, data.lng]);
            smoothMove(data.lat, data.lng);
        });


        socket.on("status-updated", ({ status }) => {
            if (status === "Completed") {
                toast.success("Job completed! Redirecting...");
                setTimeout(() => navigate("/dashboard"), 3000);
            } else if (status === "Cancelled") {
                toast.error("Booking has been cancelled.");
                setTimeout(() => navigate("/dashboard"), 3000);
            } else if (status === "Accepted") {

                fetchBooking();
            }
        });

        return () => {
            socket.off("receive-location");
            socket.off("status-updated");
        };
    }, [id, navigate, fetchBooking]);


    useEffect(() => {
        workerLocRef.current = workerLocation;
    }, [workerLocation]);

    // animate marker movement between positions
    const smoothMove = (lat: number, lng: number) => {
        if (!workerLocRef.current) {
            setWorkerLocation([lat, lng]);
            return;
        }
        let steps = 20;
        let currentLat = workerLocRef.current[0];
        let currentLng = workerLocRef.current[1];

        const latStep = (lat - currentLat) / steps;
        const lngStep = (lng - currentLng) / steps;

        let i = 0;

        const interval = setInterval(() => {
            currentLat += latStep;
            currentLng += lngStep;

            setWorkerLocation([currentLat, currentLng]);

            i++;
            if (i >= steps) clearInterval(interval);
        }, 50);
    };

    // fetch route and ETA from OSRM
    useEffect(() => {
        const targetLoc = lastSocketLocation || workerLocation;
        if (!userLocation || !targetLoc) return;

        const fetchRoute = async () => {
            try {

                const response = await fetch(
                    `https://router.project-osrm.org/route/v1/driving/${targetLoc[1]},${targetLoc[0]};${userLocation[1]},${userLocation[0]}?overview=full&geometries=geojson`
                );
                const data = await response.json();

                if (data.routes && data.routes.length > 0) {
                    const routeData = data.routes[0];
                    const coordinates = routeData.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
                    setRoute(coordinates);

                    const distKm = (routeData.distance / 1000).toFixed(1);
                    setDistance(`${distKm} km`);

                    const durMin = Math.round(routeData.duration / 60);
                    setEta(`${durMin} mins`);
                }
            } catch (error) {
                console.error("OSRM Route error:", error);
            }
        };

        fetchRoute();
    }, [lastSocketLocation, userLocation, bookingData]);

    // worker location sharing
    const startSharing = () => {
        if (watchId !== null) return;
        
        const id_ = navigator.geolocation.watchPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setWorkerLocation([latitude, longitude]);
                socket.emit("send-location", {
                    bookingId: id,
                    lat: latitude,
                    lng: longitude
                });
            },
            (err) => console.error(err),
            { enableHighAccuracy: true }
        );
        setWatchId(id_);
        setIsSharing(true);
    };

    const stopSharing = () => {
        if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        setWatchId(null);
        setIsSharing(false);
    };

    const toggleSharing = () => {
        if (isSharing) {
            stopSharing();
        } else {
            startSharing();
        }
    };

    // auto-start sharing when job is accepted
    useEffect(() => {
        if (isWorker && bookingData?.status === "Accepted" && !isSharing) {
            startSharing();
        }
    }, [isWorker, bookingData]);


    useEffect(() => {
        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [watchId]);

    return (
        <div className="relative min-h-screen bg-primary overflow-hidden">
            <Navbar />
            
            {/* Back Button */}
            <Link to="/" className="absolute top-24 left-6 z-[1000] glass p-3 rounded-full hover:bg-accent transition-all group">
                <ArrowLeft className="w-6 h-6 text-white group-hover:scale-110" />
            </Link>

            {/* Tracking Card */}
            <div className="absolute top-24 right-6 z-[1000] w-full max-w-sm px-4 sm:px-0">
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="card-premium border-accent/20 border-2"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Live Tracking</span>
                        </div>
                        <Shield className="w-5 h-5 text-accent" />
                    </div>

                    <div className="flex items-center space-x-4 mb-8">
                        <img 
                            src={bookingData?.worker?.profileImage || "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"} 
                            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-accent/30" 
                            alt="Worker"
                        />
                        <div>
                            <h3 className="text-xl font-extrabold text-white">
                                {bookingData?.worker?.name || "Expert"} Is En Route
                            </h3>
                            <p className="text-sm text-slate-400 capitalize">{bookingData?.service || "Service"} Expert</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-secondary/50 p-4 rounded-xl border border-slate-800">
                            <div className="flex items-center text-accent mb-1">
                                <Clock className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">ETA</span>
                            </div>
                            <div className="text-xl font-black text-white">{eta}</div>
                        </div>
                        <div className="bg-secondary/50 p-4 rounded-xl border border-slate-800">
                            <div className="flex items-center text-blue-400 mb-1">
                                <Navigation className="w-4 h-4 mr-2" />
                                <span className="text-[10px] font-bold uppercase tracking-tighter">Distance</span>
                            </div>
                            <div className="text-xl font-black text-white">{distance}</div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {isWorker ? (
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => alert(`Customer's Phone: ${bookingData?.phone || bookingData?.user?.phone || "Not available"}`)}
                                    className="flex-1 bg-secondary hover:bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center transition-all border border-slate-700"
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call Customer
                                </button>
                                <button 
                                    onClick={() => setIsChatOpen(true)}
                                    className="flex-1 bg-secondary hover:bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center transition-all border border-slate-700"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Chat
                                </button>
                                <button 
                                    onClick={toggleSharing}
                                    className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center transition-all ${
                                        isSharing ? "bg-red-500/20 text-red-500 border border-red-500/50" : "btn-primary"
                                    }`}
                                >
                                    <Navigation className={`w-4 h-4 mr-2 ${isSharing ? "animate-pulse" : ""}`} />
                                    {isSharing ? "Stop Sharing" : "Start Location"}
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-3 w-full">
                                <button 
                                    onClick={() => alert(`Worker's Phone: ${bookingData?.worker?.phone || "Not available"}`)}
                                    className="flex-1 bg-secondary hover:bg-slate-800 text-white py-3 rounded-xl font-bold flex items-center justify-center transition-all border border-slate-700"
                                >
                                    <Phone className="w-4 h-4 mr-2" />
                                    Call
                                </button>
                                <button 
                                    onClick={() => setIsChatOpen(true)}
                                    className="flex-1 btn-primary py-3 flex items-center justify-center"
                                >
                                    <MessageSquare className="w-4 h-4 mr-2" />
                                    Chat
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>

            {/* Chat Modal */}
            {id && currentUserId && (
                <ChatModal 
                    bookingId={id} 
                    isOpen={isChatOpen} 
                    onClose={() => setIsChatOpen(false)} 
                    currentUserId={currentUserId}
                    role={isWorker ? "Worker" : "User"}
                />
            )}

            {/* Map Container */}
            <div className="w-full h-screen z-0">
                <MapContainer 
                    center={workerLocation || userLocation || [23.0225, 72.5714]} 
                    zoom={15} 
                    style={{ height: "100%", width: "100%", background: "#020617" }}
                    zoomControl={false}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    />
                    
                    {workerLocation && <RecenterMap center={workerLocation} />}

                    {workerLocation && <Marker position={workerLocation} icon={workerIcon} />}

                    {userLocation && (
                        <Marker position={userLocation} icon={userIcon} />
                    )}

                    {route.length > 0 && (
                        <Polyline positions={route} color="#f97316" weight={6} opacity={0.8} />
                    )}
                </MapContainer>
            </div>
        </div>
    );
};

export default Tracking;