
//Import the express module
const express = require("express");
//call the router method from express to create the router
const router = express.Router();
//Import the middleware
const authMiddleware = require("../middlewares/auth.middleware");
//Import the vehicle controller
const vehicleController = require("../controllers/vehicle.controller");

//create the route to handle the add vehicle post
router.post(
  "/api/add-vehicle",
  // [authMiddleware.verifyToken, authMiddleware.isAdmin],
  vehicleController.createVehicle
);
// create the rout to handle all vehicles
router.get(
  "/api/get-all-vehicles",
  // [authMiddleware.verifyToken, authMiddleware.isAdmin],
  vehicleController.getAllVehicles
);
//create the route to handle the get a vehicle
router.get(
  "/api/get-vehicle",
  // [authMiddleware.verifyToken, authMiddleware.isAdmin],
  vehicleController.getVehicle
);
// create the route to hanlde the updte vehicle
router.put(
  "/api/update-vehicle",
  // [authMiddleware.verifyToken, authMiddleware.isAdmin],
  vehicleController.updateVehicle
);

//Export the router
module.exports = router;