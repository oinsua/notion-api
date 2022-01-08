const express = require("express");
const moduleToFetch = require("./index");
const getLessonsDatabase = moduleToFetch.getLessonsDatabase;
const getSuppliesToDatabase = moduleToFetch.getSuppliesToDatabase;
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

app.get("/lessons", async (req, res) => {
  try {
    const lessons = await getLessonsDatabase();
    res.status(200).json(lessons);
  } catch (error) {
    console.log(error);
  }
});

app.get("/supplies", async (req, res) => {
  try {
    const supplies = await getSuppliesToDatabase();
    res.status(200).json(supplies);
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, console.log(`Server started on ${port}`));
