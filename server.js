// ==========================================
// Portfolio Backend & Static File Server
// ==========================================
// Run using: node server.js

const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = 3000;

// Enable CORS
app.use(cors());

// Parse JSON & URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handle favicon.ico fallback requests
app.get("/favicon.ico", (req, res) => {
  res.type("image/svg+xml");
  res.sendFile(path.join(__dirname, "favicon.svg"));
});

// Serve static frontend files
app.use(express.static(path.join(__dirname)));

// Fallback to index.html for navigation requests
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.includes('.')) {
    return res.sendFile(path.join(__dirname, 'index.html'));
  }
  next();
});

// Start Server
app.listen(PORT, () => {
  console.log("=================================");
  console.log(`Portfolio server running on http://localhost:${PORT}`);
  console.log("=================================");
});
