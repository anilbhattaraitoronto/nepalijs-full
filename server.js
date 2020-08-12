const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4003;

app.listen(port, () => {
  console.log(`App is running on ${port}`);
});
