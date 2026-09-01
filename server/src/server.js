import 'dotenv/config';
import app from './app.js';
import { connectDatabase } from './config/db.js';

const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.error('Startup failed: JWT_SECRET is required.');
  process.exit(1);
}

connectDatabase()
  .then(() => app.listen(port, () => console.log(`API running at http://localhost:${port}`)))
  .catch((error) => {
    console.error(`Startup failed: ${error.message}`);
    process.exit(1);
  });
