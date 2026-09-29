const Donation = require("../models/Donation");
const User = require("../models/User");
const { getDistanceKm } = require("../utils/distance");

// @route POST /api/donations   (donor only)
const createDonation = async (req, res) => {
  try {
    const {
      foodName,
      description,
      quantity,
      foodType,
      pickupAddress,
      lat,
      lng,
      expiryTime,
    } = req.body;

    if (!foodName || !quantity || !pickupAddress || !expiryTime) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const donation = await Donation.create({
      donor: req.user._id,
      foodName,
      description,
      quantity,
      foodType,
      pickupAddress,
      pickupLocation: { lat, lng },
      expiryTime,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : "",
      statusHistory: [{ status: "pending", note: "Donation posted" }],
    });

    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/donations
// query params: status, urgency, nearLat, nearLng, maxDistanceKm
const getDonations = async (req, res) => {
  try {
    const { status, urgency, nearLat, nearLng, maxDistanceKm } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (urgency) filter.urgency = urgency;

    // role-based visibility
    if (req.user.role === "donor") {
      filter.donor = req.user._id;
    } else if (req.user.role === "volunteer") {
      // volunteers see pending (unclaimed) + their own accepted ones
      filter.$or = [
        { status: "pending" },
        { volunteer: req.user._id },
      ];
    } else if (req.user.role === "ngo") {
      filter.$or = [
        { status: "pending" },
        { status: "accepted" },
        { status: "picked_up" },
        { ngo: req.user._id },
      ];
    }
    // admin sees everything (no extra filter)

    let donations = await Donation.find(filter)
      .populate("donor", "name phone address")
      .populate("volunteer", "name phone")
      .populate("ngo", "name address")
      .sort({ createdAt: -1 });

    // optional distance filtering (done in-memory since it's a simple app)
    if (nearLat && nearLng) {
      donations = donations
        .map((d) => {
          const obj = d.toObject();
          obj.distanceKm = getDistanceKm(
            parseFloat(nearLat),
            parseFloat(nearLng),
            d.pickupLocation?.lat,
            d.pickupLocation?.lng
          );
          return obj;
        })
        .filter((d) => (maxDistanceKm ? d.distanceKm == null || d.distanceKm <= parseFloat(maxDistanceKm) : true))
        .sort((a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity));
    }

    res.json(donations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route GET /api/donations/:id
const getDonationById = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id)
      .populate("donor", "name phone address")
      .populate("volunteer", "name phone")
      .populate("ngo", "name address");

    if (!donation) return res.status(404).json({ message: "Donation not found" });
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/donations/:id/accept   (volunteer only)
const acceptDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });
    if (donation.status !== "pending") {
      return res.status(400).json({ message: "Donation is no longer available" });
    }

    donation.volunteer = req.user._id;
    donation.status = "accepted";
    donation.statusHistory.push({ status: "accepted", note: `Accepted by ${req.user.name}` });
    await donation.save();

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/donations/:id/status   (volunteer/ngo, moves the pipeline forward)
const updateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    const validTransitions = {
      accepted: ["picked_up", "cancelled"],
      picked_up: ["delivered", "cancelled"],
      delivered: ["received"],
    };

    const allowed = validTransitions[donation.status] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({
        message: `Cannot move from '${donation.status}' to '${status}'`,
      });
    }

    // when marking delivered, assign the requesting NGO if none set
    if (status === "delivered" && req.user.role === "ngo" && !donation.ngo) {
      donation.ngo = req.user._id;
    }

    donation.status = status;
    donation.statusHistory.push({ status, note: note || "" });

    // when fully received, bump completedCount for donor + volunteer
    if (status === "received") {
      await User.findByIdAndUpdate(donation.donor, { $inc: { completedCount: 1 } });
      if (donation.volunteer) {
        await User.findByIdAndUpdate(donation.volunteer, { $inc: { completedCount: 1 } });
      }
    }

    await donation.save();
    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route POST /api/donations/:id/rate
const rateParticipant = async (req, res) => {
  try {
    const { targetUserId, rating } = req.body;
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be 1-5" });
    }

    const target = await User.findById(targetUserId);
    if (!target) return res.status(404).json({ message: "User not found" });

    const newCount = target.ratingCount + 1;
    const newAvg = (target.rating * target.ratingCount + rating) / newCount;
    target.rating = Math.round(newAvg * 10) / 10;
    target.ratingCount = newCount;
    await target.save();

    res.json({ message: "Rating submitted", newRating: target.rating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route PATCH /api/donations/:id/claim   (ngo only)
const claimDonation = async (req, res) => {
  try {
    const donation = await Donation.findById(req.params.id);
    if (!donation) return res.status(404).json({ message: "Donation not found" });

    if (donation.ngo && donation.ngo.toString() !== req.user._id.toString()) {
      return res.status(400).json({ message: "Donation is already claimed by another NGO" });
    }
    if (donation.status === "received" || donation.status === "cancelled") {
      return res.status(400).json({ message: `Cannot claim donation in '${donation.status}' state` });
    }

    donation.ngo = req.user._id;
    donation.statusHistory.push({
      status: donation.status,
      note: `Requested / claimed by NGO ${req.user.name}`,
    });
    await donation.save();

    await donation.populate("donor", "name phone address");
    await donation.populate("volunteer", "name phone");
    await donation.populate("ngo", "name address");

    res.json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createDonation,
  getDonations,
  getDonationById,
  acceptDonation,
  updateStatus,
  rateParticipant,
  claimDonation,
};
