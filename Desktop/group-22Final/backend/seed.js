// backend/seed.js
import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const books = [
  {
    title: "Biology 101",
    author: "Mzuzu Publishers",
    category: "secondary",
    price: 12.99,
    image_path: "images/biology.jpg",
    pdf_path: "pdfs/biology.pdf",
  },
  {
    title: "Physics Advanced",
    author: "Blantyre Books",
    category: "secondary",
    price: 10.5,
    image_path: "images/physics.jpg",
    pdf_path: "pdfs/physics.pdf",
  },
  {
    title: "Physics Colleges",
    author: "Zomba Books",
    category: "tertiary",
    price: 25.0,
    image_path: "images/physics.jpg",
    pdf_path: "pdfs/physics.pdf",
  },
];

async function ensureTables() {
  // books table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS books (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      author VARCHAR(255),
      category VARCHAR(50),
      price DECIMAL(10,2),
      image_path TEXT,
      pdf_path TEXT
    );
  `);

  // cart table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart (
      id SERIAL PRIMARY KEY,
      book_id INT REFERENCES books(id),
      title VARCHAR(255),
      price DECIMAL(10,2),
      author VARCHAR(255),
      time_ordered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function seedBooks() {
  for (const book of books) {
    await pool.query(
      `INSERT INTO books (title, author, category, price, image_path, pdf_path)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT DO NOTHING`,
      [book.title, book.author, book.category, book.price, book.image_path, book.pdf_path]
    );
    console.log(`Inserted (or exists): ${book.title}`);
  }
}

async function main() {
  try {
    await ensureTables();
    console.log("✅ Ensured tables exist (books + cart).");
    await seedBooks();
    console.log("✅ Seed complete.");
  } catch (err) {
    console.error("Seed error:", err);
  } finally {
    await pool.end();
    process.exit();
  }
}

main();
