const express = require("express");
const { MongoClient, ServerApiVersion } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jfvuq.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
async function run() {
  try {
    await client.connect();
    const database = client.db("Power-Hack");
    const billInfoCollection = database.collection("billInfo");

    //api post billin info
    app.post("/api/add-billing", async (req, res) => {
      const doc = req.body;
      console.log(doc);
      const options = { ordered: true };
      const result = await billInfoCollection.insertOne(doc, options);
      res.send(result);
    });
    // get billInfo
    app.get("/api/billing-list", async (req, res) => {
      const cursor = billInfoCollection.find({});
      const page = parseInt(req.query.page);
      let billInfo;
      const count = await cursor.count();
      if (page >= 0) {
        billInfo = await cursor
          .skip(page * 10)
          .limit(10)
          .toArray();
      } else {
        billInfo = await cursor.toArray();
      }
      res.send({
        count,
        billInfo,
      });
    });
    //delete billInfo
    app.delete("/api/delete-billing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await billInfoCollection.deleteOne(query);
      res.json(result);
    });
    // fetch by id
    app.get("/api/billing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await billInfoCollection.findOne(query);
      res.send(result);
    });
    // update bill info
    app.put("api/update-billing/:id", async (req, res) => {
      const id = req.params.id;
      const updateBillInfo = req.body;
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          name: updateBillInfo.name,
          email: updateBillInfo.email,
          phone: updateBillInfo.phone,
          paidAmount: updateBillInfo.paidAmount,
        },
      };
      const result = await billInfoCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });
    app.get("/bill", async(req,res)=>{
      const cursor= billInfoCollection.find({});
      const bill= await cursor.toArray();
      res.json(bill);
    })
    
  } finally {
    //   await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Surver Run");
});
app.listen(port, () => {
  console.log("Runnig server on port", port);
});
