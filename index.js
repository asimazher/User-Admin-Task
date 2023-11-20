const express = require("express");
const dotenv = require("dotenv");
const connectDb = require("./config/db");
const adminRouter = require("./routes/admin");
const userRouter = require("./routes/user");

const app = express();

dotenv.config();
connectDb();

app.use(express.json());

app.use("/api/auth", userRouter);
app.use("/api/admin", adminRouter);


app.listen(process.env.PORT, () => {
  console.log(`Server listening to port ${process.env.PORT}`);
});
