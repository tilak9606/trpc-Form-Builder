const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 10000 });

async function main() {
  const forms = await pool.query("SELECT id, title, slug, status, created_by, deleted_at FROM forms WHERE deleted_at IS NULL ORDER BY created_at DESC LIMIT 10");
  console.log("=== Active Forms ===");
  forms.rows.forEach((f, i) => console.log(i+1 + ". " + f.id + ' | "' + f.title + '" | ' + f.status + " | slug=" + f.slug + " | by=" + f.created_by));

  const users = await pool.query("SELECT id, name, email FROM users LIMIT 5");
  console.log("\n=== Users ===");
  users.rows.forEach(u => console.log(u.id + " | " + u.name + " | " + u.email));

  const fields = await pool.query("SELECT id, form_id, type, label, index FROM form_fields ORDER BY created_at DESC LIMIT 10");
  console.log("\n=== Recent Fields ===");
  fields.rows.forEach(f => console.log(f.id + " | form=" + f.form_id + " | " + f.type + ' | "' + f.label + '" | idx=' + f.index));

  await pool.end();
}
main().catch(e => { console.log("ERROR:", e.message); pool.end(); });
