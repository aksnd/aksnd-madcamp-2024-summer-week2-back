const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const axios = require('axios');
const util = require('util');
const bodyParser = require('body-parser');
const app = express();

const port = 3001;
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
app.use(bodyParser.json());


// MySQL 연결 설정
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'molipcamp',
  database: 'madcamp3',
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

const query = util.promisify(connection.query).bind(connection);

app.get('/logout/callback', (req, res) => {
  // 클라이언트에서 세션과 쿠키 제거
  res.send(`
    <script>
      document.cookie.split(";").forEach((c) => {
        document.cookie = c.trim().split("=")[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      });
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = 'http://localhost:3000/login'; // 로그아웃 후 로그인 페이지로 리디렉션
    </script>
  `);
});

app.get('/auth/kakao/callback', async (req, res) => {
  const code = req.query.code;
  const client_id = '17132d31284a95180bea1e6df5b24fb9'; // YOUR_APP_KEY 부분을 발급받은 REST API 키로 변경
  const redirect_uri = 'http://localhost:3001/auth/kakao/callback'; // Redirect URI 변경

  console.log('Authorization code:', code);

  try {
    const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: client_id,
        redirect_uri: redirect_uri,
        code: code
      }
    });

    console.log('Token response:', tokenResponse.data);

    const accessToken = tokenResponse.data.access_token;
    const refreshToken = tokenResponse.data.refresh_token;

    const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    console.log('User response:', userResponse.data);

    const user = userResponse.data;
    const kakaoId = user.id;
    const nickname = user.properties?.nickname || '닉네임 없음';
    // 사용자 정보 저장 또는 업데이트

    const existingUserQuery = 'SELECT * FROM users WHERE kakao_id = ?';
    const existingUser = await query(existingUserQuery, [kakaoId]);

    if (existingUser.length === 0) {
      // 사용자 정보가 없으면 추가
      const insertUserQuery = 'INSERT INTO users (kakao_id, nickname) VALUES (?, ?)';
      await query(insertUserQuery, [kakaoId, nickname]);
      console.log('User added:', kakaoId);
    } else {
      console.log('User already exists:', kakaoId);
    }

    // 로그인 성공 시 메인 페이지로 리디렉션
    res.redirect(`http://localhost:3000/login?kakaoId=${kakaoId}`);
  } catch (error) {
    console.error('Error:', error.response ? error.response.data : error.message);
    // 로그인 실패 시 로그인 페이지로 리디렉션
    res.redirect('http://localhost:3000/login?error=login_failed');
  }
});

app.get('/nickname',async(req,res)=>{
  const kakao_id = req.query.kakao_id;
  console.log(kakao_id);
  const getnicknamequery = 'SELECT nickname FROM users WHERE kakao_id = ?';
  nickname = await query(getnicknamequery,[kakao_id]);
  res.json(nickname[0]);
});


app.get('/', (req, res) => {
  res.send('Hello, world!');
});
app.get('/article', (req, res) => {
  const articleId = req.query.article_id;

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
  const articleId = req.query.article_id;

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

