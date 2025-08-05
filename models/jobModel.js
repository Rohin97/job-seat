const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      required: [true, "Company name required.\n"],
      trim: true
    },
    role: {
      type: String,
      trim: true,
      default: "Software Engineer"
    },
    status: {
      type: String,
      default: "Applied"
    },
    jobUrl: {
      type: String,
      trim: true,
      required: [true, "Link to job posting required.\n"]
    },
    dateApplied: {
      type: Date,
      default: Date.now()
    },
    scheduledAt: {
      type: Date
    },
    dateUpdated: {
      type: Date,
      default: Date.now()
    },
    location: {
      type: String,
      enum: {
        values: ["NYC", "Remote"],
        message: "Location limited to NYC or Remote"
      }
    },
    industry: {
      type: String,
      default: "Not specified"
    },
    interviewNotes: {
      type: String
    }
  },
  {
    toJSON: { virtuals: true },
    toObjects: { virtuals: true }
  }
);

const Job = mongoose.model("Job", jobSchema);

// const testJob = new Job({
//   company: "Stripe",
//   status: "Applied",
//   jobUrl: "link",
//   location: "NYC"
// });
// testJob
//   .save()
//   .then(doc => console.log(doc))
//   .catch(err => console.log("ERROR!"));

module.exports = Job;
