const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true, unique: true },
  state: { type: String, enum: ['fail', 'pending', 'complete'], default: 'pending' },
  priority: { type: String, required: true },
  isDeleted: { type: Boolean, default: false }
});

module.exports = mongoose.model("Task", taskSchema);
