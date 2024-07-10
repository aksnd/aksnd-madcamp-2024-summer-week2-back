const express = require('express');
const router = express.Router();
const axios = require('axios');

const {front_ip,backend_ip,port} = require('../module/constants.js');
const {connection,query} = require('../module/db.js');
const {word_translate, get_article} = require('../module/gemini_ai.js');


router.post('/update-category', (req, res) => {
    const { user_id, category_number, category_text } = req.body;
    //console.log(`${user_id}, ${category_number}, ${category_text}`);
    if (!user_id || !category_number || !category_text) {
      return res.status(400).json({ error: 'user_id, category_number and category_text are required' });
    }
    
    let categoryColumn;
    switch (category_number) {
      case 1:
        categoryColumn = 'user_category1';
        break;
      case 2:
        categoryColumn = 'user_category2';
        break;
      case 3:
        categoryColumn = 'user_category3';
        break;
      case 4:
        categoryColumn = 'user_category4';
        break;
      default:
        return res.status(400).json({ error: 'Invalid category_number' });
    }
  
    const query = `UPDATE users SET ${categoryColumn} = ? WHERE kakao_id = ?`;
  
    connection.query(query, [category_text, user_id], (err, results) => {
      if (err) {
        console.error('Error updating category:', err.stack);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ success: true, message: 'Category updated successfully' });
    });
});

router.get('/get-category', (req, res) => {
    const { user_id, category_number } = req.query;
    if (!user_id || !category_number) {
        return res.status(400).json({ error: 'user_id and category_number are required' });
    }

    let categoryColumn;
    switch (parseInt(category_number,10)) {
        case 1:
        categoryColumn = 'user_category1';
        break;
        case 2:
        categoryColumn = 'user_category2';
        break;
        case 3:
        categoryColumn = 'user_category3';
        break;
        case 4:
        categoryColumn = 'user_category4';
        break;
        default:
        return res.status(400).json({ error: 'Invalid category_number' });
    }
    //console.log(`${user_id},${category_number}`);

    const query = `SELECT ${categoryColumn} FROM users WHERE kakao_id = ?`;

    connection.query(query, [user_id], (err, results) => {
        if (err) {
        console.error('Error fetching category:', err.stack);
        return res.status(500).json({ error: 'Database error' });
        }

        if (results.length === 0) {
        return res.status(404).json({ error: 'User not found' });
        }
        let category ='';
        switch (parseInt(category_number,10)) {
          case 1:
          category = results[0].user_category1;
          break;
          case 2:
          category = results[0].user_category2;
          break;
          case 3:
          category = results[0].user_category3;
          break;
          case 4:
          category = results[0].user_category4;
          break;
          default:
          return res.status(400).json({ error: 'Invalid category_number' });
        }
        res.json({ user_id:user_id, category_number:category_number, category_text:category });
    });
});


module.exports = router;
