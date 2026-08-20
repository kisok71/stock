import React from 'react';
import { ChartAnalysisReport, SupplyAnalysisReport } from '../types/stock';
import { Activity, ShieldCheck, PieChart, ArrowUpRight, BarChart } from 'lucide-react';

interface ChartSupplyTabProps {
  chartData: ChartAnalysisReport;
  supplyData: SupplyAnalysisReport;
}

export const ChartSupplyTab: React.FC<ChartSupplyTabProps> = ({ chartData, supplyData }) => {
  const supplyScore = supplyData.supply_score;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
    if (score >= 60) return 'text-green-400 border-green-500/40 bg-green-500/10';
    if (score >= 40) return 'text-amber-400 border-amber-500/40 bg-amber-500/10';
    return 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  };

  return (
    <div className="space-y-6">
      {/* 100-Point Supply & Demand Score Card Header */}
      <div className="bg-gradient-to-r from-dark-800 to-dark-700 p-5 rounded-xl border border-dark-600 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">수급 종합 평가</span>
            <h3 className="text-lg font-bold text-white mt-1">수급 강도 Score (100점 만점)</h3>
            <p className="text-xs text-gray-400 mt-1">기관, 외국인, 프로그램 매매, 대차잔고 및 파생 시장 종합 수급</p>
          </div>

          <div className={`p-4 rounded-xl border flex items-center justify-center gap-3 ${getScoreColor(supplyScore)}`}>
            <div className="text-center">
              <span className="text-3xl font-black font-mono tracking-tight">{supplyScore}</span>
              <span className="text-xs font-bold block mt-0.5">/ 100 점</span>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="w-full bg-dark-900 rounded-full h-3 overflow-hidden border border-dark-700">
            <div
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${supplyScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* Supply & Demand Breakdown */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <PieChart className="w-5 h-5 text-indigo-400" />
          <h3 className="text-base font-bold text-white">주체별 수급 및 시장 세부 분석</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">기관</span>
            <span className="text-sm font-semibold text-white mt-1 block">{supplyData.institutional}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">외국인</span>
            <span className="text-sm font-semibold text-white mt-1 block">{supplyData.foreigner}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">개인</span>
            <span className="text-sm font-semibold text-white mt-1 block">{supplyData.retail}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">프로그램 매매</span>
            <span className="text-sm font-semibold text-emerald-400 mt-1 block">{supplyData.program_trading}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">공매도 추이</span>
            <span className="text-sm font-semibold text-gray-200 mt-1 block">{supplyData.short_selling}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">대차잔고</span>
            <span className="text-sm font-semibold text-gray-200 mt-1 block">{supplyData.securities_lending}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">옵션시장</span>
            <span className="text-sm font-semibold text-blue-400 mt-1 block">{supplyData.options_market}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">선물시장</span>
            <span className="text-sm font-semibold text-blue-400 mt-1 block">{supplyData.futures_market}</span>
          </div>
        </div>
      </div>

      {/* Chart Indicator Analysis Summary */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">13가지 기술적 지표 상세 종합 분석</h3>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">이동평균선 (5/20/60/120/240일)</span>
                <span className="font-mono text-gray-200 font-semibold">{chartData.ma5 ? chartData.ma5 : '-'} / {chartData.ma20} / {chartData.ma60} / {chartData.ma120} / {chartData.ma240}</span>
              </div>
              <div className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">MACD / Signal</span>
                <span className="font-mono text-blue-400 font-semibold">{chartData.macd}</span>
              </div>
              <div className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">RSI (상대강도지수)</span>
                <span className="font-mono text-emerald-400 font-semibold">{chartData.rsi}</span>
              </div>
              <div className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">스토캐스틱 (%K / %D)</span>
                <span className="font-mono text-amber-400 font-semibold">{chartData.stochastic}</span>
              </div>
              <div className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">볼린저밴드 (상/하단)</span>
                <span className="font-mono text-gray-200 font-semibold">{chartData.bollinger_bands}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">OBV / ADX / ATR</span>
                <span className="font-mono text-gray-200 font-semibold">{chartData.obv} / {chartData.adx} / {chartData.atr}</span>
              </div>
              <div className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">엘리어트 파동 국면</span>
                <span className="font-semibold text-blue-300">{chartData.elliott_wave}</span>
              </div>
              <div className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">거래량 분석</span>
                <span className="text-gray-200 font-semibold">{chartData.volume_analysis}</span>
              </div>
              <div className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">갭 분석</span>
                <span className="text-gray-200 font-semibold">{chartData.gap_analysis}</span>
              </div>
            </div>
          </div>

          {/* Fibonacci Retracement Levels Box */}
          <div className="pt-2 border-t border-dark-700">
            <span className="text-gray-400 font-semibold block mb-2">피보나치 되돌림 주요 가격 마디선</span>
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {Object.entries(chartData.fibonacci || {}).map(([level, val]) => (
                <div key={level} className="bg-dark-900/80 p-2 rounded border border-dark-700 text-center">
                  <span className="text-[10px] text-gray-400 block">{level}</span>
                  <span className="font-mono text-xs font-bold text-gray-200">{val.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
