const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const axios = require('axios');
const util = require('util');
const bodyParser = require('body-parser');
const app = express();

require("dotenv").config();

const {backend_ip,port} = require('./module/constants.js');
const {connection,query} = require('./module/db.js');
const {word_translate, get_article} = require('./module/gemini_ai.js');


const articleRouter = require("./router/article_server");
const wordRouter = require("./router/word_server");
const kakaoRouter = require("./router/kakao_login");
const userRouter = require("./router/user_server");




const corsOptions = {
  origin: '*', // 모든 도메인 허용
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE', // 모든 HTTP 메서드 허용
  credentials: true, // 자격 증명(쿠키 등) 허용
  optionsSuccessStatus: 200 // 옵션 요청에 대한 응답 상태 코드
};


app.use(cors(corsOptions));
app.use(bodyParser.json());

// JSON 파싱 미들웨어
app.use(express.json());

app.use("/article", articleRouter);
app.use("/kakao", kakaoRouter);
app.use("/words",wordRouter);
app.use("/user",userRouter);


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

