const express = require("express");
const { getAllUsers, verifyNGO, toggleSuspend, getStats } = require("../controllers/userController");
const { protect } = require("../middleware/auth");
const { authorizeRoles } = require("../middleware/roleCheck");

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/", getAllUsers);
router.get("/stats", getStats);
router.patch("/:id/verify", verifyNGO);
router.patch("/:id/suspend", toggleSuspend);

module.exports = router;
