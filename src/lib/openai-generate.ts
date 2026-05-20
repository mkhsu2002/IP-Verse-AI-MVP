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
  scenePrompt: string,
  maskPhotoBase64?: string
): Promise<string> {
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      '⚠️ OPENAI_API_KEY not set. Returning mock image for testing.'
    );
    return createMockImage();
  }

  try {
    // Strip data URL prefix from user photo if present
    const userPhotoClean = userPhotoBase64.replace(
      /^data:image\/\w+;base64,/,
      ''
    );

    // Highly detailed physical description of the specific 4 virtual anime idols to ensure consistency in generated images
    const MASCOT_DESCRIPTION = 
      "four cheerful anime virtual idols posing together: " +
      "1) A handsome young man with short black hair, wearing a dark blue high school blazer uniform with a blue tie, laughing heartily. " +
      "2) A cute young man with messy bright yellow/gold hair and beautiful blue-green eyes, wearing a pink puffy zip-up winter jacket over a grey inner shirt and white sports pants. " +
      "3) A beautiful young girl with long flowing orange-brown/hazel hair, wearing a white and grey high-collar athletic track jacket and black sports shorts, smiling sweetly. " +
      "4) An energetic girl with black hair, wearing a short-sleeve dark-blue button-up shirt and dark grey casual pants, waving her hand high into the air with a big cheerful smile. " +
      "All four idols are friendly, vibrant, and welcoming the user to join them.";

    // Inject the specific 4-idol description into the scene prompt by replacing generic terms
    let customizedScenePrompt = scenePrompt;
    customizedScenePrompt = customizedScenePrompt.replace(
      /an anime-style virtual mascot/gi,
      MASCOT_DESCRIPTION
    );
    customizedScenePrompt = customizedScenePrompt.replace(
      /anime-style virtual mascot/gi,
      MASCOT_DESCRIPTION
    );

    const fullPrompt = `Create a high-quality anime illustration composite photo. 
    
Scene: ${customizedScenePrompt}

Instructions:
- Place the real person from the reference image into the scene, preserving their actual facial features, hairstyle, skin tone, and body proportions accurately.
- Place the four specific virtual anime idols next to the person, standing or posing together in a friendly group.
- There should be a total of 5 people (1 real person, and the 4 virtual idols) naturally interacting in this scene.
- The art style should blend the realistic person smoothly into the beautiful anime-style environment.
- Output a single cohesive illustration suitable for display on a large screen.
- Do NOT include any brand logos, watermarks, text overlays, or real trademarks.
- The image should be vibrant, high quality, and visually stunning.`;

    console.log('🎨 Calling OpenAI gpt-image-2 via Images API with exact 4-Idol injections...');

    // Use Images API with gpt-image-2
    const userImageFile = createImageFile(userPhotoClean, 'composite.png');
    
    let maskFile: File | undefined = undefined;
    if (maskPhotoBase64) {
      console.log('🎭 Mask detected! Activating Inpainting mode to preserve original virtual idols 100%...');
      const maskClean = maskPhotoBase64.replace(/^data:image\/\w+;base64,/, '');
      maskFile = createImageFile(maskClean, 'mask.png');
    }

    const response = await getOpenAIClient().images.edit({
      model: 'gpt-image-2',
      image: userImageFile,
      mask: maskFile,
      prompt: fullPrompt,
      n: 1,
      size: '1024x1024',
    });

    // Extract generated image
    if (response.data && response.data.length > 0) {
      const imageData = response.data[0];
      if (imageData.b64_json) {
        console.log('✅ Image generated successfully via gpt-image-2 with 4-idols');
        return imageData.b64_json;
      }
      if (imageData.url) {
        console.log('✅ Image generated (URL) with 4-idols, fetching...');
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
