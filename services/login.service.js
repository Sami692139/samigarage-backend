// Import the query function from the db.config.js file 
const conn = require("../config/db.config");
// Import the bcrypt module to do the password comparison 
const bcrypt = require('bcrypt');
// Import the employee service to get employee by email  
const employeeService = require("./employee.service");

async function logIn(employeeData) {
  try {
    let returnData = {};

    // Fetch the employee data from the service
    const employee = await employeeService.getEmployeeByEmail(
      employeeData.employee_email
    );

    console.log("Employee Data Retrieved:", employee); // Debugging line

    // Ensure employee data is an array and has the expected properties
    if (!employee || employee.length === 0) {
      returnData = {
        status: "fail",
        message: "Employee does not exist",
      };
      console.error("Error: Employee does not exist.");
      return returnData;
    }

    // Check if employee_password_hashed exists
    if (!employee[0] || !employee[0].employee_password_hashed) {
      console.error("Error: employee_password_hashed is missing in DB result");
      return {
        status: "fail",
        message: "Invalid employee data",
      };
    }

    // Compare the password with the hashed password stored in the database
    const passwordMatch = await bcrypt.compare(
      employeeData.employee_password,
      employee[0].employee_password_hashed
    );

    if (!passwordMatch) {
      returnData = {
        status: "fail",
        message: "Incorrect password",
      };
      console.error("Error: Incorrect password");
      return returnData;
    }

    // If login is successful, return employee data
    returnData = {
      status: "success",
      data: employee[0], // You might want to exclude sensitive info like password
    };
    return returnData;
  } catch (error) {
    console.error("Login Error:", error);
    return {
      status: "fail",
      message: "Internal server error",
    };
  }
}



// Export the function 
module.exports = {
  logIn
};

