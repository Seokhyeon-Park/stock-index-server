const { getDigits, getDate, getValue } = require('./util');
const axios = require('axios');

const GOOGLE_SHEET_ID = '1AGejSJXHq90mDC53L6_vb_q07assK6YaN-xmGU8hcLk';

const URL_LIST = {
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

const CASH_LIST = {
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
 * Google sheet 가져오기.
 */
const getSheetId = async (sheetName) => {
    try {
        const { data } = await axios({
            method: 'get',
            url: `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?sheet=${sheetName}`,
        });

        return data;
    } catch (error) {
        console.log(error)
    }
}

/**
 * 가져온 데이터 to json
 * @param {*} string 가공 전 데이터
 * @returns 가공된 데이터
 */
const refindSheetsData = (string) => {
    const firstSplit = string.split('google.visualization.Query.setResponse(')[1];
    const jsonData = JSON.parse(firstSplit.slice(0, firstSplit.length - 2));

    return jsonData.table;
}

/**
 * [각 인덱스 반환]
 * @param {*} key 조회할 인덱스
 * @param {*} dateRange 조회범위 
 * @returns 지수
 */
const getIndex = async (key, dateRange) => {
    const pre_index = new Object();
    const index = new Array();

    // INDEX 저장
    await getSheetId(key).then((data) => {
        const { cols, rows } = refindSheetsData(data);
        pre_index[key] = rows;

        // 조회 범위가 있는 경우
        if (dateRange !== undefined) {
            const dateRangeFrom = parseInt(dateRange.split('-')[0]);
            const dateRangeTo = parseInt(dateRange.split('-')[1]);

            for (const data of pre_index[key]) {
                const date = getDate(data.c[0].f);
                const [open, high, low, close] = getValue(data);

                // Date, Open, High, Low, Close
                if (dateRangeFrom < date && dateRangeTo > date) {
                    index.push({
                        'date': date,
                        'open': open,
                        'high': high,
                        'low': low,
                        'close': close,
                    });
                }
            }
        } else {
            // 조회 범위가 없는 경우
            for (const data of pre_index[key]) {
                const date = getDate(data.c[0].f);
                const [open, high, low, close] = getValue(data);

                // Date, Open, High, Low, Close
                index.push({
                    'date': date,
                    'open': open,
                    'high': high,
                    'low': low,
                    'close': close,
                });
            }
        }
    });

    return JSON.stringify(index);
}

/**
 * [각 국가 환율 반환]
 * @param {*} name 화폐명
 * @param {*} dateRange 조회범위
 * @returns 환율
 */
const getExchangeRate = async (name, dateRange) => {
    const cash = name.toUpperCase();
    const pre_exchangeRate = new Object();
    const exchangeRate = new Array();

    await getSheetId(cash).then((data) => {
        const { cols, rows } = refindSheetsData(data);
        pre_exchangeRate[cash] = rows;

        /**
         * 환율
         */
        if (dateRange !== undefined) {
            const dateRangeFrom = parseInt(dateRange.split('-')[0]);
            const dateRangeTo = parseInt(dateRange.split('-')[1]);

            for (const data of pre_exchangeRate[cash]) {
                const date = getDate(data.c[2].f);
                const rate = data.c[3].v;

                // 처리 완료 데이터 저장
                if (dateRangeFrom < date && dateRangeTo > date) {
                    exchangeRate.push({ 'date': date, 'exchangeRate': rate });
                }
            }
        } else {
            for (const data of pre_exchangeRate[cash]) {
                const date = getDate(data.c[2].f);
                const rate = data.c[3].v;

                // 처리 완료 데이터 저장
                exchangeRate.push({ 'date': date, cash: rate });
            }
        }
    });

    return JSON.stringify(exchangeRate);
}

/**
 * [URL 확인 및 데이터 요청]
 * @param {*} name 요청 URL
 * @param {*} dateRange URL 검색 범위
 * @returns URL data or Error
 */
const chkUrl = async (name, dateRange) => {
    let res;

    // url에 문제가 없으면 data를 return
    if (Object.keys(URL_LIST).includes(name.toUpperCase())) {
        res = await getIndex(name, dateRange);
    } else if (Object.keys(CASH_LIST).includes(name.toUpperCase())) {
        res = await getExchangeRate(name, dateRange);
    }
    else {
        res = new Error(`${name} is not found`);
    }

    return res;
}

/**
 * [API List]
 * @returns ApiList 사용 가능한 API 리스트
 */
const getApiList = () => {
    const API_LIST = Object.assign(URL_LIST, CASH_LIST);
    return API_LIST;
}

module.exports = {
    chkUrl, getApiList
};