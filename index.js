const express = require('express');
const { getData, getApiList } = require('./api');
const logger = require("./logger");
const cors = require('cors');

const app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());

// API LIST
// getApiList
app.get('/favicon.ico', (req, res) => {
    
});

app.get('/', async (req, res) => {
    try {
        logger.info(`GET /`);
        
        const json = getApiList();
        res.json(json);
    } catch (error) {
        logger.error(error + `(${req.method} ${req.url})`);
        res.status(500).send(`(${req.method} ${req.url}) ${error}`);
    }
});

app.get('/api', (req, res) => {
    try {
        logger.info(`GET /api`);

        const json = getApiList();
        res.json(json);
    } catch (error) {
        logger.error(error + `(${req.method} ${req.url})`);
        res.status(500).send(`(${req.method} ${req.url}) ${error}`);
    }
});

// Only index
app.get('/:reqUrl', async (req, res) => {
    try {
        logger.info(`GET /${req.params.reqUrl}`);

        const json = await getData(req.params.reqUrl);
        res.json(json);
    } catch (error) {
        logger.error(error + `(${req.method} ${req.url})`);
        res.status(500).send(`(${req.method} ${req.url}) ${error}`);
    }
});

// index with date
app.get('/:reqUrl/:date', async (req, res) => {
    try {
        logger.info(`GET /${req.params.reqUrl}/${req.params.date}`);

        const json = await getData(req.params.reqUrl, req.params.date);
        res.json(json);
    } catch (error) {
        logger.error(error + `(${req.method} ${req.url})`);
        res.status(500).send(`(${req.method} ${req.url}) ${error}`);
    }
});

app.use((req, res, next) => {
    if (req.url !== '/favicon.ico') {
        const error = new Error(`${req.method} ${req.url} route not found`);
        next(error);
    }
});

app.listen(app.get('port'), () => {
    logger.info("stock-index-server listening on port " + app.get('port'));
});