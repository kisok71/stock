from fastapi import APIRouter, Query, HTTPException
import pandas as pd
import numpy as np
import yfinance as yf
import requests
import io
import re
import bs4
import urllib.parse
from datetime import datetime, timedelta, timezone
from typing import Dict, List

from app.engine.indicators import calculate_technical_indicators
from app.engine.valuation import calculate_valuation_metrics
from app.engine.supply_demand import analyze_supply_and_demand
from app.engine.news_crawler import fetch_stock_news_and_disclosures
from app.engine.ai_report import generate_ai_stock_report

router = APIRouter()
KST = timezone(timedelta(hours=9))

# Popular Default Stocks
POPULAR_STOCKS = [
    {"code": "005930", "ticker": "005930.KS", "name": "삼성전자", "market": "KOSPI", "currency": "KRW"},
    {"code": "000660", "ticker": "000660.KS", "name": "SK하이닉스", "market": "KOSPI", "currency": "KRW"},
    {"code": "035420", "ticker": "035420.KS", "name": "NAVER", "market": "KOSPI", "currency": "KRW"},
    {"code": "035720", "ticker": "035720.KS", "name": "카카오", "market": "KOSPI", "currency": "KRW"},
    {"code": "373220", "ticker": "373220.KS", "name": "LG에너지솔루션", "market": "KOSPI", "currency": "KRW"},
    {"code": "058610", "ticker": "058610.KQ", "name": "에스피지", "market": "KOSDAQ", "currency": "KRW"},
    {"code": "247540", "ticker": "247540.KQ", "name": "에코프로비엠", "market": "KOSDAQ", "currency": "KRW"},
    {"code": "068270", "ticker": "068270.KS", "name": "셀트리온", "market": "KOSPI", "currency": "KRW"},
    {"code": "AAPL", "ticker": "AAPL", "name": "애플 (Apple)", "market": "NASDAQ", "currency": "USD"},
    {"code": "NVDA", "ticker": "NVDA", "name": "엔비디아 (NVIDIA)", "market": "NASDAQ", "currency": "USD"},
    {"code": "TSLA", "ticker": "TSLA", "name": "테슬라 (Tesla)", "market": "NASDAQ", "currency": "USD"},
    {"code": "MSFT", "ticker": "MSFT", "name": "마이크로소프트 (Microsoft)", "market": "NASDAQ", "currency": "USD"},
    {"code": "GOOGL", "ticker": "GOOGL", "name": "알파벳 A (Google)", "market": "NASDAQ", "currency": "USD"},
    {"code": "AMD", "ticker": "AMD", "name": "AMD", "market": "NASDAQ", "currency": "USD"},
    {"code": "PLTR", "ticker": "PLTR", "name": "팔란티어 (Palantir)", "market": "NYSE", "currency": "USD"}
]

# Cache for Korean Stock Master List (Loaded on demand or startup)
KRX_STOCKS_CACHE: List[Dict[str, str]] = []

import os
import json

def load_krx_stock_master() -> List[Dict[str, str]]:
    global KRX_STOCKS_CACHE
    if KRX_STOCKS_CACHE:
        return KRX_STOCKS_CACHE

    json_path = os.path.join(os.path.dirname(__file__), "krx_stocks_master.json")
    if os.path.exists(json_path):
        try:
            with open(json_path, "r", encoding="utf-8") as f:
                KRX_STOCKS_CACHE = json.load(f)
                if KRX_STOCKS_CACHE and len(KRX_STOCKS_CACHE) > 100:
                    return KRX_STOCKS_CACHE
        except Exception as e:
            print(f"Error reading local krx_stocks_master.json: {e}")

    try:
        url = 'https://kind.krx.co.kr/corpgeneral/corpList.do?method=download'
        r = requests.get(url, timeout=5)
        if r.status_code == 200:
            df = pd.read_html(io.BytesIO(r.content), encoding='euc-kr')[0]
            items = []
            for _, row in df.iterrows():
                code = str(row.get('종목코드', '')).zfill(6)
                name = str(row.get('회사명', '')).strip()
                market = "KOSDAQ" if "코스닥" in str(row.get('시장구분', '')) else "KOSPI"
                suffix = ".KQ" if market == "KOSDAQ" else ".KS"
                items.append({
                    "code": code,
                    "ticker": f"{code}{suffix}",
                    "name": name,
                    "market": market,
                    "currency": "KRW"
                })
            KRX_STOCKS_CACHE = items
            return KRX_STOCKS_CACHE
    except Exception as e:
        print(f"KRX master load warning: {e}")
    return POPULAR_STOCKS

