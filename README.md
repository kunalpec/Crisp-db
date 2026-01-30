# Crisp-DB

Crisp-DB is a full-stack application consisting of a React frontend and a Node.js/Express backend. The backend provides a RESTful API for managing companies, plans, conversations, messages, knowledge bases, and related entities in a MongoDB database. The frontend offers a user interface for interacting with the API.

## Features

### Backend Features

- **Authentication**: JWT-based login for users.
- **Company Management**: Create companies, send invites to employees, and accept invites.
- **Plan Management**: Create, update, deactivate, and delete subscription plans; retrieve active plans and plan details.
- **Super Admin Management**: Manage companies, plans, and system-level operations.
- **System Bootstrap**: Create super admin and super company for initial setup.
- **Database Models**: Support for companies, users, conversations, messages, knowledge bases, plans, API keys, invites, token usage, and visitors (models defined, but not all routes implemented).
- **Middleware**: Authentication, file upload, and bootstrap secret verification.
- **CORS Support**: Cross-origin resource sharing enabled.
- **File Uploads**: Support for image and file uploads via Multer and Cloudinary.

### Frontend Features

- **User Dashboard**: Interactive dashboard for managing conversations and messages.
- **Pricing Page**: Display subscription plans and features.
- **Authentication**: Login and signup forms with Redux state management.
- **Integration Showcase**: Pages for app integrations and mediator apps.
- **Help Center**: FAQ and support articles.
- **Responsive Design**: Bootstrap-based responsive UI with animations using GSAP.

## Installation

### Backend Setup

1. Navigate to the backend directory:

   ```
   cd backend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:
   - Copy `.env` and update the values as needed.
   - Ensure MongoDB URI, PORT, JWT_SECRET, and CORS_ORIGIN are configured.

4. Start the development server:

   ```
   npm run dev
   ```

   Or format code:

   ```
   npm run format
   ```

The server will run on the port specified in `.env` (default: 3000).

### Frontend Setup

1. Navigate to the Frontend directory:

   ```
   cd Frontend
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Start the development server:

   ```
   npm start
   ```

The frontend will run on [http://localhost:3001](http://localhost:3001) (React default port, or next available port).

### Running the Full Application

To run both backend and frontend simultaneously:

1. Start the backend server in one terminal:

   ```
   cd backend && npm run dev
   ```

2. Start the frontend in another terminal:

   ```
   cd Frontend && npm start
   ```

## Usage

The API is structured around RESTful endpoints. Use tools like Postman or curl to interact with the endpoints.

### Base URL

```
http://localhost:3000
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/login` - User login
  - **Request Body**: `{ "email": "string", "password": "string" }`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "user": object, "accessToken": "string", "refreshToken": "string" } }`

- `POST /api/v1/auth/forget-password` - Forget password
  - **Request Body**: `{ "email": "string" }`
  - **Response**: `{ "success": boolean, "message": "string" }`

### Company

- `POST /api/v1/company/create-company` - Create a new company
  - **Request Body**: `{ "companyName": "string", "adminEmail": "string", "adminPassword": "string", "phone": { "countryCode": "string", "number": "string" } }`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "company": object, "admin": object } }`

- `POST /api/v1/company/send-invite` - Send invite to employee (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Request Body**: `{ "email": "string", "role": "string" }`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "invite": object } }`

- `GET /api/v1/company/plans/active` - Get active plans (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "plans": array } }`

- `GET /api/v1/company/plans/by-id` - Get plan by id (query param: ?id=)
  - **Query Params**: `id=<planId>`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "plan": object } }`

- `GET /api/v1/company/api-key` - Get All Company ApiKey (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "apiKeys": array } }`

- `POST /api/v1/company/recharge-plans` - Update plans (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Request Body**: `{ "planId": "string" }`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "updatedCompany": object } }`

- `GET /api/v1/company/employee-info` - Get Employees Details (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "employees": array } }`

### Employee

- `POST /api/v1/employee/accept-invite` - Accept invite and sign up employee
  - **Request Body**: `{ "token": "string", "password": "string", "username": "string", "phone": { "countryCode": "string", "number": "string" } }`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "user": object, "accessToken": "string", "refreshToken": "string" } }`

### Superadmin

- `POST /api/v1/superadmin/plans` - Create new plan (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Request Body**: `{ "name": "string", "description": "string", "price": number, "features": array }`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "plan": object } }`

