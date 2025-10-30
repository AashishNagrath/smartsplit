import express from "express";
import Expense from "../models/Expense.js";
import Group from "../models/Group.js";

const router = express.Router();

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

// Calculate balances for a group (robust version, only endpoint needed)
router.get("/balances/:groupId", async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId });
    if (expenses.length === 0) return res.json({});

    const balance = {};

    // collect all members from any expense
    const allMembers = new Set(expenses.flatMap(e => e.membersInvolved));
    allMembers.forEach(m => (balance[m] = 0));

    // calculate balance per member
    expenses.forEach(exp => {
      const split = exp.amount / exp.membersInvolved.length;
      exp.membersInvolved.forEach(m => {
        if (m === exp.paidBy) {
          balance[m] += exp.amount - split; // payer gets back others' shares
        } else {
          balance[m] -= split; // non-payers owe their share
        }
      });
    });

    res.json(balance);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error calculating balances" });
  }
});

export default router;
