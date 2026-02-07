import NumberBall from './NumberBall';
import { Calendar, Trophy } from 'lucide-react';

/**
 * 最新当選番号カード
 */
export default function LatestResult({ data }) {
    if (!data || data.length === 0) {
        return (
            <div className="glass-card p-6 text-center">
                <p className="text-slate-400">データを読み込み中...</p>
            </div>
        );
    }

    const latest = data[0];
    const formattedDate = new Date(latest.date).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <div className="glass-card p-6">
            {/* ヘッダー */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Trophy className="text-amber-400" size={20} />
                    <span className="text-lg font-bold text-white">最新当選番号</span>
                </div>
                <span className="text-sm font-semibold text-indigo-400">
                    第{latest.round}回
                </span>
            </div>

            {/* 日付 */}
            <div className="flex items-center gap-2 mb-4 text-slate-400 text-sm">
                <Calendar size={14} />
                <span>{formattedDate}</span>
            </div>

            {/* 当選番号 */}
            <div className="flex flex-wrap justify-center gap-3 mb-4">
                {latest.numbers.map((num, index) => (
                    <NumberBall key={num} number={num} delay={index * 0.1} />
                ))}
            </div>

            {/* ボーナス番号 */}
            <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-700/50">
                <span className="text-sm text-slate-400">ボーナス</span>
                <NumberBall number={latest.bonus} isBonus size="sm" />
            </div>

            {/* 合計値 */}
            <div className="mt-4 text-center">
                <span className="text-xs text-slate-500">
                    合計: {latest.numbers.reduce((a, b) => a + b, 0)}
                </span>
            </div>
        </div>
    );
}
