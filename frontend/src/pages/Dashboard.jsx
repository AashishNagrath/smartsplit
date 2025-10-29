
import { useState, useEffect } from "react";
import api from "../api/api";


export default function Dashboard({ user, onLogout }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [settlements, setSettlements] = useState([]);
  const [expense, setExpense] = useState({
    description: "",
    amount: "",
    paidBy: "",
    splitBetween: "",
  });


  // Fetch user's groups on mount
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get(`/groups/mine?email=${encodeURIComponent(user.email)}`);
        setGroups(res.data);
      } catch (err) {
        console.error(err);
        alert("Error fetching groups");
      }
    };
    fetchGroups();
  }, [user.email]);

  // Fetch balance for selected group
  const fetchBalance = async (groupId) => {
    try {
      const res = await api.get(`/expenses/${groupId}/balance`);
      setBalances(res.data.balances);
      setSettlements(res.data.settlements);
    } catch (err) {
      console.error(err);
      alert("Error fetching balance");
    }
  };

  // Add new expense
  const handleAddExpense = async (e) => {
    e.preventDefault();
    if (!selectedGroup) {
      alert("Please select a group first.");
      return;
    }
    try {
      const payload = {
        groupId: selectedGroup._id,
        description: expense.description,
        amount: parseFloat(expense.amount),
        paidBy: expense.paidBy,
        splitBetween: expense.splitBetween.split(",").map((x) => x.trim()),
      };
      const res = await api.post("/expenses", payload);
      alert("Expense added successfully!");
      setExpense({ description: "", amount: "", paidBy: "", splitBetween: "" });
      fetchBalance(selectedGroup._id); // refresh after adding expense
    } catch (err) {
      console.error(err);
      alert("Error adding expense");
    }
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome, {user.name || user.email} 👋</h1>
      <button onClick={onLogout}>Logout</button>
      <hr />

      <div>
        <h2>Your Groups</h2>
        {groups.length === 0 ? (
          <p>No groups found.</p>
        ) : (
          <ul>
            {groups.map((group) => (
              <li key={group._id}>
                <button
                  style={{ fontWeight: selectedGroup && selectedGroup._id === group._id ? "bold" : "normal" }}
                  onClick={() => {
                    setSelectedGroup(group);
                    setBalances(null);
                    setSettlements([]);
                    fetchBalance(group._id);
                  }}
                >
                  {group.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedGroup && (
        <>
          <h2>Group: {selectedGroup.name}</h2>
          {balances && (
            <div className="balances">
              <h3>Balances</h3>
              <pre>{JSON.stringify(balances, null, 2)}</pre>
              <h3>Settlements</h3>
              <pre>{JSON.stringify(settlements, null, 2)}</pre>
            </div>
          )}
          <hr />
          <div>
            <h2>Add Expense</h2>
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
              <input
                placeholder="Paid By"
                value={expense.paidBy}
                onChange={(e) =>
                  setExpense({ ...expense, paidBy: e.target.value })
                }
                required
              />
              <input
                placeholder="Split Between (comma separated)"
                value={expense.splitBetween}
                onChange={(e) =>
                  setExpense({ ...expense, splitBetween: e.target.value })
                }
                required
              />
              <button type="submit">Add Expense</button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
