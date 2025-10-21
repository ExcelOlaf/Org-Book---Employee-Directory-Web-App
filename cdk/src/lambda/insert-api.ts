/* import express from 'express';
import serverlessExpress from '@vendia/serverless-express';
// Note: No CORS needed - this API is only triggered by S3, not frontend
// Add database import
// import { connectToDatabase, insertContact, insertDirectory } from '../shared/database';

const app = express();

// Middleware
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'INSERT API healthy',
    service: 'insert-api',
    timestamp: new Date().toISOString(),
    note: 'This API is triggered by S3 uploads only'
  });
});

// Insert routes - triggered by S3 file uploads
app.post('/api/v1/insert/contacts', async (req, res) => {
  try {
    const contactData = req.body;
    // TODO: Implement contact insertion using ../shared/database.ts
    // const result = await insertContact(contactData);
    
    console.log('Processing contact insertion from S3 trigger:', contactData);
    
    res.json({ 
      message: 'Contact insertion endpoint ready for implementation',
      data: contactData,
      status: 'processed'
    });
  } catch (error) {
    console.error('INSERT contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Bulk insert for directory uploads
app.post('/api/v1/insert/directory', async (req, res) => {
  try {
    const directoryData = req.body;
    // TODO: Implement bulk directory insertion
    // const result = await insertDirectory(directoryData);
    
    console.log('Processing directory insertion from S3 trigger:', directoryData);
    
    res.json({ 
      message: 'Directory insertion endpoint ready for implementation',
      recordCount: Array.isArray(directoryData) ? directoryData.length : 1,
      status: 'processed'
    });
  } catch (error) {
    console.error('INSERT directory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// S3 event processing endpoint
app.post('/api/v1/process-s3-upload', async (req, res) => {
  try {
    const s3Event = req.body;
    // TODO: Parse S3 event and process uploaded file
    // This would read the uploaded file from S3 and insert data to DynamoDB
    
    console.log('Processing S3 upload event:', s3Event);
    
    res.json({ 
      message: 'S3 upload processing endpoint ready for implementation',
      event: s3Event,
      status: 'processed'
    });
  } catch (error) {
    console.error('S3 processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export const handler = serverlessExpress({ app }) as any; */