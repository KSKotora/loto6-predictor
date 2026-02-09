/**
 * ロト6当選番号データ取得スクリプト (Puppeteer版)
 * みずほ銀行公式サイトからデータを取得 (テキスト解析アプローチ)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// データ保存先
const DATA_FILE = path.join(__dirname, '../public/data/loto6_history.json');

// みずほ銀行 ロト6 最新当選番号案内ページ
const LOTO6_URL = 'https://www.mizuhobank.co.jp/retail/takarakuji/loto/loto6/index.html';

/**
 * Puppeteerを使って最新〜過去数回分の当選番号を取得
 */
async function fetchRecentFromMizuho() {
    console.log('🎰 みずほ銀行公式サイトからデータを取得中...');
    let browser = null;

    try {
        browser = await puppeteer.launch({
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

        // ページにアクセス
        await page.goto(LOTO6_URL, { waitUntil: 'networkidle0', timeout: 60000 });

        // テキストデータを取得
        const bodyText = await page.evaluate(() => document.body.innerText);

        // 解析ロジック
        // テキストパターン:
        // 回別    第XXXX回
        // 抽せん日
        // YYYY年MM月DD日
        // 本数字
        // 01
        // 02 ...
        // ボーナス数字
        // (11)

        const results = [];
        const lines = bodyText.split('\n').map(l => l.trim()).filter(l => l);

        let currentRound = null;
        let currentDate = null;
        let currentNumbers = [];
        let currentBonus = null;
        let captureMode = null; // 'numbers' or 'bonus'

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 回別
            const roundMatch = line.match(/回別\s*第(\d+)回/);
            if (roundMatch) {
                // 前のデータがあれば保存
                if (currentRound && currentNumbers.length === 6 && currentBonus !== null) {
                    results.push({
                        round: currentRound,
                        date: currentDate,
                        numbers: [...currentNumbers].sort((a, b) => a - b),
                        bonus: currentBonus
                    });
                }

                // リセット
                currentRound = parseInt(roundMatch[1], 10);
                currentDate = null;
                currentNumbers = [];
                currentBonus = null;
                captureMode = null;
                continue;
            }

            if (!currentRound) continue;

            // 抽せん日
            // 日付形式: 2026年2月9日
            if (!currentDate) {
                const dateMatch = line.match(/(\d+)年(\d+)月(\d+)日/);
                if (dateMatch) {
                    currentDate = `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`;
                    continue;
                }
            }

            // 本数字
            if (line === '本数字') {
                captureMode = 'numbers';
                continue;
            }

            // ボーナス数字
            if (line === 'ボーナス数字') {
                captureMode = 'bonus';
                continue;
            }

            // 数字の取得
            if (captureMode === 'numbers') {
                // 数字のみの行か確認
                if (/^\d+$/.test(line)) {
                    const num = parseInt(line, 10);
                    if (num >= 1 && num <= 43) {
                        currentNumbers.push(num);
                    }
                } else if (currentNumbers.length >= 6) {
                    // 6個集まったらモード終了（安全策）
                    // captureMode = null; 
                }
            } else if (captureMode === 'bonus') {
                // (11) または 11
                const bonusMatch = line.match(/\(?(\d+)\)?/);
                if (bonusMatch) {
                    const num = parseInt(bonusMatch[1], 10);
                    if (num >= 1 && num <= 43) {
                        currentBonus = num;
                        captureMode = null; // ボーナス取ったら終了
                    }
                }
            }
        }

        // 最後のデータを保存
        if (currentRound && currentNumbers.length === 6 && currentBonus !== null) {
            results.push({
                round: currentRound,
                date: currentDate,
                numbers: [...currentNumbers].sort((a, b) => a - b),
                bonus: currentBonus
            });
        }

        if (results.length > 0) {
            console.log(`✅ ${results.length}件のデータを取得しました: 第${results[results.length - 1].round}回 〜 第${results[0].round}回`);
            return results;
        } else {
            console.error('❌ データ解析エラー: 有効な形式のデータが見つかりませんでした');
            // デバッグ用: 解析できなかったテキストの一部を表示
            console.log('--- DEBUG: Text Sample ---');
            console.log(lines.slice(0, 50).join('\n'));
            return null;
        }

    } catch (error) {
        console.error('❌ Puppeteerエラー:', error.message);
        return null;
    } finally {
        if (browser) await browser.close();
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
    console.log('  ロト6 データ更新スクリプト (Puppeteer)');
    console.log('========================================\n');

    // 既存データを読み込み
    let existingData = loadExistingData();
    console.log(`📁 既存データ: ${existingData.length}件\n`);

    // 最新データの取得を試みる
    const newItems = await fetchRecentFromMizuho();

    if (newItems && newItems.length > 0) {
        let updated = false;

        // 取得したデータを新しい順（回号が大きい順）に処理
        // 配列は通常、ページの上から順（新しい順）に入っているはずだが、念のためソート
        newItems.sort((a, b) => b.round - a.round);

        for (const item of newItems) {
            // 既存データに存在するか確認
            const exists = existingData.some(d => d.round === item.round);

            if (!exists) {
                console.log(`🎯 新しい当選番号を追加: 第${item.round}回 (${item.date})`);
                console.log(`   本数字: ${item.numbers.join(', ')}`);
                console.log(`   ボーナス: ${item.bonus}`);

                existingData.unshift(item);
                updated = true;
            } else {
                // 既存データがある場合、内容が違うなら更新する（オプション）
                // 今回は既存データの信憑性が低いので、最新取得データで上書きするのもありだが
                // 安全のため、未登録の回号のみ追加とする。
                // ただし、第2073回のように日付やデータが間違っている可能性がある場合は？
                // ユーザーは「新しい情報の取得」を求めているので、新しい回号があればOK。

                // 既存データの2073回が間違っている可能性が高いので、2073回も上書きすべきかもしれない
                // ここでは「回号が一致するデータがあれば、取得データで上書きする」ロジックに変更

                const index = existingData.findIndex(d => d.round === item.round);
                if (index !== -1) {
                    const oldItem = existingData[index];
                    // 数字が違う場合のみ更新通知
                    if (JSON.stringify(oldItem.numbers) !== JSON.stringify(item.numbers) || oldItem.date !== item.date) {
                        console.log(`🔄 既存データを更新: 第${item.round}回`);
                        existingData[index] = item;
                        updated = true;
                    }
                }
            }
        }

        if (updated) {
            // 回号順にソート（降順）
            existingData.sort((a, b) => b.round - a.round);

            // 最大100件に制限
            const trimmedData = existingData.slice(0, 100);

            saveData(trimmedData);
            console.log('\n✨ 更新完了!');
        } else {
            console.log('\nℹ️ 新しいデータはありませんでした');
        }

    } else {
        console.log('\n⚠️ データを取得できませんでした');
        console.log('   既存データはそのまま維持されます');
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
