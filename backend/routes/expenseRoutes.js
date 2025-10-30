import express from "express";
import Expense from "../models/Expense.js";
const router = express.Router();

// Add new expense
router.post("/add", async (req, res) => {
  try {
    const { groupId, description, amount, paidBy, membersInvolved } = req.body;

    if (!groupId || !description || !amount || !paidBy)
      return res.status(400).json({ message: "Missing required fields" });

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

export default router;
