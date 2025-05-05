/**
 * Customer Registration Server
 * Express server handling customer registration and data retrieval
 * Integrates with MySQL database for data persistence
 */

// Import required dependencies
const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
const dotenv = require("dotenv");
const bodyParser = require("body-parser");

// Load environment variables from .env file
dotenv.config();

// Initialize Express application
const app = express();

// Middleware configuration
app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json()); // Parse JSON request bodies

/**
 * Database Connection Pool Configuration
 * Creates a pool of connections to handle multiple concurrent database operations
 */
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Maximum number of connections in pool
  queueLimit: 0, // No limit on connection queue
});

/**
 * Test database connection
 * Verifies that the application can connect to the database
 * Logs success or failure to console
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("Database connected successfully");
    connection.release();
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1); // Exit if database connection fails
  }
}

// Test database connection on server start
testConnection();

/**
 * Customer Registration Endpoint
 * POST /api/register
 * Saves new customer registration data to the database
 * 
 * @param {Object} req.body - Customer registration data
 * @returns {Object} Response with success status and message
 */
app.post("/api/register", async (req, res) => {
  let connection;
  try {
    const formData = req.body;
    connection = await pool.getConnection();

    // SQL query for inserting customer data
    const query = `
      INSERT INTO customers (
        id, full_name, email, phone, gender, dob, address, password, 
        latitude, longitude, user_agent, platform, screen_resolution, 
        submission_date
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Prepare values for query
    const values = [
      formData.id,
      formData.fullName,
      formData.email,
      formData.phone,
      formData.gender,
      formData.dob,
      formData.address,
      formData.password,
      formData.latitude,
      formData.longitude,
      formData.deviceInfo.userAgent,
      formData.deviceInfo.platform,
      formData.deviceInfo.screenResolution,
      formData.submissionDate,
    ];

    // Execute query
    await connection.execute(query, values);

    res.json({ 
      success: true, 
      message: "Customer registration successful" 
    });
  } catch (error) {
    console.error("Error saving to database:", error);
    res.status(500).json({ 
      success: false, 
      message: "Failed to save customer data",
      error: error.message 
    });
  } finally {
    // Always release connection back to pool
    if (connection) {
      connection.release();
    }
  }
});

/**
 * Customer Lookup Endpoint
 * GET /api/customer/:phone
 * Retrieves customer data by phone number
 * 
 * @param {string} req.params.phone - Customer's phone number
 * @returns {Object} Response with customer data or error message
 */
app.get("/api/customer/:phone", async (req, res) => {
  let connection;
  try {
    const phone = req.params.phone;
    connection = await pool.getConnection();

    // SQL query to get most recent customer record
    const query = `
      SELECT * FROM customers 
      WHERE phone = ? 
      ORDER BY submission_date DESC 
      LIMIT 1
    `;

    const [rows] = await connection.execute(query, [phone]);

    if (rows.length > 0) {
      // Remove sensitive data before sending response
      const customerData = { ...rows[0] };
      delete customerData.password;

      res.json({
        success: true,
        data: customerData,
      });
    } else {
      res.json({
        success: false,
        message: "No customer found with this phone number",
      });
    }
  } catch (error) {
    console.error("Error fetching customer data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch customer data",
      error: error.message
    });
  } finally {
    // Always release connection back to pool
    if (connection) {
      connection.release();
    }
  }
});

/**
 * Error handling middleware
 * Catches any unhandled errors in the application
 */
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
