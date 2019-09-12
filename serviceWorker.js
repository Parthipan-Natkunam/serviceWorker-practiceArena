const version = 'v1.0.2';
// offline page url
const offlinePage = 'offline.html';
// static files cache
const staticCache = `${version}staticfiles`;
// image files cache
const imageCache = `imagefiles`;

// list of all caches
const availableCaches = [staticCache,imageCache];

addEventListener('install',(ev)=>{
    ev.waitUntil(
        caches.open(imageCache)
        .then(imgCache =>{
            imgCache.addAll([
                '/favicon.png'
            ]);
        }),
        caches.open(staticCache)
        .then((statCache)=>{
            return statCache.addAll([
                offlinePage,
                '/style.css'
            ]);
        })
        .catch((err)=>{
            console.log(err.message);
        })
    );
});

addEventListener('activate',(ev)=>{
    ev.waitUntil(
        caches.keys().then(cacheNames =>{
            return Promise.all(cacheNames.map(cache=>{
                if(!availableCaches.includes(cache)){
                    return caches.delete(cache);
                }
            }));
        }).then(()=>{
            return clients.claim();
        })
    );
});

addEventListener('fetch',(ev)=>{
    const request = ev.request;
    // HTML file strategy
    if(request.mode === 'navigate' || request.headers.get('accept').includes('text/html')){
        ev.respondWith(
            fetch(request).catch(()=>{
                return caches.match(offlinePage);
            })
        );
        return;
    }
    // Image file Strategy
    if(request.headers.get('accept').includes('image')){
        ev.respondWith(
            caches.match(request).then((cachedImage)=>{
                if(cachedImage){
                    return cachedImage;
                }
                return fetch(request).then((response)=>{
                    const imageresponse = response.clone();
                    caches.open(imageCache).then(imgCache=>{
                        imgCache.put(request, imageresponse);
                    })
                    return response;
                })
            })
        );
        return;
    }
    // other requests
    ev.respondWith(
        caches.match(request).then(cachedResponse => {
            if(cachedResponse){
                return cachedResponse;
            }
            return fetch(request);
        })
    );
});