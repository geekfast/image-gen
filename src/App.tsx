import React, { useState } from 'react';
import axios from 'axios';
import { Download, Loader2, Sparkles, Settings, History, Image as ImageIcon } from 'lucide-react';
import './App.css';

interface GeneratedImage {
  id: string;
  url: string;
  revisedPrompt?: string;
}

interface GenerationHistory {
  id: string;
  prompt: string;
  imageUrl: string;
  settings: {
    size: string;
    quality: string;
    n: number;
  };
  createdAt: string;
}

const API_BASE_URL = 'http://localhost:3001/api';

function App() {
  const [prompt, setPrompt] = useState('');
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationTime, setGenerationTime] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('0.0s');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [settings, setSettings] = useState({
    size: '1024x1024',
    quality: 'medium',
    n: 1
  });
  const [showSettings, setShowSettings] = useState(false);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  const generateImage = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setLoading(true);
    setError(null);
    setImages([]);
    setGenerationTime(null);
    setCurrentTime('0.0s');
    const startTime = Date.now();
    setStartTime(startTime);

    try {
      const response = await axios.post(`${API_BASE_URL}/generate-image`, {
        prompt: prompt.trim(),
        size: settings.size,
        quality: settings.quality,
        n: settings.n
      });

      const endTime = Date.now();
      const duration = ((endTime - startTime) / 1000).toFixed(1);
      setGenerationTime(`${duration}s`);

      if (response.data.success) {
        setImages(response.data.images);
        
        // Save to history
        if (response.data.images.length > 0) {
          await axios.post(`${API_BASE_URL}/save-to-history`, {
            prompt: prompt.trim(),
            imageUrl: response.data.images[0].url,
            settings: settings
          });
          loadHistory();
        }
      }
    } catch (err: any) {
      console.error('Error generating image:', err);
      setError(
        err.response?.data?.error || 
        'Failed to generate image. Please check your internet connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setHistory(response.data.history || []);
    } catch (err) {
      console.error('Error loading history:', err);
    }
  };

  const downloadImage = async (imageUrl: string, filename: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading image:', err);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  // Live timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (loading && startTime) {
      interval = setInterval(() => {
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        setCurrentTime(`${elapsed}s`);
      }, 100); // Update every 100ms for smooth animation
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loading, startTime]);

  React.useEffect(() => {
    loadHistory();
  }, []);

  return (
    <div className="app">
      <div className="container">
        <header className="header">
          <div className="header-content">
            <div className="logo">
              <ImageIcon className="logo-icon" />
              <h1>AI Image Generator</h1>
            </div>
            <div className="header-actions">
              <button
                className={`btn btn-secondary ${showHistory ? 'active' : ''}`}
                onClick={() => setShowHistory(!showHistory)}
              >
                <History size={20} />
                History
              </button>
              <button
                className={`btn btn-secondary ${showSettings ? 'active' : ''}`}
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings size={20} />
                Settings
              </button>
            </div>
          </div>
        </header>

        <main className="main">
          {showSettings && (
            <div className="settings-panel">
              <h3>Generation Settings</h3>
              <div className="settings-grid">
                <div className="setting-group">
                  <label>Image Size</label>
                  <select
                    value={settings.size}
                    onChange={(e) => setSettings({ ...settings, size: e.target.value })}
                  >
                    <option value="1024x1024">Square (1024×1024)</option>
                    <option value="1792x1024">Landscape (1792×1024)</option>
                    <option value="1024x1792">Portrait (1024×1792)</option>
                    <option value="512x512">Small Square (512×512)</option>
                  </select>
                </div>
                <div className="setting-group">
                  <label>Quality</label>
                  <div className="quality-buttons">
                    {['low', 'medium', 'high', 'auto'].map((quality) => (
                      <button
                        key={quality}
                        type="button"
                        className={`quality-btn ${settings.quality === quality ? 'selected' : ''}`}
                        onClick={() => setSettings({ ...settings, quality })}
                      >
                        {quality.charAt(0).toUpperCase() + quality.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="setting-group">
                  <label>Number of Images</label>
                  <select
                    value={settings.n}
                    onChange={(e) => setSettings({ ...settings, n: parseInt(e.target.value) })}
                  >
                    <option value={1}>1 Image</option>
                    <option value={2}>2 Images</option>
                    <option value={3}>3 Images</option>
                    <option value={4}>4 Images</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="input-section">
            <div className="input-group">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe the image you want to generate... (e.g., 'A serene mountain landscape with a crystal clear lake reflecting the sunset')"
                rows={3}
                disabled={loading}
                className="prompt-input"
              />
              <button
                onClick={generateImage}
                disabled={loading || !prompt.trim()}
                className="btn btn-primary generate-btn"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Generating... {currentTime}
                  </>
                ) : (
                  <>
                    <Sparkles size={20} />
                    Generate Image
                  </>
                )}
              </button>
            </div>
            
            {loading && (
              <div className="live-progress">
                🔄 Generating image... {currentTime}
              </div>
            )}
            
            {generationTime && !loading && (
              <div className="generation-time">
                ⏱️ Generated in {generationTime}
              </div>
            )}
            
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>

          {images.length > 0 && (
            <div className="results-section">
              <h2>Generated Images</h2>
              <div className="images-grid">
                {images.map((image, index) => (
                  <div key={image.id} className="image-card">
                    <img
                      src={image.url}
                      alt={`Generated image ${index + 1}`}
                      className="generated-image"
                    />
                    <div className="image-actions">
                      <button
                        onClick={() => downloadImage(image.url, `generated-image-${image.id}`)}
                        className="btn btn-secondary"
                      >
                        <Download size={16} />
                        Download
                      </button>
                    </div>
                    {image.revisedPrompt && (
                      <div className="revised-prompt">
                        <strong>Revised Prompt:</strong> {image.revisedPrompt}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {showHistory && history.length > 0 && (
            <div className="history-section">
              <h2>Generation History</h2>
              <div className="history-grid">
                {history.map((item) => (
                  <div key={item.id} className="history-item">
                    <img
                      src={item.imageUrl}
                      alt="Historical generation"
                      className="history-image"
                      onClick={() => setPrompt(item.prompt)}
                    />
                    <div className="history-info">
                      <p className="history-prompt">{item.prompt}</p>
                      <div className="history-meta">
                        <span>{item.settings.size}</span>
                        <span>{item.settings.quality}</span>
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <footer className="footer">
          <p>
            Powered by OpenAI DALL-E 3 • 
            <span className="tip"> Tip: Click on history images to reuse prompts</span>
          </p>
        </footer>
      </div>
    </div>
  );
}

export default App;
