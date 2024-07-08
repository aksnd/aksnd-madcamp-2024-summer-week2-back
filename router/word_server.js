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


router.get('/word', async(req, res) => {
  const article_id = req.query.article_id;
  const word = req.query.word;

  if (!article_id || !word) {
    return res.status(400).json({ error: 'article_id and word are required' });
  }
  word_translate(word)
    .then(translatedWord => {
      const query = 'INSERT INTO words (article_id, word, word_korean) VALUES (?, ?, ?)';
      connection.query(query, [article_id, word, translatedWord], (err, results) => {
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

module.exports = router;