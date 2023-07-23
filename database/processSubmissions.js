const db = require('./manager');
const {readFileSync} = require('fs');

const fetchPath = (path) => {
    const fileAdded=path.split('\\').reverse()[0].split('.')[0].replaceAll('[',']').split(']').filter(v=>v);
    // console.log(fileAdded);
    return fileAdded;
}

module.exports.handleLog = (path,io) => {
    const [md5,username,problemName]=fetchPath(path);

    const tmp=db.get(username);
    
    if(!tmp) return;

    io.emit("reload", { data: username });
    
    let index=-1;

    for(let i=0; i<tmp.problems.length; i++) {
        if(tmp.problems[i].name===problemName) {
            index=i;
            break;
        }
    }

    if(index===-1) return;

    if(tmp.problems[index].latest !== md5) return;

    const log=readFileSync(`./${path}`,'utf-8');
    let point=log.split(/\r?\n/)[0].split(`${username}‣${problemName}: `)[1];

    if(point[0]==='ℱ') {
        tmp.problems[index].status=2;
        point=0;
    } else if(point[0]==='⚠') {
        tmp.problems[index].status=3;
        point=0;
    } else if(point[0]==='C') {
        tmp.problems[index].status=4;
        point=0;
    } else {
        tmp.problems[index].status=1;
        point=Number(point);
    }

    tmp.problems[index].point=point;
    tmp.problems[index].log=log;

    db.set(tmp);
}

module.exports.handleSubmission = (path, io) => {
    const [md5,username,problemName]=fetchPath(path);
    io.emit("reload", { data: username });
    const tmp=db.get(username);
    let index=-1;
    for(let i=0; i<tmp.problems.length; i++) {
        if(tmp.problems[i].name===problemName) {
            index=i;
            break;
        }
    }

    try {
        const fileContent = readFileSync(`./${path}`,'utf-8');
    
        if(index===-1) {
            tmp.problems.push({
                name:problemName,
                point:0,
                attemps:0
            });
            index=tmp.problems.length-1;
        }
    
        if(tmp.problems[index].latest===md5) return;
    
        tmp.problems[index].code=fileContent;
        tmp.problems[index].attemps++;
        tmp.problems[index].latest=md5;
        tmp.problems[index].log="";
        tmp.problems[index].status=0;
    
        //0 - judging
        //1 - judged
        //2 - ce
        //3 - caution
        //4 - not judge
    
        db.set(tmp);
    } catch (err) {
        
    }

}