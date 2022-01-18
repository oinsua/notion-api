const express = require("express");
const moduleToFetch = require("./index");
const classes = require("./src/jsonClasses");
const lessons = require("./src/jsonLessons");
const getStepsDatabase = moduleToFetch.getStepsDatabase;
const getClassesDatabase = moduleToFetch.getClassesDatabase;
const getAllStepsToDatabase = moduleToFetch.getAllStepsToDatabase;
const getAllClassesToDatabase = moduleToFetch.getAllClassesToDatabase;
const getAllLessonsFromDatabase = lessons.getAllLessonsFromDatabase;
const getAllClassesFromDatabase = classes.getAllClassesFromDatabase;
const getPagesFromDatabase = moduleToFetch.getPagesFromDatabase;
const getPagesById = moduleToFetch.getPagesById;
const findClassById = moduleToFetch.findClassById;
const cors = require('cors');
const port = 8000;

const app = express();

app.use(cors());

app.use(express.static("public"));
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get("/steps", async (req, res) => {
  try {
    const steps = await getStepsDatabase();
    res.status(200).json(steps);
  } catch (error) {
    console.log(error);
  }
});

app.get("/all/steps", async (req, res) => {
  try {
    const steps = await getAllStepsToDatabase();
    res.status(200).json(steps);
  } catch (error) {
    console.log(error);
  }
});

app.get("/classes", async (req, res) => {
  try {
    const classes = await getPagesFromDatabase({database_Id: "75050910b89b48c6a52274bd0de4bb7b"});
    res.status(200).json(classes);
  } catch (error) {
    console.log(error);
  }
});

app.get("/all/classes", async (req, res) => {
  try {
    const classes = await getAllClassesToDatabase();
    res.status(200).json(classes);
  } catch (error) {
    console.log(error);
  }
});

app.get("/all/classes/:databaseId", async (req, res) => {
  const databaseId = req.params.databaseId;
  console.log('databaseId:', databaseId);
   try {
     const pages = await getAllClassesFromDatabase({databaseId});
     res.status(200).json(pages);
   } catch (error) {
     console.log(error);
   }
});

app.get("/all/lessons/:databaseId", async (req, res) => {
  const databaseId = req.params.databaseId;
  console.log('databaseId:', databaseId);
   try {
     const pages = await getAllLessonsFromDatabase({databaseId});
     res.status(200).json(pages);
   } catch (error) {
     console.log(error);
   }
});

app.get("/:classId", async (req, res) => {
  const classId = req.params.classId;
  const result = await findClassById({classId});
  res.status(200).json(result);
});

app.get("/page/:pageId", async (req, res) => {
  const pageId = req.params.pageId;
  const result = await getPagesById({pageId});
  res.status(200).json(result);
});


app.listen(port, console.log(`Server started on ${port}`));
