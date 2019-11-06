plug.init().then(function () {
    plug.PermissionAPI.request([
        { id: 'viewBoards' },
        { id: 'viewProjects' }
    ]).then(main);
});

function main() {
    start();
    plug.Store.subscribe('dialog_shown', function () {
        resetPage(); start();
    });
}

var TRELLO_SITE_ID = 8;
var PROJECTS_SITE_ID = 9;

function start() {
    if (plug.siteId === TRELLO_SITE_ID) {
        fetchBoards().then(renderItems);
        return;
    }
    plug.Store.get('project').then(function (project) {
        plug.Store.set('project', undefined);
        if (project) {
            generateCSVs(project)
        } else {
            fetchProjects().then(renderItems);
        }
    });
}

function fetchProjects() {
    return plug.fetchInternal('/projects.json')
    .then(function (r) {
        return r.json();
    }).then(function (json) {
        return json.projects;
    })
}

function fetchBoards() {
    var url = '/1/members/me/boards';
    return plug.fetchInternal(url)
    .then(function (r) {
        return r.json();
    })
}

function fetchColumns(item) {
    var url;
    if (plug.siteId === TRELLO_SITE_ID) {
        url = '/1/boards/' + item.id + '/lists';
    } else if (plug.siteId === PROJECTS_SITE_ID) {
        url = '/projects/' + item.id + '/boards/columns.json';
    }
    return plug.fetchInternal(
        url
    ).then(function (r) {
        return r.json();
    }).then(function (json) {
        return json.columns || json;
    });
}

function fetchCards(column) {
    var url;
    if (plug.siteId === TRELLO_SITE_ID) {
        url = '/1/lists/' + column.id + '/cards';
    } else if (plug.siteId === PROJECTS_SITE_ID) {
        url = '/boards/columns/' + column.id + '/cards.json';
    }
    return plug.fetchInternal(
        url
    ).then(function (r) {
        return r.json();
    }).then(function (json) {
        return json.cards || json;
    });
}

function getBoardTitle() {
    var title = 'Click a board to generate CSVs';
    if (plug.siteId === PROJECTS_SITE_ID) {
        title = 'Click a project to generate CSVs';
    }
    return title;
}

function renderItems(items) {
    var boardHolder = document.getElementById('boards');
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        fragment.appendChild(renderItem(item));
    }
    document.getElementById('board-title').innerText = getBoardTitle();
    boardHolder.appendChild(fragment);
}

function renderItem(item) {
    var div = document.createElement('li');
    var anchor = document.createElement('a');
    anchor.innerText = item.name;
    anchor.href = 'javascript:;';
    anchor.addEventListener('click', function () {
        generateCSVs(item);
    });
    div.appendChild(anchor);
    return div;
}

function elemCSV(name, data) {
    var root = document.createElement('li');
    var blob = new Blob([data], {type: 'text/csv'});
    var elem = document.createElement('a');
    elem.href = URL.createObjectURL(blob);
    elem.download = name + '.csv';
    elem.innerText = name;
    root.appendChild(elem);
    return root;
}

function toCSV(arr) {
    var tmp = 'ID,Name';
    for (var i = 0; i < arr.length; i++) {
        var item = arr[i];
        tmp += '\n' + item.id + ',' + item.name;
    }
    return tmp;
}

function renderCards(column, cardsHolder) {
    fetchCards(column).then(function (cards) {
        var cardsElem = elemCSV(column.name, toCSV(cards));
        cardsHolder.appendChild(cardsElem);
    });
}

function generateCSVs(board) {
    fetchColumns(board).then(function (columns) {
        document.getElementById('board-title').innerText = board.name;
        document.getElementById('boards').innerHTML = '';
        var colsElem = elemCSV('Columns', toCSV(columns));
        document.getElementById('columns').appendChild(colsElem);
        document.getElementById('card-title').innerText = 'Cards (per column)';
        var cardsHolder = document.getElementById('cards');
        for (var i = 0; i < columns.length; i++) {
            var column = columns[i];
            renderCards(column, cardsHolder);
        }
    })
}

function resetPage() {
    document.getElementById('board-title').innerText = getBoardTitle();
    document.getElementById('boards').innerHTML = '';
    document.getElementById('columns').innerHTML = '';
    document.getElementById('card-title').innerHTML = '';
    document.getElementById('cards').innerHTML = '';
}
