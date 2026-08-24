// Single shared Postgres connection pool for the whole server process.
//
// Previously each module called neon(DATABASE_URL) separately. That was free
// with the Neon HTTP driver (stateless request-per-query), but a real driver
// holds sockets, so one pool is shared here instead of four.
import postgres from 'postgres';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not set');
}

// max=10 keeps a single replica well under the server's max_connections (100)
// while leaving headroom for CNPG's own internal connections.
const sql = postgres(process.env.DATABASE_URL, {
  max: 10,
  idle_timeout: 30,
  connect_timeout: 10,
});

export default sql;
export { sql };
