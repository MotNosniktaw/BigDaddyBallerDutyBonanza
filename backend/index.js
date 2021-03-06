require("dotenv").config();

const express = require("express");
const cors = require("cors");
const parser = require("body-parser");
const { MongoClient } = require("mongodb");
const { uuid } = require("uuidv4");
const jwt = require("jsonwebtoken");

const privateKey = process.env.JWT_PRIVATE_KEY;

// Instantiate App
const app = express();

// Add Middleware
app.use(parser.json());
app.use(cors());

function AuthMiddleware(req, res, next) {
  const { token } = req.headers;
  try {
    if (!token) {
      res.status(401).send({ success: false, message: "token not provided" });
      return;
    }
    const verifyResult = jwt.verify(token, privateKey);

    if (!verifyResult) {
      res.status(401).send({ success: false, message: "token invalid" });
      return;
    } else {
      next();
    }
  } catch (err) {
    res.status(500).send({ success: false, message: "unable to check auth" });
  }
}

app.use("/players", AuthMiddleware);
app.use("/games", AuthMiddleware);

// Configure Tools and Clients
const mongoUrl = "mongodb://root:example@host.docker.internal:27020";
const mongoDbName = "big-daddy-ballers";

const mongoClient = new MongoClient(mongoUrl);
let db;
mongoClient.connect().then((client) => {
  db = client.db(mongoDbName);
});

// Routes
app.get("/", (req, res, next) => {
  console.log("hiiiii"), res.send("hiiii");
  return;
});

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const userCollection = db.collection("users");
    const user = await userCollection.findOne({ username });
    console.log({ user });
    if (!user) {
      res
        .status(500)
        .send({ success: false, message: "Could not retrieve user from db" });
      return;
    }

    if (user.password !== password) {
      res.status(400).send({ success: false, message: "Nope" });
    }

    const token = jwt.sign({ sub: username }, privateKey);

    res.send({ success: true, data: token });
  } catch (err) {
    console.log({ err });
    res.status(500).send({ success: false, message: "an error occured" });
  }
});

app.get("/players", async (req, res, next) => {
  try {
    const collection = db.collection("players");

    const players = await collection
      .find()
      .toArray()
      .then((players) => {
        return players;
      });

    res.send({ success: true, data: players });
    return;
  } catch (error) {
    console.log(error);

    res.status(500).send({ success: false, message: "Ruh-roh" });
    return;
  }
});

app.get("/players/:id", async (req, res, next) => {
  const { id } = req.params;
  console.log({ id });
  try {
    const collection = db.collection("players");

    const player = await collection.findOne({ id });

    res.send({ success: true, data: player });
    return;
  } catch (error) {
    console.log(error);

    res.status(500).send({ success: false, message: "Ruh-roh" });
    return;
  }
});

app.put("/players", async (req, res, next) => {
  const { name } = req.body;
  try {
    const collection = db.collection("players");

    const insertPlayerResult = await collection.insertOne({
      name,
      id: uuid(),
      balance: 0,
    });
    console.log({ insertPlayerResult });
    if (
      !insertPlayerResult ||
      !insertPlayerResult.result ||
      !insertPlayerResult.result.ok ||
      insertPlayerResult.result.ok !== 1
    ) {
      res
        .status(500)
        .send({ success: false, message: "Could not insert player into db" });
      return;
    }

    res.send({ success: true, data: insertPlayerResult.ops[0] });
    return;
  } catch (err) {
    console.log({ err });

    res.status(500).send("Ruh-roh");
    return;
  }
});

app.put("/games", async (req, res, next) => {
  const { teamAPlayers, teamBPlayers, stake } = req.body;
  console.log({ teamAPlayers, teamBPlayers, stake });
  try {
    const playersCollection = db.collection("players");
    const players = await playersCollection.find().toArray();

    if (
      ![...teamAPlayers, ...teamBPlayers].every((player) =>
        players.find((p) => p.id === player)
      )
    ) {
      res.status(400).send("No. Dem not players");
      return;
    }

    const collection = db.collection("games");

    const insertGameResult = await collection.insertOne({
      teamAPlayers,
      teamBPlayers,
      stake,
      id: uuid(),
      resultSubmitted: false,
    });
    console.log({ insertGameResult });
    if (
      !insertGameResult ||
      !insertGameResult.result ||
      !insertGameResult.result.ok ||
      insertGameResult.result.ok !== 1
    ) {
      res
        .status(500)
        .send({ success: false, message: "Could not insert game into db" });
      return;
    }

    res.send({ success: true, data: insertGameResult.ops[0] });
    return;
  } catch (err) {
    console.log({ err });

    res.status(500).send("Ruh-roh");
    return;
  }
});

app.post("/games", async (req, res, next) => {
  const {
    teamAKills,
    teamBKills,
    teamAPosition,
    teamBPosition,
    gameId,
  } = req.body;

  console.log({
    teamAKills,
    teamBKills,
    teamAPosition,
    teamBPosition,
    gameId,
  });

  try {
    const gamesCollection = db.collection("games");

    const game = await gamesCollection.findOne({ id: gameId });
    if (game.resultSubmitted) {
      res.status(400).send("This game result has already been logged");
      return;
    }

    const updateGamesResult = await gamesCollection.updateOne(
      { id: gameId },
      {
        $set: {
          teamAKills,
          teamBKills,
          teamAPosition,
          teamBPosition,
          gameId,
          resultSubmitted: true,
        },
      }
    );
    console.log({ updateGamesResult });
    if (
      !updateGamesResult ||
      !updateGamesResult.result ||
      !updateGamesResult.result.ok ||
      updateGamesResult.result.ok !== 1
    ) {
      res
        .status(500)
        .send({ success: false, message: "Could not insert game into db" });
      return;
    }

    const killsWinner =
      teamAKills > teamBKills ? 1 : teamAKills < teamBKills ? -1 : 0;

    const positionWinner = teamAPosition < teamBPosition ? 1 : -1;

    const result = killsWinner + positionWinner;

    console.log({ killsWinner, positionWinner, result });

    if (result === 0) {
      res.send({
        success: true,
        data: {
          winner: null,
          draw: true,
        },
      });
      return;
    }

    const playersCollection = db.collection("players");

    async function updatePlayerBalancesForTeam(players, negative = false) {
      const incrementAmount = result * game.stake * (negative ? -1 : 1);
      console.log({ result, stake: game.stake, incrementAmount });
      return await Promise.all(
        players.map(async (player) => {
          console.log(player);
          return await playersCollection.updateOne(
            { id: player },
            {
              $inc: {
                balance: incrementAmount,
              },
            }
          );
        })
      );
    }

    const updateResults = await Promise.all([
      updatePlayerBalancesForTeam(game.teamAPlayers),
      updatePlayerBalancesForTeam(game.teamBPlayers, true),
    ]);

    console.log({ updateResults });

    res.send({
      success: true,
      data: {
        winner: result > 0 ? "Team A" : "Team B",
      },
    });
    return;
  } catch (err) {
    res
      .status(500)
      .send({ success: false, message: "there was an error updating game" });
  }
});

app.listen(80, (port) => console.log(`Listening at Port: ${port}`));
