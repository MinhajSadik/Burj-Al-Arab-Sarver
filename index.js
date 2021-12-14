var cors = require("cors"),
  express = require("express"),
  bodyParser = require("body-parser"),
  { MongoClient } = require("mongodb"),
  admin = require("firebase-admin"),
  serviceAccount = require("./configs/burjAlArab.json"),
  dotenv = require("dotenv"),
  app = express();

// dotenv.config();

const PORT = process.env.PORT || 3100;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.urlencoded({ extended: false }));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.DATABASE_URL,
});

const DB_URI = process.env.DB_URI || "mongodb://localhost:27017";
const options = { useNewUrlParser: true, useUnifiedTopology: true };
const client = new MongoClient(DB_URI, options);

client.connect((err) => {
  if (err) {
    console.error(err);
  } else {
    console.log("database connected...");
  }
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

const bookings = client.db("burjAlArab").collection("booking");

app.post("/addBooking", (req, res) => {
  const newBooking = req.body;
  bookings.insertOne(newBooking).then((result) => {
    res.send(result.insertedCount > 0);
  });
  console.log(newBooking);
});

app.get("/booking", (req, res) => {
  const bearer = req.headers.authorization;
  if (bearer && bearer.startsWith("Bearer ")) {
    const idToken = bearer.split(" ")[1];
    console.log("Bearer:" + bearer);
    admin
      .auth()
      .verifyIdToken(idToken)
      .then((decodedToken) => {
        const uid = decodedToken.uid;
        const tokenEmail = decodedToken.email;
        const queryEmail = req.query.email;
        if (tokenEmail && queryEmail) {
          bookings.find({ email: req.query.email }).toArray((err, docs) => {
            res.send(docs);
          });
        } else {
          res.status(401).send("unAuthorized Access");
        }
      })
      .catch((err) => {
        if (err) {
          console.error(err);
        } else {
          res.status(401).send("unAuthorized Access");
        }
      });
  } else {
    res.status(401).send("unAuthorized Access");
  }
});

app.listen(PORT, () => {
  console.log(`server listening on port ${PORT}`);
});
