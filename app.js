const express = require("express");
const cors = require("cors");

const jobRouter = require("./routes/jobRoutes");
// const userRouter = require("./routes/userRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES
app.use("/api/v1/jobs", jobRouter);
// app.use("/api/v1/users", userRouter);

module.exports = app;
