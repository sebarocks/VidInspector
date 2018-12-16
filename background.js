var videos = [];

// OPERACIONES

function orden(message) {
    if (message == "videospls") {
        var videosStr = JSON.stringify(videos);
        browser.runtime.sendMessage(videosStr);
    }
    if (message == "clear") {
        videos = [];
    }
}

function obtenerFilename(url){
    var parseo = url.split("/");
    return parseo[parseo.length - 1];
}

function quitaParametros(url){
    return url.split('?')[0];
}

function quitaRange(url){
    var parseo = url.split("&");
    if(parseo[parseo.length - 1].startsWith("rbuf=")){
        parseo.pop();
    }
    if(parseo[parseo.length - 1].startsWith("rn=")){
        parseo.pop();
    }
    if(parseo[parseo.length - 1].startsWith("range=")){
        parseo.pop();
    }
    return parseo.join("&");
}

function quitaStartEnd(url){
    var parseo = url.split("&");
    if(parseo[parseo.length - 1].startsWith("byteend=")){
        parseo.pop();
    }
    if(parseo[parseo.length - 1].startsWith("bytestart=")){
        parseo.pop();
    }
    return parseo.join("&");
}

function obtenerId(url){
    var parametros = url.split("&");
    var i = parametros.findIndex(p => p.startsWith("id="))
    if(i==-1){
        return "Unknown"
    }
    else{
        return parametros[i].split("=").pop();
    }
}

function leerMime(url){
    var parametros = url.split("&");
    var aud = parametros.findIndex(p => p.startsWith("mime=audio"))
    var vid = parametros.findIndex(p => p.startsWith("mime=video"))
    if(aud!=-1){
        return "ya"
    }
    if(vid!=-1){
        return "yv"
    }
}

function leerTipoF(url){
    var parametros = url.split("&");
    var aud = parametros.findIndex(p => p.startsWith("_nc_ht=video"))
    var vid = parametros.findIndex(p => p.startsWith("_nc_ht=scontent"))
    if(aud!=-1){
        return "fa"
    }
    if(vid!=-1){
        return "fv"
    }
}

// DETECTORES

function facebookDetect(requestDetails) {
    var vidUrl = requestDetails.url;

    // quita bytestart y byteend

    vidUrl = quitaStartEnd(vidUrl);

    //obtiene nombre
    var vidName = quitaParametros(obtenerFilename(vidUrl));

    var vidTipo = leerTipoF(vidUrl);

    if (videos.findIndex(v => v.nombre == vidName) == -1) {
        videos.push({
            tipo: vidTipo,
            nombre: vidName,
            url: vidUrl
        });
    }
}

function twitterDetect(requestDetails) {

    var vidUrl = requestDetails.url;
    var vidName = obtenerFilename(vidUrl);

    if (videos.findIndex(v => v.nombre == vidName) == -1) {
        videos.push({
            tipo: 't',
            nombre: vidName,
            url: vidUrl
        });
    }
}

function youtubeDetect(requestDetails){
    var vidUrl = requestDetails.url;

    // quita range
    vidUrl = quitaRange(vidUrl);

    // obtiene tipo
    var vidTipo = leerMime(vidUrl);
    
    //obtiene nombre
    var vidName = vidTipo + '_' + obtenerId(vidUrl);

    if (videos.findIndex(v => v.nombre == vidName) == -1) {
        videos.push({
            tipo: vidTipo,
            nombre: vidName,
            url: vidUrl
        });
    }
}

function twitterGif() {
    browser.tabs.executeScript({code: 'document.getElementsByTagName("video")[0].src;'})
        .then(res => {
            var link = res[0];

            // Descarta los blob
            if(link.split(":")[0]=="blob"){
                return;
            }
            
            // Obtiene nombre de archivo
            var vidName = obtenerFilename(link);
            
            // si no esta en la lista lo agrega
            if (videos.findIndex(v => v.nombre == vidName) == -1) {
                videos.push({
                    tipo: 't',
                    nombre: vidName,
                    url: link
                });
            }
        });
}

// LISTENERS

//window.setInterval(twitterGif,3000);

browser.webRequest.onBeforeRequest.addListener(
    facebookDetect, {
        urls: ["*://*.fbcdn.net/*.mp4*"]
    }
);

browser.webRequest.onBeforeRequest.addListener(
    twitterDetect, {
        urls: ["*://video.twimg.com/*.m3u8*"]
    }
)

browser.webRequest.onBeforeRequest.addListener(
    youtubeDetect, {
        urls: ["*://*.googlevideo.com/videoplayback*"]
    }
)

browser.runtime.onMessage.addListener(orden);

