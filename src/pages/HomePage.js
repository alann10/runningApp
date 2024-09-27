import React from 'react';
import { Link } from 'react-router-dom';

function HomePage() {
  return (
    <div>
      <h1>Home Page</h1>
      <nav>
        <ul>
          <li><Link to="/run">Start a Run</Link></li>
          <li><Link to="/history">View Run History</Link></li>
        </ul>
      </nav>
    </div>
  );
}

export default HomePage;
