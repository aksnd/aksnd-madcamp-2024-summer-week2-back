const express = require('express');
const router = express.Router();
const axios = require('axios');

const {backend_ip,port} = require('../module/constants.js');
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
  const insert_query = 'INSERT INTO words (article_id, word, word_korean) VALUES (?, ?, ?)';
  const insertResult = await query(insert_query, [article_id, word, translatedWord]);
  
  const insertedId = insertResult.insertId;
  const userWord = await query('SELECT * FROM words WHERE word_id = ?', [insertedId]);
  // 응답으로 번역된 단어 반환
  res.json(userWord[0]);

  // 받아온 값을 그대로 응답으로 돌려줌
});


router.delete('/delete-word', async (req, res) => { //random하게 default에서 1개 가져와서 user_id기반으로 집어넣고, 그 기사를 json형식으로 반환하는 코드
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

module.exports = router;