/**
 * Created by jinwyp on 3/14/17.
 */


const fs = require('fs');
const path = require('path');

const sourceFile = './aa.js';







let resultModuleRequired = {};
let allDependencyList = [];
let counter = [];
let promiseArray = [];


var readFile = (file, dirname) => {

    dirname = dirname || __dirname;
    const fileFullPath = path.join(dirname, file);
    const fileDirPath = path.dirname(fileFullPath);
    const fileName = path.basename(fileFullPath);

    console.log('-----------------------------------------------');
    console.log(fileName, file, fileDirPath);

    if (allDependencyList.indexOf(fileName) === -1){
        allDependencyList.push(fileName);


        let fileContent = fs.readFileSync(fileFullPath, {encoding:'utf8'});

        let regex = /require\(('|"")(.*)('|"")\)/gi ;
        let moduleDependencyList = fileContent.match(regex);

        if (moduleDependencyList && moduleDependencyList.length > 0){
            moduleDependencyList.forEach(function(subFile){
                let regex2 = /require\(('|"")(.*)('|"")\)/gi ;
                let subModule = regex2.exec(subFile)[2];

                const subFileFullPath = path.join(fileDirPath, subModule);
                // console.log(subModule, subFileFullPath)

                if (allDependencyList.indexOf(subModule) === -1){
                    readFile(subModule, fileDirPath)
                }

            })
        }
    }


};




var readFileAsync = (file, dirname, finalCallback) => {

    dirname = dirname || __dirname;

    const fileFullPath = path.join(dirname, file);
    const fileDirPath = path.dirname(fileFullPath);
    const fileName = path.basename(fileFullPath);

    console.log('-----------------------------------------------');
    console.log(fileName, file, fileDirPath);


    if (allDependencyList.indexOf(fileName) === -1){
        allDependencyList.push(fileName);
        counter.push(fileName);
        console.log('--- Counter : ', counter);

        fs.readFile(fileFullPath, {encoding:'utf8'}, function(err, fileContent){

            if (err){
                return finalCallback(err);
            }

            let regex = /require\(('|"")(.*)('|"")\)/gi ;
            let moduleDependencyList = fileContent.match(regex);

            if (moduleDependencyList && moduleDependencyList.length > 0){
                moduleDependencyList.forEach(function(subFile){
                    let regex2 = /require\(('|"")(.*)('|"")\)/gi ;
                    let subModule = regex2.exec(subFile)[2];

                    console.log('Sub Module : ', subModule);
                    readFileAsync(subModule, fileDirPath, finalCallback)
                })
            }else{
                // 没有依赖.
            }

            const moduleIndex = counter.indexOf(fileName);
            counter.splice(moduleIndex, 1);

            if (counter.length === 0){
                finalCallback(null, allDependencyList)
            }

        });

    }
};


var readFileAsyncPromise = (file, dirname) => {

    return new Promise(function(resolve, reject) {

        dirname = dirname || __dirname;

        const fileFullPath = path.join(dirname, file);
        const fileDirPath = path.dirname(fileFullPath);
        const fileName = path.basename(fileFullPath);

        console.log('-----------------------------------------------');
        console.log(fileName, file, fileDirPath);


        if (allDependencyList.indexOf(fileName) === -1) {
            allDependencyList.push(fileName);

            fs.readFile(fileFullPath, {encoding:'utf8'}, function(err, fileContent) {

                if (err) {
                    return reject(err);
                }

                let regex = /require\(('|"")(.*)('|"")\)/gi ;
                let moduleDependencyList = fileContent.match(regex);

                let tempPromiseArray = [];

                if (moduleDependencyList && moduleDependencyList.length > 0){
                    moduleDependencyList.forEach(function(subFile){
                        let regex2 = /require\(('|"")(.*)('|"")\)/gi ;
                        let subModule = regex2.exec(subFile)[2];

                        console.log('Sub Module : ', subModule, 'in Module:', fileName);

                        tempPromiseArray.push(readFileAsyncPromise(subModule, fileDirPath))
                    });

                    Promise.all(tempPromiseArray).then(( moduleArray )=>{
                        // moduleArray.forEach((module)=>{
                        //     console.log('Sub Module 2222: ', module);
                        // })
                        console.log('+++++++++++++++++++++++++++++++');
                        console.log('Promise All Sub Module : ', moduleArray, 'in Module:', fileName);

                        resolve(allDependencyList)
                    })
                }else{
                    console.log('No Sub Module : ', fileName);
                    resolve(fileName)
                }
            })
        }else{
            resolve(null)
        }

    })

};




module.exports = run;


function run(){
    // readFile(sourceFile);
    // console.log("Final Result : ", allDependencyList);

    // readFileAsync(sourceFile, __dirname, function(err, result2){
    //     console.log("Final Result : ", result2)
    // });


    readFileAsyncPromise(sourceFile).then((result2)=>{
        console.log("Final Result : ", result2)
    }).catch(function(err){
        console.log(err)
    });
}


run();