const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const DB = require("./schema");
const app = express();
const port = process.env.PORT || 4003;

var corsOptions = {
  origin: "http://localhost:5000",
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};
app.use(cors(corsOptions));
app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));

const authRoutes = require("./routes/authRoutes");
const postRoutes = require("./routes/postRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/posts", postRoutes);

app.listen(port, () => {
  console.log(`App is running on ${port}`);
});
