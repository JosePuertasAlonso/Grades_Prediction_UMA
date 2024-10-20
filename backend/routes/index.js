const express = require('express');
const router = express.Router();


const datosTFM = require('./datosTFM');

router.get('/', (req, res) => {
    res.send('Hola Mundo');
});

router.use('/datosTFM', datosTFM);


module.exports = router;
