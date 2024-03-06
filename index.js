import express from "express";
import connectDB from "./src/database/database.js";
import cookieParser from "cookie-parser";
import routes from "./src/routes/routes.js";

connectDB();

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cookieParser());

app.use("/v1", routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
