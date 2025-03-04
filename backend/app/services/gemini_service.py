import os
import google.generativeai as genai
from flask import current_app
from app.utils.logger import get_logger

logger = get_logger(__name__)

class GeminiService:
    """Service for interacting with Google's Gemini API"""
    
    def __init__(self):
        """Initialize the Gemini service with API key"""
        api_key = current_app.config.get('GEMINI_API_KEY')
        if not api_key:
            logger.warning("Gemini API key not found in configuration")
            raise ValueError("Gemini API key is required")
        
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel('gemini-pro-vision')
        self.text_model = genai.GenerativeModel('gemini-pro')
    
    def analyze_return(self, description, image_urls=None):
        """
        Analyze return item using Gemini API
        
        Args:
            description (str): Customer's description of the return
            image_urls (list): List of image URLs to analyze
            
        Returns:
            dict: Analysis results including category, reason, recommendation, and confidence
        """
        try:
            prompt = f"""
            You are an AI assistant for an e-commerce return management system.
            Analyze the following customer return description and images (if provided).
            
            Customer description: {description}
            
            Provide the following information in a structured format:
            1. Product category (e.g., electronics, clothing, home goods)
            2. Return reason (e.g., defective, wrong size, changed mind)
            3. Recommendation for handling (e.g., resell as new, discount, return to vendor)
            4. Confidence level (0.0 to 1.0)
            
            Format your response as a JSON object with the following keys:
            category, reason, recommendation, confidence
            """
            
            if image_urls:
                # Process with images
                image_parts = []
                for url in image_urls[:5]:  # Limit to 5 images
                    image_parts.append({
                        "mime_type": "image/jpeg",
                        "data": self._get_image_data(url)
                    })
                
                response = self.model.generate_content([prompt, *image_parts])
            else:
                # Process text only
                response = self.text_model.generate_content(prompt)
            
            # Parse the response to extract structured data
            result = self._parse_response(response.text)
            return result
            
        except Exception as e:
            logger.error(f"Error analyzing return with Gemini: {str(e)}")
            return {
                "category": "unknown",
                "reason": "analysis_failed",
                "recommendation": "manual_review",
                "confidence": 0.0,
                "error": str(e)
            }
    
    def _get_image_data(self, url):
        """
        Get image data from URL
        
        This is a placeholder. In a real implementation, you would:
        1. Download the image from Cloud Storage
        2. Convert to base64 or appropriate format for Gemini API
        """
        # Placeholder implementation
        import requests
        from io import BytesIO
        import base64
        
        response = requests.get(url)
        img_data = BytesIO(response.content)
        return base64.b64encode(img_data.getvalue()).decode('utf-8')
    
    def _parse_response(self, response_text):
        """
        Parse the response from Gemini API
        
        This is a simplified implementation. In production, you would:
        1. Use proper JSON parsing
        2. Handle various response formats
        3. Add error handling
        """
        try:
            import json
            # Try to extract JSON from the response
            start_idx = response_text.find('{')
            end_idx = response_text.rfind('}') + 1
            
            if start_idx >= 0 and end_idx > start_idx:
                json_str = response_text[start_idx:end_idx]
                result = json.loads(json_str)
                return result
            
            # Fallback to manual parsing if JSON extraction fails
            lines = response_text.strip().split('\n')
            result = {
                "category": "unknown",
                "reason": "unknown",
                "recommendation": "manual_review",
                "confidence": 0.5
            }
            
            for line in lines:
                if "category" in line.lower():
                    result["category"] = line.split(":")[-1].strip()
                elif "reason" in line.lower():
                    result["reason"] = line.split(":")[-1].strip()
                elif "recommendation" in line.lower():
                    result["recommendation"] = line.split(":")[-1].strip()
                elif "confidence" in line.lower():
                    try:
                        conf = float(line.split(":")[-1].strip())
                        result["confidence"] = conf
                    except:
                        pass
            
            return result
            
        except Exception as e:
            logger.error(f"Error parsing Gemini response: {str(e)}")
            return {
                "category": "unknown",
                "reason": "parsing_failed",
                "recommendation": "manual_review",
                "confidence": 0.0,
                "error": str(e)
            } 