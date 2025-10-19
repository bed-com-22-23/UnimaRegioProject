import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "pg";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Connect to Neon PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

// ✅ Serve frontend static files
app.use(express.static(path.join(__dirname, "../frontend")));

// ✅ Serve images & PDFs from /backend/books/
app.use("/books", express.static(path.join(__dirname, "books")));

// ✅ Create cart table if not exists
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart (
      id SERIAL PRIMARY KEY,
      book_id INT REFERENCES books(id),
      title VARCHAR(255),
      price DECIMAL(10,2),
      author VARCHAR(255),
      time_ordered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      user_id INT NOT NULL
    );
  `);
  console.log("✅ Cart table ready.");
})();

// ✅ Get all books
app.get("/api/books", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM books");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add book to cart
app.post("/api/cart", async (req, res) => {
  try {
    const { bookId, userId } = req.body;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const result = await pool.query("SELECT * FROM books WHERE id=$1", [bookId]);
    const book = result.rows[0];
    if (!book) return res.status(404).json({ message: "Book not found" });

    await pool.query(
      "INSERT INTO cart (book_id, title, price, author, user_id) VALUES ($1, $2, $3, $4, $5)",
      [book.id, book.title, book.price, book.author, userId]
    );

    res.json({ message: `${book.title} added to cart!` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Get cart items for a user
app.get("/api/cart", async (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const result = await pool.query(
      "SELECT * FROM cart WHERE user_id = $1 ORDER BY time_ordered DESC",
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete a cart item by ID for a specific user
app.delete("/api/cart/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;

    if (!userId) return res.status(401).json({ message: "User not authenticated" });

    const result = await pool.query(
      "DELETE FROM cart WHERE id = $1 AND user_id = $2",
      [id, userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Item not found in your cart." });
    }

    res.json({ message: "Item removed from cart." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
