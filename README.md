# AI Image Generator

A modern web application for generating images using OpenAI's DALL-E 3 API. Create stunning images from text prompts with an intuitive interface.

![AI Image Generator](https://via.placeholder.com/800x400/4f46e5/ffffff?text=AI+Image+Generator)

## ✨ Features

- **Text-to-Image Generation**: Create images from detailed text descriptions
- **Multiple Image Sizes**: Support for square, landscape, and portrait formats
- **Quality Options**: Choose between standard and HD quality
- **Batch Generation**: Generate up to 4 images at once
- **Generation History**: View and reuse previous prompts
- **Download Images**: Save generated images to your device
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Feedback**: Loading states and error handling

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Axios** for API communication
- **Lucide React** for icons
- **Modern CSS** with responsive design

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **OpenAI SDK** for DALL-E 3 integration
- **CORS** for cross-origin requests
- **Multer** for file handling (future features)

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- OpenAI API key

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd image-gen
```

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd backend
npm install
```

### 3. Environment Setup

Create a `.env` file in the backend directory:
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file and add your OpenAI API key:
```env
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

### 4. Start the Development Servers

**Backend (Terminal 1):**
```bash
cd backend
npm run dev
```

**Frontend (Terminal 2):**
```bash
npm run dev
```

### 5. Open the Application

Visit `http://localhost:5173` in your browser.

## 📚 API Documentation

### Generate Image
```http
POST /api/generate-image
Content-Type: application/json

{
  "prompt": "A serene mountain landscape with a crystal clear lake",
  "size": "1024x1024",
  "quality": "standard",
  "n": 1
}
```

### Response
```json
{
  "success": true,
  "images": [
    {
      "id": "1234567890_0",
      "url": "https://...",
      "revisedPrompt": "..."
    }
  ],
  "originalPrompt": "A serene mountain landscape...",
  "settings": {
    "size": "1024x1024",
    "quality": "standard",
    "n": 1
  }
}
```

## 🎨 Usage Guide

### Basic Image Generation
1. Enter a descriptive prompt in the text area
2. Optionally adjust settings (size, quality, number of images)
3. Click "Generate Image" or press Enter
4. Wait for the generation to complete
5. Download or save images as needed

### Settings Options
- **Size**: Square (1024×1024), Landscape (1792×1024), Portrait (1024×1792), Small (512×512)
- **Quality**: Standard or HD (higher cost)
- **Number**: 1-4 images per generation

### Tips for Better Results
- Be specific and descriptive in your prompts
- Include style references (e.g., "in the style of Van Gogh")
- Specify lighting, mood, and composition
- Use artistic terms like "photorealistic", "watercolor", "digital art"

## 🏗️ Project Structure

```
image-gen/
├── src/                    # Frontend source code
│   ├── App.tsx            # Main React component
│   ├── App.css            # Application styles
│   └── main.tsx           # Application entry point
├── backend/               # Backend source code
│   ├── src/
│   │   └── server.ts      # Express server
│   ├── .env.example       # Environment template
│   └── package.json       # Backend dependencies
├── public/                # Static assets
├── .github/               # GitHub configurations
│   └── copilot-instructions.md
└── README.md              # This file
```

## 🔧 Development

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

**Backend:**
- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript
- `npm start` - Start production server

### Building for Production

1. Build the backend:
```bash
cd backend
npm run build
```

2. Build the frontend:
```bash
npm run build
```

## 🔒 Security

- API key is securely stored on the backend
- CORS is properly configured
- Input validation for all API endpoints
- Error handling for API rate limits

## 💰 Cost Considerations

- DALL-E 3 pricing: ~$0.04 per standard image, ~$0.08 per HD image
- Monitor your OpenAI usage through their dashboard
- Consider implementing usage limits for production

## 🐛 Troubleshooting

### Common Issues

**"OpenAI API key is not configured"**
- Ensure `.env` file exists in backend directory
- Verify `OPENAI_API_KEY` is set correctly
- Restart the backend server

**"Cannot connect to backend"**
- Verify backend is running on port 3001
- Check for CORS errors in browser console
- Ensure both frontend and backend are running

**"Content policy violation"**
- Review OpenAI's content policy
- Modify your prompt to comply with guidelines
- Avoid generating harmful or inappropriate content

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For issues and questions:
- Check the troubleshooting section
- Review OpenAI's documentation
- Create an issue in the repository

---

**Note**: This is a demonstration project. For production use, consider implementing user authentication, database storage, usage limits, and proper error logging.
# image-gen
