import OpenAI from 'openai';

interface GenerateCompositeImageInput {
  targetImageBase64: string;
  userReferencePhotoBase64?: string;
  maskPhotoBase64?: string;
  scenePrompt: string;
  sessionId?: string;
}

function getOpenAIClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

/**
 * Generate a composite image using OpenAI GPT-Image-2 via Images API.
 * Edge-compatible: no fs dependency — reads IP character from public URL.
 *
 * @param targetImageBase64 - Base64 data URL of the composited layout image
 * @param userReferencePhotoBase64 - Original camera photo used as identity reference
 * @param scenePrompt - Text prompt describing the scene
 * @returns Base64 string of the generated image
 */
export async function generateCompositeImage({
  targetImageBase64,
  userReferencePhotoBase64,
  maskPhotoBase64,
  scenePrompt,
  sessionId,
}: GenerateCompositeImageInput): Promise<string> {
  // Check if OpenAI API key is configured
  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      '⚠️ OPENAI_API_KEY not set. Returning mock image for testing.'
    );
    return createMockImage();
  }

  try {
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

Input images:
- Image 1 is the target layout. It contains the official four virtual idols and the real guest placed in protected areas.
- Image 2, when provided, is the original camera photo of the real guest and is the primary identity reference.

Instructions:
- Keep the protected pixels from Image 1 unchanged, especially the real guest's face/body and the four official virtual idols.
- Use Image 2 to verify the guest identity if any visible blending is needed around the protected area. Do not invent, replace, or redraw the guest as a different person.
- Use only the transparent mask areas to create the scene background, lighting, atmosphere, and soft visual integration around the protected guest and idols.
- Preserve the four official virtual anime idols already visible in Image 1. Do not redesign, replace, or remove them.
- There should be a total of 5 people: 1 real guest and the 4 virtual idols, naturally interacting in this scene.
- The output may blend a real photographed guest with an anime-style environment, but the guest must remain recognizably the same person from the camera photo.
- Output a single cohesive illustration suitable for display on a large screen.
- Do NOT include any brand logos, watermarks, text overlays, or real trademarks.
- The image should be vibrant, high quality, and visually stunning.`;

    console.log('🎨 Calling OpenAI gpt-image-2 with layout + user identity reference...');

    const targetImageFile = createImageFile(targetImageBase64, '01-target-layout.png');
    const inputImages: File[] = [targetImageFile];

    if (userReferencePhotoBase64) {
      inputImages.push(createImageFile(userReferencePhotoBase64, '02-user-identity-reference.jpg'));
    }
    
    let maskFile: File | undefined = undefined;
    if (maskPhotoBase64) {
      console.log('🎭 Mask detected. Applying it to Image 1 while using Image 2 for identity reference...');
      maskFile = createImageFile(maskPhotoBase64, 'mask.png');
    }

    const response = await getOpenAIClient().images.edit({
      model: 'gpt-image-2',
      image: inputImages,
      mask: maskFile,
      prompt: fullPrompt,
      input_fidelity: 'high',
      n: 1,
      quality: 'high',
      output_format: 'png',
      size: '1536x1024',
      user: sessionId,
    });

    // Extract generated image
    if (response.data && response.data.length > 0) {
      const imageData = response.data[0];
      if (imageData.b64_json) {
        console.log('✅ Image generated successfully via gpt-image-2 with preserved user reference');
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
function createImageFile(dataUrlOrBase64: string, filename: string): File {
  const parsed = parseImageData(dataUrlOrBase64);
  const buffer = Buffer.from(parsed.base64, 'base64');
  const blob = new Blob([buffer], { type: parsed.mimeType });
  return new File([blob], filename, { type: parsed.mimeType });
}

function parseImageData(dataUrlOrBase64: string): {
  base64: string;
  mimeType: string;
} {
  const match = dataUrlOrBase64.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/i);
  if (!match) {
    return {
      base64: dataUrlOrBase64,
      mimeType: 'image/png',
    };
  }

  return {
    mimeType: match[1].toLowerCase().replace('image/jpg', 'image/jpeg'),
    base64: match[2],
  };
}

/**
 * Creates a simple mock image for testing without API key.
 */
function createMockImage(): string {
  const minimalPng =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
  return minimalPng;
}
