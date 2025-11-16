import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import counterRoutes from './routes/counter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Counter API is running!',
    version: '1.0.0',
    endpoints: {
      getCounter: 'GET /api/counter/:name',
      incrementCounter: 'POST /api/counter/:name/increment',
      decrementCounter: 'POST /api/counter/:name/decrement',
      resetCounter: 'POST /api/counter/:name/reset',
      getHistory: 'GET /api/counter/:name/history'
    }
  });
});

app.use('/api/counter', counterRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});