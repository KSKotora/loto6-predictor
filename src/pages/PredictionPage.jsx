import { useState } from 'react';
import { Sparkles, RefreshCw, Save, Info } from 'lucide-react';
import LatestResult from '../components/LatestResult';
import SlotAnimation from '../components/SlotAnimation';
import { generatePrediction, validateSum } from '../utils/analyzer';

/**
 * 予想生成ページ
 */
export default function PredictionPage({ data, onSavePrediction }) {
    const [prediction, setPrediction] = useState([]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [showResult, setShowResult] = useState(false);
    const [sumInfo, setSumInfo] = useState(null);

    const handleGenerate = () => {
        if (data.length === 0) return;

        setIsSpinning(true);
        setShowResult(false);

        // 予想を生成
        const newPrediction = generatePrediction(data);
        setPrediction(newPrediction);

        const validation = validateSum(newPrediction);
        setSumInfo(validation);
    };

    const handleAnimationComplete = () => {
        setIsSpinning(false);
        setShowResult(true);
    };

    const handleSave = () => {
        if (prediction.length === 6) {
            onSavePrediction(prediction);
        }
    };

    return (
        <div className="space-y-6">
            {/* 最新当選番号 */}
            <LatestResult data={data} />

            {/* 予想生成エリア */}
            <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-indigo-400" size={20} />
                    <h2 className="text-lg font-bold">AI予想生成</h2>
                </div>

                {/* 使い方ガイド */}
                <div className="bg-slate-800/50 rounded-lg p-4 mb-4">
                    <div className="flex items-start gap-2">
                        <Info size={16} className="text-slate-400 mt-0.5" />
                        <div className="text-sm text-slate-400">
                            <p>過去のデータを分析し、出現傾向・トレンド・偏り補正を</p>
                            <p>組み合わせた独自アルゴリズムで予想します。</p>
                        </div>
                    </div>
                </div>

                {/* スロットアニメーション */}
                <SlotAnimation
                    numbers={prediction}
                    isSpinning={isSpinning}
                    onComplete={handleAnimationComplete}
                />

                {/* 合計値情報 */}
                {showResult && sumInfo && (
                    <div className="text-center mb-4">
                        <span className={`text-sm px-3 py-1 rounded-full ${sumInfo.isValid
                                ? 'bg-green-500/20 text-green-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            合計: {sumInfo.sum}
                            {sumInfo.isValid ? ' ✓ 最適範囲' : sumInfo.range === 'low' ? ' (低め)' : ' (高め)'}
                        </span>
                    </div>
                )}

                {/* ボタン */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={handleGenerate}
                        disabled={isSpinning || data.length === 0}
                        className="btn-primary flex items-center gap-2"
                    >
                        <RefreshCw size={18} className={isSpinning ? 'animate-spin' : ''} />
                        {isSpinning ? '生成中...' : '予想を生成'}
                    </button>

                    {showResult && prediction.length === 6 && (
                        <button
                            onClick={handleSave}
                            className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 
                       text-white font-medium flex items-center gap-2 transition-colors"
                        >
                            <Save size={18} />
                            保存
                        </button>
                    )}
                </div>
            </div>

            {/* 分析対象データ数 */}
            <div className="text-center text-sm text-slate-500">
                分析対象: 過去{data.length}回のデータ
            </div>
        </div>
    );
}
