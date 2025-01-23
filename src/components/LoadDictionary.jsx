// DictionaryLoader.js
export async function loadDictionary() {
    try {
        const response = await fetch('arabic-words.json');
        const words = await response.json();
        console.log(`Loaded ${words.length} words from dictionary`);
        return words;
    } catch (error) {
        console.error("Error loading dictionary:", error);
        // Fallback to a small set of common words if loading fails
        return "failed to load dictionary"
    }
}