const express = require("express");
const mysql = require("mysql2");
const dbConfig = require("./db-config");
const cors = require("cors");

const app = express();
const port = 3001;
const pool = mysql.createPool(dbConfig);

const corsOption = {
  origin: "http://localhost:3000",
  Credential: true,
};

app.use(express.json());
app.use(cors(corsOption));

const list = [
  "R",
  "C",
  "P",
  "P",
  "C",
  "R",
  "C",
  "P",
  "R",
  "R",
  "P",
  "C",
  "P",
  "R",
  "C",
  "R",
  "C",
  "P",
  "P",
  "C",
  "R",
  "C",
  "P",
  "R",
  "R",
  "P",
  "C",
  "P",
  "R",
  "C",
  "R",
  "C",
  "P",
  "P",
  "C",
  "R",
  "C",
  "P",
  "R",
  "R",
  "P",
  "C",
  "P",
  "R",
  "C",
];

const whoWon = (stan, com) => {
  if (stan === "R") {
    if (com === "R") return "DRAW";
    else if (com === "C") return "WIN";
    else return "LOSE";
  } else if (stan === "C") {
    if (com === "C") return "DRAW";
    else if (com === "P") return "WIN";
    else return "LOSE";
  } else if (stan === "P") {
    if (com === "P") return "DRAW";
    else if (com === "R") return "WIN";
    else return "LOSE";
  }
};

app.get("/wr", (req, res) => {
  const my = req.body.my;
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const qs = `select hand, count(*) as play, count(case when win = 'WIN' then 1 end) as win from project group by hand;`;
    conn.query(qs, (err, result, field) => {
      if (err) throw err;
      const data = [];
      result.map((value) => {
        let hand = "";
        if (value.hand === "R") hand = "바위";
        else if (value.hand === "C") hand = "가위";
        else if (value.hand === "P") hand = "보";
        data.push({
          hand: hand,
          wr: (value.win / value.play) * 100,
        });
      });
      res.send(data);
      7;
    });
    conn.release();
  });
});

app.get("/stats", (req, res) => {
  const my = req.body.my;
  pool.getConnection((err, conn) => {
    if (err) throw err;

    conn.query(
      `select count(*) as count, win from project where hand = '${my}' group by win`,
      (err, result, field) => {
        if (err) throw err;
        res.send(result);
      }
    );
    conn.release();
  });
});

app.post("/play", (req, res) => {
  const hand = req.body.hand;
  const num = Math.floor(Math.random() * list.length);
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const win = whoWon(hand, list[num]);
    const q = `insert into project(hand, random, win) values('${hand}', '${list[num]}', '${win}')`;
    conn.query(q, (err, result, field) => {
      if (err) throw err;
      if (win === "DRAW") res.send("DRAW");
      else if (win === "WIN") res.send("you win");
      else res.send("you lose");
    });
    conn.release();
  });
});

app.listen(port, () => {
  console.log("server running on http://localhost:" + port);
});
7;
