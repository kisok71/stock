# 📈 ALPHASTOCK AI - 주식 정보 & AI 종합 종목 분석 시스템

종목명 또는 종목 코드로 국내(KOSPI/KOSDAQ) 및 해외(미국 NYSE/NASDAQ) 주식을 검색하여, **TradingView 실시간 캔들 차트(일/주/월봉)와 13가지 기술적 지표**를 시각화하고, **Python 수치 계산 + Gemini AI 엔진**을 통해 **기관투자자 리서치센터 보고서 수준의 정교한 종목 분석 리포트**를 제공하는 모던 웹 애플리케이션입니다.

---

## ✨ 핵심 기능

1. **국내/해외 주식 통합 검색**: 삼성전자(`005930`), SK하이닉스(`000660`), 애플(`AAPL`), 엔비디아(`NVDA`), 테슬라(`TSLA`) 등 자동완성 검색 지원.
2. **TradingView 캔들 차트 & 13종 지표 오버레이**:
   - 일봉, 주봉, 월봉 선택 지원.
   - 20/60/120/240일 이동평균선, MACD, RSI, 스토캐스틱, 볼린저밴드, OBV, ADX, ATR, 피보나치 되돌림, 엘리어트 파동, 거래량, 갭 분석 온/오프 툴바 제공.
3. **6대 분야 기관급 AI 리포트**:
   - **개요 & 20종 체크 데이터**: 현재가, 시가총액, PER, PBR, ROE, 영업이익, 순이익, 분기실적, 컨센서스, 수급, 공매도, 대차잔고 등 20가지 조사 항목.
   - **차트 & 수급 100점 점수판**: 기관/외국인/개인 수급 및 파생시장 분석 기반 수급강도 Score (100점 만점).
   - **기업가치 & DCF 밸류에이션**: DCF 적정가치 추정, PER/PBR/EV-EBITDA/PEG/FCF 상대비교 및 경제적 해자(Moat) 평가.
   - **뉴스 별점 영향도 (★★★★★)**: 최근 3개월 호재/악재 뉴스 중요도 별점 및 단기/장기 주가 영향 평가.
   - **AI 10종 다차원 평가**: 성장성, 안전성, 수익성, 수급, 기술적 분석, 실적, 밸류에이션, 시장심리, 모멘텀 각각 100점 만점 계산 및 AI 종합 점수/등급 산출.
   - **투자의견 & 가격/시나리오 전략**:
     - **투자의견**: ① 적극매수 ② 분할매수 ③ 보유 ④ 일부매도 ⑤ 전량매도 중 하나 명확 선택.
     - **가격 전략**: 1차/2차/3차 매수가, 손절가, 1차/2차/최종 목표가 및 명확한 근거 제시.
     - **확률 분석**: 1주, 1개월, 3개월, 6개월, 1년 상승/보합/하락 % 제시.
     - **시나리오 분석**: 최상, 보통, 최악 시나리오별 예상주가 제시.
     - **최종 요약 결론 표 카드**: 투자등급, 투자의견, 적정가, 저평가율, 목표가, 예상수익률, 손절가, 추천비중, 매수/매도시점, 투자기간, 신뢰도, 애널리스트 한줄평.

---

## 🚀 실행 방법

### 1. 백엔드 (FastAPI) 실행

```bash
cd backend
pip install -r requirements.txt
python run.py
```
> 백엔드 서버가 `http://localhost:8000`에서 실행됩니다.
> (Gemini API 키가 있을 경우 `backend/.env` 파일 생성 후 `GEMINI_API_KEY=your_key` 설정)

### 2. 프론트엔드 (React + Vite) 실행

```bash
cd frontend
npm install
npm run dev
```
> 브라우저에서 `http://localhost:3000`으로 접속합니다.

---

## 🏗️ 프로젝트 구조

```
stock/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI 메인 서버
│   │   ├── config.py          # 환경변수 설정
│   │   ├── api/
│   │   │   └── stocks.py      # 주식 검색 & 차트 & AI 분석 API
│   │   └── engine/
│   │       ├── indicators.py  # 13종 기술적 지표 연산 모듈
│   │       ├── valuation.py   # DCF & 밸류에이션 연산 모듈
│   │       ├── supply_demand.py # 수급 분석 & 100점 점수 엔진
│   │       ├── news_crawler.py  # 뉴스 & 공시 수집 모듈
│   │       └── ai_report.py   # Gemini AI 기관급 보고서 작성 엔진
│   ├── requirements.txt
│   └── run.py
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx text search & active stock badge
│   │   │   ├── StockChart.tsx  # TradingView 캔들 차트 & 13종 지표 툴바
│   │   │   ├── OverviewTab.tsx # 20종 필수 확인 데이터
│   │   │   ├── ChartSupplyTab.tsx # 수급 100점 점수 & 차트 상세
│   │   │   ├── ValuationTab.tsx # DCF & 밸류에이션
│   │   │   ├── NewsImpactTab.tsx # 뉴스 별점 (★★★★★) 영향도
│   │   │   ├── AIScoresTab.tsx  # AI 10종 항목 점수 카드
│   │   │   ├── StrategyTab.tsx  # 투자전략, 목표가, 확률, 시나리오, 최종결론
│   │   │   └── ReportView.tsx   # 6개 탭 보고서 뷰어
│   │   ├── types/stock.ts     # TypeScript 타입 정의
│   │   ├── api/client.ts      # API 통신 클라이언트
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```
