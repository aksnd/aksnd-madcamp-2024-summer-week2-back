const express = require('express');
const router = express.Router();
const axios = require('axios');

const {front_ip,backend_ip,port} = require('../module/constants.js');
const {connection,query} = require('../module/db.js');
const {word_translate, get_article} = require('../module/gemini_ai.js');


router.get('/words', (req, res) => {
    const articleId = req.query.article_id;
  
    if (!articleId) {
      return res.status(400).json({ error: 'ID is required' });
    }
  
    const query = 'SELECT * FROM words WHERE article_id = ?';
    connection.query(query, [articleId], (err, results) => {
      if (err) {
        console.error('Error executing query:', err.stack);
        return res.status(500).json({ error: 'Database query error' });
      }
  
      /*if (results.length === 0) {
        console.error("not found the results");
        return res.status(404).json({ error: 'Article not found' });
      }*/
  
      res.json(results);
    });
  });


router.post('/word', async(req, res) => {
  const { article_id, word } = req.body;

  if (!article_id || !word) {
    return res.status(400).json({ error: 'article_id and word are required' });
  }
  const translatedWord = await word_translate(word);
  if(translatedWord===-1){
    return res.status(404).json({error:'바람직하지 않은 어휘'});
  }
  const insert_query = 'INSERT INTO words (article_id, word, word_korean) VALUES (?, ?, ?)';
  const insertResult = await query(insert_query, [article_id, word, translatedWord]);
  
  const insertedId = insertResult.insertId;
  const userWord = await query('SELECT * FROM words WHERE word_id = ?', [insertedId]);
  // 응답으로 번역된 단어 반환
  res.json(userWord[0]);

  // 받아온 값을 그대로 응답으로 돌려줌
});


router.delete('/delete-word', async (req, res) => { 
  try {
    const word_id = req.query.word_id;
    if (!word_id) {
      return res.status(400).json({ error: 'article_id and word are required' });
    }
    const word_query = 'DELETE FROM words WHERE word_id = ?';
    const insertResult = await query(word_query, [word_id]);
    
    // 응답으로 번역된 단어 반환
    res.json(word_id);
    
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
  
});

router.get('/read-word-num',async(req, res)=>{
  const user_id = req.query.user_id;
  if (!user_id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const num_query = 'SELECT COUNT(words.word_id) FROM user_article JOIN words ON user_article.article_id = words.article_id WHERE user_article.user_id = ?';
  const word_num = await query(num_query, [user_id]);
    res.json(word_num);

});

module.exports = router;