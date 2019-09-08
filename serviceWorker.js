const version = 'v1.0.0';
// offline page url
const offlinePage = 'offline.html';
// html files cache
const templateCache = `${version}templatefiles`;
// image files cache
const imageCache = `${version}imagefiles`;
// stylesheets and js cache
const miscCache = `${version}miscellaniousfiles`;
// list of all caches
const availableCaches = [templateCache,imageCache,miscCache];

addEventListener('install',(ev)=>{
    ev.waitUntil(
        caches.open(templateCache)
        .then((htmlCache)=>{
            return htmlCache.addAll([
                offlinePage
            ]);
        })
        .catch((err)=>{
            console.log(err.message);
        })
    );
});

addEventListener('activate',(ev)=>{
    console.log('service worker is activated...');
});

addEventListener('fetch',(ev)=>{
    const request = ev.request;
    if(request.mode === 'navigate' || request.headers.get('accept').includes('text/html')){
        ev.respondWith(
            fetch(request).catch(()=>{
                return caches.match(offlinePage);
            })
        );
    }
});