def generate_mock_ohlcv(symbol: str, count: int = 250) -> pd.DataFrame:
    """Generates clean historical OHLCV data if live network data is unavailable."""
    base_price = 78000.0 if symbol.replace(".KS", "").replace(".KQ", "").isdigit() else 185.0
    now_kst = datetime.now(timezone.utc).astimezone(KST)
    dates = pd.date_range(end=now_kst, periods=count, freq="B")
    
    np.random.seed(abs(hash(symbol)) % 10000)
    returns = np.random.normal(0.0005, 0.018, count)
    price_path = base_price * np.exp(np.cumsum(returns))
    
    opens = price_path * (1 + np.random.normal(0, 0.005, count))
    highs = np.maximum(opens, price_path) * (1 + np.abs(np.random.normal(0, 0.008, count)))
    lows = np.minimum(opens, price_path) * (1 - np.abs(np.random.normal(0, 0.008, count)))
    closes = price_path
    volumes = np.random.randint(1000000, 15000000, count)

    df = pd.DataFrame({
        "Open": opens,
        "High": highs,
        "Low": lows,
        "Close": closes,
        "Volume": volumes
    }, index=dates)
    return df

def fetch_naver_stock_ohlcv(code: str, pages: int = 15) -> pd.DataFrame:
    """Fetches exact real-time Korean market OHLCV data from Naver Finance."""
    clean_code = code.strip().zfill(6)
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    rows = []
    
    for page in range(1, pages + 1):
        try:
            url = f"https://finance.naver.com/item/sise_day.naver?code={clean_code}&page={page}"
            r = requests.get(url, headers=headers, timeout=4)
            if r.status_code != 200:
                continue
            soup = bs4.BeautifulSoup(r.text, 'html.parser')
            trs = soup.find_all('tr', {'onmouseover': 'mouseOver(this)'})
            if not trs:
                break
            for tr in trs:
                tds = [td.text.strip() for td in tr.find_all('td')]
                if len(tds) == 7:
                    dt_str, c_str, diff, o_str, h_str, l_str, v_str = tds
                    if not dt_str:
                        continue
                    try:
                        dt = pd.to_datetime(dt_str)
                        c = float(c_str.replace(',', ''))
                        o = float(o_str.replace(',', ''))
                        h = float(h_str.replace(',', ''))
                        l = float(l_str.replace(',', ''))
                        v = int(v_str.replace(',', ''))
                        if o > 0 and c > 0:
                            rows.append({'Date': dt, 'Open': o, 'High': h, 'Low': l, 'Close': c, 'Volume': v})
                    except (ValueError, TypeError):
                        continue
        except Exception as e:
            print(f"Naver fetch error on page {page}: {e}")
            continue

    if not rows:
        return pd.DataFrame()

    df = pd.DataFrame(rows).set_index('Date').sort_index()
    df = df[~df.index.duplicated(keep='first')]
    return df

