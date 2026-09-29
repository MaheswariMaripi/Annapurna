const User = require("../models/User");
const Donation = require("../models/Donation");

// @route GET /api/users   (admin only)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/users/:id/verify   (admin only - approve/reject NGO)
const verifyNGO = async (req, res) => {
  try {
    const { decision } = req.body; // "approved" | "rejected"
    const user = await User.findById(req.params.id);
    if (!user || user.role !== "ngo") {
      return res.status(404).json({ message: "NGO not found" });
    }

    user.verificationStatus = decision;
    user.isVerified = decision === "approved";
    await user.save();

    res.json({ message: `NGO ${decision}`, user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/users/:id/suspend   (admin only)
const toggleSuspend = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: user.isActive ? "User reactivated" : "User suspended", user: user.toSafeObject() });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/users/stats   (admin only - impact dashboard)
const getStats = async (req, res) => {
  try {
    const totalDonations = await Donation.countDocuments();
    const completed = await Donation.countDocuments({ status: "received" });
    const activeDonors = await User.countDocuments({ role: "donor", isActive: true });
    const activeVolunteers = await User.countDocuments({ role: "volunteer", isActive: true });
    const verifiedNGOs = await User.countDocuments({ role: "ngo", isVerified: true });
    const pendingNGOVerifications = await User.countDocuments({ role: "ngo", verificationStatus: "pending" });

    const topDonors = await User.find({ role: "donor" })
      .sort({ completedCount: -1 })
      .limit(5)
      .select("name completedCount");

    const topVolunteers = await User.find({ role: "volunteer" })
      .sort({ completedCount: -1 })
      .limit(5)
      .select("name completedCount rating");

    res.json({
      totalDonations,
      completed,
      activeDonors,
      activeVolunteers,
      verifiedNGOs,
      pendingNGOVerifications,
      topDonors,
      topVolunteers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getAllUsers, verifyNGO, toggleSuspend, getStats };
