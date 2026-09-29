import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import DonorDashboard from "./pages/DonorDashboard";
import VolunteerDashboard from "./pages/VolunteerDashboard";
import NGODashboard from "./pages/NGODashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/donor" element={
          <ProtectedRoute allowedRoles={["donor"]}><DonorDashboard /></ProtectedRoute>
        } />
        <Route path="/volunteer" element={
          <ProtectedRoute allowedRoles={["volunteer"]}><VolunteerDashboard /></ProtectedRoute>
        } />
        <Route path="/ngo" element={
          <ProtectedRoute allowedRoles={["ngo"]}><NGODashboard /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["admin"]}><AdminDashboard /></ProtectedRoute>
        } />
      </Routes>
    </>
  );
}

export default App;
