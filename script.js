function saveChannels(channels) {
  localStorage.setItem("channels", JSON.stringify(channels));
}

function loadChannels() {
  return JSON.parse(localStorage.getItem("channels") || "[]");
}

function renderChannels() {
  const list = document.getElementById("channelList");
  list.innerHTML = "";
  const channels = loadChannels();
  channels.forEach((ch, index) => {
    const div = document.createElement("div");
    div.className = "channel";

    div.innerHTML = `
      <div class="channel-title">${ch.name}</div>
      <div class="channel-buttons">
        <button onclick="openChannel('${ch.url}')">Abrir</button>
        <button onclick="deleteChannel(${index})">Eliminar</button>
      </div>
    `;
    list.appendChild(div);
  });
}

function addChannel() {
  const name = document.getElementById("channelName").value.trim();
  const url = document.getElementById("channelUrl").value.trim();

  if (!name || !url) return alert("Completa ambos campos");

  const channels = loadChannels();
  channels.push({ name, url });
  saveChannels(channels);
  renderChannels();
  document.getElementById("channelName").value = "";
  document.getElementById("channelUrl").value = "";
}

function deleteChannel(index) {
  const channels = loadChannels();
  channels.splice(index, 1);
  saveChannels(channels);
  renderChannels();
}

function openChannel(url) {
  window.location.href = url;
}

function exportChannels() {
  const data = JSON.stringify(loadChannels(), null, 2);
  const blob = new Blob([data], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "canales.txt";
  a.click();
  URL.revokeObjectURL(url);
}

function importChannels() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      saveChannels(imported);
      renderChannels();
    } catch (e) {
      alert("Error al importar el archivo local.");
      console.error(e); // Para depuración
    }
  };
  reader.readAsText(file);
}

// ** FUNCIÓN PARA CARGAR DESDE UNA URL ONLINE **
async function loadChannelsFromOnlineUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const channels = JSON.parse(text);
    saveChannels(channels);
    renderChannels();
    alert("Canales cargados desde la URL online.");
  } catch (e) {
    alert("Error al cargar canales desde la URL online: " + e.message);
    console.error(e);
  }
}

// ** FUNCIÓN QUE LLAMARÁ EL BOTÓN "Cargar desde GitHub Pages" **
function loadFromGitHubPages() {
  // URL estable de tu archivo canales.txt en GitHub Pages
  const onlineChannelsUrl = 'https://osfesi.github.io/mis-canales-app/canales.txt';
  loadChannelsFromOnlineUrl(onlineChannelsUrl);
}

// Registra el Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/mis-canales-app/service-worker.js')
      .then(registration => {
        console.log('Service Worker registrado con éxito:', registration);
      })
      .catch(error => {
        console.error('Fallo el registro del Service Worker:', error);
      });
  });
}

window.onload = renderChannels;