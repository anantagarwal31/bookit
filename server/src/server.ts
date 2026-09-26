import app from './app.js';
const PORT = 4000;

app.listen(PORT, () => {
  console.log(`BookIt API running on http://localhost:${PORT}`);
});