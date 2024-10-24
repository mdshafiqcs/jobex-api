import express from "express"
import cors from "cors";
import cookieParser from "cookie-parser";
import { errorHandler } from "./middlewares/index.js";


const app = express();
app.use(cors({origin: process.env.CORS_ORIGIN, credentials: true}));
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(express.static("public"));


// routes imports
import authRouter from "./routes/auth.route.js"
import userRouter from "./routes/user/user.route.js"
import recruiterRouter from "./routes/recruiter/recruiter.route.js";


// routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/recruiter", recruiterRouter);


app.use(errorHandler)

export default app;