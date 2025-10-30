import { useState, useEffect } from "react";
import api from "../api/api";

export default function Dashboard({ user, onLogout }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: "", members: "" });
  const [expenses, setExpenses] = useState([]);
  const [expense, setExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
  });
  const [balances, setBalances] = useState({});;

  // ✅ Fetch all groups for logged-in user
  const fetchGroups = async () => {
    try {
      const res = await api.get(`/groups/user/${user.email.toLowerCase()}`);
      setGroups(res.data);
    } catch (err) {
      console.error(err);
      alert("Error fetching groups");
    }
  };

  // ✅ Create new group
  const handleCreateGroup = async (e) => {
    e.preventDefault();
    try {
      const members = newGroup.members
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m);
      if (!members.includes(user.email)) members.push(user.email); // include creator

      await api.post("/groups/create", {
        name: newGroup.name,
        members,
        createdBy: user.email,
      });

      alert("Group created!");
      setNewGroup({ name: "", members: "" });
      fetchGroups();
    } catch (err) {
      console.error(err);
      alert("Error creating group");
    }
  };

  // ✅ Fetch expenses + balances for selected group
  const fetchExpenses = async (groupId) => {
    try {
      const res = await api.get(`/expenses/${groupId}`);
      setExpenses(res.data);
      fetchBalances(groupId);
    } catch (err) {
      console.error(err);
      alert("Error fetching expenses or balances");
    }
  };

  const fetchBalances = async (groupId) => {
  try {
    const res = await api.get(`/expenses/balances/${groupId}`);
    setBalances(res.data);
  } catch (err) {
    console.error(err);
    alert("Error fetching balances");
  }
};

  //  Add new expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await api.post("/expenses/add", {
        groupId: selectedGroup._id,
        description: expense.description,
        amount: parseFloat(expense.amount),
        paidBy: expense.paidBy,
        membersInvolved: selectedGroup.members,
      });
      setExpense({ description: "", amount: "", paidBy: "" });
      fetchExpenses(selectedGroup._id);
    } catch (err) {
      console.error(err);
      alert("Error adding expense");
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  return (
    <div className="dashboard">
      <h1>Welcome, {user.name || user.email}</h1>
      <button onClick={onLogout}>Logout</button>
      <hr />

      {/* CREATE GROUP */}
      <section>
        <h2>Create Group</h2>
        <form onSubmit={handleCreateGroup}>
          <input
            placeholder="Group Name"
            value={newGroup.name}
            onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
            required
          />
          <input
            placeholder="Members (comma separated emails)"
            value={newGroup.members}
            onChange={(e) =>
              setNewGroup({ ...newGroup, members: e.target.value })
            }
            required
          />
          <button type="submit">Create Group</button>
        </form>
      </section>

      <hr />

      {/* GROUP LIST */}
      <section>
        <h2>Your Groups</h2>
        {groups.length === 0 ? (
          <p>No groups yet.</p>
        ) : (
          <ul>
            {groups.map((g) => (
              <li key={g._id}>
                <button
                  onClick={() => {
                    setSelectedGroup(g);
                    fetchExpenses(g._id);
                  }}
                >
                  {g.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <hr />

      {/* GROUP DETAILS */}
      {selectedGroup && (
        <section>
          <h2>Group: {selectedGroup.name}</h2>
          <p>Members: {selectedGroup.members.join(", ")}</p>

          <h3>Add Expense</h3>
          <form onSubmit={handleAddExpense}>
            <input
              placeholder="Description"
              value={expense.description}
              onChange={(e) =>
                setExpense({ ...expense, description: e.target.value })
              }
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={expense.amount}
              onChange={(e) =>
                setExpense({ ...expense, amount: e.target.value })
              }
              required
            />
            <select
              value={expense.paidBy}
              onChange={(e) =>
                setExpense({ ...expense, paidBy: e.target.value })
              }
              required
            >
              <option value="" disabled>
                Select payer
              </option>
              {selectedGroup.members.map((member) => (
                <option key={member} value={member}>
                  {member}
                </option>
              ))}
            </select>
            <button type="submit">Add Expense</button>
          </form>

          <h3>Expenses</h3>
          {expenses.length === 0 ? (
            <p>No expenses yet.</p>
          ) : (
            <ul>
              {expenses.map((ex) => (
                <li key={ex._id}>
                  {ex.description} — ₹{ex.amount} (paid by {ex.paidBy})
                </li>
              ))}
            </ul>
          )}

          <h3>Balances</h3>
          {Object.keys(balances).length === 0 ? (
            <p>No balances yet.</p>
          ) : (
            <ul>
              {Object.entries(balances).map(([member, amount]) => (
                <li key={member}>
                  {member}: {amount > 0 ? `is owed ₹${amount.toFixed(2)}` : `owes ₹${Math.abs(amount).toFixed(2)}`}
                </li>
              ))}
            </ul>
          )}

          {/* Group Balance Summary removed: balances is a flat object, not a summary object */}
        </section>
      )}
    </div>
  );
}
