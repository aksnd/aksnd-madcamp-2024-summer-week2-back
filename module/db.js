
const mysql = require('mysql');
const util = require('util');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'test',
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

const query = util.promisify(connection.query).bind(connection);

module.exports = {connection,query};