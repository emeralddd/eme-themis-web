const {readFileSync, writeFile} = require('fs');

let storage,indexManager=new Map();

const saveData = async () => {
    const tmp=JSON.stringify(storage);
    writeFile(`${__dirname}/data.json`,tmp,'utf8',err => {
        if(err) {
            console.error(err);
        }
    });
}

module.exports.importData = () => {
    const tmp=readFileSync(`${__dirname}/data.json`,'utf8');
    storage=JSON.parse(tmp);
    for(let i=0; i<storage.length; i++) {
        indexManager.set(storage[i].username,i);
    }
}

module.exports.set = async(data) => {
    if(indexManager.has(data.username)) {
        storage[indexManager.get(data.username)]={...storage[indexManager.get(data.username)],...data};
        saveData();
        return data;
    }

    const tmp={
        ...data,
        "problems":[]
    };

    storage.push(tmp);
    indexManager.set(data.username,indexManager.size-1);
    saveData();

    return tmp;
}

module.exports.get = (data) => {
    if(!indexManager.has(data)) {
        return undefined;
    }

    return {...storage[indexManager.get(data)]};
}

module.exports.getAll = () => {
    return storage;
}