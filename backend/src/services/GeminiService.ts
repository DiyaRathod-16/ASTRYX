import { GoogleGenerativeAI, GenerativeModel, Part } from '@google/generative-ai';
import { logger } from '../utils/logger';

export interface AIAnalysisResult {
  summary: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  categories: string[];
  entities: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  riskFactors: string[];
  recommendations: string[];
  relatedAnomalies: string[];
  metadata: object;
}

export interface MultimodalInput {
  text?: string;
  images?: Buffer[];
  imageUrls?: string[];
  audioUrl?: string;
  videoUrl?: string;
}

export class GeminiService {
  private static instance: GeminiService;
  private genAI: GoogleGenerativeAI;
  private model: GenerativeModel;
  private visionModel: GenerativeModel;

  private constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY not configured - AI features will be limited');
      this.genAI = null as any;
      this.model = null as any;
      this.visionModel = null as any;
      return;
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    this.visionModel = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
  }

  static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async analyzeAnomaly(data: {
    title: string;
    description: string;
    type: string;
    location: string;
    rawData: object;
  }): Promise<AIAnalysisResult> {
    if (!this.model) {
      return this.getMockAnalysis(data);
    }

    try {
      const prompt = `Analyze this anomaly detection event and provide a structured assessment:

Title: ${data.title}
Description: ${data.description}
Type: ${data.type}
Location: ${data.location}
Raw Data: ${JSON.stringify(data.rawData, null, 2)}

Provide analysis in the following JSON format:
{
  "summary": "Brief summary of the anomaly",
  "severity": "low|medium|high|critical",
  "confidence": 0.0-1.0,
  "categories": ["category1", "category2"],
  "entities": ["entity1", "entity2"],
  "sentiment": "positive|negative|neutral",
  "riskFactors": ["risk1", "risk2"],
  "recommendations": ["action1", "action2"],
  "relatedAnomalies": ["type1", "type2"],
  "metadata": {}
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || data.description,
          severity: parsed.severity || 'medium',
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
          categories: parsed.categories || [data.type],
          entities: parsed.entities || [],
          sentiment: parsed.sentiment || 'neutral',
          riskFactors: parsed.riskFactors || [],
          recommendations: parsed.recommendations || [],
          relatedAnomalies: parsed.relatedAnomalies || [],
          metadata: parsed.metadata || {}
        };
      }

      throw new Error('Failed to parse AI response');
    } catch (error) {
      logger.error('Gemini analysis error:', error);
      return this.getMockAnalysis(data);
    }
  }

  async analyzeMultimodal(input: MultimodalInput): Promise<AIAnalysisResult> {
    if (!this.visionModel) {
      return this.getMockAnalysis({ title: 'Multimodal Analysis', description: input.text || '', type: 'unknown', location: 'unknown', rawData: {} });
    }

    try {
      const parts: Part[] = [];

      if (input.text) {
        parts.push({ text: input.text });
      }

      if (input.images && input.images.length > 0) {
        for (const image of input.images) {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: image.toString('base64')
            }
          });
        }
      }

      parts.push({
        text: `Analyze the above content for anomalies and provide assessment in JSON format with: summary, severity (low/medium/high/critical), confidence (0-1), categories, entities, sentiment, riskFactors, recommendations.`
      });

      const result = await this.visionModel.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || 'Multimodal analysis complete',
          severity: parsed.severity || 'medium',
          confidence: Math.min(1, Math.max(0, parsed.confidence || 0.5)),
          categories: parsed.categories || [],
          entities: parsed.entities || [],
          sentiment: parsed.sentiment || 'neutral',
          riskFactors: parsed.riskFactors || [],
          recommendations: parsed.recommendations || [],
          relatedAnomalies: parsed.relatedAnomalies || [],
          metadata: { multimodal: true }
        };
      }

      throw new Error('Failed to parse multimodal AI response');
    } catch (error) {
      logger.error('Gemini multimodal analysis error:', error);
      return this.getMockAnalysis({ title: 'Multimodal Analysis', description: input.text || '', type: 'unknown', location: 'unknown', rawData: {} });
    }
  }

  async crossVerify(anomalyId: string, sources: object[]): Promise<{
    verified: boolean;
    confidence: number;
    matchingSources: number;
    discrepancies: string[];
  }> {
    if (!this.model) {
      return {
        verified: sources.length >= 2,
        confidence: sources.length >= 2 ? 0.75 : 0.5,
        matchingSources: sources.length,
        discrepancies: []
      };
    }

    try {
      const prompt = `Cross-verify these data sources about an anomaly and determine if they corroborate each other:

Sources: ${JSON.stringify(sources, null, 2)}

Respond in JSON format:
{
  "verified": boolean,
  "confidence": 0.0-1.0,
  "matchingSources": number,
  "discrepancies": ["discrepancy1", "discrepancy2"]
}`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to parse verification response');
    } catch (error) {
      logger.error('Cross-verification error:', error);
      return {
        verified: sources.length >= 2,
        confidence: 0.6,
        matchingSources: sources.length,
        discrepancies: []
      };
    }
  }

  async generateImpactAssessment(anomaly: object): Promise<object> {
    if (!this.model) {
      return {
        overallImpact: 'medium',
        affectedAreas: ['local'],
        estimatedDuration: 'hours',
        populationAffected: 'unknown',
        economicImpact: 'unknown',
        environmentalImpact: 'unknown',
        recommendations: ['Monitor situation', 'Prepare contingency plans']
      };
    }

    try {
      const prompt = `Generate an impact assessment for this anomaly:

${JSON.stringify(anomaly, null, 2)}

Respond in JSON format with: overallImpact, affectedAreas, estimatedDuration, populationAffected, economicImpact, environmentalImpact, recommendations.`;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      throw new Error('Failed to parse impact assessment');
    } catch (error) {
      logger.error('Impact assessment error:', error);
      return {
        overallImpact: 'medium',
        affectedAreas: ['local'],
        estimatedDuration: 'hours',
        recommendations: ['Monitor situation']
      };
    }
  }

  private getMockAnalysis(data: { title: string; description: string; type: string; location: string; rawData: object }): AIAnalysisResult {
    return {
      summary: `Analysis of ${data.type} anomaly: ${data.description.substring(0, 100)}...`,
      severity: 'medium',
      confidence: 0.65,
      categories: [data.type],
      entities: [data.location],
      sentiment: 'neutral',
      riskFactors: ['Requires further monitoring', 'Potential escalation'],
      recommendations: ['Continue monitoring', 'Verify with additional sources'],
      relatedAnomalies: [],
      metadata: { mock: true, reason: 'Gemini API not configured or unavailable' }
    };
  }
}
