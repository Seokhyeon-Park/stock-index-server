const express = require('express');
const { chkUrl, getApiList } = require('./getSheet');
const logger = require("./logger");
const cors = require('cors');

const datePattern = /[0-9]{8}-[0-9]{8}/;
const app = express();

app.set('port', process.env.PORT || 3000);
app.use(cors());

// API LIST
// getApiList
app.get('/', (req, res) => {
    try {
        res.send("use /api");
    } catch (error) {
        console.logger(error);
    }
});

app.get('/api', (req, res) => {
    try {
        logger.info('GET /api');

        const api = getApiList();
        res.json(api);
    } catch (error) {
        console.logger(error);
    }
});

// Only index
app.get('/:name', async (req, res) => {
    try {
        logger.info(`GET /${req.params.name}`);

        // url 확인
        const chk = await chkUrl(req.params.name);

        if (typeof (chk) === 'string') {
            res.json(chk);
        } else {
            res.status(500).send({ error: chk.toString() });
        }
    } catch (error) {
        console.logger(error);
    }
});

// index with date
app.get('/:name/:date', async (req, res) => {
    try {
        logger.info(`GET /${req.params.name}/${req.params.date}`);

        if (!datePattern.test(req.params.date)) {
            const error = new Error(`${req.params.date} format is wrong`);
            res.status(500).send({ error: error.toString() });
        } else {
            // url 확인
            const chk = await chkUrl(req.params.name, req.params.date);

            if (typeof (chk) === 'string') {
                res.json(chk);
            } else {
                res.status(500).send({ error: chk.toString() });
            }
        }
    } catch (error) {
        console.logger(error);
    }
});

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} route not found`);
    next(error);
});

app.listen(app.get('port'), () => {
    logger.info("stock-index-server listening on port " + app.get('port'));
});