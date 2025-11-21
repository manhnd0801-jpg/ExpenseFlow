/**
 * Expense Chart Component
 * Displays expense breakdown and trends using Chart.js
 */
import { Card } from 'antd';
import Chart from 'chart.js/auto';
import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { formatCurrency } from '../../../utils/formatters';

interface IChartData {
  label: string;
  value: number;
  color?: string;
}

interface IExpenseChartProps {
  data: IChartData[];
  title?: string;
  type: 'pie' | 'doughnut' | 'bar' | 'line';
  height?: number;
}

const ChartWrapper = styled.div<{ $height?: number }>`
  .chart-container {
    position: relative;
    height: ${(props) => props.$height || 300}px;
    margin: 16px 0;
  }

  .chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
    margin-top: 16px;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;

      .legend-color {
        width: 12px;
        height: 12px;
        border-radius: 2px;
      }

      .legend-text {
        color: #595959;
      }
    }
  }
`;

const defaultColors = [
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
  '#4BC0C0',
  '#9966FF',
  '#FF9F40',
  '#FF6384',
  '#C9CBCF',
  '#4BC0C0',
  '#FF6384',
  '#36A2EB',
  '#FFCE56',
];

export const ExpenseChart: React.FC<IExpenseChartProps> = ({
  data,
  title = 'Biểu đồ chi tiêu',
  type = 'doughnut',
  height = 300,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data.length) return;

    // Destroy existing chart
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // Prepare chart data
    const chartData = {
      labels: data.map((item) => item.label),
      datasets: [
        {
          data: data.map((item) => item.value),
          backgroundColor: data.map(
            (item, index) => item.color || defaultColors[index % defaultColors.length]
          ),
          borderWidth: type === 'pie' || type === 'doughnut' ? 1 : 0,
          borderColor: '#fff',
        },
      ],
    };

    // Chart options based on type
    let chartOptions: any = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false, // We'll create custom legend
        },
        tooltip: {
          callbacks: {
            label: function (context: any) {
              const value = context.raw;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
            },
          },
        },
      },
    };

    // Specific options for different chart types
    if (type === 'doughnut' || type === 'pie') {
      chartOptions.cutout = type === 'doughnut' ? '60%' : '0%';
    } else if (type === 'bar') {
      chartOptions.scales = {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value: any) {
              return formatCurrency(value);
            },
          },
        },
      };
    } else if (type === 'line') {
      chartOptions.scales = {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value: any) {
              return formatCurrency(value);
            },
          },
        },
      };
      chartOptions.elements = {
        point: {
          radius: 4,
          hoverRadius: 6,
        },
        line: {
          tension: 0.4,
        },
      };
    }

    // Create new chart
    chartRef.current = new Chart(ctx, {
      type: type,
      data: chartData,
      options: chartOptions,
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [data, type, height]);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card title={title}>
      <ChartWrapper $height={height}>
        <div className="chart-container">
          <canvas ref={canvasRef}></canvas>
        </div>

        {/* Custom Legend */}
        <div className="chart-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <div
                className="legend-color"
                style={{
                  backgroundColor: item.color || defaultColors[index % defaultColors.length],
                }}
              />
              <span className="legend-text">
                {item.label}: {formatCurrency(item.value)}
                {total > 0 && ` (${((item.value / total) * 100).toFixed(1)}%)`}
              </span>
            </div>
          ))}
        </div>
      </ChartWrapper>
    </Card>
  );
};

export default ExpenseChart;
