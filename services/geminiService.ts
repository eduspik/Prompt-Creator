import { GoogleGenAI, Type } from '@google/genai';
import { Persona, ContentType, GeneratedContent, AccountType, GeneratedPosts } from '../types';
import { Language } from '../i18n';

const getAi = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const generateImagePrompts = async (persona: Persona, theme: string): Promise<string[]> => {
    const ai = getAi();
    
    let basePrompt: string;
    if (persona.id === AccountType.CASSANDRA19) {
        basePrompt = `As a creative director for a high-fashion art magazine, generate 3 distinct, hyper-detailed, and artistically sensual image prompts in ENGLISH featuring Cassandra19. The theme is: "${theme}". The theme might describe a solo scene OR a scene with other characters. If other people are mentioned, you MUST include them and describe their dynamic and interaction with Cassandra, who remains the central muse.

The goal is to create concepts that are provocative and artistic, focusing on mood, symbolism, and aesthetic composition over explicit depiction. The final images should be suitable for a fine art gallery.

Each prompt is for a photorealistic, hyperrealistic AI image generator and must produce an image indistinguishable from a real photograph of a real person. NO animation or CGI.

Each prompt MUST include:
1.  **Character(s):** Cassandra19, a 19-year-old redhead with freckles, portrayed as a powerful and enigmatic muse. If other characters are present from the theme, describe them and their interaction with her.
2.  **Camera Angle:** Be specific and artistic (e.g., extreme close-up on her eyes reflecting the scene, low-angle shot to convey power, point-of-view shot creating intimacy).
3.  **Lighting:** Describe it vividly to create a strong mood (e.g., chiaroscuro lighting reminiscent of a Caravaggio painting, soft golden hour sunlight filtering through lace, harsh neon light casting dramatic shadows).
4.  **Textures:** Detail the textures to enhance the sensory experience (e.g., the glistening sheen on skin from humidity, the glossy look of wet latex, the rough texture of an ancient stone wall, smooth silk sheets).
5.  **Facial Expression:** Be very specific and evocative, hinting at a complex inner world (e.g., a subtle, knowing smirk with a bitten lower lip, a distant, dreamy expression verging on melancholy, a look of fierce determination).
6.  **Action:** A clear, captivating, and powerful action that tells a story.

The response must be a JSON object with a 'prompts' key containing an array of 3 unique, paragraph-length string prompts in ENGLISH.`;
    } else { // DIVINESLUTS
        basePrompt = `As a creative director for a high-fashion art magazine, generate 3 distinct, hyper-detailed, and artistically sensual image prompts in ENGLISH featuring Divinesluts. The theme is: "${theme}". The theme might describe a scene with just the coven OR include additional characters. If other people are mentioned, you MUST incorporate them into the group composition, describing their role and interaction with the goddesses.

The goal is to create concepts that are provocative and artistic, focusing on mood, symbolism, and aesthetic composition over explicit depiction. The final images should be suitable for a fine art gallery.

Each prompt is for a photorealistic, hyperrealistic AI image generator and must produce an image indistinguishable from a real photograph of real people. NO animation or CGI.

Each prompt MUST include:
1.  **Characters:** Divinesluts, a coven of 19-25 year-old goddess-like figures. Describe their powerful interactions and the group dynamic. If additional characters from the theme are present, describe their role in the scene.
2.  **Camera Angle:** Be specific and dynamic to capture the scene's energy (e.g., a wide shot establishing the grand environment, a shaky handheld cam creating a sense of raw intimacy, a low-angle shot making them look monumental).
3.  **Lighting:** Describe it vividly to create a strong mood (e.g., dramatic strobe lights of a surreal nightclub, cold sterile light of an abandoned industrial setting, ethereal moonlight in a mystical forest clearing).
4.  **Textures:** Detail the textures in the scene to enhance the sensory experience (e.g., intricate details of their avant-garde outfits, the tearing of fishnet stockings against skin, condensation on a dark room window).
5.  **Facial Expressions:** Be very specific, evocative, and varied for the group, telling a collective story (e.g., confident smirks, artistic expressions of ecstasy, predatory glares of untouchable goddesses).
6.  **Action:** A clear, powerful, and dynamic group composition that is both visually stunning and narratively intriguing.

The response must be a JSON object with a 'prompts' key containing an array of 3 unique, paragraph-length string prompts in ENGLISH.`;
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: basePrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    prompts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.STRING,
                        },
                    },
                },
            },
        },
    });

    if (!response.text) {
        throw new Error('SAFETY_BLOCK');
    }
    const jsonString = response.text.trim();
    try {
        const result = JSON.parse(jsonString);
        if (result && Array.isArray(result.prompts)) {
            return result.prompts;
        }
        throw new Error('Invalid JSON structure from API for prompts.');
    } catch (e) {
        console.error('Failed to parse JSON response for image prompts:', jsonString, e);
        throw new Error('Could not generate valid image prompts.');
    }
};

