import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { StockChart } from './components/StockChart';
import { ReportView } from './components/ReportView';
import { StockSearchResult, TechnicalIndicators, AIStockReport } from './types/stock';
import { getStockChartData, getAIStockAnalysis } from './api/client';

const DEFAULT_STOCK: StockSearchResult = {
  code: '005930',
  ticker: '005930.KS',
  name: '삼성전자',
  market: 'KOSPI',
  currency: 'KRW'
};

export const App: React.FC = () => {
  const [currentStock, setCurrentStock] = useState<StockSearchResult>(DEFAULT_STOCK);
  const [period, setPeriod] = useState<'1d' | '1w' | '1m'>('1d');
  
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [report, setReport] = useState<AIStockReport | null>(null);
  
  const [loadingChart, setLoadingChart] = useState<boolean>(false);
  const [loadingReport, setLoadingReport] = useState<boolean>(false);

  // Fetch Chart Data
  const loadChart = async (stock: StockSearchResult, timeframe: '1d' | '1w' | '1m') => {
    setLoadingChart(true);
    try {
      const res = await getStockChartData(stock.code, timeframe);
      setIndicators(res.indicators);
    } catch (err) {
      console.error('Failed to load chart data:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  // Fetch AI Report Data
  const loadReport = async (stock: StockSearchResult) => {
    setLoadingReport(true);
    try {
      const res = await getAIStockAnalysis(stock.code);
      setReport(res.report);
      if (res.indicators) {
        setIndicators(res.indicators);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  useEffect(() => {
    loadChart(currentStock, period);
    loadReport(currentStock);
  }, [currentStock.code]);

  useEffect(() => {
    loadChart(currentStock, period);
  }, [period]);

  const handleSelectStock = (stock: StockSearchResult) => {
    setCurrentStock(stock);
  };

  const handleRefreshAnalysis = () => {
    loadReport(currentStock);
  };

  return (
    <div className="min-h-screen bg-dark-900 text-gray-100 flex flex-col font-sans">
      <Header
        currentStock={currentStock}
        onSelectStock={handleSelectStock}
        report={report}
        loadingReport={loadingReport}
        onRefreshAnalysis={handleRefreshAnalysis}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        {/* Top Section: TradingView Candle Chart & Indicators */}
        <section>
          <StockChart
            indicators={indicators}
            period={period}
            onPeriodChange={setPeriod}
            loading={loadingChart}
          />
        </section>

        {/* Bottom Section: 6-Tab AI Institutional Research Report */}
        <section>
          <ReportView
            report={report}
            loading={loadingReport}
            currentStock={currentStock}
          />
        </section>
      </main>

      <footer className="bg-dark-800 border-t border-dark-700 py-4 px-6 text-center text-xs text-gray-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>© 2026 ALPHASTOCK AI System. All rights reserved.</span>
          <span>본 보고서는 AI 알고리즘과 시장 실시간 데이터를 기반으로 참고용으로 생성되었으며, 최종 투자 책임은 본인에게 있습니다.</span>
        </div>
      </footer>
    </div>
  );
};

export default App;
