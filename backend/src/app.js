import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import "./controllers/AINew/AutoGetData.js";

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

import bootstrapRouter from "./routes/bootstrap.routes.js";
import superAdminRouter from "./routes/superAdmin.routes.js"
import companyRouter from './routes/Company.routes.js';
import companyChatRouter from "./routes/companyChat.routes.js";

app.use("/api/bootstrap", bootstrapRouter); // @
app.use("/api/superadmin", superAdminRouter); //@
app.use('/api/company', companyRouter);

app.use("/api/company", companyChatRouter);
// ✅ ERROR HANDLER MUST BE LAST
app.use((err, req, res, next) => {
  console.error("🔥 Global Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

export default app;
