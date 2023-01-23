const { getDigits, getDate, getValue } = require('./util');
const axios = require('axios');
const logger = require('./logger');

const GOOGLE_SHEET_ID = '1AGejSJXHq90mDC53L6_vb_q07assK6YaN-xmGU8hcLk';

const DATE_PATTERN = /[0-9]{8}-[0-9]{8}/;

const INDEX_LIST = {
    'DJX': {
        'des': '다우지수',
        'type': 'index',
    },
    'SP': {
        'des': 'S&P 500',
        'type': 'index',
    },
    'NASDAQ': {
        'des': '나스닥',
        'type': 'index',
    },
    'KOSPI': {
        'des': '코스피',
        'type': 'index',
    },
}

const EXCHANGE_LIST = {
    'USD': {
        'des': '달러',
        'type': 'exchange rate',
    },
    'JPY': {
        'des': '엔화',
        'type': 'exchange rate',
    },
    'GBP': {
        'des': '파운드',
        'type': 'exchange rate',
    },
    'EUR': {
        'des': '유로',
        'type': 'exchange rate',
    },
    'BRL': {
        'des': '헤알',
        'type': 'exchange rate',
    },
}

/**
 * [Google sheet 가져오기]
 * @param {*} sheetName 검색할 항목
 * @returns 시트 데이터
 */
const getGoogleSheet = async (sheetName) => {
    try {
        const response = await axios({
            method: 'get',
            url: `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?sheet=${sheetName}`,
        });

        logger.info("@google sheet status : " + response.status);
        logger.info("@google sheet size : " + Object.keys(response.data).length);

        return response.data;
    } catch (error) {
        console.log(error);
    }
}

/**
 * 가져온 데이터 to json
 * @param {*} string 가공 전 데이터
 * @returns 가공된 데이터
 */
const refindSheetsData = async (string) => {
    const firstSplit = string.split('google.visualization.Query.setResponse(')[1];
    const jsonData = JSON.parse(firstSplit.slice(0, firstSplit.length - 2));

    return jsonData.table;
}

/**
 * [조회 대상 확인]
 * @param {*} key 조회 대상
 * @returns 조회 대상 존재 여부(boolean)
 */
const chkUrl = (key) => {
    return Object.keys(INDEX_LIST).includes(key.toUpperCase()) || Object.keys(EXCHANGE_LIST).includes(key.toUpperCase());
}

/**
 * [지수 조회]
 * @param {*} data 시트 데이터
 * @param {*} date 검색 기간
 * @returns 
 */
const getIndex = async (data, date) => {
    const arr = new Array;
    let hasDate = date !== undefined ? true : false;

    // date formmat 확인
    if (hasDate) {
        if (!DATE_PATTERN.test(date)) { throw new Error(`${date} format is wrong`); }
        // 조회기간
        const dateFrom = parseInt(date.split('-')[0]);
        const dateTo = parseInt(date.split('-')[1]);

        // data 적재
        for (const row of data) {
            const rowData = row.c;
            console.log("rowData : " + rowData);
            const rowDate = getDate(rowData[0].f);

            if (dateFrom <= rowDate && dateTo >= rowDate) {
                const [open, high, low, close] = [rowData[1].v, rowData[2].v, rowData[3].v, rowData[4].v];

                const obj = {
                    date: rowDate,
                    value: {
                        'open': open,
                        'high': high,
                        'low': low,
                        'close': close,
                    }
                };

                arr.push(obj);
            }
        }
    } else {
        // data 적재
        for (const row of data) {
            const rowData = row.c;
            console.log("rowData : " + rowData);
            const rowDate = getDate(rowData[0].f);
            const [open, high, low, close] = [rowData[1].v, rowData[2].v, rowData[3].v, rowData[4].v];

            const obj = {
                date: rowDate,
                value: {
                    'open': open,
                    'high': high,
                    'low': low,
                    'close': close,
                }
            };

            arr.push(obj);
        }
    }

    return JSON.stringify(arr);
}

/**
 * [환율 조회]
 * @param {*} data 시트 데이터
 * @param {*} date 검색 기간
 * @returns 
 */
const getExchangeRate = async (data, date) => {
    const arr = new Array;
    let hasDate = date !== undefined ? true : false;

    // date formmat 확인
    if (hasDate) {
        if (!DATE_PATTERN.test(date)) { throw new Error(`${date} format is wrong`); }
        // 조회기간
        const dateFrom = parseInt(date.split('-')[0]);
        const dateTo = parseInt(date.split('-')[1]);

        // data 적재
        for (const row of data) {
            const rowData = row.c;
            console.log("rowData : " + rowData);
            const rowDate = getDate(rowData[0].f);

            if (dateFrom <= rowDate && dateTo >= rowDate) {
                const rate = rowData[1].v;

                const obj = {
                        date: rowDate,
                        value: {
                            'rate': rate,
                        }
                };

                arr.push(obj);
            }
        }
    } else {
        // data 적재
        for (const row of data) {
            const rowData = row.c;
            console.log("rowData : " + rowData);
            const rowDate = getDate(rowData[0].f);

            const rate = rowData[1].v;

                const obj = {
                        date: rowDate,
                        value: {
                            'rate': rate,
                        }
                };

                arr.push(obj);
        }
    }

    return JSON.stringify(arr);
}

/**
 * [API 조회]
 * @param {*} reqUrl 조회 대상
 * @param {*} date 조회 기간
 * @returns API 조회 데이터
 */
const getData = async (reqUrl, date) => {
    const key = reqUrl.toUpperCase();

    // url 확인
    if (!chkUrl(key)) throw new Error(`${key} route not found`);

    // SHEET 불러오기
    const sheetData = await getGoogleSheet(key);
    const { rows } = await refindSheetsData(sheetData);

    // 
    if (Object.keys(INDEX_LIST).includes(key)) {
        const json = await getIndex(rows, date);
        return json;
    } else {
        const json = await getExchangeRate(rows, date);
        return json;
    }
}

/**
 * [사용 가능한 API 리스트 조회]
 * @returns 사용 가능한 API 리스트
 */
const getApiList = () => {
    const API_LIST = Object.assign(INDEX_LIST, EXCHANGE_LIST);
    return API_LIST;
}

module.exports = {
    getData,
    getApiList
};