import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { config } from "./config/config.js";
import { seedDatabase } from "./services/seed.js";

async function bootstrap() {
  await connectDb();
  await seedDatabase();

  app.listen(config.port, () => {
    console.log(`API running on http://localhost:${config.port}`);
  });
}

bootstrap().catch((error) => {
  console.error(error);
  process.exit(1);
});
