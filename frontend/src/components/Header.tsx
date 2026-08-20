import React, { useState, useEffect, useRef } from 'react';
import { Search, TrendingUp, Zap } from 'lucide-react';
import { StockSearchResult, AIStockReport } from '../types/stock';
import { searchStocks } from '../api/client';

interface HeaderProps {
  currentStock: StockSearchResult;
  onSelectStock: (stock: StockSearchResult) => void;
  report?: AIStockReport | null;
  loadingReport: boolean;
  onRefreshAnalysis: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStock,
  onSelectStock,
  report,
  loadingReport,
  onRefreshAnalysis
}) => {
  const [query, setQuery] = useState('');
  const [selectedMarket, setSelectedMarket] = useState<'all' | 'kr' | 'us'>('kr');
  const [results, setResults] = useState<StockSearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const res = await searchStocks(query, selectedMarket);
      setResults(res);
      if (document.activeElement === searchRef.current?.querySelector('input')) {
        setIsOpen(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [query, selectedMarket]);

  const handleSelect = (stock: StockSearchResult) => {
    onSelectStock(stock);
    setQuery('');
    setIsOpen(false);
  };

  const handleSubmit = (targetStock?: StockSearchResult) => {
    if (targetStock) {
      handleSelect(targetStock);
      return;
    }
    
    const q = query.trim();
    if (!q) return;

    if (results.length > 0) {
      handleSelect(results[0]);
    } else {
      const isDigits = /^\d+$/.test(q);
      const fallback: StockSearchResult = {
        code: q.toUpperCase(),
        ticker: isDigits ? `${q}.KS` : q.toUpperCase(),
        name: q,
        market: isDigits ? 'KOSPI' : 'NASDAQ',
        currency: isDigits ? 'KRW' : 'USD'
      };
      handleSelect(fallback);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  const getOpinionBadgeColor = (opinion?: string) => {
    switch (opinion) {
      case '강력매수': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case '매수': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case '보유': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case '매도': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
  };

  const isKRWStock = (stock: StockSearchResult) => {
    return stock.currency === 'KRW' || stock.market === 'KOSPI' || stock.market === 'KOSDAQ' || stock.code.match(/^\d+$/);
  };

  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Search Bar with Market Tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-lg text-white font-bold shadow-lg shadow-blue-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                ALPHA<span className="text-blue-500">STOCK</span> AI
              </h1>
              <p className="text-[10px] text-gray-400 hidden sm:block">기관급 종목 분석 & 실시간 차트</p>
            </div>
          </div>

          {/* Search Box & Market Selection Filter */}
          <div className="relative flex-1 md:w-[420px]" ref={searchRef}>
            <div className="flex flex-col gap-1.5">
              {/* Market Filter Tabs */}
              <div className="flex items-center gap-1 bg-dark-900/90 p-1 rounded-lg border border-dark-700/80 text-xs">
                <button
                  type="button"
                  onClick={() => { setSelectedMarket('kr'); setIsOpen(true); }}
                  className={`flex-1 py-1 px-2.5 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
                    selectedMarket === 'kr'
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
                  }`}
                >
                  <span>🇰🇷 한국주식</span>
                  <span className="text-[10px] opacity-80 font-mono">(원화 ₩)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedMarket('us'); setIsOpen(true); }}
                  className={`flex-1 py-1 px-2.5 rounded-md font-medium transition-all flex items-center justify-center gap-1.5 ${
                    selectedMarket === 'us'
                      ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
                  }`}
                >
                  <span>🇺🇸 미국주식</span>
                  <span className="text-[10px] opacity-80 font-mono">(달러 $)</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setSelectedMarket('all'); setIsOpen(true); }}
                  className={`py-1 px-2.5 rounded-md font-medium transition-all flex items-center justify-center gap-1 ${
                    selectedMarket === 'all'
                      ? 'bg-dark-700 text-gray-100 border border-dark-600 font-semibold'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-dark-800'
                  }`}
                >
                  <span>🌐 전체</span>
                </button>
              </div>

              {/* Input Box with Clickable Search Button */}
              <div className="relative flex items-center">
                <input
                  type="text"
                  placeholder={
                    selectedMarket === 'kr'
                      ? '한국 주식 종목명/코드 입력 (예: 삼성전자, 000660)'
                      : selectedMarket === 'us'
                      ? '미국 주식 티커/종목명 입력 (예: AAPL, NVDA, TSLA)'
                      : '종목명 또는 코드 입력 (예: 삼성전자, AAPL, 005930)'
                  }
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onFocus={() => setIsOpen(true)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-10 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => handleSubmit()}
                  className="absolute left-2.5 p-1 text-gray-400 hover:text-blue-400 transition-colors"
                  title="검색 실행"
                >
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-2xl overflow-hidden z-[100] max-h-72 overflow-y-auto">
                <div className="px-3 py-1.5 bg-dark-900/90 border-b border-dark-700 text-[10px] text-gray-400 font-semibold flex items-center justify-between sticky top-0 z-10 backdrop-blur-md">
                  <span>검색 추천 종목 (클릭하여 선택)</span>
                  <span>{selectedMarket === 'kr' ? '🇰🇷 한국주식 (원화)' : selectedMarket === 'us' ? '🇺🇸 미국주식 (달러)' : '🌐 전체 시장'}</span>
                </div>
                {results.map((stock) => {
                  const isKR = isKRWStock(stock);
                  return (
                    <button
                      key={stock.code}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelect(stock);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm hover:bg-blue-600/20 active:bg-blue-600/30 flex items-center justify-between border-b border-dark-700/50 last:border-0 transition-colors cursor-pointer"
                    >
                      <div>
                        <span className="font-bold text-white group-hover:text-blue-400">{stock.name}</span>
                        <span className="text-xs text-gray-400 ml-2 font-mono">({stock.code})</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold ${
                          isKR ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          {stock.market} ({isKR ? '원화 ₩' : '달러 $'})
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Active Stock Indicator Badge */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="bg-dark-700/70 border border-dark-600 rounded-lg px-3 py-1.5 flex items-center gap-3">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-white text-sm">{currentStock.name}</span>
                <span className="text-xs text-gray-400 font-mono">({currentStock.code})</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold border ${
                  isKRWStock(currentStock) ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}>
                  {currentStock.market} ({isKRWStock(currentStock) ? '원화' : '달러'})
                </span>
              </div>
              <div className="text-xs text-gray-300 mt-0.5">
                현재가:{' '}
                <span className="font-mono font-bold text-emerald-400">
                  {report?.target?.current_price
                    ? isKRWStock(currentStock)
                      ? `${report.target.current_price.toLocaleString()} 원`
                      : `$${report.target.current_price.toLocaleString()}`
                    : '-'}
                </span>
              </div>
            </div>

            {report && (
              <div className="flex items-center gap-2 border-l border-dark-600 pl-3">
                <div className="text-right">
                  <div className="text-[10px] text-gray-400">AI 투자의견</div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${getOpinionBadgeColor(report.final_conclusion.investment_opinion)}`}>
                    {report.final_conclusion.investment_grade} {report.final_conclusion.investment_opinion}
                  </span>
                </div>
              </div>
            )}

            <button
              onClick={onRefreshAnalysis}
              disabled={loadingReport}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all ml-1"
            >
              <Zap className="w-3.5 h-3.5" />
              {loadingReport ? '분석 중...' : 'AI 재분석'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
