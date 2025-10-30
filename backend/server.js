import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import errorHandler from "./middleware/errorMiddleware.js";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;


// Security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());


// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use("/api/auth", limiter);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/expenses", expenseRoutes);
// Error handling
app.use(errorHandler);

connectDB();

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
