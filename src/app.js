const express = require("express");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./routes/authRoutes");
const readingRoutes = require("./routes/readingRoutes");
const qaRoutes = require("./routes/qaRoutes");
const challengeRoutes = require("./routes/challengeRoutes");
const textRoutes = require("./routes/textRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const { errorHandler } = require("./middleware/errorMiddleware");

const app = express();

app.use(cors());
app.use(express.json());

//configuration
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// static files
app.use(express.static(path.join(__dirname, "..", "public")));


// routes
app.use("/api/auth", authRoutes);
app.use("/api/reading", readingRoutes);
app.use("/api/qa", qaRoutes);
app.use("/api/challenges", challengeRoutes);
app.use("/api/text", textRoutes);
app.use("/api/teacher", teacherRoutes);


// default
app.get("/", (req, res) => {
  res.render("home");
});

app.get("/signup", (req, res) => {
  res.render("signup");   // signup.ejs render karega
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.get("/dashboard/student", (req, res) => {
  res.render("studentDashboard");
});

app.get("/dashboard/teacher", (req, res) => {
  res.render("teacherDashboard");
});

app.get("/choose-role", (req, res) => {
  res.render("chooseRole");
});



// error handler
app.use(errorHandler);

module.exports = app;