- `PUT /api/v1/superadmin/plans/:planId` - Update existing plan (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Request Body**: `{ "name": "string", "description": "string", "price": number, "features": array }`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "plan": object } }`

- `PATCH /api/v1/superadmin/plans/:planId/deactivate` - Deactivate a plan (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "plan": object } }`

- `DELETE /api/v1/superadmin/plans/:planId` - Delete plan (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "success": boolean, "message": "string" }`

- `GET /api/v1/superadmin/plans/active` - Get all active plans (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "plans": array } }`

- `GET /api/v1/superadmin/plans/by-id` - Get plan by id (query param: ?id=)
  - **Query Params**: `id=<planId>`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "plan": object } }`

- `GET /api/v1/superadmin/view-all-companies` - View all active companies (requires authentication)
  - **Headers**: `Authorization: Bearer <token>`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "companies": array } }`

### System (Bootstrap)

- `POST /api/v1/system/create-super-company` - Create super company (requires bootstrap secret)
  - **Headers**: `x-bootstrap-secret: <secret>`
  - **Request Body**: `{ "companyName": "string", "adminEmail": "string", "adminPassword": "string", "phone": { "countryCode": "string", "number": "string" } }`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "company": object, "admin": object } }`

- `POST /api/v1/system/create-super-admin` - Create super admin (requires bootstrap secret)
  - **Headers**: `x-bootstrap-secret: <secret>`
  - **Request Body**: `{ "email": "string", "password": "string", "username": "string", "phone": { "countryCode": "string", "number": "string" } }`
  - **Response**: `{ "success": boolean, "message": "string", "data": { "admin": object } }`

- `DELETE /api/v1/system/delete-super-admin` - Delete super admin (requires bootstrap secret)
  - **Headers**: `x-bootstrap-secret: <secret>`
  - **Response**: `{ "success": boolean, "message": "string" }`

## Project Structure

```
crisp-db/
├── backend/
│   ├── src/
│   │   ├── config/            # Configuration files
│   │   ├── constants/         # Application constants
│   │   ├── controllers/       # Route controllers
│   │   │   ├── auth.controller.js
│   │   │   ├── bootstrap/
│   │   │   │   ├── superAdmin.service.js
│   │   │   │   └── SuperCompany.service.js
│   │   │   ├── Company/
│   │   │   │   └── create_company.controller.js
│   │   │   └── invite/
│   │   │       ├── acceptInvite.controller.js
│   │   │       └── inviteEmployee.controller.js
│   │   ├── db/                # Database connection
│   │   │   └── db.js
│   │   ├── middlewares/       # Custom middlewares
│   │   │   ├── Auth.middleware.js
│   │   │   ├── uploadFile.middleware.js
│   │   │   └── verifyBootstrapSecret.middleware.js
│   │   ├── models/            # Mongoose models
│   │   │   ├── ApiKey.model.js
│   │   │   ├── Company.model.js
│   │   │   ├── CompanyUser.model.js
│   │   │   ├── Conversation.model.js
│   │   │   ├── Invite.model.js
│   │   │   ├── KnowledgeBase.model.js
│   │   │   ├── Message.model.js
│   │   │   ├── Plan.model.js
│   │   │   ├── PlanFeature.model.js
│   │   │   ├── TokenUsage.model.js
│   │   │   └── Visitors.model.js
│   │   ├── routes/            # API routes
│   │   │   ├── auth.route.js
│   │   │   ├── company.route.js
│   │   │   └── system.route.js
│   │   ├── utils/             # Utility functions
│   │   │   ├── ApiError.util.js
│   │   │   ├── ApiResponse.util.js
│   │   │   ├── AsyncHandler.util.js
│   │   │   └── Cloudinary.util.js
│   │   ├── app.js            # Express app setup
│   │   └── index.js          # Main entry point
│   ├── public/               # Static files
│   ├── .gitignore
│   ├── .prettierignore
│   ├── .prettierrc
│   ├── package.json
│   ├── package-lock.json
│   └── README.md             # Backend README
├── Frontend/
│   ├── public/
│   │   ├── index.html        # Main HTML file
│   │   ├── manifest.json     # PWA manifest
│   │   ├── robots.txt        # SEO robots file
│   ├── src/
│   │   ├── assets/           # Static assets (images, icons)
│   │   │   ├── app/          # App-related images
│   │   │   ├── footer/       # Footer images
│   │   │   ├── form/         # Form-related assets
│   │   │   ├── furtherMenu/  # Menu assets
│   │   │   ├── help/         # Help section images
│   │   │   ├── home/         # Home page images
│   │   │   ├── integration/  # Integration images
│   │   │   ├── mediatorApps/ # Mediator app icons
│   │   │   ├── pricing/      # Pricing page images
│   │   │   └── widgets/      # Widget images
│   │   ├── Components/       # React components
│   │   │   ├── apps/         # App-related components
│   │   │   ├── Dashboard/    # Dashboard components
│   │   │   ├── footer/       # Footer component
│   │   │   ├── furtherMenu/  # Additional menu components
│   │   │   ├── head/         # Header components
│   │   │   ├── help/         # Help center components
│   │   │   ├── integration/  # Integration components
│   │   │   ├── main-container/ # Main page components
│   │   │   ├── Pricing/      # Pricing components
│   │   │   └── signUp_Login/ # Authentication components
│   │   ├── routing/          # Routing configuration
│   │   │   └── routing.js    # App routes
│   │   ├── store/            # Redux store
│   │   │   ├── authSlice.js  # Authentication state
│   │   │   ├── loginSlice.js # Login state
│   │   │   └── store.js      # Store configuration
│   │   ├── App.css           # Main app styles
│   │   ├── App.js            # Main app component
│   │   ├── index.css         # Global styles
│   │   └── index.js          # App entry point
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── README.md             # Frontend README (Create React App default)
├── images/                   # Shared images
└── README.md                 # Main project README
```

## Environment Variables

### Backend (.env)

- `MONGODB_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017`)
- `PORT`: Server port (default: 3000)
- `ACCESS_TOKEN_SECRET`: Secret key for JWT access tokens
- `REFRESH_TOKEN_SECRET`: Secret key for JWT refresh tokens
- `ACCESS_TOKEN_EXPIRY`: Access token expiry (e.g., `15m`)
- `REFRESH_TOKEN_EXPIRY`: Refresh token expiry (e.g., `7d`)
- `ACCESS_COOKIE_MAX_AGE`: Access cookie max age in milliseconds
- `REFRESH_COOKIE_MAX_AGE`: Refresh cookie max age in milliseconds
- `CORS_ORIGIN`: Allowed CORS origins (e.g., `http://localhost:3001`)
- `EMAIL_USER`: Email address for sending emails
- `EMAIL_PASS`: Email password or app password
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name (for file uploads)
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

