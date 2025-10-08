import express from 'express';
import serverlessExpress from '@vendia/serverless-express';
import cors from 'cors';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'GET API healthy',
    timestamp: new Date().toISOString()
  });
});

// GET routes
app.get('/api/v1/contacts', async (req, res) => {
  try {
    // TODO: Implement contacts retrieval using ../shared/database.ts
    res.json({ 
      message: 'GET contacts endpoint',
      data: [] 
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const handler = serverlessExpress({ app }) as any;