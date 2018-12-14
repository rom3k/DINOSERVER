// Import modułów
const express = require('express');
var app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

// Ustawienie portu 
var port = process.env.port || 3000;

// Konfiguracja ExpressJS
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Konfiguracja endpointów
var Routes = require('./routes/routes');
app.use('/', Routes);

// Nasłuchiwanie 
app.listen(port, function() {
    console.log('Server is running on port ' + port);
})