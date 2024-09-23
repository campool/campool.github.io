import assert from "assert";
import { parseLeagueResults } from "./league";

test('parse current result', () => {
  const results = parseLeagueResults("./public/leagues")
  assert(results.length >= 1, `Leagues found ${results.length}`)
  results.forEach(result => {
    const numPlayers = Object.keys(result.players).length;
    assert(numPlayers > 4);
    assert(result.standings.length === numPlayers);
  });
})
