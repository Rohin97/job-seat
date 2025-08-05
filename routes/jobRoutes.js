const express = require("express");
const jobController = require("./../controllers/jobController");

const router = express.Router();

router
  .route("/")
  .get(jobController.getAllJobs)
  .post(jobController.cleanReq, jobController.createJob);

router
  .route("/:id")
  .get(jobController.getJob)
  .patch(jobController.updateJob);
//   .delete(tourController.deleteTour);

router.route("/bulk-delete").delete(jobController.deleteJobs);

router.route("/bulk-load").post(jobController.bulkLoad);

module.exports = router;
