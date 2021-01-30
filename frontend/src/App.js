import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  login,
  registerGame,
  submitGameResult,
  useGetPlayers,
} from "./services";

function App() {
  const [loggedIn, setLoggedIn] = React.useState(
    window.localStorage.getItem("bigDaddyToken") ? true : false
  );

  return (
    <div className="App">
      <header className="App-header">
        {!loggedIn ? <LoginScreen setLoggedIn={setLoggedIn} /> : <GameScreen />}
      </header>
    </div>
  );
}

function LoginScreen({ setLoggedIn }) {
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  async function handleSubmit() {
    const result = await login({ username, password });
    if (result.success) {
      window.localStorage.setItem("bigDaddyToken", result.data);
      setLoggedIn(true);
    } else {
      alert("Credenitals incorrect");
      setUsername("");
      setPassword("");
    }
  }
  return (
    <div style={{ height: "100%", width: "100$" }}>
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
        />
        <input
          type="text"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button onClick={() => handleSubmit()}>Login</button>
      </div>
    </div>
  );
}

function GameScreen() {
  const [gameCreated, setGameCreated] = React.useState(false);
  const [resultSubmitted, setResultSubmitted] = React.useState(false);
  const [winner, setWinner] = React.useState(null);
  const [draw, setDraw] = React.useState(false);

  const [gameId, setGameId] = React.useState(null);

  const [stake, setStake] = React.useState(0);
  const { players, loading, refresh } = useGetPlayers();

  const [onSelect, setOnSelect] = React.useState(null);
  const [playerSelector, setPlayerSelector] = React.useState(false);

  const [playerA1, setPlayerA1] = React.useState(null);
  const [playerA2, setPlayerA2] = React.useState(null);
  const [playerA3, setPlayerA3] = React.useState(null);
  const [playerA4, setPlayerA4] = React.useState(null);
  const [playerB1, setPlayerB1] = React.useState(null);
  const [playerB2, setPlayerB2] = React.useState(null);
  const [playerB3, setPlayerB3] = React.useState(null);
  const [playerB4, setPlayerB4] = React.useState(null);

  const [teamAKills, setTeamAKills] = React.useState(0);
  const [teamBKills, setTeamBKills] = React.useState(0);
  const [teamAPosition, setTeamAPosition] = React.useState(0);
  const [teamBPosition, setTeamBPosition] = React.useState(0);

  console.log({ players, loading, refresh });

  console.log({ onSelect });

  const teamAValid =
    [playerA1, playerA2, playerA3, playerA4].filter((player) => player != null)
      .length > 0;
  const teamBValid =
    [playerB1, playerB2, playerB3, playerB4].filter((player) => player != null)
      .length > 0;
  const stakeValid = stake > 0;

  const buttonDisabled = !teamAValid || !teamBValid || !stakeValid;

  console.log({ teamAValid, teamBValid, stakeValid, buttonDisabled });

  async function handleRegister() {
    if (!buttonDisabled) {
      const registerGameResult = await registerGame({
        teamAPlayers: [playerA1, playerA2, playerA3, playerA4]
          .filter((player) => player && player.id)
          .map((player) => player.id),
        teamBPlayers: [playerB1, playerB2, playerB3, playerB4]
          .filter((player) => player && player.id)
          .map((player) => player.id),
        stake,
      });
      console.log({ registerGameResult });
      if (registerGameResult.success) {
        setGameId(registerGameResult.data.id);
        setGameCreated(true);
      }
    }
  }

  async function handleSubmit() {
    const submitResultsResult = await submitGameResult({
      teamAKills,
      teamBKills,
      teamAPosition,
      teamBPosition,
      gameId,
    });

    console.log({ submitResultsResult });
    if (submitResultsResult.success) {
      if (submitResultsResult.data.draw) {
        setDraw(true);
        setWinner(null);
      } else {
        setWinner(submitResultsResult.data.winner);
        setDraw(false);
      }
      setResultSubmitted(true);
    }
  }

  function reset(keepTeams = true) {
    refresh();
    setGameCreated(false);
    setResultSubmitted(false);
    setDraw(false);
    setWinner(null);
    setGameId(null);
    setStake(0);
    setOnSelect(null);
    setPlayerSelector(false);

    setTeamAKills(0);
    setTeamBKills(0);
    setTeamAPosition(0);
    setTeamBPosition(0);
    if (!keepTeams) {
      setPlayerA1(null);
      setPlayerA2(null);
      setPlayerA3(null);
      setPlayerA4(null);
      setPlayerB1(null);
      setPlayerB2(null);
      setPlayerB3(null);
      setPlayerB4(null);
    }
  }

  if (resultSubmitted) {
    return (
      <div
        style={{
          height: "100%",
          width: "100$",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        {draw ? (
          <>
            <h3>It's a draw</h3>
            <button onClick={() => reset()}>Play again?</button>
          </>
        ) : (
          <>
            {" "}
            <h3>The Winner:</h3>
            <h5>{winner}</h5>
            <button onClick={() => reset()}>Play again?</button>
            <button onClick={() => reset(false)}>New Teams</button>
          </>
        )}
      </div>
    );
  }

  if (gameCreated) {
    return (
      <div
        style={{
          height: "100%",
          width: "100$",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
        }}
      >
        <h3>Game Created!</h3>
        <h4>Submit Game Results</h4>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <div style={{ padding: 32 }}>
            <h4>Team A</h4>

            <h5>Kills:</h5>
            <input
              type="number"
              value={teamAKills}
              onChange={(e) => setTeamAKills(e.target.value)}
            />
            <h5>Position:</h5>
            <input
              type="number"
              value={teamAPosition}
              onChange={(e) => setTeamAPosition(e.target.value)}
            />
          </div>
          <div style={{ padding: 32 }}>
            <h4>Team B</h4>

            <h5>Kills:</h5>
            <input
              type="number"
              value={teamBKills}
              onChange={(e) => setTeamBKills(e.target.value)}
            />
            <h5>Position:</h5>
            <input
              type="number"
              value={teamBPosition}
              onChange={(e) => setTeamBPosition(e.target.value)}
            />
          </div>
        </div>
        <button onClick={() => handleSubmit()}>Submit</button>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        width: "100$",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", flexDirection: "row" }}>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            margin: 32,
          }}
        >
          <div>Big Daddy Baller Duty Bonanza</div>
          <div style={{ display: "flex", flexDirection: "row" }}>
            <div style={{ padding: 20 }}>
              <h3>Team A</h3>
              <Player
                player={playerA1}
                onClick={() => {
                  setOnSelect(() => (val) => setPlayerA1(val));
                  setPlayerSelector(true);
                }}
              />
              <Player
                player={playerA2}
                onClick={() => {
                  setOnSelect(() => (val) => setPlayerA2(val));
                  setPlayerSelector(true);
                }}
              />
              <Player
                player={playerA3}
                onClick={() => {
                  setOnSelect(() => (val) => setPlayerA3(val));
                  setPlayerSelector(true);
                }}
              />
              <Player
                player={playerA4}
                onClick={() => {
                  setOnSelect(() => (val) => setPlayerA4(val));
                  setPlayerSelector(true);
                }}
              />
            </div>
            <div style={{ padding: 20 }}>
              <h3>Team B</h3>
              <Player
                player={playerB1}
                onClick={() => {
                  setOnSelect(() => (val) => setPlayerB1(val));
                  setPlayerSelector(true);
                }}
              />
              <Player
                player={playerB2}
                onClick={() => {
                  setOnSelect(() => (val) => setPlayerB2(val));
                  setPlayerSelector(true);
                }}
              />
              <Player
                player={playerB3}
                onClick={() => {
                  setOnSelect(() => (val) => setPlayerB3(val));
                  setPlayerSelector(true);
                }}
              />
              <Player
                player={playerB4}
                onClick={() => {
                  setOnSelect(() => (val) => setPlayerB4(val));
                  setPlayerSelector(true);
                }}
              />
            </div>
          </div>
          <div>
            <input
              type="number"
              placeholder="stake"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
            />
            <button onClick={() => handleRegister()}>Create Game!</button>
          </div>
        </div>
        <div style={{ margin: 32 }}>
          {players &&
            players.map((player) => (
              <div style={{ display: "flex", flexDirection: "row" }}>
                {player.name} - £{player.balance}
              </div>
            ))}
        </div>
      </div>
      {playerSelector && (
        <PlayerSelector
          onSelect={onSelect}
          players={players}
          onClickAway={() => setPlayerSelector(false)}
        />
      )}
    </div>
  );
}

function Player({ player, onClick }) {
  return (
    <div onClick={() => onClick()}>
      {(player && player.name) || "Select Player"}
    </div>
  );
}

function PlayerSelector({ onSelect, players, onClickAway }) {
  console.log({ onSelect, players });
  return (
    <div
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.3)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      onClick={() => onClickAway()}
    >
      <div
        style={{
          padding: 32,
          borderRadius: 16,
          backgroundColor: "grey",
          border: "1px solid black",
        }}
      >
        {players &&
          players.map((player) => (
            <div onClick={() => onSelect(player)}>{player && player.name}</div>
          ))}
        <div onClick={() => onSelect(null)}>Remove</div>
      </div>
    </div>
  );
}

export default App;
