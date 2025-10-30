import express from "express";
import { registerUser, loginUser } from "../controllers/authController.js";

const router = express.Router();


import { protect } from "../middleware/authMiddleware.js";

router.post("/register", registerUser);
router.post("/login", loginUser);

// GET /auth/me - verify JWT and return user info
router.get("/me", protect, async (req, res) => {
	if (!req.user) return res.status(401).json({ message: "Not authorized" });
	res.json({
		_id: req.user._id,
		name: req.user.name,
		email: req.user.email,
		createdAt: req.user.createdAt,
		updatedAt: req.user.updatedAt
	});
});

export default router;
