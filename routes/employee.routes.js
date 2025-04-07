// Import the express module  
const express = require('express');
// Call the router method from express to create the router 
const router = express.Router();
// Import the employee controller
const employeeController = require('../controllers/employee.controller');
//Import middleware
const authMiddleware= require('../middlewares/auth.middleware')
// Create a route to handle the add employee request on post
router.post("/api/employee",
  [authMiddleware.verifyToken, authMiddleware.isAdmin],
   employeeController.createEmployee);
// Create a route to handle the get single employee by id request
router.get("/api/employee/:id",  employeeController.getEmployeeById); // New route

//Creat a route to  handle the get all employees request on get
router.get("/api/employee", [authMiddleware.verifyToken, authMiddleware.isAdmin], employeeController.getAllEmployees);

// Update employee route (PUT)
router.put(
  "/api/employees/:employee_id",
  
  employeeController.updateEmployee
);
// Delete employee route (DELETE)
router.delete("/api/employees/:employee_id", employeeController.deleteEmployee);

// Export the router
module.exports = router;