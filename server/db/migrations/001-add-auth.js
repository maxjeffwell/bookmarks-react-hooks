import bcrypt from 'bcryptjs';

export async function runAuthMigration(sql) {
  console.log('Running auth migration...');

  // 1. Create users table
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'USER',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log('Users table created');

  // 2. Create refresh_tokens table
  await sql`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token_hash VARCHAR(255) NOT NULL,
      expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    )
  `;
  console.log('Refresh tokens table created');

  // 3. Create indexes for refresh_tokens
  await sql`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id)
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires ON refresh_tokens(expires_at)
  `;

  // 4. Add user_id to bookmarks (nullable initially)
  try {
    await sql`ALTER TABLE bookmarks ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE`;
    console.log('Added user_id to bookmarks');
  } catch (e) {
    if (e.message?.includes('already exists')) {
      console.log('bookmarks.user_id already exists');
    } else {
      throw e;
    }
  }

  // 5. Add user_id to tags (nullable initially)
  try {
    await sql`ALTER TABLE tags ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE CASCADE`;
    console.log('Added user_id to tags');
  } catch (e) {
    if (e.message?.includes('already exists')) {
      console.log('tags.user_id already exists');
    } else {
      throw e;
    }
  }

  // 6. Create demo account
  const existingDemo = await sql`SELECT id FROM users WHERE username = 'demo'`;

  let demoUserId;
  if (existingDemo.length === 0) {
    const hashedPassword = await bcrypt.hash('demo123', 10);
    const result = await sql`
      INSERT INTO users (username, email, password, role)
      VALUES ('demo', 'demo@example.com', ${hashedPassword}, 'USER')
      RETURNING id
    `;
    demoUserId = result[0].id;
    console.log('Demo account created');
  } else {
    demoUserId = existingDemo[0].id;
    console.log('Demo account already exists');
  }

  // 7. Assign existing bookmarks to demo user
  await sql`UPDATE bookmarks SET user_id = ${demoUserId} WHERE user_id IS NULL`;
  console.log('Existing bookmarks assigned to demo user');

  // 8. Assign existing tags to demo user
  await sql`UPDATE tags SET user_id = ${demoUserId} WHERE user_id IS NULL`;
  console.log('Existing tags assigned to demo user');

  // 9. Create indexes for user_id columns
  await sql`CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON bookmarks(user_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_tags_user_id ON tags(user_id)`;

  // 10. Update tags unique constraint (user-scoped)
  try {
    await sql`ALTER TABLE tags DROP CONSTRAINT IF EXISTS tags_name_key`;
    await sql`ALTER TABLE tags ADD CONSTRAINT tags_user_name_unique UNIQUE (user_id, name)`;
    console.log('Tags unique constraint updated to user-scoped');
  } catch (e) {
    console.log('Tags constraint update skipped:', e.message);
  }

  console.log('Auth migration complete');
}
