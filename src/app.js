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
import adminRouter from "./routes/admin/admin.route.js";

app.get("/", (req, res) => {
  res.status(200).send("hello from server");
})

// routes declaration
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);
app.use("/api/v1/recruiter", recruiterRouter);
app.use("/api/v1/admin", adminRouter);


app.use(errorHandler)

export default app;