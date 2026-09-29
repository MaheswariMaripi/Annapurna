const express = require("express");
const {
  createDonation,
  getDonations,
  getDonationById,
  acceptDonation,
  updateStatus,
  rateParticipant,
  claimDonation,
} = require("../controllers/donationController");
const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/roleCheck");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(protect);

router.post("/", authorizeRoles("donor"), upload.single("image"), createDonation);
router.get("/", getDonations);
router.get("/:id", getDonationById);
router.patch("/:id/accept", authorizeRoles("volunteer"), acceptDonation);
router.patch("/:id/claim", authorizeRoles("ngo"), claimDonation);
router.patch("/:id/status", authorizeRoles("volunteer", "ngo"), updateStatus);
router.post("/:id/rate", rateParticipant);

module.exports = router;
