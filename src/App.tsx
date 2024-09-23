import './App.css';
import { parseLeagueResults } from './league';

function App() {
  const leagueResult = parseLeagueResults("./public/leagues")[0];
  return (
    <div className="App">
      <header className="App-header">
        <p>
          {JSON.stringify(leagueResult)}
        </p>
      </header>
    </div>
  );
}

export default App;
