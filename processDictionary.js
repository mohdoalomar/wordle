// ProcessDictionary.js
import Papa from 'papaparse';
import fs from 'fs';

async function processDictionary() {
    try {
        // Read the CSV files
        const wordfreqRaw = fs.readFileSync('public/wordfreq.csv', 'utf8');
        const verbsRaw = fs.readFileSync('public/freq_verbs.csv', 'utf8');
        
        const fourLetterWords = new Set();
        
        // Helper function to clean Arabic text
        function cleanArabicWord(word) {
            return word.replace(/[\u064B-\u0652\u0670]/g, '') // Remove tashkeel
                      .replace(/[ًٌٍَُِّْـ]/g, '')  // Remove additional markers
                      .replace(/[إأآا]/g, 'ا')    // Normalize alef
                      .replace(/[ىي]/g, 'ي')     // Normalize yaa
                      .trim();
        }

        // Process word frequency file
        const wordfreqResults = Papa.parse(wordfreqRaw, {
            header: false,
            skipEmptyLines: true,
            delimiter: '\t'
        });
        
        // Process words
        for (let i = 1; i < wordfreqResults.data.length; i++) {
            const row = wordfreqResults.data[i];
            if (row && row[1]) {
                const word = cleanArabicWord(row[1]);
                if (word.length === 4 && /^[\u0600-\u06FF]+$/.test(word) && 
                    !word.includes('ـ') && !word.includes('ء')) {
                    fourLetterWords.add(word);
                }
            }
        }
        
        // Process verbs file
        const verbsResults = Papa.parse(verbsRaw, {
            header: false,
            skipEmptyLines: true,
            delimiter: '\t'
        });
        
        for (let i = 1; i < verbsResults.data.length; i++) {
            const row = verbsResults.data[i];
            if (row && row[1]) {
                const word = cleanArabicWord(row[1]);
                if (word.length === 4 && /^[\u0600-\u06FF]+$/.test(word) && 
                    !word.includes('ـ') && !word.includes('ء')) {
                    fourLetterWords.add(word);
                }
            }
        }

        const wordList = Array.from(fourLetterWords);
        console.log(`Found ${wordList.length} 4-letter words`);

        // Save to JSON file
        fs.writeFileSync(
            'public/arabic-words.json', 
            JSON.stringify(wordList, null, 2)
        );
        
        console.log('Dictionary saved to arabic-words.json');
    } catch (error) {
        console.error("Error processing dictionary:", error);
    }
}

processDictionary();