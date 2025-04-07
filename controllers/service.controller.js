//Import service service
const serviceService = require("../services/service.service");
// Import the database connection
const conn = require("../config/db.config");

// create add service controller
async function createService(req, res, next) {
  try {
    const serviceExists = await serviceService.checkIfServiceExists(
      req.body.service_name
    );
    if (serviceExists) {
      return res
        .status(400)
        .json({ error: "This service name already exists!" });
    }

    const serviceData = req.body;
    const service = await serviceService.createService(serviceData);

    console.log("New Service Created:", service); // Log the created service

    if (!service) {
      return res.status(400).json({ error: "Failed to add the service!" });
    }

    res.status(201).json({
      status: "true",
      message: "Service created successfully!",
      service: service,
    });
  } catch (error) {
    console.error("Error in createService:", error); // Log the error
    res.status(500).json({ error: "Something went wrong!" });
  }
}


// create get all services controller
async function getAllServices(req, res) {
  try {
    const services = await serviceService.getAllServices();
    if (services.length === 0) {
      return res.status(400).json({
        error: "No services found!",
      });
    }
    res.status(200).json({
      status: "success",
      data: services, // Ensure the response contains the full array of services
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      error: "Something went wrong!",
    });
  }
}


// create get single service controller
async function getSingleService(req, res) {
  const service_id = req.params.service_id;
  console.log("📌 Received service_id:", service_id);

  try {
    const service = await serviceService.getServiceById(service_id);

    if (!service || Object.keys(service).length === 0) {
      // ✅ Extra check
      console.log(`❌ No service found for ID: ${service_id}`);
      return res.status(404).json({ error: "Service not found!" });
    }

    console.log("✅ Found service:", service);
    res.status(200).json({
      status: "success",
      data: service,
    });
  } catch (error) {
    console.error("Error fetching service:", error);
    res
      .status(500)
      .json({ error: "Something went wrong while fetching the service." });
  }
}

// create update service controller
async function updateService(req, res, next) {
  try {
    const serviceId = req.params.id;
    const serviceData = req.body;

    console.log("Received service ID:", serviceId);
    console.log("Received service data:", serviceData);

    if (
      !serviceId ||
      !serviceData.service_name ||
      !serviceData.service_description
    ) {
      return res.status(400).json({ error: "Missing required fields!" });
    }

    const updatedService = await serviceService.updateService(
      serviceId,
      serviceData
    );

    if (!updatedService) {
      return res
        .status(404)
        .json({ error: "Service not found or not updated!" });
    }

    res.status(200).json({
      status: "success",
      message: "Service updated successfully!",
      data: updatedService,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Something went wrong!" });
  }
}



// import the controller functions
module.exports = {
  createService,
  getAllServices,
  getSingleService,
  updateService,
};