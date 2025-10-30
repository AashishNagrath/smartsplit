import mongoose from "mongoose";

const expenseSchema = new mongoose.Schema({
  groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", required: true },
  description: { type: String, required: true },
  amount: { type: Number, required: true },
  paidBy: { type: String, required: true },
  membersInvolved: [{ type: String, required: true }], // emails of members
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Expense", expenseSchema);
