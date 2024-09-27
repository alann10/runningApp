import React from 'react';

function Controls({ isRunning, onStart, onStop }) {
  return (
    <div>
      {isRunning ? (
        <button onClick={onStop}>Stop Run</button>
      ) : (
        <button onClick={onStart}>Start Run</button>
      )}
    </div>
  );
}

export default Controls;
