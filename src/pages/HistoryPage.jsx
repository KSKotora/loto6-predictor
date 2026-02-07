import { History, Trash2, AlertCircle } from 'lucide-react';
import NumberBall from '../components/NumberBall';

/**
 * マイ履歴ページ
 */
export default function HistoryPage({ history, onRemove, onClear }) {
    if (history.length === 0) {
        return (
            <div className="glass-card p-8 text-center">
                <AlertCircle className="mx-auto mb-4 text-slate-500" size={48} />
                <h3 className="text-lg font-medium text-slate-300 mb-2">履歴がありません</h3>
                <p className="text-sm text-slate-500">
                    「予想生成」タブで番号を生成し、
                    <br />「保存」ボタンで履歴に追加できます。
                </p>
            </div>
        );
    }

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('ja-JP', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="space-y-4">
            {/* ヘッダー */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <History className="text-indigo-400" size={20} />
                    <h2 className="text-lg font-bold">マイ履歴</h2>
                    <span className="text-sm text-slate-500">({history.length}件)</span>
                </div>
                {history.length > 0 && (
                    <button
                        onClick={onClear}
                        className="text-sm text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                        <Trash2 size={14} />
                        全削除
                    </button>
                )}
            </div>

            {/* 履歴リスト */}
            <div className="space-y-3">
                {history.map((entry) => (
                    <div
                        key={entry.id}
                        className="glass-card p-4"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm text-slate-400">
                                {formatDate(entry.date)}
                            </span>
                            <button
                                onClick={() => onRemove(entry.id)}
                                className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                            {entry.numbers.map((num, index) => (
                                <NumberBall key={index} number={num} size="sm" />
                            ))}
                        </div>
                        <div className="text-center mt-2">
                            <span className="text-xs text-slate-500">
                                合計: {entry.numbers.reduce((a, b) => a + b, 0)}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* 使い方ヒント */}
            <div className="text-center text-xs text-slate-500 pt-4">
                ※ 履歴はブラウザに保存されます（最大50件）
            </div>
        </div>
    );
}
