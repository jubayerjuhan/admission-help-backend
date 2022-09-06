const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
const fileUpload = require("express-fileupload");
require("dotenv").config();
const uri = `${process.env.DB_URI}`;
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static("item"));
app.use(fileUpload());

const port = 4200;

app.get("/", (req, res) => {
  res.send("hello from db it's working working");
});

app.use(express.static("public"));
app.use("/images", express.static("./item/"));

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const orderCollection = client
    .db(`${process.env.DB_FILE}`)
    .collection("allOrder");
  const foodCollection = client
    .db(`${process.env.DB_FILE}`)
    .collection("allFood");
  const itemCollection = client
    .db(`${process.env.DB_FILE}`)
    .collection("allBook");
  const questionCollection = client
    .db(`${process.env.DB_FILE}`)
    .collection("allQuestion");
  const teacherCollection = client
    .db(`${process.env.DB_FILE}`)
    .collection("allTeacher");
  const opinionCollection = client
    .db(`${process.env.DB_FILE}`)
    .collection("allOpinion");
  const appointmentCollection = client
    .db(`${process.env.DB_FILE}`)
    .collection("allAppointment");
  const universityCollection = client
    .db(`${process.env.DB_FILE}`)
    .collection("allUniversity");

  // ==========================
  const examResultCollection = client
    .db(`${process.env.DB_FILE}`)
    .collection("examResults");
  // ==========================

  //for order
  app.post("/addOrder", (req, res) => {
    const order = req.body;
    orderCollection.insertOne(order).then((result) => {
      if (result.insertedId) return res.send(true);
      res.send(false);
    });
  });
  app.get("/allOrder", (req, res) => {
    orderCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/order-user/:id", (req, res) => {
    orderCollection
      .find({
        "user.userId": req.params.id,
      })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  app.get("/order/:id", async (req, res) => {
    orderCollection
      .find({
        _id: ObjectId(req.params.id),
      })
      .toArray((err, documents) => {
        if (documents.length < 1) return res.send(false);
        res.send(documents);
      });
  });
  app.delete("/order/:id", async (req, res) => {
    orderCollection
      .deleteOne({
        _id: ObjectId(req.params.id),
      })
      .then((res) => {
        console.log(res, "first");
      });
  });
  app.patch("/updateOrder/:id", (req, res) => {
    orderCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            finalData: req.body,
          },
        }
      )
      .then((result) => {
        res.send(result.matchedCount > 0);
      });
  });

  //for amount
  app.patch("/updateAmount/:id", (req, res) => {
    orderCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            finalData: req.body,
          },
        }
      )
      .then((result) => {
        res.send(result.matchedCount > 0);
      });
  });

  //for book
  app.post("/addbooks", (req, res) => {
    const file = req.files.file;
    const image = req.files.file.name;
    const title = req.body.title;
    const price = req.body.price;
    const description = req.body?.description;
    const shortDescription = req.body?.shortDescription;

    file.mv(`${__dirname}/item/${file.name}`, (err) => {
      if (err) {
        return res.status(500).send({ msg: "Failed to upload Image" });
      }
    });

    itemCollection
      .insertOne({ title, price, description, shortDescription, image })
      .then((result) => {
        console.log(result.insertedId);
        if (result.insertedId) return res.send(true);
        res.send(false);
      });
  });
  app.get("/books", (req, res) => {
    itemCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/item/:id", (req, res) => {
    itemCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });
  app.patch("/updateItem/:id", (req, res) => {
    itemCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            title: req.body.title,
            price: req.body.price,
            description: req.body.description,
            shortDescription: req.body.shortDescription,
          },
        }
      )
      .then((result) => {
        res.send(result.matchedCount > 0);
      });
  });
  app.delete("/deleteItem/:id", (req, res) => {
    itemCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });

  //for university
  app.post("/addUniversity", (req, res) => {
    const data = req.body;
    universityCollection.insertOne({ data }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/universities", (req, res) => {
    universityCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/university/:id", (req, res) => {
    universityCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });
  app.delete("/deleteUniversity/:id", (req, res) => {
    universityCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
  app.patch("/updateUniversity/:id", (req, res) => {
    universityCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            data: req.body,
          },
        }
      )
      .then((result) => {
        res.send(result.matchedCount > 0);
      });
  });

  //for questions
  app.post("/addquestion", (req, res) => {
    const data = req.body;

    if (!data?.question)
      return res.status(404).json({
        status: false,
        message: "no question found",
      });

    questionCollection.insertOne({ data }).then((result) => {
      res.status(201).json({
        status: "success",
      });
    });
  });
  app.get("/questions", (req, res) => {
    questionCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/questionsRand", (req, res) => {
    questionCollection
      .find({})
      .limit(-5)
      .skip(1)
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  app.get("/question/:id", (req, res) => {
    questionCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });
  app.delete("/deleteQuestion/:id", (req, res) => {
    questionCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
  app.patch("/updateQuestion/:id", (req, res) => {
    questionCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            data: req.body,
          },
        }
      )
      .then((result) => {
        res.send(result.matchedCount > 0);
      });
  });

  //for teacher
  app.post("/addTeacher", (req, res) => {
    const category = req.body.category;
    const designation = req.body.designation;
    const status = req.body.status;
    const subject = req.body.subject;
    const teacherName = req.body.teacherName;
    const workingPlace = req.body.workingPlace;
    teacherCollection
      .insertOne({
        category,
        designation,
        status,
        subject,
        teacherName,
        workingPlace,
      })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });
  app.get("/teachers", (req, res) => {
    teacherCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.get("/teacher/:id", (req, res) => {
    teacherCollection
      .find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      });
  });
  app.delete("/deleteTeacher/:id", (req, res) => {
    teacherCollection
      .deleteOne({ _id: ObjectId(req.params.id) })
      .then((result) => {
        res.send(result.deletedCount > 0);
      });
  });
  app.patch("/updateTeacher/:id", (req, res) => {
    teacherCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            category: req.body.category,
            designation: req.body.designation,
            status: req.body.status,
            subject: req.body.subject,
            teacherName: req.body.teacherName,
            workingPlace: req.body.workingPlace,
          },
        }
      )
      .then((result) => {
        res.send(result.matchedCount > 0);
      });
  });

  //for opinion
  app.post("/addOpinion", (req, res) => {
    const data = req.body;
    opinionCollection.insertOne({ data }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  app.get("/opinions", (req, res) => {
    opinionCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  //for appointment
  app.post("/addAppointment", (req, res) => {
    const email = req.body.email;
    const teacher = req.body.teacher;
    const status = req.body.status;
    const approvedData = {};
    appointmentCollection
      .insertOne({ email, teacher, status, approvedData })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });
  app.get("/appointments", (req, res) => {
    appointmentCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.patch("/updateAppointment/:id", (req, res) => {
    appointmentCollection
      .updateOne(
        { _id: ObjectId(req.params.id) },
        {
          $set: {
            email: req.body.email,
            teacher: req.body.teacher,
            status: req.body.status,
            approvedData: req.body.approvedData,
          },
        }
      )
      .then((result) => {
        res.send(result.matchedCount > 0);
      });
  });
  app.post("/addResult", async (req, res) => {
    const { user, mark, fullMark, section } = req.body;

    const result = await examResultCollection.insertOne({
      user,
      mark,
      fullMark,
      section,
      time: Date.now(),
    });
    if (!result.insertedId) return res.send(false);
    res.send(true);
  });

  // get result
  app.get("/getResult/:id", async (req, res) => {
    examResultCollection
      .find({ "user.userId": req.params.id })
      .toArray((err, doc) => {
        res.send(doc);
      });
  });
});

// exam result storing and getting

// add question

app.listen(process.env.PORT || port, () => {
  console.log("Listening to port", process.env.PORT || port);
});
