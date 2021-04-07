const MongoClient = require('mongodb').MongoClient;
const cors = require('cors');
const express = require('express')
const app = express();

const port = 5000
const pass = 'MongoDbBurjAlArab';

const uri = "mongodb+srv://burjAlArab:MongoDbBurjAlArab@cluster0.iojzl.mongodb.net/burjAlArab?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

app.use(cors());
app.use(express.json());
// app.use(express.urlencoded({}))

app.get('/', (req, res) => {
    res.send('Hello World!')
})

client.connect(err => {
    const bookings = client.db("burjAlArab").collection("booking");

    app.post('/addBooking', (req, res) => {
        const newBooking = req.body;
        bookings.insertOne(newBooking)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        console.log(newBooking)
    })

    app.get('/booking', (req, res) => {
        // console.log(req.query.email)
        bookings.find({ email: req.query.email })
            .toArray((err, document) => {
                res.send(document);
        })
    })


});

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
})