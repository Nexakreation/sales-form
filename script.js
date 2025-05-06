/**
 * Customer Registration Form - Main JavaScript File
 * This script handles form validation, location services, and data submission
 * for both database and Google Sheets storage.
 */

// Configuration for data storage locations
const saveConfig = {
  googleSheets: true, // Set to false to disable Google Sheets saving
  database: true, // Set to false to disable database saving
};

// Wait for DOM to be fully loaded before initializing
document.addEventListener("DOMContentLoaded", () => {
  // Cache DOM elements for better performance
  const form = document.getElementById("registrationForm");
  const getLocationBtn = document.getElementById("getLocation");
  const addressField = document.getElementById("address");
  const charCount = document.getElementById("charCount");
  const passwordField = document.getElementById("password");
  const confirmPasswordField = document.getElementById("confirmPassword");
  const passwordStrength = document.querySelector(".password-strength");

  // Map initialization variables
  let map, marker; // OpenStreetMap variables
  let googleMap, googleMarker; // Google Maps variables

  /**
   * Initialize both map instances with specified coordinates
   * @param {number} lat - Latitude coordinate
   * @param {number} lng - Longitude coordinate
   */
  function initMap(lat = 23.5937, lng = 78.9629) {
    // Initialize OpenStreetMap
    if (!map) {
      map = L.map("map").setView([lat, lng], 5);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      marker = L.marker([lat, lng]).addTo(map);
    } else {
      map.setView([lat, lng], 13);
      marker.setLatLng([lat, lng]);
    }

    // Initialize Google Map
    if (!googleMap) {
      googleMap = new google.maps.Map(document.getElementById("googleMap"), {
        center: { lat: lat, lng: lng },
        zoom: 5,
      });
      googleMarker = new google.maps.Marker({
        position: { lat: lat, lng: lng },
        map: googleMap,
      });
    } else {
      googleMap.setCenter({ lat: lat, lng: lng });
      googleMap.setZoom(13);
      googleMarker.setPosition({ lat: lat, lng: lng });
    }
  }

  /**
   * Handle location button click event
   * Retrieves current location and updates maps
   */
  getLocationBtn.addEventListener("click", () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          // Update form fields with coordinates
          document.getElementById("latitude").value = lat;
          document.getElementById("longitude").value = lng;

          // Update both maps with new coordinates
          initMap(lat, lng);
        },
        (error) => {
          alert("Error getting location: " + error.message);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  });

  // Initialize maps with default coordinates
  initMap();

  /**
   * Update character count for address field
   */
  addressField.addEventListener("input", () => {
    const count = addressField.value.length;
    charCount.textContent = `Characters: ${count}`;
  });

  /**
   * Check password strength based on multiple criteria
   * @param {string} password - Password to check
   * @returns {number} - Strength score (1-5)
   */
  function checkPasswordStrength(password) {
    let strength = 0;
    if (password.length >= 6) strength++; // Length check
    if (password.match(/[a-z]+/)) strength++; // Lowercase check
    if (password.match(/[A-Z]+/)) strength++; // Uppercase check
    if (password.match(/[0-9]+/)) strength++; // Number check
    if (password.match(/[!@#$%^&*]+/)) strength++; // Special character check
    return strength;
  }

  // Auto-fill functionality elements
  const phoneInput = document.getElementById("phone");
  const autoFillBtn = document.getElementById("autoFillBtn");

  /**
   * Handle auto-fill button click
   * Fetches customer data based on phone number
   */
  autoFillBtn.addEventListener("click", async () => {
    const phone = phoneInput.value;

    // Validate phone number length
    if (phone.length !== 10) {
      autoFillBtn.classList.add("error");
      setTimeout(() => autoFillBtn.classList.remove("error"), 2000);
      return;
    }

    // Update button state during fetch
    autoFillBtn.disabled = true;
    autoFillBtn.textContent = "Searching...";

    try {
      const response = await fetch(
        `http://localhost:3000/api/customer/${phone}`
      );

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && result.data) {
        const data = result.data;

        // Auto-fill form fields with retrieved data
        form.fullName.value = data.full_name;
        form.email.value = data.email;
        form.gender.value = data.gender;
        form.dob.value = new Date(data.dob).toISOString().split("T")[0];

        // Security: Address and password fields are intentionally not auto-filled
        // Uncomment these lines if you want to enable address auto-fill not recommended
        // form.address.value = data.address;
        // const count = data.address.length;
        // charCount.textContent = `Characters: ${count}`;

        // Update password strength meter if password exists
        if (data.password) {
          const strength = checkPasswordStrength(data.password);
          const colors = [
            "#ff4444", // Red - Weak
            "#ffbb33", // Orange - Fair
            "#00C851", // Green - Good
            "#33b5e5", // Blue - Strong
            "#2BBBAD", // Teal - Very Strong
          ];
          passwordStrength.style.backgroundColor = colors[strength - 1] || "";
          passwordStrength.style.width = `${(strength / 5) * 100}%`;
        }

        // Visual feedback for successful auto-fill
        autoFillBtn.classList.add("success");
        setTimeout(() => autoFillBtn.classList.remove("success"), 2000);
      } else {
        // Visual feedback for no data found
        autoFillBtn.classList.add("not-found");
        setTimeout(() => autoFillBtn.classList.remove("not-found"), 2000);
      }
    } catch (error) {
      console.error("Error fetching customer data:", error);
      autoFillBtn.classList.add("error");
      setTimeout(() => autoFillBtn.classList.remove("error"), 2000);
    } finally {
      // Reset button state
      autoFillBtn.disabled = false;
      autoFillBtn.textContent = "Auto Fill";
    }
  });

  /**
   * Update password strength meter on input
   */
  passwordField.addEventListener("input", () => {
    const strength = checkPasswordStrength(passwordField.value);
    const colors = ["#ff4444", "#ffbb33", "#00C851", "#33b5e5", "#2BBBAD"];
    passwordStrength.style.backgroundColor = colors[strength - 1] || "";
    passwordStrength.style.width = `${(strength / 5) * 100}%`;
  });

  /**
   * Save form data to database
   * @param {Object} formData - Form data to save
   * @returns {Promise<boolean>} - Success status
   */
  async function saveToDatabase(formData) {
    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.message);
      }
      return true;
    } catch (error) {
      console.error("Error saving to database:", error);
      throw error;
    }
  }

  /**
   * Handle form submission
   * Saves data to configured storage locations
   */
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');

    // Validate password match
    if (passwordField.value !== confirmPasswordField.value) {
      alert("Passwords do not match!");
      return;
    }

    // Update button state during submission
    submitButton.disabled = true;
    submitButton.style.cursor = "not-allowed";
    submitButton.textContent = "Submitting...";

    // Prepare form data with additional metadata
    const formData = {
      id: Date.now(),
      fullName: form.fullName.value,
      email: form.email.value,
      phone: form.phone.value,
      gender: form.gender.value,
      dob: form.dob.value,
      address: form.address.value,
      password: form.password.value,
      latitude: form.latitude.value,
      longitude: form.longitude.value,
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
      },
      submissionDate: new Date().toISOString(),
    };

    try {
      let savedToDatabase = false;
      let savedToGoogleSheets = false;

      // Save to database if enabled
      if (saveConfig.database) {
        try {
          await saveToDatabase(formData);
          console.log("Data saved to database successfully");
          savedToDatabase = true;
        } catch (dbError) {
          console.error("Database save error:", dbError);
        }
      }

      // Save to Google Sheets if enabled
      if (saveConfig.googleSheets) {
        try {
          // Format data for Google Sheets submission
          const formDataToSend = new FormData();
          formDataToSend.append("Timestamp", formData.submissionDate);
          formDataToSend.append("ID", formData.id);
          formDataToSend.append("Full Name", formData.fullName);
          formDataToSend.append("Email", formData.email);
          formDataToSend.append("Phone", formData.phone);
          formDataToSend.append("Gender", formData.gender);
          formDataToSend.append("Date of Birth", formData.dob);
          formDataToSend.append("Address", formData.address);
          formDataToSend.append("Password", formData.password);
          formDataToSend.append("Latitude", formData.latitude);
          formDataToSend.append("Longitude", formData.longitude);
          formDataToSend.append("User Agent", formData.deviceInfo.userAgent);
          formDataToSend.append("Platform", formData.deviceInfo.platform);
          formDataToSend.append(
            "Screen Resolution",
            formData.deviceInfo.screenResolution
          );

          const scriptURL =
            "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
          const response = await fetch(scriptURL, {
            method: "POST",
            mode: "no-cors",
            body: formDataToSend,
          });

          // Since no-cors mode doesn't give us response details,
          // we'll assume success if no error is thrown
          console.log("Data sent to Google Sheets");
          savedToGoogleSheets = true;
        } catch (sheetsError) {
          console.error("Google Sheets save error:", sheetsError);
        }
      }

      // Show appropriate success message based on save status
      if (savedToDatabase && savedToGoogleSheets) {
        alert(
          "Registration successful! Data saved to both database and Google Sheets."
        );
      } else if (savedToDatabase) {
        alert("Registration successful! Data saved to database only.");
      } else if (savedToGoogleSheets) {
        alert("Registration successful! Data saved to Google Sheets only.");
      } else {
        throw new Error("Failed to save data to any location");
      }

      // Reset form and password strength meter
      form.reset();
      passwordStrength.style.width = "0";
    } catch (error) {
      console.error("Error during form submission:", error);
      alert("Error submitting registration. Please try again.");
    } finally {
      // Reset submit button state
      submitButton.disabled = false;
      submitButton.style.cursor = "pointer";
      submitButton.textContent = "Complete Registration";
    }
  });

  /**
   * Toggle password visibility
   */
  const toggleButtons = document.querySelectorAll(".toggle-password");
  toggleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.getAttribute("data-target");
      const inputField = document.getElementById(targetId);
      const icon = button.querySelector("i");

      // Toggle password visibility and update icon
      if (inputField.type === "password") {
        inputField.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
      } else {
        inputField.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
      }
    });
  });
});
