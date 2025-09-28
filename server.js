const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

app.post("/validate", async (req, res) => {
  const robloxRes = await fetch("https://auth.roblox.com/v1/usernames/validate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  });
  const data = await robloxRes.json();
  res.json(data);
});

app.listen(process.env.PORT || 3000);
