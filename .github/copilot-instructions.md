<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# AI Image Generator Project Instructions

This is a full-stack web application for generating images using OpenAI's DALL-E API.

## Project Structure
- Frontend: React + TypeScript + Vite in the root directory
- Backend: Node.js + Express + TypeScript in the `/backend` directory

## Key Technologies
- **Frontend**: React, TypeScript, Vite, Axios, Lucide React
- **Backend**: Express, TypeScript, OpenAI SDK, CORS, dotenv
- **API**: OpenAI DALL-E 3 for image generation

## Development Guidelines
1. Use TypeScript throughout the project for type safety
2. Follow React best practices with functional components and hooks
3. Handle errors gracefully, especially for API calls
4. Implement proper CORS configuration for frontend-backend communication
5. Use environment variables for sensitive data like API keys
6. Provide user-friendly error messages for API failures
7. Implement loading states for better UX during image generation

## Environment Setup
- Backend requires `OPENAI_API_KEY` environment variable
- Frontend runs on port 5173 (Vite default)
- Backend runs on port 3001

## Code Style
- Use modern ES6+ features
- Implement proper error handling with try-catch blocks
- Use semantic HTML and accessible components
- Follow RESTful API conventions
- Use descriptive variable and function names
