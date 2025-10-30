import express from "express";
import Group from "../models/Group.js";
const router = express.Router();

// Create new group
router.post("/create", async (req, res) => {
  try {
    let { name, members, createdBy } = req.body;
    if (!name || !Array.isArray(members) || members.length === 0 || !createdBy)
      return res.status(400).json({ message: "Missing required fields" });

    // Normalize emails
    members = members.map(e => e.trim().toLowerCase());
    createdBy = createdBy.trim().toLowerCase();

    if (!members.includes(createdBy)) members.push(createdBy);
    if (members.length < 2)
      return res.status(400).json({ message: "A group must have at least 2 members." });

    const group = new Group({ name, members, createdBy });
    await group.save();
    res.json({ message: "Group created successfully", group });
  } catch (err) {
    console.error("Error details:", err);
    if (err.name === "ValidationError") {
      return res.status(400).json({ message: "Validation error", details: err.message });
    }
    res.status(500).json({ message: "Server error creating group", error: err.message });
  }
});
// Get groups for a user
router.get("/user/:email", async (req, res) => {
  try {
    const groups = await Group.find({ members: req.params.email });
    res.json(groups);
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
});

export default router;
