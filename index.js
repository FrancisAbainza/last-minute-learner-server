const express = require("express");
const app = express();

app.get("/api/custom", (req, res) => {
  res.json({ message: "Hello from Express API" });
});

// Render will give you a port in process.env.PORT
const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`API server running on port ${port}`));