import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

// cron jobs auto start
import './controllers/SuperAdmin/AutoCleanPlan.controller.js';
import './controllers/Auto/chatCleanup.cron.js';

const app = express();

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true,
  })
);

// body parsers
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// static
app.use(express.static('public'));

// cookies
app.use(cookieParser());

// routes
import systemRouter from './routes/system.route.js';
import authRouter from './routes/auth.route.js';
import companyRouter from './routes/company.route.js';
import superadminRouter from './routes/superadmin.route.js';

app.use('/api/v1/system', systemRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/superadmin', superadminRouter);
app.use('/api/v1/company', companyRouter);

// ✅ ERROR HANDLER MUST BE LAST
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
