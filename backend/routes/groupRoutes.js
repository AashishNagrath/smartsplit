// Add member to group
const router = express.Router();
router.post("/:id/add-member", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    let { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email required" });
    email = email.trim().toLowerCase();
    if (group.members.includes(email)) {
      return res.status(400).json({ message: "Member already in group" });
    }
    group.members.push(email);
    await group.save();
    res.json({ message: "Member added", group });
  } catch (err) {
    console.error("Error adding member:", err);
    res.status(500).json({ message: "Error adding member to group" });
  }
});
import express from "express";
import Group from "../models/Group.js";
import Expense from "../models/Expense.js";
import { calculateBalances, calculateSettlements } from "./groupDetailsHelpers.js";

// GET /groups/:id/details - group, expenses, balances, settlements
router.get("/:id/details", async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    const expenses = await Expense.find({ groupId: group._id });
    const balances = await calculateBalances(group._id);
    const settlements = await calculateSettlements(group._id);
    res.json({ group, expenses, balances, settlements });
  } catch (err) {
    console.error("Error in /groups/:id/details:", err);
    res.status(500).json({ message: "Error fetching group details" });
  }
});

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
    const email = req.params.email.trim().toLowerCase();
    const groups = await Group.find({ members: email });
    res.json(groups);
  } catch (err) {
    console.error("Error details:", err);
    res.status(500).json({ message: "Error fetching groups" });
  }
});

export default router;
