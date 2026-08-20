export interface StockSearchResult {
  code: string;
  ticker: string;
  name: string;
  market: string;
  currency: string;
}

export interface ChartSeries {
  dates: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
  volume: number[];
  ma5: (number | null)[];
  ma20: (number | null)[];
  ma60: (number | null)[];
  ma120: (number | null)[];
  ma240: (number | null)[];
  rsi: (number | null)[];
  macd: (number | null)[];
  macd_signal: (number | null)[];
  bb_upper: (number | null)[];
  bb_lower: (number | null)[];
}

export interface TechnicalIndicators {
  latest: {
    current_price: number;
    ma5: number;
    ma20: number;
    ma60: number;
    ma120: number;
    ma240: number;
    macd: number;
    macd_signal: number;
    macd_hist: number;
    rsi: number;
    stoch_k: number;
    stoch_d: number;
    bb_upper: number;
    bb_middle: number;
    bb_lower: number;
    obv: number;
    adx: number;
    atr: number;
    gap_percent: number;
    volume_ratio_20d: number;
    elliott_phase: string;
  };
  fibonacci: Record<string, number>;
  series: ChartSeries;
}

export interface MandatoryChecks {
  analysis_datetime?: string;
  current_price: string;
  market_cap: string;
  per: string;
  pbr: string;
  roe: string;
  operating_profit: string;
  net_income: string;
  quarterly_result: string;
  consensus: string;
  institutional_trend: string;
  foreigner_trend: string;
  short_selling: string;
  securities_lending: string;
  volume_change: string;
  recent_3m_news: string;
  recent_filings: string;
  target_price: string;
  analyst_opinion: string;
  industry_outlook: string;
  competitor_comparison: string;
}

export interface ChartAnalysisReport {
  ma5: number;
  ma20: number;
  ma60: number;
  ma120: number;
  ma240: number;
  macd: number;
  rsi: number;
  stochastic: string;
  bollinger_bands: string;
  obv: number;
  adx: number;
  atr: number;
  fibonacci: Record<string, number>;
  elliott_wave: string;
  volume_analysis: string;
  gap_analysis: string;
}

export interface SupplyAnalysisReport {
  institutional: string;
  foreigner: string;
  retail: string;
  program_trading: string;
  short_selling: string;
  securities_lending: string;
  options_market: string;
  futures_market: string;
  supply_score: number;
}

export interface ValuationAnalysisReport {
  dcf_valuation: string;
  per_comparison: string;
  pbr_comparison: string;
  ev_ebitda: string;
  peg: string;
  roe: string;
  roic: string;
  fcf: string;
  debt_ratio: string;
  cash_flow: string;
  dividend: string;
  treasury_stock: string;
  new_business: string;
  growth: string;
  risk: string;
  moat: string;
}

export interface NewsItem {
  title: string;
  date: string;
  importance: string;
  type: '호재' | '악재';
  short_term_impact: string;
  long_term_impact: string;
  reliability: string;
}

export interface AIScores {
  growth: number;
  safety: number;
  profitability: number;
  supply: number;
  technical: number;
  financial: number;
  valuation: number;
  sentiment: number;
  momentum: number;
  total_score: number;
}

export interface InvestmentStrategy {
  recommendation: '① 적극매수' | '② 분할매수' | '③ 보유' | '④ 일부매도' | '⑤ 전량매도';
  reason: string;
}

export interface PriceStrategy {
  buy_1: number;
  buy_2: number;
  buy_3: number;
  stop_loss: number;
  target_1: number;
  target_2: number;
  final_target: number;
  reason: string;
}

export interface ProbabilitySet {
  up: number;
  sideways: number;
  down: number;
}

export interface ProbabilitiesReport {
  '1w': ProbabilitySet;
  '1m': ProbabilitySet;
  '3m': ProbabilitySet;
  '6m': ProbabilitySet;
  '1y': ProbabilitySet;
}

export interface ScenariosReport {
  best: { price: number; description: string };
  base: { price: number; description: string };
  worst: { price: number; description: string };
}

export interface FinalConclusion {
  investment_grade: string;
  investment_opinion: '강력매수' | '매수' | '보유' | '매도' | '강력매도';
  current_price: number;
  fair_price: number;
  undervaluation_pct: number;
  target_price: number;
  expected_return: number;
  stop_loss: number;
  recommended_weight: string;
  buy_timing: string;
  sell_timing: string;
  investment_period: string;
  reliability: string;
  one_liner: string;
}

export interface AIStockReport {
  target: {
    stock_name: string;
    stock_code: string;
    market: string;
    current_price: number;
    analysis_datetime?: string;
  };
  mandatory_checks: MandatoryChecks;
  chart_analysis: ChartAnalysisReport;
  supply_analysis: SupplyAnalysisReport;
  valuation_analysis: ValuationAnalysisReport;
  news_analysis: NewsItem[];
  ai_scores: AIScores;
  investment_strategy: InvestmentStrategy;
  price_strategy: PriceStrategy;
  probabilities: ProbabilitiesReport;
  risks: Record<string, string>;
  scenarios: ScenariosReport;
  final_conclusion: FinalConclusion;
}
