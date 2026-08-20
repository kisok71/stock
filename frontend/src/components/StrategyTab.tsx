import React from 'react';
import { InvestmentStrategy, PriceStrategy, ProbabilitiesReport, ScenariosReport, FinalConclusion } from '../types/stock';
import { Target, AlertTriangle, ShieldCheck, TrendingUp, Award, Clock, DollarSign, CheckCircle2 } from 'lucide-react';

interface StrategyTabProps {
  strategy: InvestmentStrategy;
  priceStrategy: PriceStrategy;
  probabilities: ProbabilitiesReport;
  scenarios: ScenariosReport;
  risks: Record<string, string>;
  conclusion: FinalConclusion;
  currency: string;
}

export const StrategyTab: React.FC<StrategyTabProps> = ({
  strategy,
  priceStrategy,
  probabilities,
  scenarios,
  risks,
  conclusion,
  currency
}) => {
  const isKRW = currency === 'KRW' || conclusion.current_price > 500;
  const fmt = (val: number) => (isKRW ? `${val.toLocaleString()} 원` : `$${val.toLocaleString()}`);

  const getOpinionBadgeStyle = (op: string) => {
    switch (op) {
      case '강력매수': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case '매수': return 'bg-green-500/20 text-green-400 border-green-500/40';
      case '보유': return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case '매도': return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default: return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Investment Strategy Selection Header */}
      <div className="bg-gradient-to-r from-blue-950 via-dark-800 to-dark-700 p-5 rounded-xl border border-blue-500/40 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs text-blue-400 font-bold uppercase tracking-wider">포트폴리오 투자전략</span>
            <h3 className="text-xl font-black text-white mt-1 flex items-center gap-2">
              선택 전략: <span className="text-emerald-400 underline decoration-blue-500 underline-offset-4">{strategy.recommendation}</span>
            </h3>
            <p className="text-xs text-gray-300 mt-2 leading-relaxed bg-dark-900/80 p-3 rounded-lg border border-dark-700">
              {strategy.reason}
            </p>
          </div>
        </div>
      </div>

      {/* 2. Price Strategy Grid */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Target className="w-5 h-5 text-emerald-400" />
          <h3 className="text-base font-bold text-white">명확한 가격 전략 (매수가 / 손절가 / 목표가)</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">1차 매수가</span>
            <span className="text-base font-bold text-white font-mono mt-1 block">{fmt(priceStrategy.buy_1)}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">2차 매수가</span>
            <span className="text-base font-bold text-white font-mono mt-1 block">{fmt(priceStrategy.buy_2)}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">3차 매수가</span>
            <span className="text-base font-bold text-white font-mono mt-1 block">{fmt(priceStrategy.buy_3)}</span>
          </div>

          <div className="bg-rose-950/20 p-3.5 rounded-lg border border-rose-500/30">
            <span className="text-rose-400 block font-bold">손절가 (Stop-Loss)</span>
            <span className="text-base font-bold text-rose-400 font-mono mt-1 block">{fmt(priceStrategy.stop_loss)}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">1차 목표가</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">{fmt(priceStrategy.target_1)}</span>
          </div>

          <div className="bg-dark-800 p-3.5 rounded-lg border border-dark-700">
            <span className="text-gray-400 block font-medium">2차 목표가</span>
            <span className="text-base font-bold text-emerald-400 font-mono mt-1 block">{fmt(priceStrategy.target_2)}</span>
          </div>

          <div className="bg-emerald-950/20 p-3.5 rounded-lg border border-emerald-500/30 col-span-1 sm:col-span-2">
            <span className="text-emerald-400 block font-bold">최종 목표가 (Target Price)</span>
            <span className="text-lg font-black text-emerald-400 font-mono mt-1 block">{fmt(priceStrategy.final_target)}</span>
          </div>
        </div>

        <p className="text-xs text-gray-400 mt-2 bg-dark-900 p-3 rounded-lg border border-dark-700">
          가격 근거: {priceStrategy.reason}
        </p>
      </div>

      {/* 3. Probabilities Table */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-bold text-white">기간별 주가 확률 분석 (%)</h3>
        </div>

        <div className="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-dark-900 border-b border-dark-700 text-gray-400">
                <th className="p-3">기간</th>
                <th className="p-3 text-emerald-400">상승 확률 (%)</th>
                <th className="p-3 text-amber-400">보합 확률 (%)</th>
                <th className="p-3 text-rose-400">하락 확률 (%)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dark-700">
              {Object.entries(probabilities || {}).map(([period, prob]) => (
                <tr key={period} className="hover:bg-dark-700/50 transition-colors">
                  <td className="p-3 font-semibold text-white">
                    {period === '1w' ? '1주' : period === '1m' ? '1개월' : period === '3m' ? '3개월' : period === '6m' ? '6개월' : '1년'}
                  </td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{prob.up}%</td>
                  <td className="p-3 font-mono text-amber-400">{prob.sideways}%</td>
                  <td className="p-3 font-mono text-rose-400">{prob.down}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Scenarios & Risk Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Scenarios */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3 text-xs">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-400" /> 시나리오 분석 (예상 주가)
          </h4>

          <div className="space-y-2">
            <div className="bg-emerald-950/20 p-2.5 rounded border border-emerald-500/30">
              <div className="flex justify-between items-center">
                <span className="font-bold text-emerald-400">최상의 시나리오</span>
                <span className="font-mono font-bold text-emerald-400 text-sm">{fmt(scenarios.best.price)}</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1">{scenarios.best.description}</p>
            </div>

            <div className="bg-blue-950/20 p-2.5 rounded border border-blue-500/30">
              <div className="flex justify-between items-center">
                <span className="font-bold text-blue-400">보통 시나리오</span>
                <span className="font-mono font-bold text-blue-400 text-sm">{fmt(scenarios.base.price)}</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1">{scenarios.base.description}</p>
            </div>

            <div className="bg-rose-950/20 p-2.5 rounded border border-rose-500/30">
              <div className="flex justify-between items-center">
                <span className="font-bold text-rose-400">최악의 시나리오</span>
                <span className="font-mono font-bold text-rose-400 text-sm">{fmt(scenarios.worst.price)}</span>
              </div>
              <p className="text-[11px] text-gray-300 mt-1">{scenarios.worst.description}</p>
            </div>
          </div>
        </div>

        {/* Risk Items */}
        <div className="bg-dark-800 border border-dark-700 rounded-xl p-4 space-y-3 text-xs">
          <h4 className="font-bold text-sm text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" /> 리스크 종합 평가
          </h4>
          <div className="space-y-1.5">
            {Object.entries(risks || {}).map(([key, val]) => (
              <div key={key} className="flex justify-between p-2 bg-dark-900 rounded border border-dark-700">
                <span className="text-gray-400">{key === 'interest_rate' ? '금리' : key === 'fx_rate' ? '환율' : key === 'geopolitics' ? '국제정세' : key === 'policy' ? '정책' : '악재 가능성'}</span>
                <span className="text-gray-200 font-semibold">{val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. Mandatory Final Conclusion Box */}
      <div className="bg-gradient-to-br from-dark-800 via-dark-800 to-blue-950 border-2 border-blue-500/50 rounded-2xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-dark-600 pb-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-6 h-6 text-amber-400" />
              <span className="text-amber-400 font-mono tracking-widest text-lg">{conclusion.investment_grade}</span>
              <span className="text-gray-400 text-xs font-bold uppercase">최종 리서치 결론</span>
            </div>
            <h2 className="text-2xl font-black text-white mt-1">기관 리포트 최종 요약 결론</h2>
          </div>

          <div className={`px-4 py-2 rounded-xl border text-center font-bold text-lg ${getOpinionBadgeStyle(conclusion.investment_opinion)}`}>
            투자의견: {conclusion.investment_opinion}
          </div>
        </div>

        {/* Structured Final Table */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs font-mono">
          <div className="bg-dark-900/90 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">현재가</span>
            <span className="font-bold text-white text-sm">{fmt(conclusion.current_price)}</span>
          </div>

          <div className="bg-dark-900/90 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">적정가 (DCF)</span>
            <span className="font-bold text-emerald-400 text-sm">{fmt(conclusion.fair_price)}</span>
          </div>

          <div className="bg-dark-900/90 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">저평가율</span>
            <span className="font-bold text-emerald-400 text-sm">+{conclusion.undervaluation_pct}%</span>
          </div>

          <div className="bg-dark-900/90 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">목표가</span>
            <span className="font-bold text-emerald-400 text-sm">{fmt(conclusion.target_price)}</span>
          </div>

          <div className="bg-dark-900/90 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">예상 수익률</span>
            <span className="font-bold text-blue-400 text-sm">+{conclusion.expected_return}%</span>
          </div>

          <div className="bg-dark-900/90 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">손절가</span>
            <span className="font-bold text-rose-400 text-sm">{fmt(conclusion.stop_loss)}</span>
          </div>

          <div className="bg-dark-900/90 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">추천 비중</span>
            <span className="font-bold text-white text-xs">{conclusion.recommended_weight}</span>
          </div>

          <div className="bg-dark-900/90 p-3 rounded-lg border border-dark-700">
            <span className="text-gray-400 block text-[10px]">신뢰도</span>
            <span className="font-bold text-blue-300 text-xs">{conclusion.reliability}</span>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-dark-600 text-xs">
          <div className="flex flex-col sm:flex-row justify-between gap-2">
            <span className="text-gray-400"><strong className="text-gray-200">매수시점:</strong> {conclusion.buy_timing}</span>
            <span className="text-gray-400"><strong className="text-gray-200">매도시점:</strong> {conclusion.sell_timing}</span>
          </div>

          {/* Analyst One-Liner */}
          <div className="bg-blue-950/40 p-3 rounded-lg border border-blue-500/30 mt-3">
            <span className="text-blue-400 font-bold block mb-1">애널리스트 한줄평</span>
            <p className="text-gray-200 leading-relaxed font-sans text-xs">{conclusion.one_liner}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
