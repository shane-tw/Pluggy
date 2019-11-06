plug.init().then(function () {
    plug.Store.subscribe('users', renderUsers);
    plug.Store.get('users').then(renderUsers);
});

function renderUsers(users) {
    var usersDiv = document.getElementById('users');
    var holder = document.createDocumentFragment();
    for (let i = 0; i < users.length; i++) {
        var user = users[i];
        var userDiv = document.createElement('div');

    }
    console.log(users);
    usersDiv.appendChild(holder);
}
