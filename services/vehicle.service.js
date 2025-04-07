//Import the query function from the db.config file
const conn = require("../config/db.config");
//A function to create a new vehicle in the database

async function createVehicle(vehicleInfo) {
  let createdVehicle = {};
  try {
    const query =
      "INSERT INTO customer_vehicle_info(customer_id, vehicle_year, vehicle_make,vehicle_model,vehicle_type,vehicle_mileage,vehicle_tag,vehicle_serial,vehicle_color) VALUES(?,?,?,?,?,?,?,?,?) ";
    const rows = await conn.query(query, [
      vehicleInfo.customer_id,
      vehicleInfo.vehicle_year,
      vehicleInfo.vehicle_make,
      vehicleInfo.vehicle_model,
      vehicleInfo.vehicle_type,
      vehicleInfo.vehicle_mileage,
      vehicleInfo.vehicle_tag,
      vehicleInfo.vehicle_serial,
      vehicleInfo.vehicle_color,
    ]);
    //Check if the insertion was successful
    if (rows.affectedRows !== 1) {
      return {
        success: false,
        message: "Failed to insert customer vehicle",
      };
    }
    //Construct the vehicle object to return
    createdVehicle = {
      customer_id: vehicleInfo.customer_id,
      vehicle_year: vehicleInfo.vehicle_year,
      vehicle_make: vehicleInfo.vehicle_make,
      vehicle_model: vehicleInfo.vehicle_model,
      vehicle_type: vehicleInfo.vehicle_type,
      vehicle_mileage: vehicleInfo.vehicle_mileage,
      vehicle_tag: vehicleInfo.vehicle_tag,
      vehicle_serial_number: vehicleInfo.vehicle_serial,
      vehicle_color: vehicleInfo.vehicle_color,
    };
    return {
      success: true,
      createdVehicle,
      message: "Vehicle created successfully",
    };
  } catch (error) {
    return { success: false, message: "Database query failed." };
  }
}
// create the get all vehicles function
async function getAllVehicles() {
  try {
    const query = "SELECT * FROM customer_vehicle_info";
    const rows = await conn.query(query);

    // Always return array format
    if (rows.length === 0) {
      return {
        success: false,
        message: "No vehicles found",
        data: [], // Explicit empty array
      };
    }

    return {
      success: true,
      data: rows,
    };
  } catch (error) {
    console.error(error.message);
    return {
      success: false,
      message: "Database error",
      data: [], // Return empty array on error
    };
  }
}

async function getVehicle(customer_id) {
  try {
    const query = "SELECT * FROM customer_vehicle_info WHERE customer_id = ?";
    const rows = await conn.query(query, [customer_id]);

    // Always return array format
    if (rows.length === 0) {
      return {
        success: false,
        message: "No vehicles found for this customer",
        data: [], // Explicit empty array
      };
    }

    return {
      success: true,
      data: rows,
    };
  } catch (error) {
    console.error(error.message);
    return {
      success: false,
      message: "Database error",
      data: [], // Return empty array on error
    };
  }
}
// create the update vehicle function
async function updateVehicle(vehicleInfo) {
  try {
    const query = `
      UPDATE customer_vehicle_info 
      SET vehicle_year = ?, vehicle_make = ?, vehicle_model = ?, vehicle_type = ?, 
          vehicle_mileage = ?, vehicle_tag = ?, vehicle_serial = ?, vehicle_color = ? 
      WHERE vehicle_id = ?
    `;
    const rows = await conn.query(query, [
      vehicleInfo.vehicle_year,
      vehicleInfo.vehicle_make,
      vehicleInfo.vehicle_model,
      vehicleInfo.vehicle_type,
      parseInt(vehicleInfo.vehicle_mileage), // convert to number
      vehicleInfo.vehicle_tag,
      vehicleInfo.vehicle_serial,
      vehicleInfo.vehicle_color,
      vehicleInfo.vehicle_id, // <-- match vehicle_id, not customer_id
    ]);

    if (rows.affectedRows !== 1) {
      return {
        success: false,
        message: "Failed to update customer vehicle",
      };
    }

    return {
      success: true,
      message: "Vehicle updated successfully",
    };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, message: "Database query failed." };
  }
}


module.exports = {
  createVehicle,
  getAllVehicles,
  getVehicle,
  updateVehicle,
};
