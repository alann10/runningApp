import React from 'react';
import '../styles/Controls.css';

const Controls = ({ isRunning, onStart, onStop, isLoading }) => {
  return (
    <div className="controls">
      {!isRunning ? (
        <button 
          className={`control-button start-button ${isLoading ? 'disabled' : ''}`}
          onClick={onStart}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Start'}
        </button>
      ) : (
        <button 
          className="control-button stop-button"
          onClick={onStop}
        >
          Stop
        </button>
      )}
    </div>
  );
};

export default Controls;
