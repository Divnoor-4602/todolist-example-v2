//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://Divnoor:Frosty4602@todolistapp-example.bcddpqb.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp",
  {
    useNewUrlParser: true,
    dbName: "todolistDB",
  }
);

// items schema mongo db
const itmesSchema = mongoose.Schema({
  title: String,
});

// list schema for multiple cutom lists
const listSchema = mongoose.Schema({
  nameList: String,
  items: [itmesSchema],
});

// mongoose model
const itemsModel = mongoose.model("Item", itmesSchema);
const listModel = mongoose.model("List", listSchema);

// three default items
const task1 = new itemsModel({
  title: "Get things done",
});

const task2 = new itemsModel({
  title: "Click on the + to add tasks",
});

const task3 = new itemsModel({
  title: "You got this!",
});

const defaultItems = [task1, task2, task3];

// itemsModel.insertMany(defaultItems).then(function (result) {
//   console.log(result);
// });

app.get("/", function (req, res) {
  itemsModel.find().then(function (result) {
    if (result.length == 0) {
      itemsModel.insertMany(defaultItems);
      res.redirect("/");
    } else {
      res.render("list.ejs", { listTitle: "Today", newListItems: result });
    }
  });
});

app.post("/", async function (req, res) {
  const itemToAdd = req.body.newItem;
  const listTitleAdd = req.body.list;
  console.log(listTitleAdd);

  const taskToAdd = new itemsModel({
    title: itemToAdd,
  });

  if (listTitleAdd == "Today") {
    itemsModel.create(taskToAdd);
    res.redirect("/");
  } else {
    await listModel.findOne({ nameList: listTitleAdd }).then(function (result) {
      result.items.push(taskToAdd);
      result.save();
    });
    res.redirect("/" + listTitleAdd);
  }
});

// delete route
app.post("/delete", async (req, res) => {
  const listToDeleteTaskFrom = Object.keys(req.body)[0];
  const taskToDelete = req.body[listToDeleteTaskFrom];

  if (listToDeleteTaskFrom == "Today") {
    await itemsModel.deleteOne({ title: taskToDelete }).then(function (result) {
      console.log(result);
    });
  } else {
    await listModel.find({ nameList: listToDeleteTaskFrom }).then((result) => {
      console.log(result);
    });
  }

  // await itemsModel.deleteOne({ title: nameToDelete }).then(function (output) {
  //   console.log(output);
  // });
  res.redirect("/");
});

app.get("/work", function (req, res) {
  res.render("list", { listTitle: "Work List", newListItems: workItems });
});

app.get("/about", function (req, res) {
  res.render("about");
});

app.get("/:listType", async (req, res) => {
  const customListType = req.params.listType;

  await listModel.findOne({ nameList: customListType }).then(function (result) {
    if (result == null) {
      // custom list document
      const newList = new listModel({
        nameList: customListType,
        items: defaultItems,
      });

      listModel.create(newList).then(function (res) {
        console.log(`New list has been added!: ${customListType}`);
      });

      res.redirect("/" + customListType);
    } else {
      console.log("list already exists!");
      res.render("list", {
        listTitle: customListType,
        newListItems: result.items,
      });
    }
  });
});

app.listen(3000, function () {
  console.log("Server started on port 3000");
});
