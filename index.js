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
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const qs = `select hand, count(*) as play, count(case when win = 'WIN' then 1 end) as win from project group by hand`;
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
          wr: ((value.win / value.play) * 100).toFixed(2),
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
    const q = `insert into project(hand, random, win, created) values('${hand}', '${list[num]}', '${win}', current_timestamp)`;
    conn.query(q, (err, result, field) => {
      if (err) throw err;
      if (win === "DRAW") res.send("무승부입니다.");
      else if (win === "WIN") res.send("당신이 이겼습니다.");
      else res.send("당신이 졌습니다.");
    });
    conn.release();
  });
});

app.get("/day", (req, res) => {
  const data = req.query.day;
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const q = `select count(*) as play, hand, count(case when win = 'WIN' then 1 end) as win from project where created = '${data}' group by hand`;
    conn.query(q, (err, result, field) => {
      if (err) throw err;
      const arr = [];
      result.map((value) => {
        const obj = {
          hand: value.hand,
          win: ((value.win / value.play) * 100).toFixed(2),
        };
        arr.push(obj);
      });
      console.log(arr);
      res.send(arr);
    });
    conn.release();
  });
});

app.get("/week", (req, res) => {
  const { start, end } = req.query;
  pool.getConnection((err, conn) => {
    if (err) throw err;
    const q = `select count(*) as play, hand, count(case when win = 'WIN' then 1 end) as win, created from project where created between '${start}' and '${end}' group by hand, created`;
    conn.query(q, (err, result, field) => {
      if (err) throw err;
      const arr = [];
      let li = [];
      let key = result[0].created.toString().substring(0, 10);
      result.map((value) => {
        const obj = {
          hand: value.hand,
          win: ((value.win / value.play) * 100).toFixed(2),
          created: value.created,
        };
        if (key === value.created.toString().substring(0, 10)) {
          li.push(obj);
        } else {
          arr.push(li);
          li = [];
          li.push(obj);
          key = value.created.toString().substring(0, 10);
        }
      });
      arr.push(li);
      res.send(arr);
    });
    conn.release();
  });
});

app.listen(port, () => {
  console.log("server running on http://localhost:" + port);
});
