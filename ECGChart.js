import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';

// Register Chart.js components
Chart.register(...registerables);

const ECGChart = ({ 
  data, 
  label = 'ECG Data', 
  color = 'rgb(75, 192, 192)',
  height = 200,
  showGrid = false
}) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // If no data, create dummy data
    const chartData = data?.length > 0 ? data : Array(100).fill(0);
    
    // Create labels (time in milliseconds)
    const labels = chartData.map((_, index) => index);

    // If chart exists, destroy it first
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Create new chart
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: chartData,
            borderColor: color,
            backgroundColor: 'rgba(0, 0, 0, 0)',
            borderWidth: 1.8,
            pointRadius: 0,
            tension: 0.1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
          duration: 0
        },
        scales: {
          x: {
            display: false,
            grid: {
              display: false
            }
          },
          y: {
            display: false,
            grid: {
              display: false
            },
            ticks: {
              display: false
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: false
          }
        },
        elements: {
          line: {
            borderWidth: 1.8
          },
          point: {
            radius: 0
          }
        }
      }
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, label, color, showGrid]);

  return (
    <div className="ecg-container" style={{ 
      height: `${height}px`, 
      backgroundColor: 'transparent',
      position: 'relative'
    }}>
      <canvas ref={chartRef} height={height}></canvas>
    </div>
  );
};

export default ECGChart;