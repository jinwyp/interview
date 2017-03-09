/**
 *
 * Here's the file for the coding challenge.
 * Pls tell me the stock with the largest absolute increase from its first recording to its last recording.
 * This is complicated by the file being unsorted, and having lots of null values, with non-standard null entries (unknown, NA, N/A, UNKOWN, etc).
 *
 *
 *
 * 附件内是一个包含了多个公司股价历史的文件（乱序排列），
 * 请编写一个程序(不限语言，但最好能在mac/linux下运行), 读取这个文件并返回增长最多的那只股票的名称及增值（输出到终端也可），请注意数据中包含不规则的无效数据。
 *
 *
 *
 * require node 7.x.x
 *
 */






const fs = require('fs');
const path = require('path');
const readline = require('readline');
const stream = require('stream');


const filePath = path.join(__dirname, 'interview.csv');


/**
 * arrayToObject
 *
 * reformat the original data from array to object
 * filter out the date without null ,unknown, NA, etc
 *
 *
 */

function arrayToObject (titleArray, sourceArray){

    let stockList = [];

    if (Array.isArray(titleArray) && Array.isArray(sourceArray)) {

        for(let i=0;  i < sourceArray.length; i++){

            let stock = {};
            let oneRowDataArray = sourceArray[i].split(',');
            const oneRowValue = oneRowDataArray[3];

            if (oneRowValue && oneRowValue !== true && !isNaN(Number(oneRowValue))){
                titleArray.forEach(function(title, titleIndex){

                    stock[title] = oneRowDataArray[titleIndex];

                    if (title === 'Date'){
                        stock[title] = oneRowDataArray[titleIndex].split('/').join('-');
                    }
                });

                // console.log('one row data : ', oneRowDataArray)
                stockList.push(stock)
            }
        }

    }
    // console.log('arrayToObject : ', stockList.length);
    return stockList;
}




/**
 * Sort by date
 *
 */
function sortByDate (sourceData){

    if (Array.isArray(sourceData)){

        if ( sourceData.length <= 1){
            return sourceData;
        }else {

            const midNumber = Math.floor(sourceData.length / 2);
            const midObject = sourceData.splice(midNumber, 1);

            let left = [];
            let right = [];


            for (let j = 0; j < sourceData.length; j++){

                let currentDateValue = new Date(sourceData[j].Date);
                let midDateValue = new Date(midObject[0].Date);

                if (currentDateValue < midDateValue){
                    left.push(sourceData[j]);
                }else{
                    right.push(sourceData[j]);
                }
            }
            // console.log('left: ', left.length)
            // console.log('right: ', right.length)

            return sortByDate(left).concat(midObject, sortByDate(right));
        }
    }else{
        return [];
    }

}




/**
 * Find largest absolute increase and decrease stock
 *
 */
function getLargestAbsoluteIncrease( sourceData) {

    let tempObject = {};
    let tempResult = {
        maxIncreaseName : '',
        maxIncrease     : 0,
        maxDecreaseName : '',
        maxDecrease     : 0,
        maxBalanceName : '',
        maxBalance   : 0
    };


    sourceData.forEach( (item, itemIndex) => {

        if(typeof tempObject[item.Name] === 'undefined'){
            tempObject[item.Name] = {
                firstItemValue : Number(item.Value),
                firstItemChange : item.Change,
                absoluteIncrease : 0,
                absoluteDecrease : 0,
                balance :  0
            };


            if (item.Change === 'INCREASED'){
                tempObject[item.Name].absoluteIncrease = Number(item.Value)
            }else if (item.Change === 'DECREASED'){
                tempObject[item.Name].absoluteDecrease = Number(item.Value)
            }else if (item.Change === 'NEW'){
                tempObject[item.Name].balance = Number(item.Value)
            }
        }else{

            if (item.Change === 'INCREASED'){
                tempObject[item.Name].absoluteIncrease = tempObject[item.Name].absoluteIncrease + Number(item.Value);

                tempObject[item.Name].balance = tempObject[item.Name].balance + Number(item.Value);

                if (tempResult.maxIncrease < tempObject[item.Name].absoluteIncrease){
                    tempResult.maxIncrease = tempObject[item.Name].absoluteIncrease;
                    tempResult.maxIncreaseName = item.Name;
                }

            }else if (item.Change === 'DECREASED'){
                tempObject[item.Name].absoluteDecrease = tempObject[item.Name].absoluteDecrease + Number(item.Value);

                tempObject[item.Name].balance = tempObject[item.Name].balance - Number(item.Value);

                if (tempResult.maxDecrease < tempObject[item.Name].absoluteDecrease){
                    tempResult.maxDecrease = tempObject[item.Name].absoluteDecrease;
                    tempResult.maxDecreaseName = item.Name;
                }
            }


            if (tempResult.maxBalance < tempObject[item.Name].balance){
                tempResult.maxBalance = tempObject[item.Name].balance;
                tempResult.maxBalanceName = item.Name;
            }

        }
    });

    return tempResult;
}





