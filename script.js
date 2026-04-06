async function loadFromGitHubPages() {
  const url = 'https://osfesi.github.io/mis-canales-app/canales.txt';
  const list = document.getElementById("channelList");
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("No se pudo obtener la lista");
    
    const channels = await response.json();
    
    // Limpiamos la lista antes de cargar
    list.innerHTML = "";

    channels.forEach((ch) => {
      const div = document.createElement("div");
      div.className = "channel";
      div.innerHTML = `
        <div class="channel-title">${ch.name}</div>
        <button class="btn-open" onclick="window.location.href='${ch.url}'">Ver Canal</button>
      `;
      list.appendChild(div);
    });

  } catch (e) {
    alert("Error al cargar: " + e.message);
  }
}

// Registro del Service Worker para que funcione como App
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/mis-canales-app/service-worker.js');
}