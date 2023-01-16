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

let g_time;
let g_index;
let g_exchangeRate;

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
const refindSheetsData = async (string) => {
    const firstSplit = await string.split('google.visualization.Query.setResponse(')[1];
    const jsonData = await JSON.parse(firstSplit.slice(0, firstSplit.length - 2));

    return jsonData.table;
}

/**
 * [모든 데이터 저장]
 * 특정 시간마다 데이터를 저장.
 */
const getAllData = async () => {
    g_index = new Object();
    g_exchangeRate = new Object();
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1
    const date = today.getDate();
    const hours = today.getHours();
    const minutes = today.getMinutes();
    const seconds = today.getSeconds();
    g_time = year + '-' + month + '-' + date + " / " + hours + ":" + minutes + ":" + seconds;
    getFullIndex();
    getFullExchangeRate();
}

/**
 * [모든 인덱스 저장]
 * @returns 지수
 */
const getFullIndex = async () => {
    const pre_index = new Object();
    const index = new Object();

    // INDEX 저장
    for (const key in URL_LIST) {
        await getSheetId(key).then( async (data) => {
            const { cols, rows } = await refindSheetsData(data);
            pre_index[key] = await rows;
            const arr = new Array;

            for (const data of pre_index[key]) {
                const date = getDate(data.c[0].f);
                const [open, high, low, close] = getValue(data);

                // Date, Open, High, Low, Close
                const obj = {
                    date: date,
                    value: {
                        'open': open,
                        'high': high,
                        'low': low,
                        'close': close,
                    }
                };
                
                arr.push(obj);
            }

            index[key] = arr;
        });
    }

    g_index = index;
}

/**
 * [각 국가 환율 반환]
 * @returns 환율
 */
const getFullExchangeRate = async () => {
    const pre_exchangeRate = new Object();
    const exchangeRate = new Array();

    for (const key in CASH_LIST) {
        await getSheetId(key).then((data) => {
            const { cols, rows } = refindSheetsData(data);
            pre_exchangeRate[key] = rows;
            const arr = new Array;

            for (const data of pre_exchangeRate[key]) {
                const date = getDate(data.c[2].f);
                const rate = data.c[3].v;

                const obj = {
                        date: date,
                        value: {
                            'rate': rate,
                        }
                };

                arr.push(obj);
            }

            exchangeRate[key] = arr;
        });
    }

    g_exchangeRate = exchangeRate;
}

/**
 * [각 인덱스 반환]
 * @param {*} key 조회할 인덱스
 * @param {*} dateRange 조회범위 
 * @returns 지수
 */
const getIndex = async (key, dateRange) => {
    const upKey = key.toUpperCase();

    // 조회 범위가 있는 경우
    if (dateRange !== undefined) {
        const dateRangeFrom = parseInt(dateRange.split('-')[0]);
        const dateRangeTo = parseInt(dateRange.split('-')[1]);

        const index = new Array();
        
        Object.entries(g_index[upKey]).forEach(([upKey, value]) => {
            if(dateRangeFrom < value.date && dateRangeTo > value.date) {
                index.push(value);
            }
        });

        return JSON.stringify(index);
    } else {
        // 조회 범위가 없는 경우
        return JSON.stringify(g_index[upKey]);
    }

}

/**
 * [각 국가 환율 반환]
 * @param {*} key 화폐명
 * @param {*} dateRange 조회범위
 * @returns 환율
 */
const getExchangeRate = async (key, dateRange) => {
    const upKey = key.toUpperCase();

    // 조회 범위가 있는 경우
    if (dateRange !== undefined) {
        const dateRangeFrom = parseInt(dateRange.split('-')[0]);
        const dateRangeTo = parseInt(dateRange.split('-')[1]);

        const index = new Array();
        
        Object.entries(g_exchangeRate[upKey]).forEach(([key, value]) => {
            if(dateRangeFrom < value.date && dateRangeTo > value.date) {
                index.push(value);
            }
        });
        
        return JSON.stringify(index);
    } else {
        // 조회 범위가 없는 경우
        return JSON.stringify(g_exchangeRate[upKey]);
    }
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
    } else {
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

const main = () => {
    getAllData();
    console.log("main started (", g_time, ")");
    setInterval(() => {
        console.log("get data...(", g_time, ")");
        getAllData();
    }, 1000 * 60 * 60);
}


module.exports = {
    chkUrl, getApiList
};

main();