const version = 'v1.0.0';
// html files cache
const templateCache = 'templatefiles';
// image files cache
const imageCache = 'imagefiles';
// stylesheets and js cache
const miscCache = 'miscellaniousfiles';

addEventListener('install',(ev)=>{
    ev.waitUntil(
        caches.open(templateCache)
        .then((htmlCache)=>{
            return htmlCache.addAll([
                '/offline.html'
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
    caches.match(request).then((cachedResponse)=>{
        return cachedResponse || fetch(request);
    });
});