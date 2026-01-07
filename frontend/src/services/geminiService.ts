// Gemini AI Service for ASTRYX
// Using gemini-2.5-flash - latest multimodal model
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

export interface GeminiAnalysisResult {
  success: boolean;
  analysis: {
    summary: string;
    anomalyType: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    confidence: number;
    detectedElements: string[];
    potentialThreats: string[];
    recommendations: string[];
    location?: string;
    timestamp?: string;
  } | null;
  error?: string;
  isDemo?: boolean;
}

// Error result with actual error message
const getErrorResult = (errorMessage: string): GeminiAnalysisResult => {
  return {
    success: false,
    isDemo: false,
    error: errorMessage,
    analysis: {
      summary: `API ERROR: ${errorMessage}`,
      anomalyType: 'Error',
      severity: 'low',
      confidence: 0,
      detectedElements: ['API Error occurred'],
      potentialThreats: [],
      recommendations: [
        'Check your Gemini API key is valid',
        'Ensure you have billing enabled in Google AI Studio',
        'Try a different model if quota exceeded'
      ],
      location: 'N/A',
      timestamp: new Date().toISOString()
    }
  };
};

export const geminiService = {
  // Get API key from localStorage
  getApiKey(): string | null {
    return localStorage.getItem('gemini_api_key');
  },

  // Set API key
  setApiKey(key: string): void {
    localStorage.setItem('gemini_api_key', key);
  },

  // Check if API key is configured
  isConfigured(): boolean {
    // Always return true to allow demo mode
    return true;
  },

  // Check if using demo mode
  isDemoMode(): boolean {
    const key = this.getApiKey();
    return !key || key.length === 0 || key === 'demo';
  },

  // Convert file to base64
  async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/png;base64,")
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  },

  // Analyze image with Gemini
  async analyzeImage(file: File): Promise<GeminiAnalysisResult> {
    const apiKey = this.getApiKey();
    
    console.log('=== GEMINI SERVICE DEBUG ===');
    console.log('API Key from localStorage:', apiKey ? `"${apiKey.substring(0, 10)}..." (length: ${apiKey.length})` : 'NULL/EMPTY');
    
    // If no API key, return error
    if (!apiKey || apiKey.trim().length === 0) {
      console.error('No API key configured!');
      return getErrorResult('No API key configured. Go to Settings → AI & API to add your Gemini API key.');
    }

    // Try real API
    console.log('Making API request to:', GEMINI_API_URL);
    try {
      const base64Data = await this.fileToBase64(file);
      const mimeType = file.type || 'image/jpeg';
      console.log('Image prepared:', { mimeType, base64Length: base64Data.length });

      const requestUrl = `${GEMINI_API_URL}?key=${apiKey}`;
      console.log('Full request URL:', requestUrl.replace(apiKey, 'API_KEY_HIDDEN'));

      const response = await fetch(requestUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `You are ASTRYX, an Autonomous System for Threat Recognition & Yielded eXecution. Analyze this image for potential anomalies, threats, or unusual patterns.

IMPORTANT GUIDELINES FOR SEVERITY CLASSIFICATION:
- "low": Normal images with NO threats (logos, portraits, nature photos, everyday objects, team photos, buildings in good condition)
- "medium": Minor concerns that might need monitoring (small damage, unusual but non-threatening patterns)
- "high": Significant threats requiring attention (major damage, security concerns, hazardous conditions)
- "critical": Immediate danger to life or infrastructure (active disasters, severe damage, imminent threats)

MOST IMAGES WILL BE "low" SEVERITY - only classify as higher if there are ACTUAL threats visible.

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "summary": "Brief 1-2 sentence summary of what you see in the image",
  "anomalyType": "Type: Normal/Benign, Infrastructure, Environmental, Security, Network, Natural Disaster, etc.",
  "severity": "low|medium|high|critical",
  "confidence": 0.0 to 1.0,
  "detectedElements": ["list", "of", "key", "elements", "detected", "in", "image"],
  "potentialThreats": ["list of actual threats - use 'No threats detected' if image is normal"],
  "recommendations": ["list", "of", "recommended", "actions"],
  "location": "Detected or estimated location if visible, otherwise 'Not identifiable'",
  "timestamp": "Any visible timestamp or 'Not visible'"
}

Be accurate and honest. If the image shows a normal scene (logo, portrait, landscape, etc.) with no threats, classify it as "low" severity with "No threats detected".`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64Data
                }
              }
            ]
          }]
        })
      });

      console.log('Response status:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        
        let errorMessage = 'API request failed';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.error?.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        
        console.error('Gemini API Error:', errorMessage);
        return getErrorResult(`API Error (${response.status}): ${errorMessage}`);
      }

      console.log('API call successful, parsing response...');
      const data = await response.json();
      console.log('Raw API Response:', JSON.stringify(data, null, 2));
      
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        console.error('No text in API response:', data);
        return getErrorResult('No response from Gemini API. The model may have blocked the content.');
      }

      console.log('Text response from Gemini:', textResponse);

      // Parse JSON from response (handle potential markdown wrapping)
      let jsonStr = textResponse;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
      }

      const analysis = JSON.parse(jsonStr.trim());
      console.log('Parsed analysis result:', analysis);

      return {
        success: true,
        analysis: {
          summary: analysis.summary || 'Analysis complete',
          anomalyType: analysis.anomalyType || 'Unknown',
          severity: analysis.severity || 'low',
          confidence: analysis.confidence || 0.75,
          detectedElements: analysis.detectedElements || [],
          potentialThreats: analysis.potentialThreats || [],
          recommendations: analysis.recommendations || [],
          location: analysis.location,
          timestamp: analysis.timestamp
        }
      };
    } catch (error: any) {
      console.error('=== GEMINI SERVICE ERROR ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      
      // Return the actual error, NOT demo mode
      return getErrorResult(`Exception: ${error.message || 'Unknown error occurred'}`);
    }
  },

  // Analyze text content
  async analyzeText(text: string): Promise<GeminiAnalysisResult> {
    const apiKey = this.getApiKey();
    
    // If no API key, return error
    if (!apiKey || apiKey.trim().length === 0) {
      return getErrorResult('No API key configured for text analysis.');
    }

    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are ASTRYX, an Autonomous System for Threat Recognition & Yielded eXecution. Analyze this text/data for potential anomalies, threats, or unusual patterns.

Text to analyze:
${text}

Provide your analysis in the following JSON format (respond ONLY with valid JSON, no markdown):
{
  "summary": "Brief 1-2 sentence summary",
  "anomalyType": "Type of anomaly detected",
  "severity": "low|medium|high|critical",
  "confidence": 0.0 to 1.0,
  "detectedElements": ["list", "of", "key", "elements"],
  "potentialThreats": ["list", "of", "potential", "threats"],
  "recommendations": ["list", "of", "recommended", "actions"]
}`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Gemini API error:', errorText);
        return getErrorResult(`Text analysis API error: ${response.status}`);
      }

      const data = await response.json();
      const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        return getErrorResult('No response from text analysis API');
      }

      let jsonStr = textResponse;
      if (jsonStr.includes('```json')) {
        jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      }
      if (jsonStr.includes('```')) {
        jsonStr = jsonStr.replace(/```\n?/g, '');
      }

      const analysis = JSON.parse(jsonStr.trim());

      return {
        success: true,
        analysis: {
          summary: analysis.summary || 'Analysis complete',
          anomalyType: analysis.anomalyType || 'Unknown',
          severity: analysis.severity || 'low',
          confidence: analysis.confidence || 0.75,
          detectedElements: analysis.detectedElements || [],
          potentialThreats: analysis.potentialThreats || [],
          recommendations: analysis.recommendations || []
        }
      };
    } catch (error: any) {
      console.error('Gemini text analysis error:', error);
      return getErrorResult(`Text analysis error: ${error.message}`);
    }
  }
};
