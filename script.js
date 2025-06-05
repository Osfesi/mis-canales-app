// Clave para el almacenamiento local de canales (la contraseña NO se guarda aquí)
const LOCAL_STORAGE_CHANNELS_KEY = "channels";
// URL del archivo de contraseña en GitHub Pages
// ¡IMPORTANTE: CAMBIA ESTA URL A LA DE TU ARCHIVO password.txt EN TU REPOSITORIO DE GITHUB PAGES!
const GITHUB_PASSWORD_URL = 'https://osfesi.github.io/mis-canales-app/password.txt';

// Objeto para mapear palabras clave a rutas de iconos
const ICON_MAP = {
  "formula 1": "f1-icon.svg", // Convierte a minúsculas y sin espacios extra para la comparación
  "futbol": "football-icon.svg",
  "baloncesto": "basketball-icon.svg",
  // Agrega más palabras clave y sus iconos aquí
  // Ejemplo: "nba": "basketball-icon.svg",
  // Ejemplo: "champions": "champions-icon.svg",
};

// --- Funciones de Gestión de Canales ---
function saveChannels(channels) {
  localStorage.setItem(LOCAL_STORAGE_CHANNELS_KEY, JSON.stringify(channels));
}

function loadChannels() {
  return JSON.parse(localStorage.getItem(LOCAL_STORAGE_CHANNELS_KEY) || "[]");
}

function renderChannels() {
  const list = document.getElementById("channelList");
  list.innerHTML = "";
  const channels = loadChannels();
  if (channels.length === 0) {
    list.innerHTML = "<p class='no-channels-message'>Parece que no hay canales aquí. ¡Agrega uno nuevo o importa tus favoritos!</p>";
  } else {
    channels.forEach((ch, index) => {
      const div = document.createElement("div");
      div.className = "channel";

      // Lógica para el icono
      let channelTitleContent = `<div class="channel-text">${ch.name}</div>`; // Por defecto, solo el texto
      const normalizedName = ch.name.toLowerCase().trim(); // Normaliza el nombre para la comparación

      // Buscar si alguna palabra clave está contenida en el nombre del canal
      for (const keyword in ICON_MAP) {
        if (normalizedName.includes(keyword)) {
          const iconPath = `/mis-canales-app/${ICON_MAP[keyword]}`; // Ruta completa al icono
          // Creamos el HTML con el icono y el texto original en un span oculto para accesibilidad/copiado
          channelTitleContent = `
            <div class="channel-icon-wrapper">
              <img src="${iconPath}" alt="${ch.name}" class="channel-icon">
              <span class="visually-hidden">${ch.name}</span>
            </div>
          `;
          break; // Salimos del bucle una vez que encontramos una coincidencia
        }
      }

      div.innerHTML = `
        <div class="channel-title">${channelTitleContent}</div>
        <div class="channel-buttons">
          <button onclick="openChannel('${ch.url}')" class="button secondary-button">Abrir</button>
          <button onclick="deleteChannel(${index})" class="button secondary-button">Eliminar</button>
        </div>
      `;
      list.appendChild(div);
    });
  }
}

function addChannel() {
  const name = document.getElementById("channelName").value.trim();
  const url = document.getElementById("channelUrl").value.trim();

  if (!name || !url) {
    alert("¡Ups! Por favor, completa el nombre y el enlace del canal.");
    return;
  }

  const channels = loadChannels();
  channels.push({ name, url });
  saveChannels(channels);
  renderChannels();
  document.getElementById("channelName").value = "";
  document.getElementById("channelUrl").value = "";
}

function deleteChannel(index) {
  const channels = loadChannels();
  if (confirm(`¿Estás seguro de que quieres eliminar el canal "${channels[index].name}"? Esta acción no se puede deshacer.`)) {
    channels.splice(index, 1);
    saveChannels(channels);
    renderChannels();
    alert("Canal eliminado con éxito.");
  }
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
  a.download = "canales_acestream.txt"; // Nombre de archivo más descriptivo
  a.click();
  URL.revokeObjectURL(url);
  alert("Canales exportados con éxito a canales_acestream.txt");
}

