import { BrowserRouter, Routes, Route } from "react-router-dom";
import  { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import Loader from "./components/Loader";

// lazy loaded pages
const Home = lazy(() => import("./pages/Home"));
const WorkerRegister = lazy(() => import("./pages/WorkerRegister"));
const Workers = lazy(() => import("./pages/Workers"));
const Booking = lazy(() => import("./pages/Booking"));
const Tracking = lazy(() => import("./pages/Tracking"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Profile = lazy(() => import("./pages/Profile"));
const About = lazy(() => import("./pages/About"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const Services = lazy(() => import("./pages/Services"));
const NotFound = lazy(() => import("./pages/NotFound"));


function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/worker-register" element={<WorkerRegister />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/booking/:id" element={<Booking />} />
          <Route path="/workers" element={<Workers />} />
          <Route path="/services" element={<Services />} />
          <Route path="/tracking/:id" element={<Tracking/>}/>
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

    </BrowserRouter>
  );
}

export default App;