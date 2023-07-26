const express = require("express");
const app = express();

app.get("/", (req, res) => {
  console.log("REQ: ", req.headers);
  res.status(200).json({ success: true, message: "Page loaded successfully" });
});

app.listen(8080, () => console.log("Server running on port 8080"));
