const { MongoClient } = require("mongodb");
const cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();

const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));

const DB_URI = process.env.DB_URI || "mongodb://localhost:27017";
const options = { useNewUrlParser: true, useUnifiedTopology: true };
const client = new MongoClient(DB_URI, options);

client.connect((err) => {
  if (err) {
    console.log(err);
  } else {
    console.log("Database Connected...");
  }
});

const bookings = client.db("burjAlArab").collection("booking");

app.post("/addBooking", (req, res) => {
  const newBooking = req.body;
  bookings.insertOne(newBooking).then((result) => {
    res.send(result.insertedCount > 0);
  });
  console.log(newBooking);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/booking", (req, res) => {
  // console.log(req.query.email)
  bookings.find({ email: req.query.email }).toArray((err, document) => {
    res.send(document);
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on port http://localhost:${PORT}`);
});
