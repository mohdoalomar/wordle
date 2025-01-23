import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, X } from 'lucide-react';
import { loadDictionary } from './LoadDictionary';

// Game constants
const WORD_LENGTH = 4;
const MAX_ATTEMPTS = 6;
const ANIMATION_DURATION = 500;
const NOTIFICATION_DURATION = 3000;

// Notification component
const Notification = ({ message, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(onClose, NOTIFICATION_DURATION);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-slideDown">
            <div className="bg-gray-800 text-white px-4 py-3 rounded-lg shadow-lg
                          flex items-center gap-2 min-w-[300px]">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
                <span className="flex-grow text-center">{message}</span>
                <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                    <X className="h-5 w-5" />
                </button>
            </div>
        </div>
    );
};

const ArabicWordle = () => {
    const [gameState, setGameState] = useState({
        currentGuess: '',
        guesses: [],
        targetWord: '',
        gameStatus: 'loading', // 'loading', 'playing', 'won', 'lost'
        message: '',
        shake: false
    });

    const [dictionary, setDictionary] = useState([]);

    useEffect(() => {
        const initGame = async () => {
            const words = await loadDictionary();
            const randomWord = words[Math.floor(Math.random() * words.length)];
            setDictionary(words);
            setGameState(prev => ({
                ...prev,
                targetWord: randomWord,
                gameStatus: 'playing'
            }));
        };

        initGame();
    }, []);

    const handleKeyPress = (key) => {
        if (gameState.gameStatus !== 'playing') return;

        if (key === 'Backspace') {
            setGameState(prev => ({
                ...prev,
                currentGuess: prev.currentGuess.slice(0, -1),
                message: ''
            }));
            return;
        }

        if (key === 'Enter') {
            handleSubmitGuess();
            return;
        }

        if (gameState.currentGuess.length < WORD_LENGTH && /^[\u0600-\u06FF]$/.test(key)) {
            setGameState(prev => ({
                ...prev,
                currentGuess: prev.currentGuess + key,
                message: ''
            }));
        }
    };

    const handleSubmitGuess = () => {
        const guess = gameState.currentGuess;

        if (guess.length !== WORD_LENGTH) {
            showMessage('الكلمة يجب أن تكون من 4 أحرف');
            shakeBoard();
            return;
        }

        if (!dictionary.includes(guess)) {
            showMessage('الكلمة غير موجودة في القاموس');
            shakeBoard();
            return;
        }

        const newGuesses = [...gameState.guesses, guess];
        let newStatus = gameState.gameStatus;

        if (guess === gameState.targetWord) {
            newStatus = 'won';
            showMessage('أحسنت! لقد فزت');
        } else if (newGuesses.length >= MAX_ATTEMPTS) {
            newStatus = 'lost';
            showMessage(`للأسف خسرت. الكلمة كانت: ${gameState.targetWord}`);
        }

        setGameState(prev => ({
            ...prev,
            currentGuess: '',
            guesses: newGuesses,
            gameStatus: newStatus
        }));
    };

    const showMessage = (message) => setGameState(prev => ({ ...prev, message }));
    const clearMessage = () => setGameState(prev => ({ ...prev, message: '' }));

    const shakeBoard = () => {
        setGameState(prev => ({ ...prev, shake: true }));
        setTimeout(() => {
            setGameState(prev => ({ ...prev, shake: false }));
        }, ANIMATION_DURATION);
    };

    const getLetterStatus = (letter, position, guess) => {
        if (gameState.targetWord[position] === letter) {
            return 'bg-green-500';
        }
        if (gameState.targetWord.includes(letter)) {
            return 'bg-yellow-500';
        }
        return 'bg-gray-500';
    };

    const keyboardLayout = [
        ['ض', 'ص', 'ث', 'ق', 'ف', 'غ', 'ع', 'ه', 'خ', 'ح', 'ج'].reverse(),
        ['ش', 'س', 'ي', 'ب', 'ل', 'ا', 'ت', 'ن', 'م', 'ك'].reverse(),
        ['ظ', 'ط', 'ذ', 'د', 'ز', 'ر', 'و', 'ة', 'ى'].reverse()
    ];
    

    if (gameState.gameStatus === 'loading') {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    return (
        <div dir="rtl" className="min-h-screen bg-gray-900 text-white p-4 flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 text-center">خمن الكلمة</h1>
            
            {gameState.message && (
                <Notification 
                    message={gameState.message} 
                    onClose={clearMessage}
                />
            )}

            {/* Game Grid */}
            <div 
                className={`grid gap-2 mb-8 transition-transform duration-100 ${
                    gameState.shake ? 'animate-shake' : ''
                }`}
            >
                {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => (
                    <div key={rowIndex} className="flex flex-row-reverse gap-2">
                        {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                            const guess = gameState.guesses[rowIndex];
                            const letter = guess ? guess[WORD_LENGTH - 1 - colIndex] : 
                                         (rowIndex === gameState.guesses.length ? 
                                          gameState.currentGuess[WORD_LENGTH - 1 - colIndex] : '');
                            const status = guess ? getLetterStatus(letter, WORD_LENGTH - 1 - colIndex, guess) : 'bg-gray-700';
                            
                            return (
                                <div
                                    key={colIndex}
                                    className={`w-14 h-14 flex items-center justify-center text-2xl font-bold rounded
                                        ${status} transition-all duration-300 transform
                                        ${letter ? 'scale-100' : 'scale-90'}`}
                                >
                                    {letter}
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            {/* Virtual Keyboard */}
            <div className="w-full max-w-3xl">
                {keyboardLayout.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1 mb-2">
                        {row.map((key) => {
                            const isUsed = gameState.guesses.some(guess => 
                                guess.includes(key)
                            );
                            const isCorrect = gameState.guesses.some(guess => 
                                guess.split('').some((letter, index) => 
                                    letter === key && gameState.targetWord[index] === key
                                )
                            );
                            const isPresent = gameState.guesses.some(guess => 
                                guess.includes(key) && gameState.targetWord.includes(key)
                            );
                            
                            let bgColor = 'bg-gray-700 hover:bg-gray-600';
                            if (isUsed) {
                                if (isCorrect) bgColor = 'bg-green-500 hover:bg-green-400';
                                else if (isPresent) bgColor = 'bg-yellow-500 hover:bg-yellow-400';
                                else bgColor = 'bg-gray-500 hover:bg-gray-400';
                            }

                            return (
                                <button
                                    key={key}
                                    onClick={() => handleKeyPress(key)}
                                    className={`w-8 h-10 rounded font-bold
                                             transition-colors duration-200
                                             active:scale-95 text-sm ${bgColor}`}
                                >
                                    {key}
                                </button>
                            );
                        })}
                    </div>
                ))}
                <div className="flex justify-center gap-2 mt-2">
                    <button
                        onClick={() => handleKeyPress('Enter')}
                        className="px-4 py-2 bg-green-600 rounded font-bold
                                 hover:bg-green-500 transition-colors duration-200"
                    >
                        إدخال
                    </button>
                    <button
                        onClick={() => handleKeyPress('Backspace')}
                        className="px-4 py-2 bg-red-600 rounded font-bold
                                 hover:bg-red-500 transition-colors duration-200"
                    >
                        مسح
                    </button>
                </div>
            </div>

            {/* Reset Game Button */}
            {gameState.gameStatus !== 'playing' && (
                <button
                    onClick={() => {
                        const randomWord = dictionary[Math.floor(Math.random() * dictionary.length)];
                        setGameState({
                            currentGuess: '',
                            guesses: [],
                            targetWord: randomWord,
                            gameStatus: 'playing',
                            message: '',
                            shake: false
                        });
                    }}
                    className="mt-6 px-4 py-2 bg-blue-600 rounded font-bold
                             hover:bg-blue-500 transition-colors duration-200
                             flex items-center gap-2"
                >
                    <RefreshCw className="h-4 w-4" />
                    لعبة جديدة
                </button>
            )}

            <style jsx global>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(5px); }
                    75% { transform: translateX(-5px); }
                }

                @keyframes slideDown {
                    from { transform: translate(-50%, -100%); opacity: 0; }
                    to { transform: translate(-50%, 0); opacity: 1; }
                }

                .animate-shake {
                    animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
                }

                .animate-slideDown {
                    animation: slideDown 0.3s ease-out forwards;
                }

                :root {
                    direction: rtl;
                }
            `}</style>
        </div>
    );
};
export default ArabicWordle;