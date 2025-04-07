
// import express module
const express = require("express");
// call the router method from express to create the router
const router = express.Router();
// import service controller
const serviceController = require("../controllers/service.controller");
// import middleware
const authMiddleware = require("../middlewares/auth.middleware");

// Create a route to handle the add service request on POST
router.post(
  "/api/service",
//   [authMiddleware.verifyToken, authMiddleware.isAdmin],
  serviceController.createService
);
// Create a route to handle the get all service request on GET
router.get(
  "/api/service",
//   [authMiddleware.verifyToken, authMiddleware.isAdmin],
  serviceController.getAllServices
);
// Create a route to handle the get a single service request on GET
router.get(
  "/api/service/:service_id",
//   [authMiddleware.verifyToken, authMiddleware.isAdmin],
  serviceController.getSingleService
);
// Update service route (PUT)
router.put(
  "/api/service/:id",
//   [authMiddleware.verifyToken, authMiddleware.isAdmin],
  serviceController.updateService
);

module.exports = router;