/**
 * ロト6当選番号データ取得スクリプト
 * 宝くじ公式サイトからHTMLをスクレイピングしてデータを取得
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// データ保存先
const DATA_FILE = path.join(__dirname, '../public/data/loto6_history.json');

// 宝くじ公式サイトのロト6ページ（最新結果）
const LOTO6_URL = 'https://www.takarakuji-official.jp/kuji/loto/loto6/past-winning.html';

/**
 * HTMLから最新の当選番号を抽出（シンプルなスクレイピング）
 */
async function fetchLatestFromOfficial() {
    try {
        console.log('🎰 宝くじ公式サイトからデータを取得中...');

        const response = await fetch(LOTO6_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const html = await response.text();

        // 正規表現でデータを抽出
        // パターン: 第XXXX回、本数字、ボーナス数字
        const roundMatch = html.match(/第(\d+)回/);
        const numberMatches = html.match(/<span class="num">(\d+)<\/span>/g);

        if (roundMatch && numberMatches && numberMatches.length >= 7) {
            const round = parseInt(roundMatch[1], 10);
            const numbers = numberMatches.slice(0, 6).map(m =>
                parseInt(m.match(/(\d+)/)[1], 10)
            ).sort((a, b) => a - b);
            const bonus = parseInt(numberMatches[6].match(/(\d+)/)[1], 10);

            console.log(`✅ 第${round}回のデータを取得しました`);
            return { round, numbers, bonus };
        }

        return null;
    } catch (error) {
        console.error('❌ 公式サイトからの取得エラー:', error.message);
        return null;
    }
}

/**
 * 既存データを読み込む
 */
function loadExistingData() {
    try {
        if (fs.existsSync(DATA_FILE)) {
            const content = fs.readFileSync(DATA_FILE, 'utf8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.log('⚠️ 既存データの読み込みに失敗:', error.message);
    }
    return [];
}

/**
 * データを保存
 */
function saveData(data) {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`💾 ${data.length}件のデータを保存しました`);
        return true;
    } catch (error) {
        console.error('❌ 保存エラー:', error.message);
        return false;
    }
}

/**
 * メイン処理
 */
async function main() {
    console.log('========================================');
    console.log('  ロト6 データ更新スクリプト');
    console.log('========================================\n');

    // 既存データを読み込み
    const existingData = loadExistingData();
    console.log(`📁 既存データ: ${existingData.length}件\n`);

    // 最新データの取得を試みる
    const latestData = await fetchLatestFromOfficial();

    if (latestData) {
        // 既存データに最新回が含まれているか確認
        const latestExisting = existingData.length > 0 ? existingData[0].round : 0;

        if (latestData.round > latestExisting) {
            // 新しいデータを先頭に追加
            const today = new Date().toISOString().split('T')[0];
            const newEntry = {
                round: latestData.round,
                date: today,
                numbers: latestData.numbers,
                bonus: latestData.bonus
            };

            existingData.unshift(newEntry);

            // 最大100件に制限
            const trimmedData = existingData.slice(0, 100);

            saveData(trimmedData);

            console.log(`\n🎯 新しい当選番号を追加しました (第${latestData.round}回):`);
            console.log(`   本数字: ${latestData.numbers.join(', ')}`);
            console.log(`   ボーナス: ${latestData.bonus}`);
            console.log('\n✨ 更新完了!');
        } else {
            console.log(`\nℹ️ データは最新です (第${latestExisting}回まで保持)`);
            console.log('✨ 更新の必要はありません');
        }
    } else {
        console.log('\n⚠️ 最新データを取得できませんでした');
        console.log('   既存データはそのまま維持されます');

        if (existingData.length === 0) {
            console.log('❌ データがありません');
            process.exit(1);
        }
    }

    // 最新の当選番号を表示
    if (existingData.length > 0) {
        const latest = existingData[0];
        console.log(`\n📊 現在の最新データ (第${latest.round}回 / ${latest.date}):`);
        console.log(`   本数字: ${latest.numbers.join(', ')}`);
        console.log(`   ボーナス: ${latest.bonus}`);
    }
}

main();
