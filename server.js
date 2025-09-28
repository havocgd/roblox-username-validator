const express = require("express");
const fetch = require("node-fetch");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors());

const cacheFile = "rejected.json";
let rejected = new Set();

// Load cache on startup
if (fs.existsSync(cacheFile)) {
  try {
    const data = JSON.parse(fs.readFileSync(cacheFile));
    rejected = new Set(data);
  } catch (err) {
    console.error("Failed to load cache:", err);
  }
}

// Validate username via Roblox API
app.post("/validate", async (req, res) => {
  const { username } = req.body;

  if (rejected.has(username)) {
    return res.json({ valid: false, cached: true });
  }

  const robloxRes = await fetch("https://auth.roblox.com/v1/usernames/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      context: "Signup",
      birthday: "2009-11-26T13:00:00.000Z"
    })
  });

  const result = await robloxRes.json();
  const isValid = result.isValid && result.code === 0;

  if (!isValid) {
    rejected.add(username);
    fs.writeFileSync(cacheFile, JSON.stringify([...rejected]));
  }

  res.json({ valid: isValid });
});

app.listen(process.env.PORT || 3000);