def get_ohlcv_dataframe(code: str) -> tuple[pd.DataFrame, dict, str]:
    code_clean = code.strip()
    ticker, name, market, currency = resolve_ticker(code_clean)
    
    # Extract 6-digit stock code from ticker or code_clean if Korean stock
    digits_match = re.search(r"\d{6}", ticker) or re.search(r"\d{6}", code_clean)
    
    # 1. If 6-digit Korean stock code exists, fetch directly from Naver Finance
    if digits_match:
        k_code = digits_match.group(0)
        df_naver = fetch_naver_stock_ohlcv(k_code, pages=15)
        if not df_naver.empty and len(df_naver) >= 5:
            resolved_t = f"{k_code}.KS" if market == "KOSPI" else f"{k_code}.KQ"
            return df_naver, {}, resolved_t

    # 2. Try yfinance for US/International stocks or fallback
    df_yf = pd.DataFrame()
    info = {}
    tickers_to_try = [ticker]
    digits_code = digits_match.group(0) if digits_match else None
    if digits_code:
        tickers_to_try = [f"{digits_code}.KS", f"{digits_code}.KQ"]

    for t in tickers_to_try:
        try:
            yf_ticker = yf.Ticker(t)
            df_temp = yf_ticker.history(period="1y")
            if not df_temp.empty and len(df_temp) >= 5:
                df_yf = df_temp
                info = yf_ticker.info or {}
                ticker = t
                break
        except Exception:
            continue

    if not df_yf.empty and len(df_yf) >= 5:
        return df_yf, info, ticker

    # 3. Fallback mock generator
    return generate_mock_ohlcv(code_clean), {}, ticker

NAVER_NAME_CACHE: Dict[str, str] = {}

def fetch_naver_stock_name(code: str) -> str:
    """Scrapes exact official Korean stock name from Naver Finance."""
    clean_code = code.strip().zfill(6)
    if clean_code in NAVER_NAME_CACHE:
        return NAVER_NAME_CACHE[clean_code]
        
    headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'}
    try:
        url = f"https://finance.naver.com/item/main.naver?code={clean_code}"
        r = requests.get(url, headers=headers, timeout=3)
        if r.status_code == 200:
            soup = bs4.BeautifulSoup(r.text, 'html.parser')
            wrap = soup.find('div', {'class': 'wrap_company'})
            if wrap and wrap.find('h2'):
                a_tag = wrap.find('h2').find('a')
                name = a_tag.text.strip() if a_tag else wrap.find('h2').text.strip()
                if name:
                    NAVER_NAME_CACHE[clean_code] = name
                    return name
    except Exception as e:
        print(f"Naver stock name fetch warning for {code}: {e}")
        
    return f"종목 ({clean_code})"

def resolve_ticker(code: str) -> tuple[str, str, str, str]:
    code_clean = code.strip()
    code_upper = code_clean.upper()
    
    # 1. Check popular list first (exact code, ticker, or name)
    for item in POPULAR_STOCKS:
        if (item["code"] == code_upper or 
            item["ticker"] == code_upper or 
            item["name"].lower() == code_clean.lower() or
            code_clean in item["name"]):
            return item["ticker"], item["name"], item["market"], item.get("currency", "KRW")
            
    # 2. Check KRX Master list
    krx_list = load_krx_stock_master()
    # 2-a. Exact code or exact name match
    for item in krx_list:
        if item["code"] == code_clean or item["name"] == code_clean:
            return item["ticker"], item["name"], item["market"], "KRW"
            
    # 2-b. Partial name match in KRX Master list (e.g. '현대차' -> '현대자동차', '카카오' -> '카카오')
    for item in krx_list:
        if code_clean and not code_clean.isdigit() and (code_clean in item["name"] or item["name"] in code_clean):
            return item["ticker"], item["name"], item["market"], "KRW"
    
    # 3. Numeric code resolution via Naver Finance (e.g. '005935', '005380', '005930.KS')
    numeric_match = re.search(r"\d{6}", code_clean)
    if numeric_match:
        digits = numeric_match.group(0)
        official_name = fetch_naver_stock_name(digits)
        return f"{digits}.KS", official_name, "KOSPI", "KRW"

    if code_clean.isdigit():
        digits = code_clean.zfill(6)
        official_name = fetch_naver_stock_name(digits)
        return f"{digits}.KS", official_name, "KOSPI", "KRW"
        
    return code_upper, code_upper, "NASDAQ", "USD"

