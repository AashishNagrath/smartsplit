import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dashboard({ user }) {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [balances, setBalances] = useState(null);
  const [msg, setMsg] = useState("");

  // Fetch all groups for the user
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await api.get("/groups");
        setGroups(res.data);
      } catch (err) {
        console.error("Error fetching groups:", err);
        setMsg("Failed to load groups.");
      }
    };
    fetchGroups();
  }, []);

  // Fetch balances for selected group
  const viewBalance = async (groupId) => {
    try {
      const res = await api.get(`/expenses/${groupId}/balance`);
      setBalances(res.data);
    } catch (err) {
      console.error("Error fetching balance:", err);
      setMsg("Failed to load balance.");
    }
  };

  return (
    <div className="dashboard">
      <h2>Welcome, {user?.name || "User"}!</h2>

      <h3>Your Groups</h3>
      {groups.length === 0 ? (
        <p>No groups found.</p>
      ) : (
        <ul>
          {groups.map((g) => (
            <li key={g._id}>
              {g.name}{" "}
              <button onClick={() => viewBalance(g._id)}>View Balance</button>
            </li>
          ))}
        </ul>
      )}

      {balances && (
        <div className="balances">
          <h3>Balances</h3>
          <pre>{JSON.stringify(balances, null, 2)}</pre>
        </div>
      )}

      {msg && <p>{msg}</p>}
    </div>
  );
}
