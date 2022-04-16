const fs = require("fs");
const express = require("express");
const app = express();
const port = 4000;
let result;

app.use(express.static('./public'));
app.use(express.json());

app.listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`);
});
app.get("/data", (req, res) => {
    res.send(result);
});

let filesystem = {};
filesystem[""] = {
    children: {}
}
filesystem["trash"] = {
    children: {}
}

fs.readdir('Remarkable', (err, files) => {
    console.log("Found mounting point");
    for(i in files){
        console.log(files[i]);
        if(files[i].contains(".metadata")){
            f = fs.readFileSync(`Remarkable/${files[i]}`, {encoding: 'utf-8'});
            data = JSON.parse(f);
            data.children = {};

            currentUUID = files[i].slice(0, files[i].length - ".metadata".length);
            data.selfID = currentUUID;
            filesystem[currentUUID] = data;
        }
    }
    for(key in filesystem){
        if(key !== "" && key !== "trash") filesystem[filesystem[key].parent].children[key] = filesystem[key];
    }
    result = filesystem[""];
});
