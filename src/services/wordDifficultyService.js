import { useQuery } from '@tanstack/react-query';

export const useWordDifficulty = (word, language) => {
    return useQuery({
        queryKey: ['wordDifficulty', word, language],
        queryFn: () => getWordDifficulty(word, language),
        enabled: !!word && !!language,
        staleTime: 5 * 60 * 1000, // 5 mins
    });
};


export const getGoogleBooksFromApi = async (word, language) => {
    const corpusCode = getCorpusCode(language); 
    // Try different CORS proxy
    const proxyUrl = `https://cors-anywhere.herokuapp.com/https://books.google.com/ngrams/json?content=${word}&year_start=2000&year_end=2019&corpus=${corpusCode}&smoothing=3`;
    const response = await fetch(proxyUrl);
    const data = await response.json();
    return data;
};


export const getCorpusCode = (language) => {
    const corpusMap = {
        'english': 26,
        'japanese': 28,
        'chinese': 25,
        'spanish': 27,
        'french': 29,
        'german': 30,
    };
    return corpusMap[language] || 26;
};


export const getLengthBasedDifficulty = (word) => { 
    if (word.length > 8) return { level: 'Hard', score: 3 };
    if (word.length > 4) return { level: 'Medium', score: 2 };
    return { level: 'Easy', score: 1 };
};


export const getWordDifficulty = async (word, language) => {
    try {
        // First try to get difficulty for the word as entered
        let response = await fetch(`http://localhost:3003/api/word-difficulty?word=${encodeURIComponent(word)}&language=${encodeURIComponent(language)}`);
        let result = await response.json();
        
        // If no data found, try with spelling correction
        if (result.error || !result.data || result.data.source === 'length_fallback') {
            console.log('No Google Books data found, trying spelling correction for', word);
            
            // Try common spelling variations mainly for japanese
            const variations = getSpellingVariations(word, language);
            
            for (const variation of variations) {
                try {
                    response = await fetch(`http://localhost:3003/api/word-difficulty?word=${encodeURIComponent(variation)}&language=${encodeURIComponent(language)}`);
                    result = await response.json();
                    
                    if (result.data && result.data.source === 'google_books') {
                        console.log('Found data for spelling variation:', variation);
                        return { ...result.data, correctedFrom: word, correctedTo: variation };
                    }
                } catch (error) {
                    continue;
                }
            }
        }
        
        if (result.error) {
            throw new Error(result.error);
        }
        
        console.log('Word difficulty from server:', result.data);
        return result.data;
    } catch (error) {
        console.log('Server failed, using length fallback for', word);
        return { ...getLengthBasedDifficulty(word), source: 'length_fallback' };
    }
};

// Helper function to generate spelling variations
const getSpellingVariations = (word, language) => {
    const variations = [];
    
    // Language-specific spelling corrections
    const spellingRules = {
        japanese: {
            'わ': 'は', // wa vs ha
            'を': 'お', // wo vs o  
            'じ': 'ぢ', // ji vs di
            'ず': 'づ', // zu vs du
        },
        english: {
            'ie': 'ei', // receive vs recieve
            'ei': 'ie', // believe vs beleive
            'ph': 'f',  // phone vs fone
            'ck': 'k',  // back vs bak
        },
        spanish: {
            'll': 'y',  // llamar vs yamar
            'ñ': 'n',   // año vs ano
            'rr': 'r',  // perro vs pero
        },
        french: {
            'é': 'e',   // café vs cafe
            'è': 'e',   // père vs pere
            'ç': 'c',   // français vs francais
        },
        german: {
            'ß': 'ss',  // groß vs gross
            'ä': 'ae', // Mädchen vs Maedchen
            'ö': 'oe', // schön vs schoen
            'ü': 'ue', // über vs ueber
        },
      
    };
    
    const rules = spellingRules[language];
    if (!rules) return variations;
    
    // Try swapping common mistaken characters/patterns
    for (const [wrong, correct] of Object.entries(rules)) {
        if (word.includes(wrong)) {
            variations.push(word.replace(wrong, correct));
        }
        if (word.includes(correct)) {
            variations.push(word.replace(correct, wrong));
        }
    }
    
    // Only fix obvious triple+ letter mistakes (not legitimate double letters)
    const obviousTypos = {
        // Triple letters (obvious mistakes)
        'aaa': 'aa', 'bbb': 'bb', 'ccc': 'cc', 'ddd': 'dd', 'eee': 'ee',
        'fff': 'ff', 'ggg': 'gg', 'hhh': 'hh', 'iii': 'ii', 'jjj': 'jj',
        'kkk': 'kk', 'lll': 'll', 'mmm': 'mm', 'nnn': 'nn', 'ooo': 'oo',
        'ppp': 'pp', 'qqq': 'qq', 'rrr': 'rr', 'sss': 'ss', 'ttt': 'tt',
        'uuu': 'uu', 'vvv': 'vv', 'www': 'ww', 'xxx': 'xx', 'yyy': 'yy', 'zzz': 'zz'
    };
    
    for (const [triple, double] of Object.entries(obviousTypos)) {
        if (word.includes(triple)) {
            variations.push(word.replace(triple, double));
        }
    }
    
    return variations;
};