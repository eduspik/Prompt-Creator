export const translations = {
  es: {
    // Header
    headerTitle: 'Arquitecto de Contenido Fanvue',
    headerSubtitle: 'Tu asistente IA para la creación de contenido único y seductor.',
    // Language Switcher
    language: 'EN',
    // Content Type
    contentTypeLabel: '1. Elige el Tipo de Contenido',
    imagePrompts: '📷 Prompts de Imagen',
    postTexts: '✍️ Textos para Publicación',
    // Prompt Builder
    promptBuilderLabel: '2. Construye tu Prompt',
    resetSelections: 'Resetear Selecciones',
    generateRandomIdea: 'Generar Idea Aleatoria',
    mainActionPlaceholder: 'Describe la idea principal aquí... ej: Una foto hiperrealista de una mujer hermosa...',
    previewLabel: 'PROMPT FINAL (EDITABLE)',
    previewPlaceholder: 'El prompt construido a partir de tus selecciones aparecerá aquí y será editable.',
    // Image Reference
    imageReferenceLabel: '¿Tienes una imagen de referencia?',
    uploadImage: 'Subir Imagen',
    describeImage: '✨ Generar Prompt desde Imagen',
    describingImage: 'Describiendo...',
    removeImage: 'Quitar Imagen',
    // Prompt Builder categories
    refreshAria: 'Refrescar ideas para',
    needInspiration: '¿Necesitas inspiración?',
    inspirationSubtitle: 'Haz clic en una idea para añadirla como acción principal.',
    loadMoreIdeas: 'Cargar más ideas...',
    viewMoreOptions: 'Ver más opciones...',
    addYourOwn: 'Añade tu propia opción...',
    add: 'Añadir',
    // Submit button
    generateButton: '✨ Generar Contenido',
    generatingButton: 'Generando Contenido...',
    // Output
    copyToClipboard: 'Copiar al portapapeles',
    // History
    historyTitle: 'Historial de Generaciones',
    clearHistory: 'Limpiar Historial',
    reusePrompt: 'Reutilizar',
    deletePrompt: 'Eliminar',
    // Error messages
    safetyError: 'El contenido generado fue bloqueado por filtros de seguridad. Por favor, ajusta el prompt e inténtalo de nuevo.',
    apiError: 'Error al generar el contenido. El modelo puede no estar disponible o la solicitud fue bloqueada.',
    translationError: 'Error al traducir el prompt. Por favor, inténtalo de nuevo o escribe el prompt en inglés.',
    // Category Labels
    hairStyle: 'Estilo de Pelo',
    hairStyleRed: 'Estilo de Pelo (Pelirrojo)',
    bodyPart: 'Partes del Cuerpo',
    facialEmotion: 'Emoción Facial',
    outfit: 'Atuendo',
    accessories: 'Accesorios',
    location: 'Escenario',
    action: 'Acción / Pose',
    lighting: 'Iluminación',
    cameraAngle: 'Ángulo de Cámara',
    style: 'Estilo Artístico',
    ethnicity: 'Etnia / Raza',
    hairColor: 'Color de Pelo',
    extraPeople: 'Personas Adicionales',
    specificFetishes: 'Fetiches Específicos',
  },
  en: {
    // Header
    headerTitle: 'Fanvue Content Architect',
    headerSubtitle: 'Your AI assistant for creating unique and seductive content.',
    // Language Switcher
    language: 'ES',
    // Content Type
    contentTypeLabel: '1. Choose Content Type',
    imagePrompts: '📷 Image Prompts',
    postTexts: '✍️ Post Texts',
    // Prompt Builder
    promptBuilderLabel: '2. Build Your Prompt',
    resetSelections: 'Reset Selections',
    generateRandomIdea: 'Generate Random Idea',
    mainActionPlaceholder: 'Describe the main idea here... e.g., A hyperrealistic photo of a beautiful woman...',
    previewLabel: 'FINAL PROMPT (EDITABLE)',
    previewPlaceholder: 'The prompt built from your selections will appear here and will be editable.',
    // Image Reference
    imageReferenceLabel: 'Have a reference image?',
    uploadImage: 'Upload Image',
    describeImage: '✨ Generate Prompt from Image',
    describingImage: 'Describing...',
    removeImage: 'Remove Image',
    // Prompt Builder categories
    refreshAria: 'Refresh ideas for',
    needInspiration: 'Need some inspiration?',
    inspirationSubtitle: 'Click an idea to add it as your main action.',
    loadMoreIdeas: 'Load more ideas...',
    viewMoreOptions: 'View more options...',
    addYourOwn: 'Add your own option...',
    add: 'Add',
    // Submit button
    generateButton: '✨ Generate Content',
    generatingButton: 'Generating Content...',
    // Output
    copyToClipboard: 'Copy to clipboard',
    // History
    historyTitle: 'Generation History',
    clearHistory: 'Clear History',
    reusePrompt: 'Reuse',
    deletePrompt: 'Delete',
    // Error messages
    safetyError: 'The generated content was blocked by safety filters. Please adjust the prompt and try again.',
    apiError: 'Error generating content. The model may be unavailable or the request was blocked.',
    translationError: 'Failed to translate the prompt. Please try again or write the prompt in English.',
    // Category Labels
    hairStyle: 'Hair Style',
    hairStyleRed: 'Hair Style (Redhead)',
    bodyPart: 'Body Parts',
    facialEmotion: 'Facial Emotion',
    outfit: 'Outfit',
    accessories: 'Accessories',
    location: 'Location',
    action: 'Action / Pose',
    lighting: 'Lighting',
    cameraAngle: 'Camera Angle',
    style: 'Artistic Style',
    ethnicity: 'Ethnicity / Race',
    hairColor: 'Hair Color',
    extraPeople: 'Extra People',
    specificFetishes: 'Specific Fetishes',
  },
};

export type Language = 'es' | 'en';
export type TranslationKey = keyof typeof translations.es;