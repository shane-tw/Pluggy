function safeHTML(unsafe) {
  return unsafe
  	.replace(/&/g, "&amp;").replace(/</g, "&lt;")
    .replace(/>/g, "&gt;").replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function addPlugin(pluginId, pluginUrl) {
  var iframe = document.createElement('iframe');
  iframe.id = pluginId;
  iframe.src = pluginUrl + '#' + pluginId;
  document.body.appendChild(iframe);
}

function handleBtn(e) {
  var pluginFrame = document.getElementById(e.target['data-pluginId']);
  var pluginWindow = pluginFrame.contentWindow;
  pluginWindow.postMessage(JSON.stringify({
    cmd: 'press-button', buttonId: e.target.id
  }), '*');
}

function addButton(section, details) {
  var button = document.createElement('button');
  button.id = details.id;
  button.innerHTML = details.label;
  button.onclick = handleBtn;
  button['data-pluginId'] = details.pluginId;
  document.getElementById(section).appendChild(button);
}

function handleMessageFromPlugin(e) {
  details = JSON.parse(e.data);
  if (details.cmd === 'add-button') {
    addButton(details.section, {
        id: details.buttonId, label: details.buttonLabel,
        pluginId: details.pluginId
    });
  }
}

window.addEventListener('message', handleMessageFromPlugin, false);
window.onload = function() {
  addPlugin('plugin-id-1', '//shanepm.github.io/iframe.html');
  addPlugin('plugin-id-2', '//shanepm.github.io/iframe.html');
}
