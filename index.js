const express = require('express')
const cors = require('cors');
const app = express();
require('dotenv').config()
const { MongoClient } = require('mongodb')
const ObjectId = require('mongodb').ObjectId;
const { default: axios } = require('axios');
const port = process.env.PORT || 5000;

// middlewares
app.use(cors())
app.use(express.json())

async function run() {
    const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.e2cer.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    await client.connect()
    console.log('mongo ready');
    const db = client.db(process.env.DB);

    // place api 
    const place = db.collection('place');

    app.get('/', (req, res) => {
        place.find({}).sort({_id:1}).limit(6).toArray().then((response) => {
            res.send(response);
        })
    })

    app.get('/latest', (req, res) => {
        place.find({}).sort({_id:-1}).limit(6).toArray().then((response) => {
            res.send(response);
        })
    })

    app.get('/place/:id', (req, res) => {
        place.findOne({_id:ObjectId(req.params.id)}).then((response) => {
            res.send(response);
        })
    })

    app.post('/', (req, res) => {
        place.insertOne(req.body).then((response) => {
            res.send('Added succesfully');
        })
            .catch(error => {
                res.send(error)
            })
    })

    // members api 
    const member = db.collection('member')

    app.get('/latest-member', (req, res) => {
        member.find().sort({_id:-1}).limit(4).toArray()
            .then((response) => {
                res.send(response);
            })
            .catch(error => {
                res.send(error)
            })
    })

    app.post('/register-user', (req, res) => {
        member.find({ email: req.body.email }).limit(1).toArray()
            .then((response) => {
                if (response.length > 0) {
                    res.send();
                } else {
                    member.insertOne(req.body)
                        .then((response2) => {
                            res.send('Welcome to TouridmBD');
                        })
                        .catch(error => {
                            res.send(error)
                        })
                }
            })
            .catch(error => {
                res.send(error)
            })
    })

    // booking api
    const booking = db.collection('booking');

    app.get('/bookings', (req,res) => {
        booking.find({}).toArray().then(response=>{
            res.send(response)
        })
    })

    app.get('/booking/:userId', (req,res) => {
        booking.find({ user: req.params.userId }).toArray().then(response=>{
            res.send(response)
        })
    })

    app.delete('/booking/:id', (req,res) => {
        booking.deleteOne({ _id: ObjectId(req.params.id) }).then(response=>{
            res.send(response)
        })
    })

    app.put('/booking/:id', (req,res) => {
        // booking.updateOne({ _id: ObjectId(req.params.id) },{$set:{status:'approved'}},{upsert:false}).then(response=>{
        //     res.send(response)
        // })
        res.send(req.params)
    })

    app.post('/booking', (req,res) => {
        booking.insertOne(req.body).then(response=>{
            res.send('Booking added successfully')
        })
    })
}
run().catch(console.dir)

app.listen(port, () => {
    console.log('http://localhost:'+port);
})