
import express from "express";
import Group from "../models/Group.js";

const router = express.Router();

// GET /api/groups/mine?email=user@email.com - get groups for a user
router.get("/mine", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }
    // Find groups where the user is a member (case-insensitive)
    const groups = await Group.find({ members: { $elemMatch: { $regex: `^${email}$`, $options: "i" } } });
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching user's groups:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/groups - create group
router.post("/", async (req, res) => {
  try {
    const { name, members } = req.body;
    const group = await Group.create({ name, members });
    res.status(201).json(group);
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/groups - get all groups
router.get("/", async (req, res) => {
  try {
    const groups = await Group.find();
    res.status(200).json(groups);
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
