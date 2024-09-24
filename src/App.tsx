import './App.css';
import { parseLeagueResults } from './league';
import { LeagueStanding } from './league/LeagueStanding';

function App() {
  const leagueResult = parseLeagueResults()[0];
  return (
    <div className="App">
      <LeagueStanding {...leagueResult} />
    </div>
  );
}

export default App;
