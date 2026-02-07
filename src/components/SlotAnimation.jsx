import { useState, useEffect } from 'react';

/**
 * スロットマシン風アニメーションコンポーネント
 */
export default function SlotAnimation({ numbers, isSpinning, onComplete }) {
    const [displayNumbers, setDisplayNumbers] = useState([0, 0, 0, 0, 0, 0]);
    const [stoppedCount, setStoppedCount] = useState(0);

    useEffect(() => {
        if (!isSpinning) {
            setDisplayNumbers(numbers.length === 6 ? numbers : [0, 0, 0, 0, 0, 0]);
            setStoppedCount(0);
            return;
        }

        // スピン中はランダム数字を表示
        const spinInterval = setInterval(() => {
            setDisplayNumbers(prev =>
                prev.map((_, idx) =>
                    idx < stoppedCount ? numbers[idx] : Math.floor(Math.random() * 43) + 1
                )
            );
        }, 50);

        // 順番に停止
        const stopTimers = numbers.map((_, idx) =>
            setTimeout(() => {
                setStoppedCount(prev => prev + 1);
                setDisplayNumbers(prev => {
                    const newNumbers = [...prev];
                    newNumbers[idx] = numbers[idx];
                    return newNumbers;
                });

                if (idx === numbers.length - 1) {
                    setTimeout(() => {
                        onComplete?.();
                    }, 300);
                }
            }, 500 + idx * 400)
        );

        return () => {
            clearInterval(spinInterval);
            stopTimers.forEach(timer => clearTimeout(timer));
        };
    }, [isSpinning, numbers, onComplete]);

    return (
        <div className="flex justify-center gap-2 py-4">
            {displayNumbers.map((num, index) => {
                const isStopped = !isSpinning || index < stoppedCount;

                return (
                    <div
                        key={index}
                        className={`
              w-12 h-16 rounded-xl flex items-center justify-center
              font-bold text-xl
              ${isStopped
                                ? 'bg-gradient-to-br from-amber-300 to-amber-500 text-slate-800'
                                : 'bg-gradient-to-br from-slate-600 to-slate-700 text-slate-300'
                            }
              shadow-lg transition-all duration-300
              ${!isStopped ? 'animate-pulse' : ''}
            `}
                        style={{
                            boxShadow: isStopped
                                ? '0 4px 15px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                                : '0 4px 15px rgba(0, 0, 0, 0.3)',
                            transform: isStopped ? 'scale(1)' : 'scale(0.95)'
                        }}
                    >
                        {num || '?'}
                    </div>
                );
            })}
        </div>
    );
}