exports.useStream = function(){
    let file = fs.createReadStream(filePath);
    let sourceDataBuffer = Buffer.from('');


    file.on("data", function(data) {

        file.pause();
        sourceDataBuffer = Buffer.concat([sourceDataBuffer, data]);
        file.resume();

    });

    file.on("end", function() {

        console.log('---------- Log Message Stream----------');

        let fileDataArray = sourceDataBuffer.toString('utf8').split(/(?:\n|\r\n|\r)/g);
        const dataTableTitle = fileDataArray.shift().split(',');

        let stockDataList = arrayToObject(dataTableTitle, fileDataArray);
        let stockDataList2 = sortByDate(stockDataList);

        let result = getLargestAbsoluteIncrease(stockDataList2);
        console.log(result)
    });

    file.on("error", function(error) {
        console.log("Open file error。", error);
    });
};






exports.useStreamReadline = function(){
    let instream = fs.createReadStream(filePath);
    let outstream = new stream;

    let tempObject = {};

    let tempResult = {
        maxIncreaseName : '',
        maxIncrease     : 0,
        maxDecreaseName : '',
        maxDecrease     : 0,
        maxBalanceName : '',
        maxBalance   : 0
    };


    let rl = readline.createInterface({
        input  : instream,
        output : outstream
    });

    rl.on('line', function(line) {

        let oneStock = line.split(',');
        let oneStockName = oneStock[0];
        let oneStockValue = oneStock[3];
        let oneStockChange = oneStock[4];

        if (oneStock[0] !== 'Name'){

            // Filter valid numbers
            if (oneStockValue && oneStockValue !== true && !isNaN(Number(oneStockValue))){

                if (typeof tempObject[oneStockName] === 'undefined'){
                    tempObject[oneStockName] = {
                        historyList      : [],
                        absoluteIncrease : 0,
                        absoluteDecrease : 0,
                        balance          : 0
                    };

                    tempObject[oneStockName].historyList.push({
                        name : oneStock[0],
                        date : oneStock[1],
                        notes : oneStock[2],
                        value : Number(oneStock[3]),
                        change : oneStock[4],
                    });

                    if (oneStockChange === 'INCREASED'){
                        tempObject[oneStockName].absoluteIncrease = Number(oneStockValue)
                    }else if (oneStockChange === 'DECREASED'){
                        tempObject[oneStockName].absoluteDecrease = Number(oneStockValue)
                    }else if (oneStockChange === 'NEW'){
                        tempObject[oneStockName].balance = Number(oneStockValue)
                    }

                }else{


                    if (oneStockChange=== 'INCREASED'){
                        tempObject[oneStockName].absoluteIncrease = tempObject[oneStockName].absoluteIncrease + Number(oneStockValue);
                        tempObject[oneStockName].balance = tempObject[oneStockName].balance + Number(oneStockValue);

                        if (tempResult.maxIncrease < tempObject[oneStockName].absoluteIncrease){
                            tempResult.maxIncrease = tempObject[oneStockName].absoluteIncrease;
                            tempResult.maxIncreaseName = oneStockName;
                        }

                    }else if (oneStockChange=== 'DECREASED'){
                        tempObject[oneStockName].absoluteDecrease = tempObject[oneStockName].absoluteDecrease + Number(oneStockValue);
                        tempObject[oneStockName].balance = tempObject[oneStockName].balance - Number(oneStockValue);

                        if (tempResult.maxDecrease < tempObject[oneStockName].absoluteDecrease){
                            tempResult.maxDecrease = tempObject[oneStockName].absoluteDecrease;
                            tempResult.maxDecreaseName = oneStockName;
                        }

                    }else if (oneStockChange=== 'NEW'){
                        tempObject[oneStockName].balance = tempObject[oneStockName].balance + Number(oneStockValue);
                    }


                    if (tempResult.maxBalance < tempObject[oneStockName].balance){
                        tempResult.maxBalance = tempObject[oneStockName].balance;
                        tempResult.maxBalanceName = oneStockName;
                    }

                }
            }


        }

    });

    rl.on('close', function() {
        console.log('---------- Log Message Stream with readline ----------');
        // console.log(tempObject);
        console.log(tempResult);
    });
};





exports.run = function(){

    fs.readFile(filePath, function (err, data) {
        if (err) {
            console.log(err);
            return
        }

        console.log('---------- Log Message ----------');

        let fileDataArray = data.toString('utf8').split(/(?:\n|\r\n|\r)/g);
        const dataTableTitle = fileDataArray.shift().split(',');

        let stockDataList = arrayToObject(dataTableTitle, fileDataArray);
        let stockDataList2 = sortByDate(stockDataList);

        let result = getLargestAbsoluteIncrease(stockDataList2);
        console.log(result)

    });
};






