import league202409Info from "./data/league202409/leagueinfo";
import league202409Players from "./data/league202409/players";
import league202409Results from "./data/league202409/results";


export const LEAGUE_INFO_FILE_NAME = "leagueinfo.json";
export const PLAYERS_FILE_NAME = "players.json";
export const RESULTS_DIR_NAME = "results";

export interface LeagueInfo {
  readonly name: string;
  readonly started: Date;
  readonly format: string;
  readonly winnerPoint: number;
  readonly perPairMatches: number;
  readonly finished: boolean;
}

export interface Player {
  readonly id: string;
  readonly name: string;
}

export interface MatchResult {
  readonly matchDay?: Date;
  readonly player1Id: string;
  readonly player2Id: string;
  readonly player1Score: number;
  readonly player2Score: number;
  readonly rackWinners?: string[];
}

export interface StandingItem {
  rank: number;
  readonly player: Player;
  readonly played: number;
  readonly won: number;
  readonly points: number;
  readonly racksFor: number;
  readonly racksAgainst: number;
  readonly rackDifference: number;
  readonly matches: MatchResult[];
}

export interface LeagueResult {
  readonly league: LeagueInfo;
  readonly players: {[k: string]: Player};
  readonly results: MatchResult[];
  readonly standings: StandingItem[];
}

function parseLeagueInfo(json: any): LeagueInfo {
  return {
    name: json.name,
    started: new Date(json.started),
    format: json.format,
    winnerPoint: json.winnerPoint || 1,
    perPairMatches: json.perPairMatches || 1,
    finished: json.finished || false,
  };
}

function parsePlayersInfo(json: {[k1: string]: {[k2: string]: string}}): {[k: string]: Player} {
  const players: {[k: string]: Player} = {};
  for (let playerId in json) {
    const playerInfo = json[playerId];
    players[playerId] = {
      id: playerId,
      name: playerInfo.name,
    };
  }
  return players;
}

function parseResult(json: {[k: string]: number}[], players: {[k: string]: Player}): MatchResult[] {
  return json.map(result => {
    const playerIds: string[] = [];
    for (let key in result) {
      if (!(key in players)) {
        throw Error(`Invalid player with id ${key}`);
      }
      playerIds.push(key);
    }
    if (result[playerIds[0]] === result[playerIds[1]]) {
      throw Error(`Tie detected`);
    }
    return {
      player1Id: playerIds[0],
      player2Id: playerIds[1],
      player1Score: result[playerIds[0]],
      player2Score: result[playerIds[1]],
    }
  })
}

function standingComparator(item1: StandingItem, item2: StandingItem): number {
  const pointsDelta = item2.points - item1.points;
  if (pointsDelta === 0) {
    const rackDiffDelta = item2.rackDifference - item1.rackDifference
    if (rackDiffDelta === 0) {
      return item2.racksFor - item1.racksFor;
    }
    return rackDiffDelta;
  }
  return pointsDelta;
}

function calculateRackDifference(playerId: string, result: MatchResult) {
  if (playerId === result.player1Id) {
    return result.player1Score - result.player2Score;
  }
  if (playerId === result.player2Id) {
    return result.player2Score - result.player1Score;
  }
  throw Error(`${playerId} didn't play the match`);
}

function calculateRacksFor(playerId: string, result: MatchResult) {
  if (playerId === result.player1Id) {
    return result.player1Score;
  }
  if (playerId === result.player2Id) {
    return result.player2Score;
  }
  throw Error(`${playerId} didn't play the match`);
}

function calculateRacksAgainst(playerId: string, result: MatchResult) {
  if (playerId === result.player1Id) {
    return result.player2Score;
  }
  if (playerId === result.player2Id) {
    return result.player1Score;
  }
  throw Error(`${playerId} didn't play the match`);
}

function calculateStandings(league: LeagueInfo, results: MatchResult[], players: {[k: string]: Player}): StandingItem[] {
  const standings: StandingItem[] = [];
  for (let playerId in players) {
    const matches = results
      .filter(result => result.player2Id === playerId || result.player1Id === playerId)
    const differences = matches.map(result => calculateRackDifference(playerId, result));
    const won = differences.filter(x => x > 0).length;
    standings.push({
      rank: 1,
      player: players[playerId],
      played: matches.length,
      won,
      points: won * league.perPairMatches,
      racksFor: matches.map(result => calculateRacksFor(playerId, result)).reduce((acc, x) => acc+x),
      racksAgainst: matches.map(result => calculateRacksAgainst(playerId, result)).reduce((acc, x) => acc+x),
      rackDifference: differences.reduce((acc, x) => x+acc),
      matches,
    })
  }
  standings.sort(standingComparator);
  for (let i = 1; i < standings.length; i ++) {
    let rankIncrement = 0;
    if (standingComparator(standings[i-1], standings[i]) !== 0) {
      rankIncrement = 1;
    }
    standings[i].rank = standings[i-1].rank + rankIncrement;
  }
  return standings;
}

function calculateResultForLeague(leagueJson: any, playersJson: any, resultsJson: any): LeagueResult {
  const players = parsePlayersInfo(playersJson);
  const results = parseResult(resultsJson, players);
  const league = parseLeagueInfo(leagueJson);
  const standings: StandingItem[] = calculateStandings(league, results, players);
  return { players, results, league, standings };
}

export function parseLeagueResults(): LeagueResult[] {
  return [
    calculateResultForLeague(league202409Info, league202409Players, league202409Results),
  ];
}
