import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/DBconnection.js";
dotenv.config({
  path: "./.env",
});

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is listening at port on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.log("DB connection error ", error);
    process.exit(1);
  });
