const mongoose = require("mongoose");

const journalEntrySchema = new mongoose.Schema({
  usn: { type: String, required: true },
  studentName: { type: String, required: true },
  semester: { type: String, required: true },
  classSection: { type: String, required: true },
  week: { type: Number, required: true },
  weekRange: String,
  courseCode: String,
  courseName: String,
  module: String,
  topics: String,
  keyTerms: String,
  summary: String,
  doubts: String,
  absentDays: String,
  makeup: String,
  remark: String,
  lastEdited: { type: Date, default: Date.now },
});

module.exports = mongoose.model("JournalEntry", journalEntrySchema);
