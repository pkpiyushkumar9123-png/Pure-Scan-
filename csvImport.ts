import { ScanResult, Ingredient } from '../components/ScanHistoryView';

/**
 * Robust RFC 4180 compliant CSV line/field parser handling quotes and commas
 */
export function parseCSVToRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentField.trim());
      currentField = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++;
      }
      currentRow.push(currentField.trim());
      if (currentRow.some(col => col.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField.length > 0 || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some(col => col.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

/**
 * Normalizes header string to match standard fields
 */
function normalizeHeader(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Parses raw CSV string into validated ScanResult items
 */
export function parseScanResultsFromCSV(csvText: string): { results: ScanResult[]; errors: string[] } {
  const rows = parseCSVToRows(csvText);
  if (rows.length < 2) {
    return {
      results: [],
      errors: ['The CSV file is empty or does not contain a header and data rows.']
    };
  }

  const rawHeaders = rows[0];
  const headers = rawHeaders.map(normalizeHeader);

  // Identify column indices
  let colProduct = -1;
  let colGrade = -1;
  let colScore = -1;
  let colDate = -1;
  let colTime = -1;
  let colTimestamp = -1;
  let colRisks = -1;
  let colAlt = -1;

  headers.forEach((h, idx) => {
    if (colProduct === -1 && (h.includes('product') || h.includes('item') || h.includes('name') || h === 'food' || h === 'title')) {
      colProduct = idx;
    } else if (colGrade === -1 && (h.includes('grade') || h === 'rating' || h === 'tier')) {
      colGrade = idx;
    } else if (colScore === -1 && (h.includes('score') || h.includes('points') || h === 'healthscore')) {
      colScore = idx;
    } else if (colTimestamp === -1 && (h.includes('timestamp') || h === 'datetime' || h === 'scannedat')) {
      colTimestamp = idx;
    } else if (colDate === -1 && h.includes('date')) {
      colDate = idx;
    } else if (colTime === -1 && h.includes('time')) {
      colTime = idx;
    } else if (colRisks === -1 && (h.includes('additive') || h.includes('risk') || h.includes('ingredient') || h.includes('chemical') || h.includes('concern'))) {
      colRisks = idx;
    } else if (colAlt === -1 && (h.includes('alternative') || h.includes('swap') || h.includes('recommendation'))) {
      colAlt = idx;
    }
  });

  // Fallback defaults for column order if header was generic: Date, Time, Product, Grade, Score, Risk Count, Flagged Additives, Healthier Alternative
  if (colProduct === -1 && rows[0].length >= 3) {
    colProduct = 2;
  }
  if (colGrade === -1 && rows[0].length >= 4) {
    colGrade = 3;
  }
  if (colScore === -1 && rows[0].length >= 5) {
    colScore = 4;
  }

  const results: ScanResult[] = [];
  const errors: string[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (row.length === 0 || row.every(cell => !cell)) continue;

    const rawProductName = colProduct !== -1 && row[colProduct] ? row[colProduct].trim() : `Imported Scan #${r}`;
    if (!rawProductName) continue;

    // Parse Grade
    let rawGrade = colGrade !== -1 && row[colGrade] ? row[colGrade].trim().toUpperCase() : '';
    let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'C';
    if (['A', 'B', 'C', 'D', 'F'].includes(rawGrade)) {
      grade = rawGrade as any;
    }

    // Parse Score
    let score = 50;
    if (colScore !== -1 && row[colScore]) {
      const parsedScore = parseInt(row[colScore].replace(/[^0-9]/g, ''), 10);
      if (!isNaN(parsedScore)) {
        score = Math.max(0, Math.min(100, parsedScore));
      }
    } else {
      // Derive score from grade if missing
      score = grade === 'A' ? 88 : grade === 'B' ? 72 : grade === 'C' ? 52 : grade === 'D' ? 34 : 18;
    }

    // If grade was missing, derive from score
    if (!rawGrade) {
      grade = score >= 80 ? 'A' : score >= 65 ? 'B' : score >= 50 ? 'C' : score >= 35 ? 'D' : 'F';
    }

    // Parse Timestamp
    let timestamp = Date.now() - (rows.length - r) * 60000;
    if (colTimestamp !== -1 && row[colTimestamp]) {
      const parsedTs = parseInt(row[colTimestamp], 10);
      if (!isNaN(parsedTs) && parsedTs > 1000000000) {
        timestamp = parsedTs;
      } else {
        const d = new Date(row[colTimestamp]);
        if (!isNaN(d.getTime())) timestamp = d.getTime();
      }
    } else if (colDate !== -1 && row[colDate]) {
      const dateStr = row[colDate];
      const timeStr = colTime !== -1 && row[colTime] ? ` ${row[colTime]}` : '';
      const combined = new Date(`${dateStr}${timeStr}`);
      if (!isNaN(combined.getTime())) {
        timestamp = combined.getTime();
      }
    }

    // Parse Risky Additives
    const riskyIngredients: Ingredient[] = [];
    if (colRisks !== -1 && row[colRisks]) {
      const riskStr = row[colRisks].trim();
      if (riskStr && riskStr.toLowerCase() !== 'none' && riskStr.toLowerCase() !== '0') {
        const items = riskStr.split(/;|\|/).map(s => s.trim()).filter(Boolean);
        items.forEach(item => {
          // Check for pattern like "Red 40 (high)" or "High Fructose Corn Syrup (medium)"
          const match = item.match(/^(.*?)(?:\s*\((high|medium|low)\))?$/i);
          const name = match ? match[1].trim() : item;
          const riskLevel = match && match[2] ? (match[2].toLowerCase() as 'low' | 'medium' | 'high') : 'medium';
          
          if (name) {
            riskyIngredients.push({
              name,
              risk: riskLevel,
              description: `Identified during nutritional audit in imported CSV record.`,
              implications: `Potential health concern associated with ${name.toLowerCase()}.`
            });
          }
        });
      }
    }

    // Parse Alternative
    let alternative = {
      name: 'Whole Food Alternative',
      reason: 'Contains clean, organic ingredients with fewer processed additives.'
    };
    if (colAlt !== -1 && row[colAlt]) {
      const altStr = row[colAlt].trim();
      if (altStr && altStr.toLowerCase() !== 'none') {
        const splitIdx = altStr.indexOf(':');
        if (splitIdx > 0) {
          alternative = {
            name: altStr.slice(0, splitIdx).trim(),
            reason: altStr.slice(splitIdx + 1).trim() || 'Contains fewer processed additives.'
          };
        } else {
          alternative = {
            name: altStr,
            reason: 'Healthier alternative identified from imported records.'
          };
        }
      }
    }

    results.push({
      id: `csv-${Date.now()}-${r}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp,
      productName: rawProductName,
      grade,
      score,
      riskyIngredients,
      alternative
    });
  }

  return { results, errors };
}
