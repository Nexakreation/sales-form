# Customer Registration Form

A web-based customer registration form for sales executives with auto-fill functionality and real-time location detection.

## Features

- Customer data registration with validation
- Real-time geolocation detection
- Password strength meter
- Auto-fill functionality for returning customers
- Data storage in both MySQL database and Google Sheets
- Character count for address field
- Password visibility toggle

## Auto-Fill Security Considerations

The auto-fill functionality has certain security restrictions:

1. **Password Fields**:

   - Password and Confirm Password fields are intentionally not auto-filled
   - This is a security measure to protect customer credentials
   - Users must re-enter passwords even for returning customers

2. **Location Data**:
   - Address, Latitude and Longitude fields are not auto-filled from previous records
   - These fields should always reflect the current location
   - Use the "Get Location" button to capture current coordinates

## Technical Implementation

### Form Fields

- Full Name (required)
- Email Address (required, valid format)
- Phone Number (required, 10 digits)
- Gender (Male/Female/Other)
- Date of Birth (required)
- Address (required, multiline)
- Password (required, minimum 6 characters)
- Confirm Password (required)
- Latitude (auto-captured)
- Longitude (auto-captured)

### Auto-Fill Process

1. Enter a 10-digit phone number
2. Click "Auto Fill" button
3. If customer exists:
   - Basic information is populated
   - Password fields remain empty for security
   - Location fields require fresh capture
4. Visual feedback indicates success/failure

### Data store 
   - the will store in both google sheets and the database but you can control where it should store 
   - in script.js at the very top you'll find set value false where you don't want to store
   ```
      // Configuration for save locations
   const saveConfig = {
     googleSheets: true, // Set to false to disable Google Sheets saving
     database: true, // Set to false to disable database saving
   };
   ```


### Security Features

- Password strength meter
- Secure password handling
- Real-time location verification
- Form validation
- Device info capture

## Setup Instructions

1. **Install dependencies:**

```bash
npm install
```
2. **create you database**
copy the sql command from the schema.sql and run it in the myphpadmin and create the database

3. **Configure environment variables in .env same as .env.example:**

```
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=your_database
```
4. **configure google sheet:**
   - open google sheet
   - go to Extensions >App script
   - copy the code from gsheet.js and paste it in the app script 
   - Deploy > New Deployment 
   - select type > web app
   - set who can access to anyone and deploy 
   - copy the web url 
   - paste it in the script.js line:283 look for 
   ```
   const scriptURL = "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
   ```

5. **Add the API Key to the Project**
- Open `index.html`
- Find this line near the bottom of the file:
  ```html
  <script src="https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY"></script>
  ```
- Replace `YOUR_API_KEY` with your actual API key

**How to get google api key**

   1.Create a Google Cloud Project to get api key
      - Go to the [Google Cloud Console](https://console.cloud.google.com/)
      - Click on "Select a Project" at the top of the page
      - Click "New Project"
      - Enter a project name and click "Create"

   2. Enable the Maps JavaScript API
      - In your new project, go to "APIs & Services" > "Library"
      - Search for "Maps JavaScript API"
      - Click on it and press "Enable"

   3. Create API Key
      - Go to "APIs & Services" > "Credentials"
      - Click "Create Credentials" > "API Key"
      - Your new API key will be displayed

   4. Restrict the API Key (Recommended)
      - In the API key creation success dialog, click "Restrict Key"
      - Under "Application restrictions", select "HTTP referrers"
      - Add your website's domain to the allowed referrers
      - Under "API restrictions", select "Restrict key"
      - Select "Maps JavaScript API" from the dropdown
      - Click "Save"

6. **Start the server:**

```bash
npm start
```
7. **start apache and mysql in your XAMPP**

8. **Access the application through your browser at http://localhost:3000/PROJECT_NAME**

## Technical Requirements

- Node.js
- MySQL
- Modern web browser with geolocation support
- Internet connection for Google Sheets integration

## Security Notes

- Passwords are never auto-filled for security reasons
- Location data requires fresh capture for accuracy
- All form submissions include device information
- Data is saved both locally and to Google Sheets
