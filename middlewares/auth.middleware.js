//Import the dotenv module
require('dotenv').config();
// Import the jsonwebtoken package
const jwt = require('jsonwebtoken');
const employeeService = require("../services/employee.service");


// A function to verify the token recivied from the frontend



const verifyToken = async (req, res, next) => {
    const token = req.headers['x-access-token'];
    // Check if the token is provided
    if (!token) {
        return res.status(403).send({ 
            status: 'fail',
            message: 'No token provided!' });
    }
    // Verify the token using the secret key from environment variables
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        // Check if the token is valid
        if (err) {
            return res.status(401).send({ 
                status: 'fail',
                message: 'Unauthorized!' });
        }
        // Set the decoded token to the request object
      req.employee_email = decoded.employee_email;
        next();
    });

    

}
// A function to check if the user is an admin
const isAdmin = async (req, res, next) => {
   // const token = req.headers['x-access-token'];
    const employee_email = req.employee_email;
    const employee = await employeeService.getEmployeeByEmail(employee_email);
    if (employee[0].company_role_id === 3) 
        {
        next();
    }else{
        return res.status(403).send({ 
            status: 'fail',
            message: 'Unauthorized!' });
    }
} 
// Export the verifyToken function
const authMiddleware = {
    verifyToken, isAdmin
}
module.exports = authMiddleware;

