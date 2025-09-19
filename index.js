const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors({ origin: ["http://localhost:3000", "https://last-minute-learner.vercel.app"] }));

app.get("/api/custom", (req, res) => {
  res.json({ message: "Hello from Express API" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API server listening on ${port}`));
