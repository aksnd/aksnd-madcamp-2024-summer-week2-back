const express = require('express');
const router = express.Router();
const axios = require('axios');

const {backend_ip,port} = require('../module/constants.js');
const {connection,query} = require('../module/db.js');
const {word_translate, get_article} = require('../module/gemini_ai.js');



router.post('/random-article', async (req, res) => { //random하게 default에서 1개 가져와서 user_id기반으로 집어넣고, 그 기사를 json형식으로 반환하는 코드
    try {
      // 요청에서 kakao_id 가져오기
      const kakao_id = req.body.kakao_id;
  
      if (!kakao_id) {
        return res.status(400).send('kakao_id is required');
      }
  
      // 랜덤한 기사를 선택하는 쿼리
      const article_json = await get_article('economy'); 
      const { title, contents } = article_json;
      
      console.log(title);
      
      if (title.length === 0 || contents.length=== 0) {
        return res.status(404).send('No articles found');
      }
      
      // User_article 테이블에 기사 삽입
      const insertResult= await query(
        'INSERT INTO user_article (user_id, title, contents,author,date) VALUES (?, ?, ?, ?, ?)',
        [kakao_id, title, contents,"chatgpt","2024-07-06"]
      );
  
      const insertedId = insertResult.insertId;
  
      // 삽입된 레코드 조회
      const userArticleRows = await query('SELECT * FROM user_article WHERE article_id = ?', [insertedId]);
  
      if (userArticleRows.length === 0) {
        return res.status(404).send('Inserted article not found');
      }
  
      const userArticle = userArticleRows[0];
  
      res.json(userArticle);
  
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
    
  });
  
router.get('/article', (req, res) => { //기사를 id를 기반으로 받아오는 코드
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.status(400).json({ error: 'ID is required' });
    }

    const query = 'SELECT * FROM article WHERE user_id = ?';
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

module.exports = router;
