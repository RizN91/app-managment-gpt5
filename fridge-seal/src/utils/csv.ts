export function toCsv<T extends object>(rows: T[]): string {
  if (!rows.length) return '';
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(',')];
  for (const row of rows) {
    lines.push(headers.map(h => JSON.stringify((row as any)[h] ?? '')).join(','));
  }
  return lines.join('\n');
}

export function parseCsv(csv: string): Record<string,string>[] {
  const [headerLine, ...rest] = csv.trim().split(/\r?\n/);
  const headers = headerLine.split(',').map(h => h.replace(/^"|"$/g,''));
  return rest.map(line => {
    const cols = line.match(/(?:^|,)\s*("(?:[^"]|"")*"|[^,]*)/g)!.map(s => s.replace(/^,?\s*/,'')).map(s => s.replace(/^"|"$/g,'').replace(/""/g,'"'));
    const rec: Record<string,string> = {};
    headers.forEach((h,i) => rec[h] = cols[i] ?? '');
    return rec;
  });
}