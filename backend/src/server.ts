import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OpenAI } from 'openai';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Load environment variables from correct path
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Initialize Azure OpenAI for chat (GPT-4o)
let chatOpenAI: OpenAI | null = null;

if (process.env.AZURE_OPENAI_API_KEY && process.env.AZURE_OPENAI_ENDPOINT) {
  chatOpenAI = new OpenAI({
    apiKey: process.env.AZURE_OPENAI_API_KEY,
    baseURL: `${process.env.AZURE_OPENAI_ENDPOINT}openai/deployments/${process.env.GPT_4O_DEPLOYMENT}`,
    defaultQuery: { 'api-version': process.env.AZURE_OPENAI_API_VERSION },
    defaultHeaders: {
      'api-key': process.env.AZURE_OPENAI_API_KEY,
    },
  });
  console.log('✅ Azure OpenAI Chat client initialized');
  console.log(`🤖 GPT-4o Deployment: ${process.env.GPT_4O_DEPLOYMENT}`);
} else {
  console.warn('⚠️  Azure OpenAI chat configuration not found');
}

// Initialize Azure OpenAI for image generation
let imageOpenAI: OpenAI | null = null;

if (process.env.AZURE_IMAGE_API_KEY && process.env.AZURE_IMAGE_ENDPOINT) {
  imageOpenAI = new OpenAI({
    apiKey: process.env.AZURE_IMAGE_API_KEY,
    baseURL: `${process.env.AZURE_IMAGE_ENDPOINT}openai/deployments/${process.env.AZURE_IMAGE_DEPLOYMENT}`,
    defaultQuery: { 'api-version': process.env.AZURE_IMAGE_API_VERSION },
    defaultHeaders: {
      'api-key': process.env.AZURE_IMAGE_API_KEY,
    },
  });
  console.log('✅ Azure OpenAI Image client initialized');
  console.log(`🎨 Image Deployment: ${process.env.AZURE_IMAGE_DEPLOYMENT}`);
} else {
  console.warn('⚠️  Azure OpenAI image configuration not found');
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Configure multer for file uploads (if needed for future features)
const upload = multer({ storage: multer.memoryStorage() });

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Image Generation API is running' });
});

// Test Azure OpenAI connection for chat
app.get('/api/test-connection', async (req, res) => {
  try {
    if (!chatOpenAI) {
      return res.status(500).json({ 
        status: 'Error',
        message: 'Azure OpenAI chat client not initialized',
        endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'Not configured'
      });
    }

    const completion = await chatOpenAI.chat.completions.create({
      messages: [{ role: 'user', content: 'Hello! Can you respond in both English and Indonesian?' }],
      model: 'gpt-4o',
      max_tokens: 100,
    });

    res.json({
      status: 'Connected',
      message: 'Azure OpenAI connection successful with GPT-4o',
      model: 'gpt-4o',
      response: completion.choices[0]?.message?.content || 'No response',
      endpoint: process.env.AZURE_OPENAI_ENDPOINT
    });
  } catch (error: any) {
    console.error('Azure OpenAI connection test failed:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Azure OpenAI connection failed',
      error: error.message,
      endpoint: process.env.AZURE_OPENAI_ENDPOINT || 'Not configured'
    });
  }
});

// Test Azure OpenAI image generation
app.get('/api/test-image-connection', async (req, res) => {
  try {
    if (!imageOpenAI) {
      return res.status(500).json({ 
        status: 'Error',
        message: 'Azure OpenAI image client not initialized',
        endpoint: process.env.AZURE_IMAGE_ENDPOINT || 'Not configured'
      });
    }

    // Test with a simple prompt
    const response = await imageOpenAI.images.generate({
      model: process.env.AZURE_IMAGE_DEPLOYMENT || 'gpt-image-1',
      prompt: 'A simple red circle on white background',
      size: '1024x1024',
      quality: 'medium',
      n: 1,
    });

    let testImageUrl = 'No image data';
    if (response.data?.[0]?.url) {
      testImageUrl = response.data[0].url;
    } else if (response.data?.[0]?.b64_json) {
      testImageUrl = 'Base64 data received (Azure style)';
    }

    res.json({
      status: 'Connected',
      message: 'Azure OpenAI image generation successful',
      deployment: process.env.AZURE_IMAGE_DEPLOYMENT,
      endpoint: process.env.AZURE_IMAGE_ENDPOINT,
      testImage: testImageUrl
    });
  } catch (error: any) {
    console.error('Azure OpenAI image connection test failed:', error);
    res.status(500).json({
      status: 'Error',
      message: 'Azure OpenAI image connection failed',
      error: error.message,
      deployment: process.env.AZURE_IMAGE_DEPLOYMENT || 'Not configured',
      endpoint: process.env.AZURE_IMAGE_ENDPOINT || 'Not configured'
    });
  }
});

