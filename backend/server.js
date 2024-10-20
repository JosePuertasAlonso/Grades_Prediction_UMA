const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const routes = require('./routes/index');

app.use('/', routes);

app.listen(PORT, () => {
    console.log('Servidor iniciado en puerto: ' + PORT);
});
