const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema(
  {
    donor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    volunteer: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    ngo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    foodName: { type: String, required: true },
    description: { type: String, default: "" },
    quantity: { type: String, required: true }, // e.g. "20 meals", "5 kg rice"
    foodType: {
      type: String,
      enum: ["veg", "non-veg", "mixed", "packaged", "other"],
      default: "other",
    },
    imageUrl: { type: String, default: "" },

    pickupAddress: { type: String, required: true },
    pickupLocation: {
      lat: { type: Number },
      lng: { type: Number },
    },

    expiryTime: { type: Date, required: true }, // best-before time, drives urgency tag
    urgency: {
      type: String,
      enum: ["urgent", "today", "later"],
      default: "later",
    },

    status: {
      type: String,
      enum: [
        "pending",      // just posted, no volunteer yet
        "accepted",     // volunteer accepted pickup
        "picked_up",    // volunteer collected from donor
        "delivered",    // handed to NGO
        "received",     // NGO confirmed receipt - closed
        "cancelled",
      ],
      default: "pending",
    },

    statusHistory: [
      {
        status: String,
        changedAt: { type: Date, default: Date.now },
        note: String,
      },
    ],

    // ratings given after completion
    donorRatedVolunteer: { type: Number, default: null },
    ngoRatedVolunteer: { type: Number, default: null },
    volunteerRatedDonor: { type: Number, default: null },
  },
  { timestamps: true }
);

// auto-compute urgency based on expiryTime before save
donationSchema.pre("save", function (next) {
  const hoursLeft = (this.expiryTime - Date.now()) / (1000 * 60 * 60);
  if (hoursLeft <= 2) this.urgency = "urgent";
  else if (hoursLeft <= 24) this.urgency = "today";
  else this.urgency = "later";
  next();
});

module.exports = mongoose.model("Donation", donationSchema);
