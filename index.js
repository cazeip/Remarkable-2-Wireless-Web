const fs = require('fs');
const express = require('express');
const app = express();
const port = 4000;
const path = require('path');
const { dirname } = require('path');
const nodeScp = require('node-scp');
const childProcess = require('child_process');
require('dotenv').config();
let result;

app.disable('x-powered-by');
app.use(express.static('./public'));
app.use(express.json());

app.listen(port, () => {
    console.log(`Success! Your application is running on port ${port}.`);
});
app.get('/data', (req, res) => {
    res.send(result);
});
app.get('/reload_cache', (req, res) => {
    childProcess.exec('rm cache/*');
    nodeScp.Client({
        host: process.env.HOST,
        port: 22,
        username: 'root',
        password: process.env.PASSWORD 
    }).then(client => {
        client.list('/home/root/.local/share/remarkable/xochitl/').then(list => {
            let toBedownloaded = 0;
            for(let i in list){
                if(list[i].name.includes('.metadata')){
                    client.downloadFile(`/home/root/.local/share/remarkable/xochitl/${list[i].name}`, `cache/${list[i].name}`).then(response => {
                        toBedownloaded--;
                        if(toBedownloaded == 0){
                            console.log('Cached Everything');
                            client.close();
                            fs.readdir('cache', (err, files) => {
                                for(let i in files){
                                    if(files[i].includes('.metadata')){
                                        let f = fs.readFileSync(`cache/${files[i]}`, {encoding: 'utf-8'});
                                        let data = JSON.parse(f);
                                        data.children = {};

                                        let currentUUID = files[i].slice(0, files[i].length - '.metadata'.length);
                                        data.selfID = currentUUID;
                                        filesystem[currentUUID] = data;
                                    }
                                }
                                for(let key in filesystem){
                                    if(key !== '' && key !== 'trash') filesystem[filesystem[key].parent].children[key] = filesystem[key];
                                }
                                result = filesystem[''];
                                fs.writeFileSync('cached.json', JSON.stringify(result));
                                console.log('Successfully indexed file system');
                                res.status(200).send('Successfully indexed file system');
                            });
                        }
                    });
                    toBedownloaded++;
                }
            }
        });
    });
});
app.get('/pdf/:id', (req, res)=>{
    const pdfUUID = req.params.id;
    nodeScp.Client({
        host: process.env.HOST,
        port: 22,
        username: 'root',
        password: process.env.PASSWORD 
    }).then(client => {
        client.list('/home/root/.local/share/remarkable/xochitl').then(list => {
            let curatedList = [];
            let containsPdf = false;
            for(let i in list){
                if (list[i].name.includes(pdfUUID)){
                    curatedList.push(list[i]);
                    if(list[i].name.includes('.pdf')){
                        containsPdf = true;
                    }
                }
            }
            let toBedownloaded = 0;
            for(let i in curatedList){
                let request;
                if(curatedList[i].type === 'd'){
                    request = client.downloadDir(`/home/root/.local/share/remarkable/xochitl/${curatedList[i].name}`, `cache/${curatedList[i].name}`)
                }else{
                    request = client.downloadFile(`/home/root/.local/share/remarkable/xochitl/${curatedList[i].name}`, `cache/${curatedList[i].name}`)
                }    
                request.then(resp => {
                    toBedownloaded--;
                    if(toBedownloaded === 0){
                        console.log('Downloaded all files.');
                        let conversion;
                        if(containsPdf){
                            conversion = childProcess.exec(`./rm2pdf cache/${pdfUUID} rendered/${pdfUUID}.pdf`);
                        }else{
                            conversion = childProcess.exec(`./rm2pdf -t templates/A4.pdf cache/${pdfUUID} rendered/${pdfUUID}.pdf`);
                        }
                        conversion.on('exit', () => {
                            let f = fs.readFileSync(`cache/${pdfUUID}.metadata`, {encoding: 'utf-8'});
                            let dataForname = JSON.parse(f);
                            let pdfName = dataForname.visibleName;
                            res.download(path.join(__dirname, `rendered/${pdfUUID}.pdf`), `${pdfName}.pdf`);
                        });
                    }
                });
                toBedownloaded++;
            }
        });
    });
});
let filesystem = {};
filesystem[''] = {
    children: {}
}
filesystem['trash'] = {
    children: {}
}
result = fs.readFileSync('cached.json', {encoding: 'utf-8'});
