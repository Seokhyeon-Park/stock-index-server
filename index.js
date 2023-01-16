const express = require('express');
const { chkUrl, getApiList } = require('./getSheet');
const logger = require("./logger");

const datePattern = /[0-9]{8}-[0-9]{8}/;
const app = express();

app.set('port', process.env.PORT || 3000);

// API LIST
// getApiList
app.get('/', (req, res) => {
    res.send("use /api");
});

app.get('/api', (req, res) => {
    logger.info('GET /api');

    const api = getApiList();
    res.json(api);
});

// Only index
app.get('/:name', async (req, res) => {
    logger.info(`GET /${req.params.name}`);

    // url 확인
    const chk = await chkUrl(req.params.name);

    console.log("@chk", chk);
    console.log("@chk type", typeof(chk));

    if (typeof (chk) === 'string') {
        res.json(chk);
    } else {
        res.status(500).send({ error: chk.toString() });
    }
});

// index with date
app.get('/:name/:date', async (req, res) => {
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
});

app.use((req, res, next) => {
    const error = new Error(`${req.method} ${req.url} route not found`);
    next(error);
});

app.listen(app.get('port'), () => {
    logger.info("stock-index-server listening on port " + app.get('port'));
});