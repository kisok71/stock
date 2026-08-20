import React, { useState } from 'react';
import { AIStockReport, StockSearchResult } from '../types/stock';
import { OverviewTab } from './OverviewTab';
import { ChartSupplyTab } from './ChartSupplyTab';
import { ValuationTab } from './ValuationTab';
import { NewsImpactTab } from './NewsImpactTab';
import { AIScoresTab } from './AIScoresTab';
import { StrategyTab } from './StrategyTab';
import { FileText, Award, BarChart3, Newspaper, Cpu, Target, Copy, Check, Download, Clock } from 'lucide-react';

interface ReportViewProps {
  report?: AIStockReport | null;
  loading: boolean;
  currentStock: StockSearchResult;
}

export const ReportView: React.FC<ReportViewProps> = ({ report, loading, currentStock }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  if (loading) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center space-y-4 shadow-lg min-h-[400px] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-white">AI 기관급 분석 보고서 생성 중...</h3>
          <p className="text-xs text-gray-400">20가지 필수 확인 데이터 수집 및 13종 기술적 지표, DCF 밸류에이션을 종합 연산하고 있습니다.</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-8 text-center text-gray-400 text-sm">
        종목을 선택하면 AI 종합 리포트가 자동으로 생성됩니다.
      </div>
    );
  }

  const tabs = [
    { label: '개요 & 20종 체크', icon: FileText },
    { label: '차트 & 수급 100점', icon: BarChart3 },
    { label: '기업가치 & DCF', icon: Award },
    { label: '뉴스 별점 영향도', icon: Newspaper },
    { label: 'AI 10종 평가', icon: Cpu },
    { label: '전략 & 최종결론', icon: Target },
  ];

  const handleCopyMarkdown = () => {
    const text = `
# [AI 기관 리서치] ${report.target.stock_name} (${report.target.stock_code}) 종목 분석 보고서
- 조회/분석 일시: ${report.target.analysis_datetime || new Date().toLocaleString()}
- 상장시장: ${report.target.market}
- 현재가: ${report.target.current_price}
- 투자의견: ${report.final_conclusion.investment_grade} ${report.final_conclusion.investment_opinion}
- DCF 적정가: ${report.final_conclusion.fair_price}
- 최종 목표가: ${report.final_conclusion.target_price}
- 손절가: ${report.final_conclusion.stop_loss}
- 한줄평: ${report.final_conclusion.one_liner}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 md:p-6 shadow-lg space-y-5">
      {/* Report Header & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-700 pb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-semibold border border-blue-500/30">
              기관투자자 리서치센터 보고서
            </span>
            {report.target.analysis_datetime && (
              <span className="text-xs px-2.5 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-mono font-semibold border border-emerald-500/30 flex items-center gap-1">
                <Clock className="w-3 h-3 text-emerald-400" />
                분석 일시: {report.target.analysis_datetime}
              </span>
            )}
            <span className="text-xs text-gray-400 font-mono hidden md:inline">출처: KIS API / DART / Gemini AI</span>
          </div>
          <h2 className="text-xl font-black text-white mt-1">
            {report.target.stock_name} <span className="text-gray-400 text-sm font-mono">({report.target.stock_code})</span> AI 종합 분석 보고서
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyMarkdown}
            className="px-3 py-1.5 rounded-lg bg-dark-700 hover:bg-dark-600 text-gray-200 text-xs font-semibold flex items-center gap-1.5 border border-dark-600 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? '복사 완료' : '보고서 요약 복사'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-dark-700 scrollbar-none">
        {tabs.map((t, idx) => {
          const Icon = t.icon;
          return (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2.5 rounded-lg text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
                activeTab === idx
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-dark-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 0 && (
          <OverviewTab
            data={report.mandatory_checks}
            stockName={report.target.stock_name}
            stockCode={report.target.stock_code}
            market={report.target.market}
          />
        )}

        {activeTab === 1 && (
          <ChartSupplyTab
            chartData={report.chart_analysis}
            supplyData={report.supply_analysis}
          />
        )}

        {activeTab === 2 && (
          <ValuationTab data={report.valuation_analysis} />
        )}

        {activeTab === 3 && (
          <NewsImpactTab newsList={report.news_analysis} />
        )}

        {activeTab === 4 && (
          <AIScoresTab scores={report.ai_scores} />
        )}

        {activeTab === 5 && (
          <StrategyTab
            strategy={report.investment_strategy}
            priceStrategy={report.price_strategy}
            probabilities={report.probabilities}
            scenarios={report.scenarios}
            risks={report.risks}
            conclusion={report.final_conclusion}
            currency={currentStock.currency}
          />
        )}
      </div>
    </div>
  );
};
