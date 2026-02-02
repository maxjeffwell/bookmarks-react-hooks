import { neon } from '@neondatabase/serverless';
import crypto from 'crypto';

let sql;

export function getDb() {
  if (!sql) {
    sql = neon(process.env.DATABASE_URL);
  }
  return sql;
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const usersDB = {
  async findByLogin(login) {
    const sql = getDb();
    const result = await sql`
      SELECT id, username, email, password, role, created_at, updated_at
      FROM users
      WHERE username = ${login} OR email = ${login}
    `;
    return result[0] || null;
  },

  async findById(id) {
    const sql = getDb();
    const result = await sql`
      SELECT id, username, email, role, created_at, updated_at
      FROM users
      WHERE id = ${id}
    `;
    return result[0] || null;
  },

  async create({ username, email, password }) {
    const sql = getDb();
    const result = await sql`
      INSERT INTO users (username, email, password)
      VALUES (${username}, ${email}, ${password})
      RETURNING id, username, email, role, created_at, updated_at
    `;
    return result[0];
  },

  async usernameExists(username) {
    const sql = getDb();
    const result = await sql`SELECT id FROM users WHERE username = ${username}`;
    return result.length > 0;
  },

  async emailExists(email) {
    const sql = getDb();
    const result = await sql`SELECT id FROM users WHERE email = ${email}`;
    return result.length > 0;
  }
};

export const refreshTokensDB = {
  async create(userId, tokenHash, expiresAt) {
    const sql = getDb();
    await sql`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${userId}, ${tokenHash}, ${expiresAt})
    `;
  },

  async findValid(userId, tokenHash) {
    const sql = getDb();
    const result = await sql`
      SELECT id FROM refresh_tokens
      WHERE user_id = ${userId}
        AND token_hash = ${tokenHash}
        AND expires_at > NOW()
    `;
    return result[0] || null;
  },

  async deleteForUser(userId) {
    const sql = getDb();
    await sql`DELETE FROM refresh_tokens WHERE user_id = ${userId}`;
  }
};
