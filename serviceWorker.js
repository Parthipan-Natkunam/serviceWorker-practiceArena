const version = 'v1.0.8';
// offline page url
const offlinePage = 'offline.html';
// static files cache
const staticCache = `${version}staticfiles`;
// image files cache
const imageCache = `imagefiles`;

// list of all caches
const availableCaches = [
    {
        name: staticCache,
        size: 10
    },
    {
        name:imageCache,
        size: 6
    }
];

/**
 * Helper to keep the cache size in control
 * @param {string} cacheName name of the cache
 * @param {number} maxSize integer denoting the max size of the cache
 */
const trimCache = (cacheName, maxSize) => {
    caches.open(cacheName).then(cache =>{
        cache.keys()
        .then(item=>{
            if(item.length > maxSize){
                cache.delete(item[0])
                .then(()=>{
                    trimCache(cacheName, maxSize);
                });
            }
        });
    }).catch(()=>{
        // the cahe doesn't exist so can be ignored.
    });     
}

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
    const activeCaches = availableCaches.map(cache=>{return cache.name});
    ev.waitUntil(
        caches.keys().then(cacheNames =>{
            return Promise.all(cacheNames.map(cache=>{
                if(!activeCaches.includes(cache)){
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
                if(request.url.includes('favicon.ico')){
                    return caches.match('/favicon.png');
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

addEventListener('message',(ev)=>{
    if(ev.data === 'cleanUpCache'){
        availableCaches.forEach(cache=>{
            trimCache(cache.name, cache.size);
        });
    }
});