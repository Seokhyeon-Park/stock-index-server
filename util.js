/**
 * 입력문자열에서 숫자만 추출한다.
 * @param {string} pStr 
 * @return {string}
 */
const getDigits = (pStr) => {
    if (isEmpty(pStr)) {
        return '';
    }
    // 정규식
    return pStr.replace(/[^0-9]/g, '');
}

/**
* 빈 객체(또는 빈 배열) 체크
* @param {object|Array} param 
* @returns 
*/
const isEmpty = (param) => {

    if (param == null || param === undefined) {
        return true;
    }
    if (param === "undefined" || param === "UNDEFINED" || param === "null" || param === "NULL" || param.length == 0) {
        return true;
    }


    return false;
}

const getDate = (data) => {
    const ori_date = data;
    const cuted_date = ori_date.substring(0, 12);
    const y = cuted_date.split('.')[0].trim();
    const m = cuted_date.split('.')[1].trim().padStart(2, '0');
    const d = getDigits(cuted_date.split('.')[2]).trim().padStart(2, '0');
    const date = parseInt(y + m + d);

    return date;
}

const getValue = (data) => {
    return [data.c[1].v, data.c[2].v, data.c[3].v, data.c[4].v];
}

module.exports = {
    getDigits,
    getDate,
    getValue
};