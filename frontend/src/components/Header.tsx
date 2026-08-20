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
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      const res = await searchStocks(query);
      setResults(res);
      setIsOpen(true);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (stock: StockSearchResult) => {
    onSelectStock(stock);
    setQuery('');
    setIsOpen(false);
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

  return (
    <header className="bg-dark-800 border-b border-dark-700 sticky top-0 z-40 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand & Search Bar */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
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

          {/* Search Box */}
          <div className="relative flex-1 md:w-96" ref={searchRef}>
            <div className="relative">
              <input
                type="text"
                placeholder="종목명 또는 코드 입력 (예: 에스피지, 삼성전자, AAPL)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setIsOpen(true)}
                className="w-full bg-dark-900 border border-dark-600 rounded-lg pl-9 pr-4 py-2 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            </div>

            {/* Dropdown Results */}
            {isOpen && results.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-dark-800 border border-dark-600 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                {results.map((stock) => (
                  <button
                    key={stock.code}
                    onClick={() => handleSelect(stock)}
                    className="w-full px-4 py-2.5 text-left text-sm hover:bg-dark-700 flex items-center justify-between border-b border-dark-700/50 last:border-0 transition-colors"
                  >
                    <div>
                      <span className="font-semibold text-white">{stock.name}</span>
                      <span className="text-xs text-gray-400 ml-2">({stock.code})</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-dark-600 text-gray-300 font-mono">
                      {stock.market}
                    </span>
                  </button>
                ))}
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
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
                  {currentStock.market}
                </span>
              </div>
              <div className="text-xs text-gray-300 mt-0.5">
                현재가:{' '}
                <span className="font-mono font-bold text-emerald-400">
                  {report?.target?.current_price
                    ? currentStock.market === 'KOSPI' || currentStock.market === 'KOSDAQ'
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