const generatePostTexts = async (persona: Persona, theme: string): Promise<GeneratedPosts[]> => {
    const ai = getAi();
    
    const basePrompt = `Based on the persona description and the theme, generate 3 unique sets of social media posts.

**Persona:**
${persona.description}

**Theme:**
"${theme}"

For each of the 3 sets, generate one post for each of the following platforms: Fanvue, Instagram, and Twitter.
-   **Fanvue Post:** Must be alluring and artfully descriptive, using evocative language that aligns with the persona's confident and sensual nature. The tone is suitable for an exclusive platform where fans expect a deeper, more artistic connection.
-   **Instagram Post:** Must be suggestive and teasing but adhere to Instagram's content policies. Use coded language, suggestive emojis, and hint at the more artistic content available on Fanvue without being explicit. The goal is to drive traffic.
-   **Twitter/X Post:** Can be more direct and bold than Instagram but should maintain an artistic and intriguing tone. It should be short, punchy, and use relevant hashtags to attract attention.

The response must be a JSON object with a 'posts' key, containing an array of 3 objects. Each object must have 'fanvue', 'instagram', and 'twitter' keys with the corresponding post text as string values.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: basePrompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    posts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                fanvue: { type: Type.STRING },
                                instagram: { type: Type.STRING },
                                twitter: { type: Type.STRING },
                            },
                            required: ['fanvue', 'instagram', 'twitter'],
                        },
                    },
                },
            },
        },
    });

    if (!response.text) {
        throw new Error('SAFETY_BLOCK');
    }
    const jsonString = response.text.trim();
    try {
        const result = JSON.parse(jsonString);
        if (result && Array.isArray(result.posts)) {
            return result.posts as GeneratedPosts[];
        }
        throw new Error('Invalid JSON structure from API for posts.');
    } catch (e) {
        console.error('Failed to parse JSON response for posts:', jsonString, e);
        throw new Error('Could not generate valid posts.');
    }
};

export const generateContent = async (persona: Persona, contentType: ContentType, theme: string): Promise<GeneratedContent> => {
    if (contentType === ContentType.IMAGE_PROMPT) {
        return generateImagePrompts(persona, theme);
    } else if (contentType === ContentType.POST_TEXT) {
        return generatePostTexts(persona, theme);
    }
    // Should not happen with the current UI
    throw new Error('Invalid content type specified.');
};

export const translateToEnglish = async (text: string): Promise<string> => {
    if (!text.trim()) {
        return "";
    }
    const ai = getAi();
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Translate the following text to English. Return only the translated text, with no additional commentary or explanations. Text: "${text}"`,
            config: {
                temperature: 0.1,
            }
        });

        if (!response.text) {
            throw new Error('Translation failed or returned empty response.');
        }
        return response.text.trim();
    } catch (error) {
        console.error("Translation API call failed:", error);
        throw new Error('TRANSLATION_FAILED');
    }
};

export const generatePromptFromImage = async (base64Data: string, mimeType: string, language: Language): Promise<string> => {
    const ai = getAi();
    const imagePart = {
        inlineData: {
            mimeType,
            data: base64Data,
        },
    };

    const textPrompt = language === 'es'
        ? "Describe esta imagen con extremo detalle, enfocándote en elementos útiles para recrearla con un generador de imágenes IA. Describe los personajes, su ropa, el entorno, la iluminación, el ángulo de la cámara y el estilo general. La descripción debe ser un único párrafo coherente y muy descriptivo."
        : "Describe this image in extreme detail, focusing on elements useful for recreating it with an AI image generator. Describe the characters, their clothing, the environment, the lighting, the camera angle, and the overall style. The description should be a single, cohesive, and very descriptive paragraph.";

    const textPart = { text: textPrompt };

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
        config: {
            temperature: 0.2,
        }
    });

    if (!response.text) {
        throw new Error('SAFETY_BLOCK');
    }
    return response.text.trim();
};