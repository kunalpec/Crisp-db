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

The server will run on the port specified in `.env` (default: 5000).

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

The frontend will run on [http://localhost:3000](http://localhost:3000).

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
http://localhost:5000
```

## API Endpoints

### Authentication

- `POST /api/v1/auth/login` - User login

### Company

- `POST /api/v1/company/create-company` - Create a new company
- `POST /api/v1/company/send-invite` - Send invite to employee (requires authentication)
- `POST /api/v1/company/accept-invite` - Accept invite and signup
- `GET /api/v1/company/plans/active` - Get active plans
- `GET /api/v1/company/plans/by-id` - Get plan by id (query param: ?id=)

### Superadmin

- `POST /api/v1/superadmin/plans` - Create new plan (requires authentication)
- `PUT /api/v1/superadmin/plans/:planId` - Update existing plan (requires authentication)
- `PATCH /api/v1/superadmin/plans/:planId/deactivate` - Deactivate a plan (requires authentication)
- `DELETE /api/v1/superadmin/plans/:planId` - Delete plan (requires authentication)
- `GET /api/v1/superadmin/plans/active` - Get all active plans (requires authentication)
- `GET /api/v1/superadmin/plans/by-id` - Get plan by id (query param: ?id=)
- `GET /api/v1/superadmin/view-all-companies` - View all active companies (requires authentication)

### System (Bootstrap)

- `POST /api/v1/system/create-super-company` - Create super company (requires bootstrap secret)
- `POST /api/v1/system/create-super-admin` - Create super admin (requires bootstrap secret)
- `DELETE /api/v1/system/delete-super-admin` - Delete super admin (requires bootstrap secret)

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

- `MONGO_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT tokens
- `CORS_ORIGIN`: Allowed CORS origins

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

## Contributing

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Test thoroughly.
5. Submit a pull request.

## License

ISC License
