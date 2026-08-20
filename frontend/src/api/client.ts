import { StockSearchResult, TechnicalIndicators, AIStockReport } from '../types/stock';

const API_BASE = '/api';

export async function searchStocks(query: string): Promise<StockSearchResult[]> {
  try {
    const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) throw new Error('Search failed');
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error('Failed to search stocks:', error);
    return [];
  }
}

export async function getStockChartData(code: string, period: '1d' | '1w' | '1m' = '1d'): Promise<{ stock_info: any; indicators: TechnicalIndicators }> {
  const res = await fetch(`${API_BASE}/stock/${code}?period=${period}`);
  if (!res.ok) throw new Error('Failed to fetch stock chart data');
  return res.json();
}

export async function getAIStockAnalysis(code: string): Promise<{ report: AIStockReport; indicators: TechnicalIndicators }> {
  const res = await fetch(`${API_BASE}/analyze/${code}`);
  if (!res.ok) throw new Error('Failed to generate AI stock analysis');
  return res.json();
}
