// src/components/AverageImprovementChart.js
// src/components/diagram.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Diagram = () => {
  const data = {
    labels: ['Learner 1', 'Learner 2', 'Learner 3', 'Learner 4', 'Learner 5'],
    datasets: [
      {
        label: 'Average Improvement (%)',
        data: [16.5, 15.0, 18.0, 14.5, 18.0], // your table data
        backgroundColor: 'rgba(75, 192, 192, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: {
        display: true,
        text: 'Average Improvement of Learners',
      },
    },
    scales: {
      y: { beginAtZero: true, max: 20 },
    },
  };

  return <Bar data={data} options={options} />;
};

export default Diagram;