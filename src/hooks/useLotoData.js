import { useState, useEffect } from 'react';

/**
 * ロト6データを取得・管理するカスタムフック
 */
export function useLotoData() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        setError(null);

        try {
            // デモデータを取得
            const response = await fetch('/data/loto6_history.json');

            if (!response.ok) {
                throw new Error('データの取得に失敗しました');
            }

            const jsonData = await response.json();
            setData(jsonData);
        } catch (err) {
            console.error('データ取得エラー:', err);
            setError(err.message);

            // フォールバック: ハードコードされたデモデータ
            setData([
                { round: 2073, date: "2026-02-03", numbers: [2, 8, 15, 23, 31, 40], bonus: 12 },
                { round: 2072, date: "2026-01-30", numbers: [5, 11, 19, 27, 35, 42], bonus: 7 },
                { round: 2071, date: "2026-01-27", numbers: [3, 14, 22, 28, 36, 43], bonus: 18 },
            ]);
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, refetch: fetchData };
}

/**
 * マイ履歴（予想履歴）を管理するカスタムフック
 */
export function useMyHistory() {
    const STORAGE_KEY = 'loto6_my_history';

    const [history, setHistory] = useState(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    }, [history]);

    const addPrediction = (numbers) => {
        const newEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            numbers: [...numbers].sort((a, b) => a - b)
        };

        setHistory(prev => [newEntry, ...prev].slice(0, 50)); // 最大50件保持
    };

    const removePrediction = (id) => {
        setHistory(prev => prev.filter(entry => entry.id !== id));
    };

    const clearHistory = () => {
        setHistory([]);
    };

    return { history, addPrediction, removePrediction, clearHistory };
}
