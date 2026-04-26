import React, { useEffect, useRef, memo } from 'react';

const TradingViewChart = ({ symbol = 'BTC/USDT', timeframe = '15m' }) => {
  const container = useRef();

  useEffect(() => {
    // Transform symbol format: BTC/USDT -> BINANCE:BTCUSDT
    const baseSymbol = symbol.split('/')[0];
    const quoteSymbol = symbol.split('/')[1] || 'USDT';
    const tvSymbol = `BINANCE:${baseSymbol}${quoteSymbol}`;

    // Transform timeframe: 1h -> 60, 1d -> D, etc.
    // TradingView Widget interval mapping
    const intervalMap = {
      '1m': '1',
      '3m': '3',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '2h': '120',
      '4h': '240',
      '1d': 'D',
      '1w': 'W',
    };
    const interval = intervalMap[timeframe] || '15';

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.type = "text/javascript";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          "autosize": true,
          "symbol": tvSymbol,
          "interval": interval,
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "en",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "save_image": false,
          "container_id": "tradingview_chart_container",
          "backgroundColor": "#031427",
          "gridColor": "rgba(255, 255, 255, 0.06)",
          "hide_side_toolbar": false,
          "allow_symbol_change": true,
          "details": true,
          "hotlist": true,
          "calendar": true,
          "show_popup_button": true,
          "popup_width": "1000",
          "popup_height": "650"
        });
      }
    };
    
    if (container.current) {
        container.current.innerHTML = '<div id="tradingview_chart_container" style="height: 100%; width: 100%;"></div>';
        container.current.appendChild(script);
    }

    return () => {
        if (container.current) {
            container.current.innerHTML = '';
        }
    };
  }, [symbol, timeframe]);

  return (
    <div className="w-full h-full rounded-lg overflow-hidden border border-slate-800/50" ref={container} style={{ height: "100%", width: "100%" }}>
      <div id="tradingview_chart_container" style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default memo(TradingViewChart);
