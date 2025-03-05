import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/HomePage.css';

function HomePage() {
  const [miles, setMiles] = useState('');
  const navigate = useNavigate();

  const handleStartRun = () => {
    if (miles) {
      navigate(`/run?distance=${miles}`);
    }
  };

  return (
    <div className="home-container">
      <h1 className="title">Ready to Run?</h1>
      <div className="input-section">
        <h2 className="subtitle">How many miles today?</h2>
        <input
          type="number"
          value={miles}
          onChange={(e) => setMiles(e.target.value)}
          className="miles-input"
          placeholder="Enter miles"
          min="0.0"
          step="0.5"
        />
      </div>
      <button 
        className="run-button"
        onClick={handleStartRun}
        disabled={!miles}
      >
        Run
      </button>
    </div>
  );
}

export default HomePage;