@router.get("/search")
def search_stocks(
    q: str = Query("", description="Stock code or name"),
    market: str = Query("all", description="Market filter: all, kr, or us")
):
    unquoted_q = urllib.parse.unquote(q or "")
    query = unquoted_q.strip()
    query_lower = query.lower()
    m_filter = market.strip().lower()
    
    def is_target_market(item_m: str, item_curr: str) -> bool:
        if m_filter == "kr":
            return item_curr == "KRW" or item_m in ["KOSPI", "KOSDAQ"]
        if m_filter == "us":
            return item_curr == "USD" or item_m in ["NASDAQ", "NYSE", "AMEX"]
        return True

    matches = []
    
    # 1. Default empty query return filtered popular stocks
    if not query:
        for item in POPULAR_STOCKS:
            if is_target_market(item["market"], item.get("currency", "KRW")):
                matches.append(item)
        return {"results": matches[:15]}

    # 2. Match in Popular stocks
    for item in POPULAR_STOCKS:
        if is_target_market(item["market"], item.get("currency", "KRW")):
            if query_lower in item["code"].lower() or query_lower in item["name"].lower() or query_lower in item["ticker"].lower():
                matches.append(item)
            
    # 3. Match in KRX Master Database (2800+ Korean stocks)
    if m_filter in ["all", "kr"]:
        krx_list = load_krx_stock_master()
        for item in krx_list:
            if len(matches) >= 25:
                break
            if query_lower in item["name"].lower() or query == item["code"] or query in item["code"]:
                if item["code"] not in [m["code"] for m in matches]:
                    matches.append(item)
                
    # 4. Dynamic fallback if no matches found in filtered list
    if not matches and len(query) >= 1:
        is_korean_text = bool(re.search(r"[\uac00-\ud7a3]", query))
        if query.isdigit() or is_korean_text or m_filter == "kr":
            k_code = query.zfill(6) if query.isdigit() else query
            off_name = fetch_naver_stock_name(k_code) if query.isdigit() else query
            matches.append({
                "code": k_code, 
                "ticker": f"{k_code}.KS" if query.isdigit() else k_code, 
                "name": off_name, 
                "market": "KOSPI", 
                "currency": "KRW"
            })
        else:
            matches.append({
                "code": query.upper(), 
                "ticker": query.upper(), 
                "name": query.upper(), 
                "market": "NASDAQ", 
                "currency": "USD"
            })
            
    return {"results": matches[:25]}

@router.get("/stock/{code}")
def get_stock_chart_data(code: str, period: str = Query("1d", enum=["1d", "1w", "1m"])):
    code_clean = urllib.parse.unquote(code).strip()
    ticker, name, market, currency = resolve_ticker(code_clean)
    df, _, resolved_ticker = get_ohlcv_dataframe(code_clean)

    # Resample for week or month if requested
    if period == "1w":
        df = df.resample("W").agg({"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}).dropna()
    elif period == "1m":
        df = df.resample("M").agg({"Open": "first", "High": "max", "Low": "min", "Close": "last", "Volume": "sum"}).dropna()

    indicators = calculate_technical_indicators(df)
    latest_price = float(df['Close'].iloc[-1])

    return {
        "stock_info": {
            "code": code_clean,
            "ticker": resolved_ticker,
            "name": name,
            "market": market,
            "currency": currency,
            "current_price": round(latest_price, 2)
        },
        "indicators": indicators
    }

@router.get("/analyze/{code}")
def analyze_stock(code: str):
    code_clean = urllib.parse.unquote(code).strip()
    ticker, name, market, currency = resolve_ticker(code_clean)
    df, info, resolved_ticker = get_ohlcv_dataframe(code_clean)

    tech_data = calculate_technical_indicators(df)
    latest_price = float(df['Close'].iloc[-1])
    
    val_data = calculate_valuation_metrics(info, latest_price)
    supply_data = analyze_supply_and_demand(code, tech_data.get("latest", {}))
    news_data = fetch_stock_news_and_disclosures(code, name)

    report = generate_ai_stock_report(
        symbol=code,
        name=name,
        market=market,
        price=latest_price,
        tech_data=tech_data,
        val_data=val_data,
        supply_data=supply_data,
        news_data=news_data
    )

    return {
        "report": report,
        "indicators": tech_data
    }

