# DHydroquack Backend API

Node.js + Express backend for the DHydroquack hydroponic monitoring system.

## Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection pool
├── controllers/
│   ├── userController.js    # User operations
│   ├── plantController.js   # Plant management
│   ├── sensorController.js  # Sensor readings
│   ├── deviceController.js  # Device controls
│   └── notificationController.js  # Notifications
├── routes/
│   ├── users.js
│   ├── plants.js
│   ├── sensors.js
│   ├── devices.js
│   └── notifications.js
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
└── server.js                # Main server file
```

## Setup

### 1. Copy environment variables

```bash
copy .env.example .env
```

Edit `.env` with your MySQL credentials:
```
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=dhydroquack_db
NODE_ENV=development
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the server

Development (with auto-reload):
```bash
npm run dev
```

Production:
```bash
npm start
```

The server will run on `http://localhost:4000`

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Plants
- `GET /api/plants` - Get all plants
- `GET /api/plants/user/:userId` - Get plants by user
- `GET /api/plants/:id` - Get plant by ID
- `POST /api/plants` - Create plant
- `PUT /api/plants/:id` - Update plant
- `DELETE /api/plants/:id` - Delete plant

### Sensors
- `GET /api/sensors` - Get all sensor readings (supports `?limit=100`)
- `GET /api/sensors/latest` - Get latest reading
- `GET /api/sensors/range?startDate=&endDate=` - Get readings by date range
- `GET /api/sensors/:id` - Get reading by ID
- `POST /api/sensors` - Create sensor reading

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Notifications
- `GET /api/notifications` - Get all notifications
- `GET /api/notifications/user/:userId` - Get user notifications
- `GET /api/notifications/user/:userId/unread` - Get unread notifications
- `GET /api/notifications/:id` - Get notification by ID
- `POST /api/notifications` - Create notification
- `PUT /api/notifications/:id/read` - Mark as read
- `DELETE /api/notifications/:id` - Delete notification

## Example Requests

### Create a user
```bash
curl -X POST http://localhost:4000/api/users \
  -H "Content-Type: application/json" \
  -d '{"full_name":"John Doe","email":"john@example.com","phone_number":"1234567890","password":"password123"}'
```

### Create a plant
```bash
curl -X POST http://localhost:4000/api/plants \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"group_name":"Vegetables","plant_name":"Tomato","date_planted":"2026-05-26","growth_stage":"seedling"}'
```

### Create sensor reading
```bash
curl -X POST http://localhost:4000/api/sensors \
  -H "Content-Type: application/json" \
  -d '{"water_level":45.5,"temperature":24.5,"humidity":65.2,"ph_level":6.8,"nutrient_ppm":1250}'
```

## Database Tables

- `users` - User accounts
- `plants` - Plant information
- `sensor_readings` - Sensor data readings
- `device_controls` - Device control settings
- `notifications` - User notifications

## Technologies

- Node.js
- Express.js
- MySQL2
- CORS
- Morgan (logging)
- Dotenv (environment variables)
