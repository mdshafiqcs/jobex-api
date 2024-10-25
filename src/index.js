import "dotenv/config"
import app from "./app.js";
import connectDB from "./db/index.js";
import config from "./utils/config.js";

connectDB().then(() => {
  app.on("error", (error) => {
    console.log("Error after DB connection and before listening: ", error);
  });

  const PORT = config.port || 3000;
  app.listen(PORT, () => {
    console.log("Serve Running at port ", PORT);
  })
})
.catch((error) => {
  console.log("MongoDB Connection Failed, ", error)
})


