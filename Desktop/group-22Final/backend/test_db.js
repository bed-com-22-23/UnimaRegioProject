// import pkg from "pg";
// import dotenv from "dotenv";
// dotenv.config();

// const { Pool } = pkg;
// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: { rejectUnauthorized: false }
// });

// pool.query("SELECT NOW()", (err, res) => {
//   if (err) console.error("❌ Connection error:", err);
//   else console.log("✅ Connected! Server time:", res.rows[0]);
//   pool.end();
// });
