// Import the express module 
const express = require('express');
// Call the router method from express to create the router 
const router = express.Router();
// Import the install router 
const installRouter = require('./install.routes');
// Import the employee routes 
const employeeRouter = require('./employee.routes');
// Import the customer routes
const customerRouter = require('./customer.routes');
// Import the login routes 
const loginRoutes = require("./login.routes");
// Import the order routes
const orderRoutes = require("./order.routes");
//Import the service routes
const serviceRoutes = require("./service.routes");
// Import the vehicle routes
const vehicleRoutes = require("./vehicle.routes");

// Add the install router to the main router 
router.use(installRouter);
// Add the employee routes to the main router 
router.use(employeeRouter);
// Add the customer routes to the main router 
router.use(customerRouter);
// Add the login routes to the main router
router.use(loginRoutes);
//add the order routes to the main router
router.use(orderRoutes);
// Import the service routes to the main router
 router.use(serviceRoutes);
 // Add the vehicle routes to the main router
router.use(vehicleRoutes);

// Export the router
module.exports = router; 
