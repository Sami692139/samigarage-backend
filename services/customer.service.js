const db = require("../config/db.config"); // Import the query function from db.config.js
const bcrypt = require("bcrypt");

// Function to check if a customer exists by email or phone number
const checkIfCustomerExists = async (customerEmail, customerPhoneNumber) => {
  try {
    const query = `
      SELECT * FROM customer_identifier 
      WHERE customer_email = ? OR customer_phone_number = ?
    `;
    const rows = await db.query(query, [customerEmail, customerPhoneNumber]);
    console.log("Database Query Result:", rows);

    if (rows.length === 0) {
      return null; // No customer found
    }

    return rows[0]; // Return the first customer if found
  } catch (error) {
    console.error("Error checking customer existence:", error);
    throw new Error("Database error while checking customer existence.");
  }
};

// Function to create a new customer
const createCustomer = async (customerData) => {
  try {
    // If no password is provided, set customer_hash to an empty string
    let customerHash = "";
    if (customerData.customer_password) {
      const salt = await bcrypt.genSalt(10);
      customerHash = await bcrypt.hash(customerData.customer_password, salt);
    }

    // Log the data before the query for debugging
    console.log("Customer Data for Insert:", customerData);

    // Insert into customer_identifier table
    const query1 = `
      INSERT INTO customer_identifier (customer_email, customer_phone_number, customer_hash) 
      VALUES (?, ?, ?)
    `;
    const result1 = await db.query(query1, [
      customerData.customer_email,
      customerData.customer_phone_number,
      customerHash, // This will be an empty string if no password is provided
    ]);

    // Get the inserted customer ID
    const customerId = result1.insertId;

    // Insert into customer_info table
    const query2 = `
      INSERT INTO customer_info (customer_id, customer_first_name, customer_last_name, active_customer_status)
      VALUES (?, ?, ?, ?)
    `;
    await db.query(query2, [
      customerId,
      customerData.customer_first_name || null, // Ensure null if not provided
      customerData.customer_last_name || null, // Ensure null if not provided
      customerData.active_customer_status || 0, // Fallback to 0 if missing
    ]);

    // Insert into customer_vehicle_info table (if vehicle data is provided)
    if (customerData.vehicle_info && Array.isArray(customerData.vehicle_info)) {
      for (let vehicle of customerData.vehicle_info) {
        const query3 = `
          INSERT INTO customer_vehicle_info (customer_id, vehicle_year, vehicle_make, vehicle_model, vehicle_type,
                                              vehicle_mileage, vehicle_tag, vehicle_serial, vehicle_color)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await db.query(query3, [
          customerId,
          vehicle.vehicle_year || null,
          vehicle.vehicle_make || null,
          vehicle.vehicle_model || null,
          vehicle.vehicle_type || null,
          vehicle.vehicle_mileage || null,
          vehicle.vehicle_tag || null,
          vehicle.vehicle_serial || null,
          vehicle.vehicle_color || null,
        ]);
      }
    }

    return { status: "success", message: "Customer created successfully!" };
  } catch (error) {
    console.error("Error creating customer:", error);
    throw new Error("Database error while creating customer.");
  }
};
// Function to get all customers and their details
const getAllCustomers = async () => {
  try {
    // Corrected SQL query to retrieve all customer details by joining customer_identifier and customer_info tables
    const query = `
      SELECT ci.customer_id, ci.customer_email, ci.customer_phone_number, ci.customer_added_date, 
             ci.customer_hash, c.customer_first_name, c.customer_last_name, 
             c.active_customer_status
      FROM customer_identifier ci
      LEFT JOIN customer_info c ON ci.customer_id = c.customer_id
    `;
    // Execute the query and get all customer records
    const rows = await db.query(query);

    // Return the rows (customers) if found, otherwise return an empty array
    return rows;
  } catch (error) {
    console.error("Error fetching customers:", error);
    throw new Error("Database error while fetching customers.");
  }
};
// Function to get a single customer by ID and their details
const getSingleCustomer = async (customerId) => {
  try {
    // SQL query to retrieve customer details and vehicle data
    const query = `
      SELECT 
        ci.customer_id, 
        ci.customer_email, 
        ci.customer_phone_number, 
        ci.customer_added_date, 
        ci.customer_hash, 
        c.customer_first_name, 
        c.customer_last_name, 
        c.active_customer_status,
        v.vehicle_id, 
        v.vehicle_year, 
        v.vehicle_make, 
        v.vehicle_model, 
        v.vehicle_type, 
        v.vehicle_mileage, 
        v.vehicle_tag, 
        v.vehicle_serial, 
        v.vehicle_color
      FROM customer_identifier ci
      LEFT JOIN customer_info c ON ci.customer_id = c.customer_id
      LEFT JOIN customer_vehicle_info v ON ci.customer_id = v.customer_id
      WHERE ci.customer_id = ?
    `;

    // Execute the query to fetch the customer record along with vehicle data
    const rows = await db.query(query, [customerId]);

    // If no customer found, return null
    if (rows.length === 0) {
      return null;
    }

    // Return the first (and only) customer found, including vehicle data
    return rows[0];
  } catch (error) {
    console.error("Error fetching customer:", error);
    throw new Error("Database error while fetching customer.");
  }
};
//Create the searchCustomers function to get the customer from teh database
async function searchCustomers(searchQuery) {
  try {
    const searchTerm = `%${searchQuery}%`;
    const query = `
      SELECT 
        customer_info.*,
        customer_identifier.customer_email,
        customer_identifier.customer_phone_number
      FROM customer_info
      INNER JOIN customer_identifier 
        ON customer_info.customer_id = customer_identifier.customer_id
      WHERE 
        customer_identifier.customer_email LIKE ? OR
        customer_identifier.customer_phone_number LIKE ? OR
        customer_info.customer_first_name LIKE ? OR
        customer_info.customer_last_name LIKE ?
      ORDER BY customer_identifier.customer_id DESC
      LIMIT 10
    `;
    const rows = await db.query(query, [
      // Use db.query instead of conn.query
      searchTerm,
      searchTerm,
      searchTerm,
      searchTerm,
    ]);

    if (rows.length === 0) {
      console.log("No customers found.");
    }

    return rows;
  } catch (error) {
    console.error("Database search error:", error); // Log the full error
    throw new Error("Failed to execute customer search");
  }
}





// Function to update a customer by ID
const updateCustomer = async (customerId, customerData) => {
  try {
    // Initialize the update query with basic structure
    let updateQuery = "UPDATE customer_identifier SET ";
    const updateValues = [];

    // Only add to query if data is provided
    if (customerData.customer_email) {
      updateQuery += "customer_email = ?, ";
      updateValues.push(customerData.customer_email);
    }

    if (customerData.customer_phone_number) {
      updateQuery += "customer_phone_number = ?, ";
      updateValues.push(customerData.customer_phone_number);
    }

    // Remove the trailing comma and space from the query
    updateQuery = updateQuery.slice(0, -2);

    // Add the WHERE clause to the query
    updateQuery += " WHERE customer_id = ?";
    updateValues.push(customerId);

    // Execute the query for customer_identifier table
    await db.query(updateQuery, updateValues);

    // Now, build the query for the customer_info table (first name, last name, status)
    let updateQuery2 = "UPDATE customer_info SET ";
    const updateValues2 = [];

    if (customerData.customer_first_name) {
      updateQuery2 += "customer_first_name = ?, ";
      updateValues2.push(customerData.customer_first_name);
    }

    if (customerData.customer_last_name) {
      updateQuery2 += "customer_last_name = ?, ";
      updateValues2.push(customerData.customer_last_name);
    }

    if (customerData.active_customer_status !== undefined) {
      updateQuery2 += "active_customer_status = ?, ";
      updateValues2.push(customerData.active_customer_status);
    }

    // Remove the trailing comma and space from the query
    updateQuery2 = updateQuery2.slice(0, -2);

    updateQuery2 += " WHERE customer_id = ?";
    updateValues2.push(customerId);

    // Execute the query for customer_info table
    await db.query(updateQuery2, updateValues2);

    // Handle vehicle info updates if provided
    if (customerData.vehicle_info && Array.isArray(customerData.vehicle_info)) {
      for (let vehicle of customerData.vehicle_info) {
        const query3 = `
          UPDATE customer_vehicle_info 
          SET vehicle_year = ?, vehicle_make = ?, vehicle_model = ?, vehicle_type = ?,
              vehicle_mileage = ?, vehicle_tag = ?, vehicle_serial = ?, vehicle_color = ? 
          WHERE customer_id = ?;
        `;
        await db.query(query3, [
          vehicle.vehicle_year || null,
          vehicle.vehicle_make || null,
          vehicle.vehicle_model || null,
          vehicle.vehicle_type || null,
          vehicle.vehicle_mileage || null,
          vehicle.vehicle_tag || null,
          vehicle.vehicle_serial || null,
          vehicle.vehicle_color || null,
          customerId,
        ]);
      }
    }

    return { status: "success", message: "Customer updated successfully!" };
  } catch (error) {
    console.error("Error updating customer:", error);
    throw new Error("Database error while updating customer.");
  }
};



module.exports = {
  checkIfCustomerExists,
  createCustomer,
  getAllCustomers,
  getSingleCustomer,
  searchCustomers,
  updateCustomer,
};
