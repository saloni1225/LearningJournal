const express = require("express");
const router = express.Router();
const JournalEntry = require("../models/JournalEntry");
const { auth, requireAdmin } = require("../middleware/authMiddleware");

// GET current student's entries (must be before /:id)
router.get("/mine", auth, async (req, res) => {
  try {
    const entries = await JournalEntry.find({ userId: req.user.userId }).sort({ week: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch your entries." });
  }
});

// GET all entries (admin only)
router.get("/", auth, requireAdmin, async (req, res) => {
  try {
    const entries = await JournalEntry.find().sort({ lastEdited: -1 });
    res.json(entries);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch entries." });
  }
});

// GET single entry
router.get("/:id", auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    const isOwner = entry.userId && entry.userId.toString() === req.user.userId;
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Access denied." });
    }

    res.json(entry);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch entry." });
  }
});

// CREATE new entry
router.post("/", auth, async (req, res) => {
  try {
    const entryData = {
      ...req.body,
      week: Number(req.body.week),
      userId: req.user.userId,
      studentName: req.body.studentName || req.user.fullName,
    };

    const newEntry = new JournalEntry(entryData);
    const saved = await newEntry.save();
    res.status(201).json(saved);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to save journal entry." });
  }
});

// UPDATE entry (student edits own entry, or admin updates remark)
router.patch("/:id", auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    const isOwner = entry.userId && entry.userId.toString() === req.user.userId;

    if (req.user.role === "admin" && req.body.remark !== undefined) {
      entry.remark = req.body.remark;
      entry.lastEdited = Date.now();
      await entry.save();
      return res.json(entry);
    }

    if (req.user.role === "student" && isOwner) {
      const allowed = [
        "week", "weekRange", "courseCode", "courseName", "module",
        "topics", "keyTerms", "summary", "doubts", "makeup",
        "usn", "studentName", "semester", "classSection",
      ];
      allowed.forEach((field) => {
        if (req.body[field] !== undefined) entry[field] = req.body[field];
      });
      if (req.body.week !== undefined) entry.week = Number(req.body.week);
      entry.lastEdited = Date.now();
      await entry.save();
      return res.json(entry);
    }

    return res.status(403).json({ message: "Access denied." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update entry." });
  }
});

// DELETE entry
router.delete("/:id", auth, async (req, res) => {
  try {
    const entry = await JournalEntry.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: "Entry not found." });
    }

    const isOwner = entry.userId && entry.userId.toString() === req.user.userId;
    if (req.user.role !== "admin" && !isOwner) {
      return res.status(403).json({ message: "Access denied." });
    }

    await JournalEntry.findByIdAndDelete(req.params.id);
    res.json({ message: "Entry deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete entry." });
  }
});

module.exports = router;
