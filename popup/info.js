var videos = [];


// agrega elemento a la lista (pendiente: que reciba obj video como parametro)
function addToLista(vid){

    var row = document.createElement("tr");
    row.id = vid.nombre;
    var data = document.createElement("td");
    var zelda = document.createElement("a");
    zelda.href = vid.url;
    var mensaje = document.createTextNode(vid.nombre);

    row.appendChild(data);
    data.appendChild(zelda);
    zelda.appendChild(mensaje);

    var lista = document.getElementById("lista");
    lista.appendChild(row);
}

function addToListaPro(videoObj){
    //var row = document.createElement("tr");
}

// actualiza el titulo
function title(palabras) {
    document.getElementById("titulo").innerText = palabras;
}

// Comunicacion

function pedirVideos() {
    browser.runtime.sendMessage("videospls");
    console.log(videos);
}

function recibe(mensaje) {

    videos = JSON.parse(mensaje);

    var lista = document.getElementById("lista");
    lista.innerHTML = "";

    videos.forEach(v => {
        addToLista(v);
    });
    title(videos.length + " videos encontrados");
}

// Eventos e inicializacion

var limpia = document.getElementById("limpiar");

limpia.addEventListener('click', function () {
    browser.runtime.sendMessage("clear");
});

browser.runtime.onMessage.addListener(recibe);

title("buscando...");
pedirVideos();
window.setInterval(pedirVideos, 1000);


