// Import the login service 
const loginService = require('../services/login.service');
// Import the jsonwebtoken module
const jwt = require("jsonwebtoken");
// Import the secret key from the environment variables
const jwtSecret = process.env.JWT_SECRET;

// Handle employee login 
async function logIn(req, res, next) {
  try {
    console.log(req.body);
    const employeeData = req.body;

    const employee = await loginService.logIn(employeeData);

    if (employee.status === "fail") {
      return res.status(403).json({
        status: employee.status,
        message: employee.message,
      });
    }

    const payload = {
      employee_id: employee.data.employee_id,
      employee_email: employee.data.employee_email,
      employee_role: employee.data.company_role_id,
      employee_first_name: employee.data.employee_first_name,
    };

    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: "24h",
    });

    const sendBack = {
      employee_token: token,
    };

    return res.status(200).json({
      status: "success",
      message: "Employee logged in successfully",
      data: sendBack,
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
    });
  }
}


// Export the functions 
module.exports = {
  logIn
};

