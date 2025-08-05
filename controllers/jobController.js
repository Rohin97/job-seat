const fs = require("fs");
const Job = require("./../models/jobModel");

// MIDDLEWARES
exports.cleanReq = (req, res, next) => {
  let body = {};

  for (const key in req.body) {
    const value = req.body[key];
    if (
      value !== null &&
      value !== undefined &&
      (typeof value !== "string" || value.trim() !== "")
    ) {
      body[key] = value;
    }
  }

  req.body = body;
  next();
};

///////////////////////////////
/*
Thanks that is a smart suggestion. However, is it possible to have the tight control with a two column layout. What is the issue that is biggest restricting factor in implementing the two column layout?
*/

exports.getAllJobs = async (req, res) => {
  try {
    let query = Job.find();
    const jobs = req.query.sort
      ? await query.sort(req.query.sort)
      : await query;
    res.status(200).json({
      status: "success",
      data: { jobs }
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message
    });
  }
};

exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    res.status(200).json({
      status: "success",
      data: {
        job
      }
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message
    });
  }
};

exports.createJob = async (req, res) => {
  //   console.log(req);
  try {
    const job = await Job.create(req.body);
    // console.log(job);
    res.status(201).json({
      status: "success",
      data: {
        job
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message
    });
  }
};

exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: "success",
      data: {
        job
      }
    });
  } catch (err) {
    res.status(404).json({
      status: "fail",
      message: err.message
    });
  }
};

exports.deleteJobs = async (req, res) => {
  try {
    // console.log(req.body.ids);
    jobsArr = req.body.ids;
    jobs = await Job.deleteMany({ _id: { $in: jobsArr } });
    res.status(202).json({
      status: "success",
      data: {
        jobsDeleted: jobs.deletedCount
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err
    });
  }
};

exports.bulkLoad = async (req, res) => {
  try {
    const jobsData = JSON.parse(
      fs.readFileSync(
        `${__dirname}/../dev-data/data/jobseat.jobs.json`,
        "utf-8"
      )
    );
    const jobs = await Job.create(jobsData);
    res.status(200).json({
      status: "success",
      data: {
        jobsAdd: jobs.length,
        jobs
      }
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err
    });
  }
};
