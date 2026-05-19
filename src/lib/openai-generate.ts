import OpenAI from 'openai';
import { promises as fs } from 'fs';

function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate a composite image using OpenAI GPT-Image (gpt-image-1).
 * Combines a user photo, a virtual IP character reference, and a scene prompt.
 *
 * @param userPhotoBase64 - Base64 data URL of the user's photo (data:image/jpeg;base64,...)
 * @param ipCharacterPath - Absolute file path to the IP character image
 * @param scenePrompt - Text prompt describing the scene
 * @returns Base64 string of the generated image (without data URL prefix)
 */
export async function generateCompositeImage(
  userPhotoBase64: string,
  ipCharacterPath: string,
  scenePrompt: string
): Promise<string> {
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      '⚠️ OPENAI_API_KEY not set. Returning mock image for testing.'
    );
    return createMockImage();
  }

  try {
    // Read IP character image and convert to base64
    const ipCharacterBuffer = await fs.readFile(ipCharacterPath);
    const ipCharacterBase64 = ipCharacterBuffer.toString('base64');

    // Strip data URL prefix from user photo if present
    const userPhotoClean = userPhotoBase64.replace(
      /^data:image\/\w+;base64,/,
      ''
    );

    const fullPrompt = `Create a high-quality anime illustration composite photo. 
    
Scene: ${scenePrompt}

Instructions:
- Place the real person from the first reference image into the scene, preserving their actual facial features, hairstyle, skin tone, and body proportions accurately.
- Place the anime virtual mascot character from the second reference image next to the person.
- Both characters should be naturally interacting within the scene setting.
- The art style should blend the realistic person smoothly into the anime-style environment.
- Output a single cohesive illustration suitable for display on a large screen.
- Do NOT include any brand logos, watermarks, text overlays, or real trademarks.
- The image should be vibrant, high quality, and visually stunning.`;

    const response = await getOpenAIClient().responses.create({
      model: 'gpt-image-1',
      input: [
        {
          role: 'user' as const,
          content: [
            { type: 'input_text' as const, text: fullPrompt },
            {
              type: 'input_image' as const,
              image_url: `data:image/jpeg;base64,${userPhotoClean}`,
              detail: 'high' as const,
            },
            {
              type: 'input_image' as const,
              image_url: `data:image/png;base64,${ipCharacterBase64}`,
              detail: 'high' as const,
            },
          ],
        },
      ],
      tools: [{ type: 'image_generation', size: '1536x1024', quality: 'high' }],
    });

    // Extract generated image from response
    const imageOutput = response.output.find(
      (item) => item.type === 'image_generation_call'
    );

    if (imageOutput && imageOutput.type === 'image_generation_call' && imageOutput.result) {
      return imageOutput.result;
    }

    console.error('No image output found in OpenAI response');
    return createMockImage();
  } catch (error) {
    console.error('OpenAI image generation error:', error);
    throw new Error(
      `圖片生成失敗: ${error instanceof Error ? error.message : '未知錯誤'}`
    );
  }
}

/**
 * Creates a simple mock image (gradient) for testing without API key.
 */
function createMockImage(): string {
  // Create a simple 1x1 pixel PNG as placeholder
  // This is a minimal valid PNG with a purple pixel
  const minimalPng =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return minimalPng;
}
