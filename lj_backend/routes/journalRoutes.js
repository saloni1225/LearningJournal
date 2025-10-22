// backend/routes/journalRoutes.js
const express = require("express");
const router = express.Router();
const JournalEntry = require("../models/JournalEntry");

// CREATE new entry
router.post("/", async (req, res) => {
  try {
    const newEntry = new JournalEntry(req.body);
    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save journal entry." });
  }
});

// GET all entries
router.get("/", async (req, res) => {
  try {
    const entries = await JournalEntry.find();
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch entries." });
  }
});

// UPDATE remark (for admin)
router.patch("/:id", async (req, res) => {
  try {
    const updated = await JournalEntry.findByIdAndUpdate(
      req.params.id,
      { remark: req.body.remark, lastEdited: Date.now() },
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update entry." });
  }
});

// DELETE entry
router.delete("/:id", async (req, res) => {
  try {
    await JournalEntry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete entry." });
  }
});

module.exports = router;