// Generate image endpoint
app.post('/api/generate-image', async (req, res) => {
  try {
    const { prompt, size = '1024x1024', quality = 'medium', n = 1 } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    if (!process.env.AZURE_IMAGE_API_KEY || !imageOpenAI) {
      return res.status(500).json({ error: 'Azure OpenAI Image API is not configured' });
    }

    // Validate size parameter - Azure OpenAI supported sizes
    const validSizes = ['1024x1024', '1024x1536', '1536x1024'];
    if (!validSizes.includes(size)) {
      return res.status(400).json({ 
        error: 'Invalid size. Must be one of: ' + validSizes.join(', ') 
      });
    }

    // Validate quality parameter - Azure OpenAI supported qualities
    const validQualities = ['medium', 'auto'];
    if (!validQualities.includes(quality)) {
      return res.status(400).json({ 
        error: 'Invalid quality. Must be one of: ' + validQualities.join(', ') 
      });
    }

    // Validate number of images
    if (n < 1 || n > 10) {
      return res.status(400).json({ 
        error: 'Number of images must be between 1 and 10' 
      });
    }

    console.log(`🎨 Generating ${n} image(s) for prompt: "${prompt}"`);
    console.log(`🔗 Using Azure Image endpoint: ${process.env.AZURE_IMAGE_ENDPOINT}`);
    console.log(`🚀 Using deployment: ${process.env.AZURE_IMAGE_DEPLOYMENT}`);

    const response = await imageOpenAI.images.generate({
      model: process.env.AZURE_IMAGE_DEPLOYMENT || 'gpt-image-1',
      prompt: prompt,
      size: size as '1024x1024' | '1024x1536' | '1536x1024',
      quality: quality as 'medium' | 'auto',
      n: n,
    });

    const images = response.data?.map((image: any, index: number) => {
      const imageId = `dalle_${Date.now()}_${index}`;
      let imageUrl = '';
      
      if (image.url) {
        // Direct URL (OpenAI style)
        imageUrl = image.url;
      } else if (image.b64_json) {
        // Base64 data (Azure style) - save to file
        try {
          const imageBuffer = Buffer.from(image.b64_json, 'base64');
          const filename = `${imageId}.png`;
          const filepath = path.join(uploadsDir, filename);
          const metafilepath = path.join(uploadsDir, `${imageId}_meta.json`);
          
          // Save image file
          fs.writeFileSync(filepath, imageBuffer);
          
          // Save metadata with prompt
          const metadata = {
            prompt: prompt,
            size: size,
            quality: quality,
            revisedPrompt: image.revised_prompt || prompt,
            createdAt: new Date().toISOString()
          };
          fs.writeFileSync(metafilepath, JSON.stringify(metadata, null, 2));
          
          imageUrl = `http://localhost:${PORT}/uploads/${filename}`;
          console.log(`💾 Image saved as ${filename} with metadata`);
        } catch (saveError) {
          console.error('❌ Failed to save image:', saveError);
          imageUrl = 'data:image/png;base64,' + image.b64_json; // Fallback to base64 data URL
        }
      }
      
      return {
        id: imageId,
        url: imageUrl,
        revisedPrompt: image.revised_prompt || prompt,
      };
    }) || [];

    console.log('✅ Azure DALL-E generation successful!');

    res.json({
      success: true,
      images: images,
      originalPrompt: prompt,
      source: 'Azure OpenAI DALL-E (Sweden RG)',
      settings: { size, quality, n }
    });

  } catch (error: any) {
    console.error('❌ Error generating image:', error);
    
    const { prompt, size = '1024x1024', quality = 'standard', n = 1 } = req.body;
    
    if (error.code === 'invalid_api_key') {
      return res.status(401).json({ error: 'Invalid Azure OpenAI API key' });
    }
    
    if (error.code === 'insufficient_quota') {
      return res.status(429).json({ error: 'Azure OpenAI API quota exceeded' });
    }
    
    if (error.code === 'content_policy_violation') {
      return res.status(400).json({ error: 'Content policy violation. Please modify your prompt.' });
    }

    // Fallback to mock images if Azure fails
    console.log('🔄 Falling back to mock images...');
    
    const mockImages = Array.from({ length: n }, (_, index) => ({
      id: `mock_${Date.now()}_${index}`,
      url: `https://picsum.photos/1024/1024?random=${Date.now()}_${index}`,
      revisedPrompt: `Mock image for: ${prompt}`,
    }));

    res.json({
      success: true,
      images: mockImages,
      originalPrompt: prompt,
      source: 'Mock Images (Azure DALL-E failed)',
      warning: `Azure DALL-E generation failed: ${error.message}`,
      settings: { size, quality, n }
    });
  }
});