function importChannels() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) {
    alert("Selecciona un archivo para importar.");
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const imported = JSON.parse(reader.result);
      if (!Array.isArray(imported) || !imported.every(ch => typeof ch.name === 'string' && typeof ch.url === 'string')) {
         throw new Error("Formato de archivo incorrecto.");
      }
      saveChannels(imported);
      renderChannels();
      alert("¡Canales importados con éxito!");
    } catch (e) {
      alert("Error al importar el archivo. Asegúrate de que sea un archivo .txt con un formato JSON válido de canales.");
      console.error(e);
    }
  };
  reader.readAsText(file);
}

async function loadChannelsFromOnlineUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    const channels = JSON.parse(text);
    if (!Array.isArray(channels) || !channels.every(ch => typeof ch.name === 'string' && typeof ch.url === 'string')) {
        throw new Error("Formato de datos online incorrecto.");
    }
    saveChannels(channels);
    renderChannels();
    alert("Canales cargados desde la fuente online.");
  } catch (e) {
    alert("¡Uy! No se pudieron cargar los canales desde la URL online. Revisa tu conexión o el enlace.");
    console.error(e);
  }
}

function loadFromGitHubPages() {
  const onlineChannelsUrl = 'https://osfesi.github.io/mis-canales-app/canales.txt'; // Cambia esta URL si tu archivo de canales online tiene otro nombre
  loadChannelsFromOnlineUrl(onlineChannelsUrl);
}

// --- Funciones de Pantalla de Contraseña ---
function showPasswordScreen(message = "") {
  const passwordScreen = document.getElementById("passwordScreen");
  const appContent = document.getElementById("appContent");
  const passwordScreenTitle = document.getElementById("passwordScreenTitle");
  const passwordScreenMessage = document.getElementById("passwordScreenMessage");
  const passwordInput = document.getElementById("passwordInput");
  const passwordActionButton = document.getElementById("passwordActionButton");
  const passwordError = document.getElementById("passwordError");

  passwordScreenTitle.textContent = "Acceso a Canales Acestream";
  passwordScreenMessage.textContent = message;
  passwordActionButton.textContent = "Acceder";

  passwordInput.value = "";
  passwordError.textContent = "";

  appContent.classList.add("hidden");
  passwordScreen.classList.remove("hidden");
  passwordInput.focus();
}

async function checkPassword() {
  const passwordInput = document.getElementById("passwordInput");
  const errorMessage = document.getElementById("passwordError");
  const passwordActionButton = document.getElementById("passwordActionButton");

  const enteredPassword = passwordInput.value.trim();

  if (!enteredPassword) {
    errorMessage.textContent = "Por favor, introduce la contraseña.";
    return;
  }

  errorMessage.textContent = "Verificando contraseña...";
  passwordActionButton.disabled = true;

  try {
    const response = await fetch(GITHUB_PASSWORD_URL);
    if (!response.ok) {
      throw new Error(`No se pudo cargar la contraseña desde GitHub. (Estado: ${response.status})`);
    }
    const githubPassword = (await response.text()).trim();

    if (enteredPassword === githubPassword) {
      hidePasswordScreen();
      renderChannels(); // Renderiza los canales después de un acceso exitoso
    } else {
      errorMessage.textContent = "Contraseña incorrecta. Inténtalo de nuevo.";
      passwordInput.value = "";
      passwordInput.focus();
      // Si la contraseña no coincide y quieres que la app se recargue o cierre, puedes descomentar una de estas líneas:
      // window.location.reload(); // Recarga la página
      // window.location.href = "about:blank"; // Intenta cerrar la pestaña/ventana (comportamiento varía según el navegador)
    }
  } catch (e) {
    errorMessage.textContent = `Error de conexión o al verificar la contraseña: ${e.message}. Asegúrate de tener internet.`;
    console.error("Error al cargar la contraseña de GitHub:", e);
  } finally {
    passwordActionButton.disabled = false;
  }
}

function hidePasswordScreen() {
  document.getElementById("passwordScreen").classList.add("hidden");
  document.getElementById("appContent").classList.remove("hidden");
}

// --- Inicialización al cargar la ventana ---
window.onload = () => {
  showPasswordScreen("Introduce la contraseña para acceder a tus canales.");
};

// Registra el Service Worker (mantener al final)
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