const express = require('express');
const router = express.Router();
const axios = require('axios');

const {backend_ip,port} = require('../module/constants.js');
const {connection,query} = require('../module/db.js');
const {word_translate, get_article} = require('../module/gemini_ai.js');


router.get('/logout/callback', (req, res) => {
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
  
router.get('/auth/kakao/callback', async (req, res) => {
    const code = req.query.code;
    const client_id = '17132d31284a95180bea1e6df5b24fb9'; // YOUR_APP_KEY 부분을 발급받은 REST API 키로 변경
    const redirect_uri = `http://${backend_ip}:${port}/kakao/auth/kakao/callback`; // Redirect URI 변경

    try {
        const tokenResponse = await axios.post('https://kauth.kakao.com/oauth/token', null, {
        params: {
            grant_type: 'authorization_code',
            client_id: client_id,
            redirect_uri: redirect_uri,
            code: code
        }
        });

        const accessToken = tokenResponse.data.access_token;
        const refreshToken = tokenResponse.data.refresh_token;

        const userResponse = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
        });


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
  
router.get('/nickname',async(req,res)=>{
    const kakao_id = req.query.kakao_id;
    const getnicknamequery = 'SELECT nickname FROM users WHERE kakao_id = ?';
    nickname = await query(getnicknamequery,[kakao_id]);
    res.json(nickname[0]);
});

module.exports = router;