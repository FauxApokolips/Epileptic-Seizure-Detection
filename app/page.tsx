'use client';
import { useState, useEffect } from 'react';
import '../globals.css';
import { Line } from 'react-chartjs-2';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// ✅ Registering all necessary components
ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function EEGInputPage() {
  const router = useRouter();
  const [inputValues, setInputValues] = useState<string[]>(Array(178).fill(''));
  const [prediction, setPrediction] = useState<string | null>(null);
  const [eegData, setEegData] = useState<any[]>([]);
  const [graphData, setGraphData] = useState<number[]>([]);

  useEffect(() => {
    fetch('/eeg_subset_50.json')
      .then(res => res.json())
      .then(data => setEegData(data))
      .catch(err => console.error('Failed to load EEG data:', err));
  }, []);

  const handleChange = (index: number, value: string) => {
    const updated = [...inputValues];
    updated[index] = value;
    setInputValues(updated);
  };

  const handleAutoFill = () => {
    if (eegData.length === 0) {
      console.error("Dataset not loaded");
      return;
    }

    const randomIndex = Math.floor(Math.random() * eegData.length);
    const randomRow = eegData[randomIndex];
    console.log("Random Row Selected (Index):", randomIndex);
    console.log("Random Row Data:", randomRow);

    const values = Array.from({ length: 178 }, (_, i) => {
      const val = parseFloat(randomRow[`X${i + 1}`]);
      return !isNaN(val) ? val.toFixed(2) : '0';
    });

    console.log("Auto-filled values:", values);
    setInputValues(values);
    setGraphData(values.map(Number)); // Set graph data for chart
    setPrediction(randomRow.y.toString());
  };

  const getPredictionMessage = () => {
    if (prediction === '1') return 'No Seizure - Normal State';
    if (prediction === '2') return 'Type A - Focal Seizure Detected';
    if (prediction === '3') return 'Type B - Generalized Seizure Detected';
    if (prediction === '4') return 'Type C - Preictal State of Seizure';
    if (prediction === '5') return 'Type D - Ictal State of Seizure';
    return 'No match found in dataset';
  };

  const graphOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
      title: {
        display: true,
        text: `EEG Signal Visualization - ${getPredictionMessage()}`,
        color: '#ffffff',
        font: {
          size: 16
        }
      },
    },
    scales: {
      x: {
        grid: {
          color: '#444',
        },
        ticks: {
          color: '#ffffff',
        },
      },
      y: {
        grid: {
          color: '#444',
        },
        ticks: {
          color: '#ffffff',
        },
      },
    },
  };

  const graphDataConfig = {
    labels: Array.from({ length: 178 }, (_, i) => `X${i + 1}`),
    datasets: [
      {
        label: prediction ? getPredictionMessage() : 'EEG Signal',
        data: graphData,
        borderColor: prediction === '1' ? 'red' : 'green',
        backgroundColor: prediction === '1' ? 'rgba(255,0,0,0.2)' : 'rgba(0,255,0,0.2)',
        borderWidth: 2,
        pointRadius: 2,
        fill: true,
        tension: 0.2,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">🧠 EEG Seizure Prediction</h1>

      <form className="grid grid-cols-3 gap-2 max-h-[500px] overflow-y-scroll mb-4">
        {inputValues.map((value, index) => (
          <input
            key={index}
            type="number"
            step="any"
            className="p-2 bg-gray-800 border border-gray-700 rounded"
            placeholder={`X${index + 1}`}
            value={value}
            onChange={e => handleChange(index, e.target.value)}
          />
        ))}
      </form>

      <div className="flex gap-4 mt-4">
        <button onClick={handleAutoFill} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
          Auto-Fill Demo
        </button>

        <button 
          onClick={() => router.push('/graph-input')} 
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Switch to Graph Mode
        </button>

      </div>

      {prediction && (
        <div
          className={`mt-6 text-xl font-semibold px-4 py-2 rounded w-fit ${
            prediction === '1' ? 'bg-red-700 text-white' : 'bg-green-700 text-white'
          }`}
        >
          🔍 Prediction: {getPredictionMessage()}
        </div>
      )}

      {graphData.length > 0 ? (
        <div className="mt-8 bg-gray-800 p-4 rounded">
          <Line data={graphDataConfig} options={graphOptions} />
        </div>
      ) : (
        <div className="mt-8 text-yellow-400">Graph will display here after Auto-Fill.</div>
      )}
    </div>
  );
}
