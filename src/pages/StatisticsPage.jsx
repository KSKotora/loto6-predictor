import { useMemo } from 'react';
import { BarChart3, TrendingUp, ThermometerSun, Snowflake } from 'lucide-react';
import { getStatsSummary } from '../utils/analyzer';

/**
 * 統計分析ページ
 */
export default function StatisticsPage({ data }) {
    const stats = useMemo(() => {
        if (data.length === 0) return null;
        return getStatsSummary(data);
    }, [data]);

    if (!stats) {
        return (
            <div className="glass-card p-6 text-center">
                <p className="text-slate-400">データを読み込み中...</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ホット/コールド番号 */}
            <div className="grid grid-cols-2 gap-4">
                {/* ホット番号 */}
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <ThermometerSun className="text-orange-400" size={18} />
                        <h3 className="font-bold text-sm">ホット番号</h3>
                    </div>
                    <div className="space-y-2">
                        {stats.hotNumbers.slice(0, 5).map(({ number, count }) => (
                            <div key={number} className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 
                              flex items-center justify-center text-sm font-bold text-white">
                                    {number}
                                </span>
                                <div className="flex-1">
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-orange-400 to-red-500 rounded-full"
                                            style={{ width: `${(count / stats.totalDraws) * 100 * 5}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 w-8 text-right">{count}回</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* コールド番号 */}
                <div className="glass-card p-4">
                    <div className="flex items-center gap-2 mb-3">
                        <Snowflake className="text-blue-400" size={18} />
                        <h3 className="font-bold text-sm">コールド番号</h3>
                    </div>
                    <div className="space-y-2">
                        {stats.coldNumbers.slice(0, 5).map(({ number, count }) => (
                            <div key={number} className="flex items-center gap-2">
                                <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 
                              flex items-center justify-center text-sm font-bold text-white">
                                    {number}
                                </span>
                                <div className="flex-1">
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                                            style={{ width: `${(count / stats.totalDraws) * 100 * 5}%` }}
                                        />
                                    </div>
                                </div>
                                <span className="text-xs text-slate-400 w-8 text-right">{count}回</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* トレンド番号 */}
            <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-green-400" size={18} />
                    <h3 className="font-bold">直近のトレンド</h3>
                    <span className="text-xs text-slate-500">（直近10回）</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    {stats.trendingNumbers.map(({ number, score }, index) => (
                        <div
                            key={number}
                            className="flex items-center gap-1 px-3 py-2 rounded-lg"
                            style={{
                                background: `linear-gradient(135deg, 
                  rgba(34, 197, 94, ${0.3 - index * 0.04}) 0%, 
                  rgba(16, 185, 129, ${0.2 - index * 0.03}) 100%)`
                            }}
                        >
                            <span className="font-bold text-green-400">{number}</span>
                            <span className="text-xs text-slate-400">({score.toFixed(0)}pt)</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* 全体出現頻度 */}
            <div className="glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="text-indigo-400" size={18} />
                    <h3 className="font-bold">出現頻度ヒートマップ</h3>
                </div>
                <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 43 }, (_, i) => i + 1).map(num => {
                        const freq = stats.frequency[num];
                        const intensity = freq.probability / 20; // 0-1の範囲に正規化

                        return (
                            <div
                                key={num}
                                className="aspect-square rounded flex items-center justify-center text-xs font-medium"
                                style={{
                                    background: `rgba(99, 102, 241, ${Math.min(intensity, 1)})`,
                                    color: intensity > 0.5 ? 'white' : 'rgb(148, 163, 184)'
                                }}
                                title={`${num}: ${freq.count}回 (${freq.probability.toFixed(1)}%)`}
                            >
                                {num}
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-xs text-slate-500">
                    <span>← 低い</span>
                    <span>出現頻度</span>
                    <span>高い →</span>
                </div>
            </div>

            {/* 統計情報 */}
            <div className="text-center text-sm text-slate-500">
                分析対象: 過去{stats.totalDraws}回のデータ
            </div>
        </div>
    );
}
