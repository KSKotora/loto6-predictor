/**
 * ロト6 分析・予想エンジン
 * 過去データから統計情報を計算し、予想番号を生成する
 */

// ロト6の数字範囲
const MIN_NUMBER = 1;
const MAX_NUMBER = 43;
const PICK_COUNT = 6;

/**
 * 各数字の出現回数を計算
 * @param {Array} data - 過去の当選データ
 * @returns {Object} 数字ごとの出現回数と確率
 */
export function calculateFrequency(data) {
    const frequency = {};

    // 初期化
    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
        frequency[i] = { count: 0, probability: 0 };
    }

    // 出現回数をカウント
    data.forEach(draw => {
        draw.numbers.forEach(num => {
            frequency[num].count++;
        });
    });

    // 確率を計算
    const totalDraws = data.length;
    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
        frequency[i].probability = totalDraws > 0
            ? (frequency[i].count / totalDraws) * 100
            : 0;
    }

    return frequency;
}

/**
 * 直近N回のトレンドを分析（重み付け）
 * 新しいデータほど高い重みを持つ
 * @param {Array} data - 過去の当選データ（新しい順）
 * @param {number} count - 分析対象の回数
 * @returns {Object} 数字ごとのトレンドスコア
 */
export function getRecentTrend(data, count = 10) {
    const trend = {};

    // 初期化
    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
        trend[i] = 0;
    }

    // 直近N回のデータを取得
    const recentData = data.slice(0, count);

    // 重み付けスコアを計算（新しいほど高い）
    recentData.forEach((draw, index) => {
        const weight = count - index; // 最新が最高スコア
        draw.numbers.forEach(num => {
            trend[num] += weight;
        });
    });

    // 正規化（0-100のスコアに）
    const maxScore = (count * (count + 1)) / 2; // 最大可能スコア
    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
        trend[i] = (trend[i] / maxScore) * 100;
    }

    return trend;
}

/**
 * 長期的な偏りを分析
 * 全履歴と理論上の出現確率との差を計算
 * @param {Array} data - 過去の当選データ
 * @returns {Object} 数字ごとの偏りスコア
 */
export function getLongTermBias(data) {
    const frequency = calculateFrequency(data);
    const bias = {};

    // 理論上の出現確率 (6/43 ≈ 13.95%)
    const theoreticalProbability = (PICK_COUNT / MAX_NUMBER) * 100;

    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
        // 理論値との差を計算（正なら「出過ぎ」、負なら「出不足」）
        bias[i] = frequency[i].probability - theoreticalProbability;
    }

    return bias;
}

/**
 * 合計値が適正範囲内かチェック
 * ロト6の合計値は100-150に収まりやすい
 * @param {Array} numbers - 6つの数字
 * @returns {Object} 合計値と判定結果
 */
export function validateSum(numbers) {
    const sum = numbers.reduce((acc, num) => acc + num, 0);
    const isValid = sum >= 100 && sum <= 150;

    return {
        sum,
        isValid,
        range: sum < 100 ? 'low' : sum > 150 ? 'high' : 'optimal'
    };
}

/**
 * 予想番号を生成
 * 確率 + トレンド + 偏りを組み合わせた独自アルゴリズム
 * @param {Array} data - 過去の当選データ
 * @param {Object} options - オプション設定
 * @returns {Array} 予想された6つの番号
 */
export function generatePrediction(data, options = {}) {
    const {
        trendWeight = 0.4,      // トレンドの重み
        frequencyWeight = 0.3,  // 出現頻度の重み
        biasWeight = 0.2,       // 偏り補正の重み
        randomWeight = 0.1,     // ランダム要素の重み
        filterSum = true        // 合計値フィルターを適用
    } = options;

    const frequency = calculateFrequency(data);
    const trend = getRecentTrend(data);
    const bias = getLongTermBias(data);

    // 各数字のスコアを計算
    const scores = [];
    for (let i = MIN_NUMBER; i <= MAX_NUMBER; i++) {
        // 偏り補正: 出不足の数字を優遇
        const biasScore = Math.max(0, -bias[i]) * 5;

        const score =
            (frequency[i].probability * frequencyWeight) +
            (trend[i] * trendWeight) +
            (biasScore * biasWeight) +
            (Math.random() * 100 * randomWeight);

        scores.push({ number: i, score });
    }

    // スコア順にソート
    scores.sort((a, b) => b.score - a.score);

    // 上位から6つを選択（合計値フィルター適用時）
    let attempts = 0;
    const maxAttempts = 100;

    while (attempts < maxAttempts) {
        let candidates;

        if (attempts === 0) {
            // 最初はスコア上位から選択
            candidates = scores.slice(0, PICK_COUNT).map(s => s.number);
        } else {
            // 再試行時はスコア上位からランダムに選択
            const pool = scores.slice(0, 15);
            candidates = [];
            const poolCopy = [...pool];

            for (let i = 0; i < PICK_COUNT; i++) {
                const idx = Math.floor(Math.random() * poolCopy.length);
                candidates.push(poolCopy[idx].number);
                poolCopy.splice(idx, 1);
            }
        }

        candidates.sort((a, b) => a - b);

        if (!filterSum) {
            return candidates;
        }

        const validation = validateSum(candidates);
        if (validation.isValid) {
            return candidates;
        }

        attempts++;
    }

    // 最大試行回数を超えた場合はスコア上位を返す
    return scores.slice(0, PICK_COUNT).map(s => s.number).sort((a, b) => a - b);
}

/**
 * 統計情報のサマリーを取得
 * @param {Array} data - 過去の当選データ
 * @returns {Object} 統計サマリー
 */
export function getStatsSummary(data) {
    const frequency = calculateFrequency(data);
    const trend = getRecentTrend(data);

    // 出現頻度でソート
    const sortedByFrequency = Object.entries(frequency)
        .map(([num, data]) => ({ number: parseInt(num), ...data }))
        .sort((a, b) => b.count - a.count);

    // トレンドでソート
    const sortedByTrend = Object.entries(trend)
        .map(([num, score]) => ({ number: parseInt(num), score }))
        .sort((a, b) => b.score - a.score);

    return {
        totalDraws: data.length,
        hotNumbers: sortedByFrequency.slice(0, 6),
        coldNumbers: sortedByFrequency.slice(-6).reverse(),
        trendingNumbers: sortedByTrend.slice(0, 6),
        frequency,
        trend
    };
}
