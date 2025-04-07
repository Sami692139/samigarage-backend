// Import the express module
const express = require("express");
// Call the router method from express to create the router
const router = express.Router();
// Import order controller
const OrderController = require("../controllers/order.controller");
// Import middleware (Uncomment if needed)
// const authMiddleware = require("../middlewares/auth.middleware");

// Create a route to handle the add order request on POST
router.post("/api/order", OrderController.createOrder);

// Create a route to handle the get all orders request on GET
router.get("/api/orders", OrderController.getAllOrders);

// Create a route to handle the get a single order request on GET
router.get("/api/order/:id", OrderController.getSingleOrder);

// Update order route (PUT)
router.put("/api/order/:id", OrderController.updateOrder);



// Export router
module.exports = router;
