import { useState } from 'react';
import { Loader2, Ticket } from 'lucide-react';
import TabNavigation from './components/TabNavigation';
import PredictionPage from './pages/PredictionPage';
import StatisticsPage from './pages/StatisticsPage';
import HistoryPage from './pages/HistoryPage';
import { useLotoData, useMyHistory } from './hooks/useLotoData';
import './index.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('prediction');
  const { data, loading, error } = useLotoData();
  const { history, addPrediction, removePrediction, clearHistory } = useMyHistory();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-indigo-500 mx-auto mb-4" />
          <p className="text-slate-400">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-20">
      {/* ヘッダー */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-lg border-b border-slate-700/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 
                          flex items-center justify-center shadow-lg">
              <Ticket className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 
                           bg-clip-text text-transparent">
                Loto6 Predictor
              </h1>
              <p className="text-xs text-slate-500">AI分析 × 統計予想</p>
            </div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-3 bg-amber-500/20 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-amber-400">
              ⚠️ {error}（デモデータを使用中）
            </p>
          </div>
        )}

        {activeTab === 'prediction' && (
          <PredictionPage data={data} onSavePrediction={addPrediction} />
        )}
        {activeTab === 'statistics' && (
          <StatisticsPage data={data} />
        )}
        {activeTab === 'history' && (
          <HistoryPage
            history={history}
            onRemove={removePrediction}
            onClear={clearHistory}
          />
        )}
      </main>

      {/* タブナビゲーション */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}
