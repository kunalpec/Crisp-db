import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// Import cron job file so it runs automatically when app starts
import './controllers/AutoCeanPlan.controller.js';

const app = express();

// Enable CORS so frontend can access backend
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Parse incoming JSON requests
app.use(
  express.json({
    limit: '16kb',
  })
);

// Parse URL-encoded form data
app.use(
  express.urlencoded({
    extended: true,
    limit: '16kb',
  })
);

// Serve static files like images or uploads
app.use(express.static('public'));

// Parse cookies from client requests
app.use(cookieParser());

// Import route files
import systemRouter from './routes/system.route.js';
import authRouter from './routes/auth.route.js';
import companyRouter from './routes/company.route.js';
import superadminRouter from './routes/superadmin.route.js';
import employeeRouter from './routes/employee.route.js';

// Register API routes
app.use('/api/v1/system', systemRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/superadmin', superadminRouter);
app.use('/api/v1/company', companyRouter);
app.use('/api/v1/employee', employeeRouter);

export default app;