### Frontend (.env)

- `REACT_APP_API_BASE_URL`: Backend API base URL (default: `http://localhost:3000`)
- `REACT_APP_SOCKET_URL`: Socket.IO server URL (default: `http://localhost:3000`)

## Dependencies

### Backend Dependencies

- `express`: Web framework for Node.js
- `mongoose`: MongoDB object modeling
- `mongoose-aggregate-paginate-v2`: Pagination plugin for Mongoose
- `bcryptjs`: Password hashing
- `jsonwebtoken`: JWT token handling
- `cookie-parser`: Cookie parsing middleware
- `cors`: Cross-origin resource sharing
- `dotenv`: Environment variable management
- `multer`: File upload handling
- `cloudinary`: Cloud image storage
- `axios`: HTTP client
- `moment`: Date manipulation
- `socket.io-client`: WebSocket client
- `crypto`: Cryptographic functions
- `nodemon`: Development server (dev dependency)
- `prettier`: Code formatter (dev dependency)

### Frontend Dependencies

- `react`: Frontend library
- `react-dom`: React DOM rendering
- `react-router-dom`: Routing for React
- `redux`: State management
- `@reduxjs/toolkit`: Redux toolkit for efficient Redux development
- `axios`: HTTP client for API calls
- `bootstrap`: CSS framework
- `react-bootstrap`: Bootstrap components for React
- `react-icons`: Icon library
- `gsap`: Animation library
- `react-scripts`: Build scripts for React
- `web-vitals`: Performance monitoring

## WebSocket (Socket.IO) Architecture

The application uses Socket.IO for real-time communication between employees and visitors, similar to Crisp.

### Room Structure

#### Company Rooms
- **Format**: `company_<companyId>`
- **Purpose**: All employees of the same company join this room automatically when they connect
- **Events**:
  - `employee:connected` - When an employee connects
  - `employee:disconnected` - When an employee disconnects
  - `visitor:connected` - When a new visitor connects (notifies all employees)
  - `visitor:disconnected` - When a visitor disconnects

#### Visitor Rooms
- **Format**: `visitor_<visitorSessionId>`
- **Purpose**: Each visitor has their own room. Employees can join to chat with specific visitors
- **Events**:
  - `visitor:connected` - Visitor successfully connected
  - `employee:joined-room` - Employee joined the visitor's room
  - `employee:left-room` - Employee left the visitor's room
  - `message:received` - New message in the room

