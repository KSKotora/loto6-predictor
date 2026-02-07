/**
 * 番号ボール表示コンポーネント
 */
export default function NumberBall({ number, isBonus = false, size = 'md', delay = 0 }) {
    const sizeClasses = {
        sm: 'w-10 h-10 text-sm',
        md: 'w-12 h-12 text-lg',
        lg: 'w-14 h-14 text-xl',
    };

    return (
        <div
            className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center font-bold
        ${isBonus
                    ? 'bg-gradient-to-br from-red-400 to-red-600 text-white'
                    : 'bg-gradient-to-br from-amber-300 to-amber-500 text-slate-800'
                }
        shadow-lg transition-transform hover:scale-110
      `}
            style={{
                animation: `bounce-in 0.5s ease-out ${delay}s both`,
                boxShadow: isBonus
                    ? '0 4px 15px rgba(239, 68, 68, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
                    : '0 4px 15px rgba(251, 191, 36, 0.4), inset 0 2px 4px rgba(255, 255, 255, 0.3)'
            }}
        >
            {number}
        </div>
    );
}
