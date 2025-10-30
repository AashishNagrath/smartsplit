const router = express.Router();
// Delete an expense by ID
router.delete("/:expenseId", async (req, res) => {
  try {
    const { expenseId } = req.params;
    const deleted = await Expense.findByIdAndDelete(expenseId);
    if (!deleted) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted", expense: deleted });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting expense" });
  }
});
import express from "express";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";



// Add new expense
router.post("/add", async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, membersInvolved } = req.body;

    if (!groupId || !description || !amount || !paidBy || !membersInvolved)
      return res.status(400).json({ message: "Missing required fields" });

    // ensure paidBy is a member of the group
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    if (!group.members.includes(paidBy)) {
      return res
        .status(400)
        .json({ message: "PaidBy user must be part of the group" });
    }

    // ensure all membersInvolved are group members
    const invalidMembers = membersInvolved.filter(
      (m) => !group.members.includes(m)
    );
    if (invalidMembers.length > 0) {
      return res.status(400).json({
        message: `These users are not in the group: ${invalidMembers.join(", ")}`
      });
    }

    const expense = new Expense({
      groupId,
      description,
      amount,
      paidBy,
      membersInvolved,
    });

    await expense.save();
    res.json({ message: "Expense added successfully", expense });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding expense" });
  }
});

import { calculateBalances, calculateSettlements } from "./groupDetailsHelpers.js";

// Calculate balances for a group (robust version, only endpoint needed)
router.get("/balances/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const balances = await calculateBalances(groupId);
    res.json(balances);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculating balances" });
  }
});

// Calculate minimal settlements between group members
router.get("/settlements/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const settlements = await calculateSettlements(groupId);
    res.json(settlements);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculating settlements" });
  }
});

// Get all expenses for a group
router.get("/:groupId", async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId });
    res.json(expenses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching expenses" });
  }
});



export default router;