### Socket Events

#### Employee Events

**Client → Server:**
- `joinCompanyRoom` - Join company room (automatic on connection)
- `joinVisitorRoom` - Join a specific visitor room to chat
- `leaveVisitorRoom` - Leave a visitor room
- `employee:waiting` - Request list of waiting visitors
- `sendMessage` - Send a message to a room
- `typing` - Indicate typing in a room
- `stopTyping` - Stop typing indicator

**Server → Client:**
- `employee:connected` - Employee successfully connected
- `employee:disconnected` - Employee disconnected
- `employee:joined-room-success` - Successfully joined visitor room
- `employee:left-room-success` - Successfully left visitor room
- `employee:waiting-rooms` - List of waiting visitors
- `visitor:connected` - New visitor connected (broadcast to company room)
- `visitor:disconnected` - Visitor disconnected (broadcast to company room)
- `message:received` - New message received

#### Visitor Events

**Client → Server:**
- `frontend:verify-response` - Send verification data (API key, session ID, etc.)
- `visitor:hello` - Reconnection attempt
- `sendMessage` - Send a message
- `typing` - Indicate typing
- `stopTyping` - Stop typing indicator

**Server → Client:**
- `backend:verify-request` - Server requests verification
- `verify:failed` - Verification failed
- `visitor:connected` - Visitor successfully connected
- `employee:joined-room` - Employee joined the room
- `employee:left-room` - Employee left the room
- `message:received` - New message received

### Data Flow

1. **Visitor Connection:**
   - Visitor connects → Server requests verification
   - Visitor sends API key and session ID
   - Server validates, creates/finds visitor and chat room
   - Visitor joins `visitor_<sessionId>` room
   - Company room receives `visitor:connected` event

2. **Employee Connection:**
   - Employee connects with valid JWT token
   - Automatically joins `company_<companyId>` room
   - Company room receives `employee:connected` event
   - Employee can request waiting visitors list

3. **Employee → Visitor Chat:**
   - Employee clicks on a visitor
   - Employee emits `joinVisitorRoom` with `visitorSessionId`
   - Server verifies access and joins employee to visitor room
   - Both can now exchange messages in that room

4. **Message Flow:**
   - Either party emits `sendMessage` with `{ roomId, message, sender }`
   - Server validates access, saves to database
   - Broadcasts `message:received` to all in the room

### Security

- **Authentication**: Employees authenticated via JWT tokens in cookies
- **Authorization**: Employees can only access visitors from their company
- **Room Isolation**: Messages are scoped to specific rooms, preventing cross-room leakage
- **Visitor Verification**: Visitors must provide valid API key matching their company

### Socket Handler Structure

```
backend/src/socket/
├── index.js              # Main socket initialization
├── rooms.js              # Room utility functions
├── handlers/
│   ├── companyHandler.js   # Employee/company room handlers
│   ├── visitorHandler.js   # Visitor room handlers
│   └── messageHandler.js   # Message handlers
├── agent.socket.js       # Legacy employee handlers (for compatibility)
└── visitor.socket.js     # Legacy visitor handlers (for compatibility)
```

## Bugs Fixed

### Frontend
- ✅ Fixed `react-scripts` version (was `^0.0.0`, now `5.0.1`)
- ✅ Fixed React version compatibility (downgraded from 19.0.0 to 18.3.1)
- ✅ Fixed `react-router-dom` breaking changes (downgraded from v7 to v6)
- ✅ Fixed hardcoded API URLs (now uses proxy and relative URLs)
- ✅ Fixed socket URL configuration (now uses environment variables)

### Backend
- ✅ Added missing `start` script to package.json
- ✅ Fixed CORS configuration (now uses environment variable with fallback)
- ✅ Fixed port configuration (default 3000, not 5000)
- ✅ Fixed socket authentication middleware
- ✅ Added missing OTP verification and reset password endpoints
- ✅ Fixed JWT field name inconsistencies (`companyId` vs `company_id`)

### Socket Architecture
- ✅ Implemented proper company room structure (`company_<companyId>`)
- ✅ Implemented proper visitor room structure (`visitor_<visitorSessionId>`)
- ✅ Created modular socket handler structure
- ✅ Fixed room joining logic for employees
- ✅ Fixed visitor verification flow
- ✅ Implemented proper message broadcasting
- ✅ Added typing indicators
- ✅ Fixed employee/visitor disconnection handling

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test thoroughly.
5. Submit a pull request.

## License

ISC License
