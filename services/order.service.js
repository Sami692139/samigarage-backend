// Import the database connection
const conn = require("../config/db.config");

// Function to create a new order
async function createOrder(orderData) {
  try {
    // Insert into orders table
    const query = `
      INSERT INTO orders (employee_id, customer_id, vehicle_id, order_description, estimated_completion_date, order_completed)
      VALUES (?, ?, ?, ?, ?, ?)
    `;

    const rows = await conn.query(query, [
      orderData.employee_id,
      orderData.customer_id,
      orderData.vehicle_id,
      orderData.order_info?.additional_request || "", // Avoid undefined
      orderData.order_info?.estimated_completion_date || null, // Avoid undefined
      orderData.order_info?.completion_date ? 1 : 0, // Set completion flag
    ]);

    const order_id = rows.insertId; // Get the inserted order ID

    // ✅ Insert into order_status table
    const queryStatus = `
      INSERT INTO order_status (order_id, order_status)
      VALUES (?, ?)
    `;
    await conn.query(queryStatus, [
      order_id,
      orderData.order_status?.order_status || 1,
    ]); // Default status to 1 if not provided

    // ✅ Insert into order_info table if needed
    const queryInfo = `
      INSERT INTO order_info (order_id, order_total_price, estimated_completion_date, additional_request, notes_for_internal_use, notes_for_customer, additional_requests_completed)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    await conn.query(queryInfo, [
      order_id,
      orderData.order_info?.order_total_price || 0, // Default to 0 if not provided
      orderData.order_info?.estimated_completion_date || null,
      orderData.order_info?.additional_request || "",
      orderData.order_info?.notes_for_internal_use || "",
      orderData.order_info?.notes_for_customer || "",
      orderData.order_info?.additional_requests_completed || 0,
    ]);

    // ✅ Insert into order_services table
    for (let service of orderData.order_services) {
      const query2 = `
        INSERT INTO order_services (order_id, service_id, service_completed)
        VALUES (?, ?, ?)
      `;
      await conn.query(query2, [
        order_id,
        service.service_id,
        service.service_completed || 0,
      ]);
    }

    return { success: true, message: "Order created successfully!" };
  } catch (error) {
    console.error("Error creating order:", error);
    return {
      success: false,
      message: "Internal server error: " + error.message,
    };
  }
}

// Function to retrieve all orders

async function getAllOrders() {
  try {
    const query = `
      SELECT 
    o.order_id,
    o.order_hash,
    o.order_date,
    o.active_order,
    v.vehicle_year,
    v.vehicle_make,
    v.vehicle_model,
    v.vehicle_color,
    v.vehicle_mileage,
    v.vehicle_serial,
    v.vehicle_tag,
    CONCAT(ci.customer_first_name, ' ', ci.customer_last_name) AS customer_name,
    c.customer_email,
    c.customer_phone_number,
    CONCAT(ei.employee_first_name, ' ', ei.employee_last_name) AS employee_name,
    oi.order_total_price,
    oi.estimated_completion_date,
    oi.additional_request,
    oi.additional_requests_completed,
    GROUP_CONCAT(
      CONCAT(cs.service_id, ':', cs.service_name, ':', os.service_completed) 
      SEPARATOR ', '
    ) AS services
FROM orders o
LEFT JOIN customer_vehicle_info v ON o.vehicle_id = v.vehicle_id
LEFT JOIN customer_identifier c ON o.customer_id = c.customer_id
LEFT JOIN customer_info ci ON c.customer_id = ci.customer_id
LEFT JOIN employee emp ON o.employee_id = emp.employee_id
LEFT JOIN employee_info ei ON emp.employee_id = ei.employee_id
LEFT JOIN order_info oi ON o.order_id = oi.order_id
LEFT JOIN order_services os ON o.order_id = os.order_id
LEFT JOIN common_services cs ON os.service_id = cs.service_id
GROUP BY o.order_id
ORDER BY o.order_date DESC;
    `;

    const orders = await conn.query(query);

    console.log("Fetched orders:", orders); // Log the result for debugging

    return orders.map((order) => ({
      ...order,
      services: order.services
        ? order.services.split(", ").map((service) => {
            const [service_id, service_name, service_completed] =
              service.split(":");
            return {
              service_id: parseInt(service_id),
              service_name,
              service_completed: parseInt(service_completed),
            };
          })
        : [],
    }));
  } catch (error) {
    console.error("Error fetching orders:", error.message);
    throw error;
  }
}




// Function to get order by ID
async function getOrderById(order_id) {
  try {
    const query = `
      SELECT 
        orders.*, 
        order_info.*, 
        order_status.*, 
        customer_vehicle_info.make, 
        customer_vehicle_info.model, 
        customer_vehicle_info.year
      FROM orders
      INNER JOIN order_info ON orders.order_id = order_info.order_id
      INNER JOIN order_status ON orders.order_id = order_status.order_id
      INNER JOIN customer_vehicle_info ON orders.vehicle_id = customer_vehicle_info.vehicle_id
      WHERE orders.order_id = ?;
    `;

    // Perform the query
    const order = await conn.query(query, [order_id]);

    if (!order) {
      throw new Error("Order not found");
    }

    // Combine vehicle details (make, model, year)
    const orderWithVehicle = {
      ...order,
      vehicle_name: `${order.make} ${order.model} (${order.year})`, // Combine make, model, and year into a vehicle_name
    };

    return orderWithVehicle;
  } catch (error) {
    console.error("Error fetching order:", error);
    return { success: false, message: error.message };
  }
}
async function validateServiceExists(serviceId) {
  const result = await conn.query(
    `SELECT COUNT(*) AS count FROM common_services WHERE service_id = ?,
    [serviceId]`
  );
  return result[0].count > 0; // Returns true if service exists
}

// Function to update order details
// async function updateOrder(order_id, updatedData) {
//   try {
//     const {
//       order_total_price,
//       estimated_completion_date,
//       completion_date,
//       additional_request,
//       notes_for_internal_use,
//       notes_for_customer,
//       additional_requests_completed,
//     } = updatedData;

//     const query = `
//       UPDATE order_info SET 
//         order_total_price = ?, 
//         estimated_completion_date = ?, 
//         completion_date = ?, 
//         additional_request = ?, 
//         notes_for_internal_use = ?, 
//         notes_for_customer = ?, 
//         additional_requests_completed = ?
//       WHERE order_id = ?;
//     `;
//     await conn.query(query, [
//       order_total_price,
//       estimated_completion_date,
//       completion_date,
//       additional_request,
//       notes_for_internal_use,
//       notes_for_customer,
//       additional_requests_completed,
//       order_id,
//     ]);


//     return { success: true, message: "Order updated successfully!" };
//   } catch (error) {
//     console.error("Error updating order:", error);
//     return { success: false, message: error.message };
//   }
// }
async function updateOrder(orderId, orderData) {
  const connection = await conn.pool.getConnection(); // ✅ renamed properly

  try {
    await connection.beginTransaction();

    // 1. Remove existing services
    await connection.query(`DELETE FROM order_services WHERE order_id = ?`, [
      orderId,
    ]);

    // 2. Validate and insert updated services
    if (orderData.services?.length > 0) {
      const serviceValues = [];
      for (const service of orderData.services) {
        const serviceExists = await validateServiceExists(service.service_id);
        if (!serviceExists) {
          throw new Error(
            `Service ID ${service.service_id} does not exist in common_services.`
          );
        }
        serviceValues.push([
          orderId,
          service.service_id,
          service.service_completed,
        ]);
      }

      const placeholders = serviceValues.map(() => "(?, ?, ?)").join(", ");
      await connection.query(
        `INSERT INTO order_services (order_id, service_id, service_completed) VALUES ${placeholders}`,
        serviceValues.flat()
      );
    }

    // 3. Update order_info
    const updateParams = {
      order_total_price: orderData.totalPrice,
      additional_request: orderData.additional_request ?? null,
      additional_requests_completed:
        orderData.additional_requests_completed ?? 1,
    };

    await connection.query(
      `UPDATE order_info 
       SET order_total_price = ?, additional_request = COALESCE(?, additional_request), additional_requests_completed = ? 
       WHERE order_id = ?`,
      [
        updateParams.order_total_price,
        updateParams.additional_request,
        updateParams.additional_requests_completed,
        orderId,
      ]
    );

    // 4. Determine order active status
    const allServicesCompleted = () => {
      if (orderData.received === 2) return 2;
      const servicesComplete =
        orderData.services?.every((s) => s.service_completed === 1) ?? true;

      if (!updateParams.additional_request) {
        return servicesComplete ? 1 : 0;
      } else {
        return servicesComplete &&
          updateParams.additional_requests_completed === 1
          ? 1
          : 0;
      }
    };

    const orderStatus = allServicesCompleted();

    // 5. Update order's active status
    await connection.query(
      `UPDATE orders SET active_order = ? WHERE order_id = ?`,
      [orderStatus, orderId]
    );

    await connection.commit();
    connection.release();

    return { success: true, order_status: orderStatus };
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Order update failed:", error.message);
    return { success: false, error: error.message };
  }
}

// Function to get a single order by ID
async function getSingleOrder(order_id) {
  try {
   const query = `
  SELECT * FROM orders 
  LEFT JOIN order_info ON orders.order_id = order_info.order_id
  LEFT JOIN order_status ON orders.order_id = order_status.order_id
  WHERE orders.order_id = ?;
`;

    const order = await conn.query(query, [order_id]);
    console.log("Fetched order:", order); // Log fetched order to see the result

    if (order.length === 0) {
      throw new Error("Order not found");
    }
    return order[0];
  } catch (error) {
    console.error("Error fetching single order:", error);
    return { success: false, message: error.message };
  }
}




// Function to delete an order
async function deleteOrder(order_id) {
  try {
    // Delete related data from order_status, order_services, and order_info first
    await conn.query("DELETE FROM order_status WHERE order_id = ?", [order_id]);
    await conn.query("DELETE FROM order_services WHERE order_id = ?", [
      order_id,
    ]);
    await conn.query("DELETE FROM order_info WHERE order_id = ?", [order_id]);

    // Delete the order from orders table
    const orderDeleteQuery = "DELETE FROM orders WHERE order_id = ?";
    const orderDeleteResult = await conn.query(orderDeleteQuery, [order_id]);
    if (orderDeleteResult.affectedRows === 0) {
      throw new Error("Order not found");
    }

    return { success: true, message: "Order deleted successfully!" };
  } catch (error) {
    console.error("Error deleting order:", error);
    return { success: false, message: error.message };
  }
}

// Export the functions for use in the controller
module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  updateOrder,
  getSingleOrder,
  deleteOrder,
};
