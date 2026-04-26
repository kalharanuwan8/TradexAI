import React, { useEffect, useRef } from 'react';
import {
  Chart,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  BarElement,
  BarController
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { CandlestickController, CandlestickElement, OhlcController, OhlcElement } from 'chartjs-chart-financial';

Chart.register(
  CandlestickController,
  CandlestickElement,
  OhlcController,
  OhlcElement,
  LinearScale,
  TimeScale,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LineController,
  CategoryScale,
  BarElement,
  BarController
);

export default function CandlestickChart({ candles, indicators, timeframe }) {
  const chartRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    // Basic validation
    if (!candles || !Array.isArray(candles) || candles.length === 0 || !chartRef.current) return;

    if (instanceRef.current) {
      instanceRef.current.destroy();
    }

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    // Sanitize and limit displayed candles
    const validCandles = candles.filter(c => 
      c && typeof c.open === 'number' && !isNaN(c.open) &&
      typeof c.close === 'number' && !isNaN(c.close) &&
      typeof c.high === 'number' && !isNaN(c.high) &&
      typeof c.low === 'number' && !isNaN(c.low)
    );

    if (validCandles.length === 0) return;

    const displayCandles = validCandles.slice(-120);

    const candleData = displayCandles.map(c => ({
      x: c.timestamp,
      o: c.open,
      h: c.high,
      l: c.low,
      c: c.close,
    }));

    // Build EMA series safely
    const emaShortSeries = indicators?.emaShortSeries || [];
    const emaLongSeries = indicators?.emaLongSeries || [];

    const emaShortData = displayCandles.map((c, i) => {
      const idx = candles.indexOf(c);
      const val = emaShortSeries[idx];
      return (typeof val === 'number' && !isNaN(val)) ? { x: c.timestamp, y: val } : null;
    }).filter(Boolean);

    const emaLongData = displayCandles.map((c, i) => {
      const idx = candles.indexOf(c);
      const val = emaLongSeries[idx];
      return (typeof val === 'number' && !isNaN(val)) ? { x: c.timestamp, y: val } : null;
    }).filter(Boolean);

    // Volume data
    const volumeData = displayCandles.map(c => ({
      x: c.timestamp,
      y: typeof c.volume === 'number' ? c.volume : 0,
      isUp: c.close >= c.open,
    }));

    instanceRef.current = new Chart(ctx, {
      data: {
        datasets: [
          {
            type: 'candlestick',
            label: 'Price',
            data: candleData,
            // Using standard Chart.js color format for financial plugin
            color: {
              up: '#00ff87',
              down: '#ff4d6d',
              unchanged: '#94a3b8',
            },
            borderColor: '#94a3b8', // Fallback border
            backgroundColors: { // Some versions use this
              up: '#00ff87',
              down: '#ff4d6d',
              unchanged: '#94a3b8',
            },
            yAxisID: 'y',
            order: 1,
          },
          {
            type: 'line',
            label: 'EMA 9',
            data: emaShortData,
            borderColor: '#00d4ff',
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.3,
            yAxisID: 'y',
            order: 2,
          },
          {
            type: 'line',
            label: 'EMA 21',
            data: emaLongData,
            borderColor: '#ff7a1a',
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.3,
            yAxisID: 'y',
            order: 3,
          },
          {
            type: 'bar',
            label: 'Volume',
            data: volumeData.map(v => ({ x: v.x, y: v.y })),
            backgroundColor: volumeData.map(v =>
              v.isUp ? 'rgba(0,255,135,0.15)' : 'rgba(255,77,109,0.15)'
            ),
            borderColor: volumeData.map(v =>
              v.isUp ? 'rgba(0,255,135,0.4)' : 'rgba(255,77,109,0.4)'
            ),
            borderWidth: 1,
            yAxisID: 'volume',
            order: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false, // Performance
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: 'rgba(255,255,255,0.4)',
              font: { family: 'Inter', size: 10 },
              boxWidth: 8,
              padding: 10,
              filter: item => item.text !== 'Volume',
            },
          },
          tooltip: {
            enabled: true,
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            titleColor: '#38bdf8',
            bodyColor: '#f1f5f9',
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.1)',
            padding: 10,
            callbacks: {
              label: (ctx) => {
                if (ctx.dataset.type === 'candlestick') {
                  const { o, h, l, c } = ctx.raw;
                  return [
                    `O: ${o.toFixed(2)}`,
                    `H: ${h.toFixed(2)}`,
                    `L: ${l.toFixed(2)}`,
                    `C: ${c.toFixed(2)}`
                  ];
                }
                return `${ctx.dataset.label}: ${ctx.raw.y?.toFixed(2)}`;
              }
            }
          }
        },
        scales: {
          x: {
            type: 'time',
            time: {
              unit: ['1m', '5m', '15m'].includes(timeframe) ? 'hour' : 'day',
              displayFormats: { hour: 'HH:mm', day: 'MMM d' },
            },
            grid: { display: false },
            ticks: { color: '#64748b', font: { size: 9 } }
          },
          y: {
            position: 'right',
            grid: { color: 'rgba(255,255,255,0.05)' },
            ticks: { color: '#94a3b8', font: { size: 10 } }
          },
          volume: {
            display: false,
            position: 'left',
            grid: { display: false },
            min: 0,
          }
        },
      },
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, [candles, indicators, timeframe]);

  return (
    <div className="w-full h-full min-h-[400px]">
      <canvas ref={chartRef} />
    </div>
  );
}