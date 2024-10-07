import React from "react";

function CompletionScreen({ distance }) {
  return (
    <div className="completion-screen">
      <h1>Congratulations!</h1>
      <p>You did it, {distance} miles!</p>
    </div>
  );
}

export default CompletionScreen;

