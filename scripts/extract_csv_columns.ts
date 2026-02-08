
import * as fs from 'fs';
import * as path from 'path';

const INPUT_PATH = '/Users/yuyu24/2ndBrain/Ehime Base app/元データ/コンテンツ一覧.csv';
const OUTPUT_PATH = '/Users/yuyu24/2ndBrain/Ehime Base app/元データ/processed_content_list.csv';

function parseCsvLine(line: string): string[] {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i++;
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

function processCsv() {
    try {
        const fileContent = fs.readFileSync(INPUT_PATH, 'utf-8');
        const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');

        if (lines.length === 0) {
            console.error('File is empty');
            return;
        }

        const headers = parseCsvLine(lines[0]);
        // Expecting ID, コンテンツ名, YOUTUBE_URL, コース...
        // Indices: 1, 2, 3

        const outputLines: string[] = [];
        // Add Header
        outputLines.push('コンテンツ名,YOUTUBE_URL,コース');

        for (let i = 1; i < lines.length; i++) {
            const columns = parseCsvLine(lines[i]);
            if (columns.length < 4) continue; // Skip malformed lines

            const contentName = columns[1] || '';
            const youtubeUrl = columns[2] || '';
            const course = columns[3] || '';

            // Escape if necessary for output
            const escape = (s: string) => {
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            };

            outputLines.push(`${escape(contentName)},${escape(youtubeUrl)},${escape(course)}`);
        }

        fs.writeFileSync(OUTPUT_PATH, outputLines.join('\n'));
        console.log(`Successfully processed ${lines.length} lines.`);
        console.log(`Output saved to: ${OUTPUT_PATH}`);

    } catch (error) {
        console.error('Error processing CSV:', error);
    }
}

processCsv();
