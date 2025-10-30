import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: String, required: true }], // list of member emails
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Group", groupSchema);