// Get image generation history (in-memory storage for demo)
let imageHistory: any[] = [];

app.get('/api/history', (req, res) => {
  res.json({ history: imageHistory });
});

// Get all images from uploads folder
app.get('/api/uploads', (req, res) => {
  try {
    const uploadsPath = path.join(__dirname, '../uploads');
    
    if (!fs.existsSync(uploadsPath)) {
      return res.json({ images: [] });
    }

    const files = fs.readdirSync(uploadsPath);
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return ['.png', '.jpg', '.jpeg', '.gif', '.webp'].includes(ext);
    });

    const images = imageFiles.map(file => {
      const filePath = path.join(uploadsPath, file);
      const stats = fs.statSync(filePath);
      const baseId = file.replace(/\.[^/.]+$/, ""); // Remove extension for ID
      const metaPath = path.join(uploadsPath, `${baseId}_meta.json`);
      
      let metadata = null;
      try {
        if (fs.existsSync(metaPath)) {
          const metaContent = fs.readFileSync(metaPath, 'utf8');
          metadata = JSON.parse(metaContent);
        }
      } catch (metaError) {
        console.warn(`⚠️ Could not read metadata for ${file}:`, metaError);
      }
      
      return {
        id: baseId,
        filename: file,
        url: `http://localhost:${PORT}/uploads/${file}`,
        title: metadata?.prompt || baseId,
        prompt: metadata?.prompt || '',
        revisedPrompt: metadata?.revisedPrompt || '',
        size: metadata?.size || 'unknown',
        quality: metadata?.quality || 'unknown',
        createdAt: metadata?.createdAt || stats.birthtime.toISOString(),
        fileSize: stats.size
      };
    });

    // Sort by creation date (newest first)
    images.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({ 
      images: images,
      count: images.length 
    });
  } catch (error: any) {
    console.error('Error reading uploads folder:', error);
    res.status(500).json({ 
      error: 'Failed to read uploads folder',
      message: error.message 
    });
  }
});

// Save image to history
app.post('/api/save-to-history', (req, res) => {
  const { prompt, imageUrl, settings, duration } = req.body;
  
  const historyItem = {
    id: Date.now().toString(),
    prompt,
    imageUrl,
    settings,
    duration,
    createdAt: new Date().toISOString()
  };
  
  imageHistory.unshift(historyItem);
  
  // Keep only last 50 items
  if (imageHistory.length > 50) {
    imageHistory = imageHistory.slice(0, 50);
  }
  
  res.json({ success: true, item: historyItem });
});

// Error handling middleware
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📡 API endpoints:`);
  console.log(`   GET  /api/health - Health check`);
  console.log(`   POST /api/generate-image - Generate images`);
  console.log(`   GET  /api/history - Get generation history`);
  console.log(`   GET  /api/uploads - Get all uploaded images`);
  console.log(`   POST /api/save-to-history - Save image to history`);
});

export default app;
