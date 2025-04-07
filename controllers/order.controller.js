// Import order service
const orderService = require("../services/order.service");
const conn = require("../config/db.config"); // Ensure this is correct

// Create the add order controller
async function createOrder(req, res, next) {
  try {
    const orderData = req.body;

    // Create the order
    const order = await orderService.createOrder(orderData);

    if (!order) {
      return res.status(400).json({
        status: "fail",
        message: "Failed to create the order!",
      });
    }

    return res.status(201).json({
      status: "success",
      message: "Order created successfully!",
      data: order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
}

// Create a getAllOrders controller
async function getAllOrders(req, res, next) {
  try {
    const orders = await orderService.getAllOrders();

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        status: "fail",
        message: "No orders found!",
      });
    }

    return res.status(200).json({
      status: "success",
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
}

// Create the getSingleOrder controller
async function getSingleOrder(req, res, next) {
  try {
    const orderId = parseInt(req.params.id); // Get order ID from request parameters

    // Fetch the order by ID
    const order = await orderService.getSingleOrder(orderId);

    if (!order) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found!",
      });
    }

    return res.status(200).json({
      status: "success",
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
}

// Create the updateOrder controller
async function updateOrder(req, res, next) {
  try {
    const orderId = parseInt(req.params.id); // Get order ID from request parameters
    const updateData = req.body;

    // Check if order exists
    const existingOrder = await orderService.getSingleOrder(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found!",
      });
    }

    // Update the order
    const updatedOrder = await orderService.updateOrder(orderId, updateData);
    if (!updatedOrder) {
      return res.status(400).json({
        status: "fail",
        message: "Failed to update the order!",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Order updated successfully!",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
}

// Create the deleteOrder controller
async function deleteOrder(req, res, next) {
  try {
    const orderId = parseInt(req.params.id); // Get order ID from request parameters

    // Check if order exists
    const existingOrder = await orderService.getSingleOrder(orderId);
    if (!existingOrder) {
      return res.status(404).json({
        status: "fail",
        message: "Order not found!",
      });
    }

    // Delete the order
    const deleted = await orderService.deleteOrder(orderId);
    if (!deleted) {
      return res.status(400).json({
        status: "fail",
        message: "Failed to delete the order!",
      });
    }

    return res.status(200).json({
      status: "success",
      message: "Order deleted successfully!",
    });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({
      status: "fail",
      message: "Something went wrong!",
    });
  }
}

// Export the controllers
module.exports = {
  createOrder,
  getAllOrders,
  getSingleOrder,
  updateOrder,
  deleteOrder,
};
