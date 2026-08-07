// Side-effect import: this must be the FIRST import so .env is loaded before any
// other module reads process.env at evaluation time. app.js reads CORS_ORIGIN
// while building its middleware stack, which happens at import, not at call.
import "dotenv/config";
import app from "./app.js";
import connectDB from "./db/index.js";

const port = process.env.PORT || 3000;

connectDB()
  .then(() => {
    app.listen(port, () => {
      console.log(`Example app listening on port http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error("MongoDB connection error", err);
    process.exit(1);
  });
