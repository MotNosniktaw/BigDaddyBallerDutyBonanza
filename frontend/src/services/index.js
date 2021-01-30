import React from "react";
import config from "../config";

export async function login({ username, password }) {
  const url = `${config.bigDaddyApiUrl}/login`;
  console.log({ url });
  const data = JSON.stringify({ username, password });
  const result = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    body: data,
    redirect: "follow",
    referrerPolicy: "no-referrer",
  })
    .then((r) => {
      return r.json();
    })

    .catch((err) => {
      console.log({ err });
      return { error: "Unable to login." };
    });
  console.log({ result });
  return result;
}

export async function getAllPlayers({ callback }) {
  const url = `${config.bigDaddyApiUrl}/players`;
  const result = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      token: window.localStorage.getItem("bigDaddyToken"),
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
  })
    .then((r) => {
      return r.json();
    })

    .catch((err) => {
      console.log({ err });
      return { error: "Unable to get players." };
    });
  callback && callback(result);
  return result;
}

export function useGetPlayers() {
  const [players, setPlayers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  async function getPlayers() {
    const result = await getAllPlayers({
      callback: (result) => {
        if (result.success) {
          setPlayers(result.data);
          setLoading(false);
        }
      },
    });
  }

  React.useEffect(() => {
    getPlayers();
  }, []);

  function refresh() {
    setLoading(true);
    getPlayers();
    return true;
  }

  return { players, loading, refresh };
}

export async function getPlayerById({ playerId }) {
  const url = `${config.bigDaddyApiUrl}/players/${playerId}`;
  const result = await fetch(url, {
    method: "GET",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      token: window.localStorage.getItem("bigDaddyToken"),
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
  })
    .then((r) => {
      return r.json();
    })

    .catch((err) => {
      console.log({ err });
      return { error: "Unable to get player by id." };
    });
  return result;
}

export async function registerPlayer({ name }) {
  const url = `${config.bigDaddyApiUrl}/players/`;
  const data = JSON.stringify({ name });
  const result = await fetch(url, {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      token: window.localStorage.getItem("bigDaddyToken"),
    },
    body: data,
    redirect: "follow",
    referrerPolicy: "no-referrer",
  })
    .then((r) => {
      return r.json();
    })

    .catch((err) => {
      console.log({ err });
      return { error: "Unable to register player." };
    });
  return result;
}

export async function registerGame({ teamAPlayers, teamBPlayers, stake }) {
  const url = `${config.bigDaddyApiUrl}/games/`;
  const data = JSON.stringify({ teamAPlayers, teamBPlayers, stake });
  const result = await fetch(url, {
    method: "PUT",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      token: window.localStorage.getItem("bigDaddyToken"),
    },
    body: data,
    redirect: "follow",
    referrerPolicy: "no-referrer",
  })
    .then((r) => {
      return r.json();
    })

    .catch((err) => {
      console.log({ err });
      return { error: "Unable to register game." };
    });
  return result;
}

export async function submitGameResult({
  teamAKills,
  teamBKills,
  teamAPosition,
  teamBPosition,
  gameId,
}) {
  const url = `${config.bigDaddyApiUrl}/games/`;
  const data = JSON.stringify({
    teamAKills,
    teamBKills,
    teamAPosition,
    teamBPosition,
    gameId,
  });
  const result = await fetch(url, {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      token: window.localStorage.getItem("bigDaddyToken"),
    },
    body: data,
    redirect: "follow",
    referrerPolicy: "no-referrer",
  })
    .then((r) => {
      return r.json();
    })

    .catch((err) => {
      console.log({ err });
      return { error: "Unable to register game result." };
    });
  return result;
}
