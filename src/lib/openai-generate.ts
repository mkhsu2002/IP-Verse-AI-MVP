import OpenAI from 'openai';

function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate a composite image using OpenAI GPT-Image-2 via Images API.
 * Edge-compatible: no fs dependency — reads IP character from public URL.
 *
 * @param userPhotoBase64 - Base64 data URL of the user's photo
 * @param ipCharacterUrl - URL to the IP character image (public asset)
 * @param scenePrompt - Text prompt describing the scene
 * @returns Base64 string of the generated image
 */
export async function generateCompositeImage(
  userPhotoBase64: string,
  ipCharacterUrl: string,
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
    // Fetch IP character image from public URL and convert to base64
    const ipResponse = await fetch(ipCharacterUrl);
    if (!ipResponse.ok) {
      throw new Error(`Failed to fetch IP character image: ${ipResponse.status}`);
    }
    const ipArrayBuffer = await ipResponse.arrayBuffer();
    const ipCharacterBase64 = Buffer.from(ipArrayBuffer).toString('base64');

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

    console.log('🎨 Calling OpenAI gpt-image-2 via Images API...');

    // Use Images API with gpt-image-2
    const userImageFile = createImageFile(userPhotoClean, 'user-photo.png');

    const response = await getOpenAIClient().images.edit({
      model: 'gpt-image-2',
      image: userImageFile,
      prompt: fullPrompt,
      n: 1,
      size: '1536x1024' as '1024x1024',
      quality: 'high' as 'low',
    });

    // Extract generated image
    if (response.data && response.data.length > 0) {
      const imageData = response.data[0];
      if (imageData.b64_json) {
        console.log('✅ Image generated successfully via gpt-image-2');
        return imageData.b64_json;
      }
      if (imageData.url) {
        console.log('✅ Image generated (URL), fetching...');
        const imgResponse = await fetch(imageData.url);
        const imgBuffer = await imgResponse.arrayBuffer();
        return Buffer.from(imgBuffer).toString('base64');
      }
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
 * Create a File object from base64 string for the OpenAI API.
 */
function createImageFile(base64Data: string, filename: string): File {
  const buffer = Buffer.from(base64Data, 'base64');
  const blob = new Blob([buffer], { type: 'image/png' });
  return new File([blob], filename, { type: 'image/png' });
}

/**
 * Creates a simple mock image for testing without API key.
 */
function createMockImage(): string {
  const minimalPng =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return minimalPng;
}
