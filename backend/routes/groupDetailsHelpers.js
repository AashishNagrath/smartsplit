import Expense from "../models/Expense.js";

// Calculate balances for a group, rounding to 2 decimals
export async function calculateBalances(groupId) {
  const expenses = await Expense.find({ groupId });
  if (expenses.length === 0) return {};
  const balance = {};
  const allMembers = new Set(expenses.flatMap(e => e.membersInvolved));
  allMembers.forEach(m => (balance[m] = 0));
  expenses.forEach(exp => {
    const split = exp.amount / exp.membersInvolved.length;
    exp.membersInvolved.forEach(m => {
      if (m === exp.paidBy) {
        balance[m] += exp.amount - split;
      } else {
        balance[m] -= split;
      }
    });
  });
  // Round to 2 decimals
  Object.keys(balance).forEach(m => {
    balance[m] = Number(balance[m].toFixed(2));
  });
  return balance;
}

// Calculate minimal settlements between group members, rounding to 2 decimals
export async function calculateSettlements(groupId) {
  console.log('calculateSettlements called for', groupId);
  const balances = await calculateBalances(groupId);
  const members = Object.keys(balances);
  const settlements = [];
  const creditors = [];
  const debtors = [];
  members.forEach(m => {
    if (balances[m] > 0.01) creditors.push({ member: m, amount: balances[m] });
    else if (balances[m] < -0.01) debtors.push({ member: m, amount: -balances[m] });
  });
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);
    settlements.push({
      from: debtors[i].member,
      to: creditors[j].member,
      amount: Number(pay.toFixed(2))
    });
    debtors[i].amount -= pay;
    creditors[j].amount -= pay;
    if (Math.abs(debtors[i].amount) < 0.01) i++;
    if (Math.abs(creditors[j].amount) < 0.01) j++;
  }
  console.log('calculateSettlements done for', groupId, settlements);
  return settlements;
}
