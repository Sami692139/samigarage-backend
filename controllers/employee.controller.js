// Import necessary modules
const employeeService = require("../services/employee.service");
const conn = require("../config/db.config"); // Ensure this is correct


// Create the add employee controller
async function createEmployee(req, res, next) {
  try {
    // Check if employee email already exists in the database
    const employeeExists = await employeeService.checkIfEmployeeExists(
      req.body.employee_email
    );

    if (employeeExists) {
      return res.status(400).json({
        error:
          "This email address is already associated with another employee!",
      });
    }

    // Create the employee
    const employeeData = req.body;
    const employee = await employeeService.createEmployee(employeeData);

    if (!employee) {
      return res.status(400).json({
        error: "Failed to add the employee!",
      });
    }

    res.status(200).json({
      status: "true",
      message: "Employee created successfully!",
    });
  } catch (error) {
    console.log(error); // ✅ Fixed error variable name
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
}

// Create a getAllEmployees controller
async function getAllEmployees(req, res, next) {
  try {
    // Call the getAllEmployees method from employee service
    const employees = await employeeService.getAllEmployees();

    if (!employees || employees.length === 0) {
      return res.status(400).json({
        error: "Failed to get the employees!",
      });
    }

    res.status(200).json({
      status: "success",
      data: employees,
    });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}

// Get single employee by ID
// async function getEmployeeById(req, res) {
//   const employee_id = req.params.id;

//   try {
//     const employee = await employeeService.getEmployeeById(employee_id);

//     if (!employee) {
//       return res.status(404).json({
//         error: "Employee not found",
//       });
//     }

//     res.status(200).json({
//       status: "success",
//       data: employee,
//     });
//   } catch (error) {
//     console.error("Error fetching employee:", error);
//     res.status(500).json({
//       error: "Internal server error",
//     });
//   }
// }
// Function to get a single employee by ID
// Function to get a single employee by ID
async function getEmployeeById(req, res) {
  try {
    const employeeId = req.params.id; // Get the employee ID from URL params

    // Fetch the employee details from the service
    const employee = await employeeService.getEmployeeById(employeeId);

    // Return employee details as JSON
    return res.status(200).json(employee);
  } catch (error) {
    // Handle the error and return a proper message
    if (error.message === "Employee not found") {
      return res.status(404).json({ error: "Employee not found" });
    }
    console.error("Error fetching employee:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}



// Update employee controller
async function updateEmployee(req, res) {
  try {
    const employee_id = req.params.employee_id;
    const updatedData = req.body;

    // Convert `active_employee` to boolean if it's 1 or 0
    if (updatedData.active_employee !== undefined) {
      updatedData.active_employee = updatedData.active_employee === 1;
    }

    // Validate required fields
    if (
      !updatedData.employee_first_name ||
      !updatedData.employee_last_name ||
      !updatedData.employee_phone
    ) {
      return res
        .status(400)
        .json({ error: "First name, last name, and phone are required" });
    }

    // Validate `active_employee`
    if (
      updatedData.active_employee !== undefined &&
      typeof updatedData.active_employee !== "boolean"
    ) {
      return res.status(400).json({ error: "Active status must be a boolean" });
    }

    // Pass `conn` to the service function
    const result = await employeeService.updateEmployee(
      employee_id,
      updatedData,
      conn
    );

    if (result.success) {
      return res.status(200).json({ message: result.message });
    } else {
      return res.status(400).json({ error: result.message });
    }
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

// Delete employee controller
async function deleteEmployee(req, res) {
  try {
    const employee_id = req.params.employee_id; // Get employee ID from the URL params

    // Check if the employee exists
    const employee = await employeeService.getEmployeeById(employee_id);
    if (!employee) {
      return res.status(404).json({
        error: "Employee not found",
      });
    }

    // Call the deleteEmployee service function
    const result = await employeeService.deleteEmployee(employee_id);

    if (result.success) {
      return res.status(200).json({
        message: "Employee deleted successfully!",
      });
    } else {
      return res.status(400).json({
        error: result.message || "Failed to delete the employee",
      });
    }
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
}
// Export the controllers
module.exports = {
  createEmployee,
  getAllEmployees,
  getEmployeeById, // Export the getEmployeeById function
  updateEmployee,
  deleteEmployee,
};
