// Import the express module
const express = require("express");
// Call the router method from express to create the router
const router = express.Router();
// Import customer controller
const customerController = require("../controllers/customer.controller");
// Import middleware
const authMiddleware = require("../middlewares/auth.middleware");

// Create a route to handle the add customer request on POST
router.post(
  "/api/customer",
  
  customerController.createCustomer
);

// Create a route to handle the get all customer request on GET
router.get(
  "/api/customers",
 
  customerController.getAllCustomers
);

// Create a route to handle the get a single customer request on GET
router.get(
  "/api/customer/:id",  // :id is the parameter for customer ID
  customerController.getSingleCustomer
);
// Update customer route (PUT)
router.put("/api/customer/:id", customerController.updateCustomer);
// Searching customers
router.get(
  "/api/customers/search",  
  customerController.searchCustomers
);


// Export router
module.exports = router;
