let position = [];
let data = [];
let view = {};
fetch('data').then(res => res.json()).then(res => {
    console.log(res);
    data = res;
    refreshView();
});
function refreshView() {
    view = data;
    document.getElementById('statusBar').innerHTML = '';
    let virtualPosition = [];

    let a = document.createElement('a');
    a.setAttribute('onclick', 'jump([])');
    a.innerText = 'root > ';
    document.getElementById('statusBar').appendChild(a);
    for (let i in position) {
        view = view.children[position[i]];
        virtualPosition.push(position[i]);
        let a = document.createElement('a');
        a.setAttribute('onclick', `jump(${JSON.stringify(virtualPosition)})`);
        a.innerText = view.visibleName + ' > ';
        document.getElementById('statusBar').appendChild(a);
    }
    document.getElementById('tree').innerHTML = '';
    for (let i in view.children) {
        let e = document.createElement('div');
        e.classList.add('listItem');
        if (view.children[i].type === 'CollectionType') {
            e.setAttribute('onclick', `navigate('${i}')`)
            e.innerText = '📂 ' + view.children[i].visibleName;
            e.classList.add('folder');
        }
        else if (view.children[i].type === 'DocumentType') {

            let a = document.createElement('span');
            a.innerHTML = 'View Unconverted';
            a.classList.add('unconvertedOption');
            a.setAttribute('onclick', `unconverted('${i}')`)

            let b = document.createElement('span');
            b.innerText = '🗒 ' + view.children[i].visibleName;
            b.classList.add('fileName');
            b.setAttribute('onclick', `openFile('${i}')`)

            e.appendChild(b);
            e.appendChild(a);
        }
        document.getElementById('tree').appendChild(e);
    }
}
function openFile(uuid) {
    window.location.pathname = `/pdf/${uuid}`;
}
function unconverted(uuid) {
    window.location.pathname = `/unconverted/${uuid}`;
}
function navigate(uuid) {
    position.push(uuid);
    refreshView();
}
function jump(uuidList) {
    position = uuidList;
    refreshView();
}
function reloadCache(button) {
    button.classList.add('spin');
    fetch('/reload_cache').then(_ => {
        if (_.ok) {
            window.location.reload();
        } else {
            window.location.pathname = '/fetch_error';
        }
    });
}