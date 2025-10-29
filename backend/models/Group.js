import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: String, required: true }], // simple list of names/emails
}, { timestamps: true });

const Group = mongoose.model("Group", groupSchema);
export default Group;
