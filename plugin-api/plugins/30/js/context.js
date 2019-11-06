plug.init().then(function () {
    plug.Store.get('task').then(renderTask);
    plug.Store.subscribe('task', renderTask);
});

function renderTask(task) {
    document.getElementById('info-text').style.display = 'none';
    var frag = document.createDocumentFragment();
    var id = document.createElement('div');
    id.innerText = 'ID: ' + task.id;
    frag.appendChild(id);
    var name = document.createElement('div');
    name.innerText = 'Name: ' + task.name;
    frag.appendChild(name);
    var context = document.getElementById('context');
    context.innerHTML = '';
    context.appendChild(frag);
}
