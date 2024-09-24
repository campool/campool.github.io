import "./LeagueStanding.css"
import { LeagueResult } from "../league";

export function LeagueStanding(props: LeagueResult){
  return (
    <div>
      <h2>{props.league.name}</h2>
      <p>Format: {props.league.format}</p>
      <h3>Standing</h3>
      <table>
        <tr>
          <th>Rank</th>
          <th>Player</th>
          <th>Played</th>
          <th>Points</th>
          <th>Rack Difference</th>
        </tr>
        {props.standings.map(standing =>
          <tr>
            <td> {standing.rank} </td>
            <td> {standing.player.name} </td>
            <td> {standing.played} </td>
            <td> <b>{standing.points}</b> </td>
            <td> {standing.rackDifference} </td>
          </tr>
        )}
      </table>
    </div>
  );
}
