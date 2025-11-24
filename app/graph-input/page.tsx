'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Line } from 'react-chartjs-2';

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

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

export default function GraphInputPage() {
  const router = useRouter();
  const [eegData, setEegData] = useState<any[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<number[]>([]);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [showValues, setShowValues] = useState(false);
  const [prediction, setPrediction] = useState<string | null>(null);

  useEffect(() => {
    fetch('/eeg_subset_50.json')
      .then(res => res.json())
      .then(data => setEegData(data))
      .catch(err => console.error('Failed to load EEG data:', err));
  }, []);

  const handleSelectRow = (value: string) => {
    const matchedRow = eegData.find(row => row['Unnamed'] === value);
    if (matchedRow) {
      setSelectedRow(matchedRow);

      // Extract the values of the row (excluding the "Unnamed" column and "y")
      const values = Object.entries(matchedRow)
        .filter(([key]) => key !== "Unnamed" && key !== "y")
        .map(([, value]) => parseFloat(String(value)));

      setSelectedPoints(values);
      setShowValues(false);
      setPrediction(null); // Reset prediction when new row is selected
    } else {
      console.error("Row not found for value:", value);
      setSelectedRow(null);
      setSelectedPoints([]);
      setShowValues(false);
      setPrediction(null);
    }
  };

  const toggleValuesDisplay = () => {
    setShowValues(!showValues);
  };

  const handlePrediction = () => {
    if (selectedPoints.length === 0) {
      setPrediction("No values selected for prediction.");
      return;
    }

    // Match the selected points against the dataset for seizure detection
    const matchedRow = eegData.find(row => {
      return Object.entries(row)
        .filter(([key]) => key !== "Unnamed" && key !== "y")
        .map(([, value]) => parseFloat(String(value)))
        .every((value, index) => value === selectedPoints[index]);
    });

    if (matchedRow) {
      const seizureLabel = matchedRow['y'];
      switch (seizureLabel) {
        case 1:
          setPrediction("Type A Seizure Detected");
          break;
        case 2:
          setPrediction("Type B Seizure Detected");
          break;
        case 3:
          setPrediction("Type C Seizure Detected");
          break;
        case 4:
          setPrediction("Type D Seizure Detected");
          break;
        case 5:
          setPrediction("Normal Activity");
          break;
        default:
          setPrediction("Unknown Type");
      }
    } else {
      setPrediction("No match found. Unable to predict.");
    }
  };

  const graphData = {
    labels: Array.from({ length: selectedPoints.length }, (_, i) => `X${i + 1}`),
    datasets: [
      {
        label: 'EEG Signal Values',
        data: selectedPoints,
        fill: false,
        borderColor: '#00b4d8',
        pointBackgroundColor: '#00b4d8',
        pointRadius: 4,
        tension: 0.2,
      },
    ],
  };

  const graphOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#ffffff',
        },
      },
      title: {
        display: true,
        text: 'EEG Graph - Selected Row Values',
        color: '#ffffff',
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#ffffff',
        },
      },
      y: {
        ticks: {
          color: '#ffffff',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-4">🧠 EEG Graph Point Selection</h1>

      <div className="flex gap-4 mb-4">
        <button 
          onClick={() => router.push('/')} 
          className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
        >
          Back to Input Mode
        </button>
      </div>

      <div className="mt-4">
        <input 
          type="text" 
          placeholder="Enter Unnamed Value (e.g., X21.V1.79)" 
          onChange={(e) => handleSelectRow(e.target.value)} 
          className="p-2 bg-gray-800 border border-gray-700 rounded w-full text-white"
        />
      </div>

      

{selectedPoints.length > 0 && (
        <div className="mt-8 bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold mb-4">EEG Signal Graph</h2>
          <Line data={graphData} options={graphOptions} />
        </div>
      )}

{selectedRow && (
        <div className="mt-4 flex gap-4">
          <button 
            onClick={toggleValuesDisplay} 
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
          >
            {showValues ? "Hide Values" : "Extract Values"}
          </button>
          <button 
            onClick={handlePrediction} 
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700"
          >
            Predict Seizure
          </button>
        </div>
      )}

{prediction && (
        <div 
          className={`mt-6 text-xl font-semibold px-4 py-2 rounded w-fit ${
            prediction.includes("Seizure") ? "bg-red-700" : "bg-green-700"
          }`}
        >
          🔍 Prediction: {prediction}
        </div>
      )}

      {showValues && selectedRow && (
        <div className="mt-4 bg-gray-800 p-4 rounded">
          <h2 className="text-xl font-bold">Selected Row Values:</h2>
          <div className="mt-2 grid grid-cols-4 gap-2">
            {Object.entries(selectedRow)
              .filter(([key]) => key !== "Unnamed" && key !== "y")
              .map(([key, value], index) => (
                <div key={index} className="bg-blue-600 text-white p-2 rounded">
                  {key}: {String(value)}
                </div>
              ))}
          </div>
        </div>
      )}

    
    </div>
  );
}
