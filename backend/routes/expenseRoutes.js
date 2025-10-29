import express from "express";
import Expense from "../models/Expense.js";

const router = express.Router();

// Helper to normalize names
const normalizeName = (name) => name.trim().toLowerCase();

// POST /api/expenses - add expense
router.post("/", async (req, res) => {
  try {
    let { groupId, description, amount, paidBy, splitBetween } = req.body;

    // Normalize names
    paidBy = normalizeName(paidBy);
    splitBetween = splitBetween.map(normalizeName);

    const expense = await Expense.create({ groupId, description, amount, paidBy, splitBetween });
    res.status(201).json(expense);
  } catch (error) {
    console.error("Error adding expense:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/expenses/:groupId - get expenses by group
router.get("/:groupId", async (req, res) => {
  try {
    const expenses = await Expense.find({ groupId: req.params.groupId });
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:groupId/balance", async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId });

    if (expenses.length === 0) {
      return res.status(200).json({ message: "No expenses found for this group", balance: [] });
    }

    // Step 1— Calculate net balances
    const balances = {};

    expenses.forEach((exp) => {
      // Normalize names
      const paidBy = normalizeName(exp.paidBy);
      const splitBetween = exp.splitBetween.map(normalizeName);
      const splitAmount = exp.amount / splitBetween.length;

      // paid
      balances[paidBy] = (balances[paidBy] || 0) + exp.amount;

      // owes
      splitBetween.forEach((person) => {
        balances[person] = (balances[person] || 0) - splitAmount;
      });
    });

    // Step 2 — Convert balances into settlement transactions
    const debtors = [];
    const creditors = [];

    for (const [person, balance] of Object.entries(balances)) {
      if (balance < 0) debtors.push({ person, amount: Math.abs(balance) });
      else if (balance > 0) creditors.push({ person, amount: balance });
    }

    const settlements = [];
    let i = 0, j = 0;

    while (i < debtors.length && j < creditors.length) {
      const debtor = debtors[i];
      const creditor = creditors[j];
      const amount = Math.min(debtor.amount, creditor.amount);

      settlements.push({
        from: debtor.person,
        to: creditor.person,
        amount: parseFloat(amount.toFixed(2)),
      });

      debtor.amount -= amount;
      creditor.amount -= amount;

      if (debtor.amount === 0) i++;
      if (creditor.amount === 0) j++;
    }

    res.status(200).json({ balances, settlements });
  } catch (error) {
    console.error("Error calculating balance:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;