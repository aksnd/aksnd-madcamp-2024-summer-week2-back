const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const app = express();
require("dotenv").config();

const API_KEY = "AIzaSyAYadrNbAJu8LP-Zf2G1oQNSAYdqt0c5mk";
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.API_KEY);

// The Gemini 1.5 models are versatile and work with most use cases
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});


const corsOptions = {
  origin: '*', // 모든 도메인 허용
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 모든 HTTP 메서드 허용
  credentials: true, // 자격 증명(쿠키 등) 허용
  optionsSuccessStatus: 200 // 옵션 요청에 대한 응답 상태 코드
};


app.use(cors(corsOptions));


const port = 3001;

// MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'molipcamp',
  database: 'madcamp2',
});

// MySQL 연결
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL: ', err);
    return;
  }
  console.log('Connected to MySQL');
});

// JSON 파싱 미들웨어
app.use(express.json());

//기사 삽입

async function word_translate(word) {
  // The Gemini 1.5 models are versatile and work with both text-only and multimodal prompts
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
  console.log(word);
  const prompt = `please translate the english vocabulary '${word}' into Korean. only respond the translated korean word. do not add any prefix or suffix except for the translated korean vocabulary.`;
  console.log(prompt);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(text);
  return text;
}


app.get('/', (req, res) => {
  res.send('Hello, world!');
});
app.get('/article', (req, res) => {
  const articleId = req.query.id;

  if (!articleId) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const query = 'SELECT * FROM article WHERE id = ?';
  connection.query(query, [articleId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err.stack);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (results.length === 0) {
      console.error("not found the results");
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(results[0]);
  });
});

app.get('/words', (req, res) => {
  const articleId = req.query.id;

  if (!articleId) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const query = 'SELECT * FROM word WHERE article_id = ?';
  connection.query(query, [articleId], (err, results) => {
    if (err) {
      console.error('Error executing query:', err.stack);
      return res.status(500).json({ error: 'Database query error' });
    }

    if (results.length === 0) {
      console.error("not found the results");
      return res.status(404).json({ error: 'Article not found' });
    }

    res.json(results);
  });
});



app.get('/word', async(req, res) => {
  const articleId = req.query.article_id;
  const word = req.query.word;

  if (!articleId || !word) {
    return res.status(400).json({ error: 'article_id and word are required' });
  }
  word_translate(word)
    .then(translatedWord => {
      const query = 'INSERT INTO word (article_id, word, korean_word) VALUES (?, ?, ?)';
      connection.query(query, [articleId, word, translatedWord], (err, results) => {
        if (err) {
          console.error('Error inserting word:', err.stack);
          return res.status(500).json({ error: 'Database error' });
        }
      });
      // 응답으로 번역된 단어 반환
      res.json({word: word, translated_word: translatedWord });
    })
    .catch(error => {
      console.error('Error during translation:', error);
      res.status(500).json({ error: 'Translation failed' });
    });
  // 받아온 값을 그대로 응답으로 돌려줌
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

