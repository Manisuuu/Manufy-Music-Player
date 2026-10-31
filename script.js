
// =====================================
// MUSICHUB - PERSONAL MUSIC PLAYER
// =====================================

// 1. DEFAULT SONGS

const defaultSongs = [
    { name: "2 Numbari", src: "songs/2_Numbari_1.mp3", cover: "covers/2_Numbari_1.jpg" },
    { name: "Aankhon Se Tune", src: "songs/Aankhon Se Tune 2.0(KoshalWorld.Com).mp3", cover: "covers/song02.jpg" },
    { name: "Casa Tupka Anthem", src: "songs/Casa Tupka Anthemo - Yo Yo Honey Singh.mp3", cover: "covers/song03.jpg" },
    { name: "Har Kisi Ko Nahi Milta", src: "songs/Har Kisi Ko Nahi Milta_320(KoshalWorld.Com).mp3", cover: "covers/song04.jpg" },
    { name: "Haseeno Ka Deewana", src: "songs/Haseeno Ka Deewana Kaabil 320 Kbps.mp3", cover: "covers/song05.jpg" },
    { name: "Heeriye (Race 3)", src: "songs/Heeriye Race 3 320 Kbps.mp3", cover: "covers/song06.jpg" },
    { name: "Jee Karda (Badlapur)", src: "songs/Jee Karda (Badlapur) - Divya Kumar.mp3", cover: "covers/song07.jpg" },
    { name: "Jo Tere Sang", src: "songs/Jo Tere Sang(KoshalWorld.Com).mp3", cover: "covers/song08.jpg" },
    { name: "Kaha Se", src: "songs/Kaha_Se_1.mp3", cover: "covers/song09.jpg" },
    { name: "KALYANI (Remix)", src: "songs/KALYANI (Remix)(KoshalWorld.Com).mp3", cover: "covers/song10.jpg" },
    { name: "KALYANI", src: "songs/KALYANI.mp3", cover: "covers/song11.jpg" },
    { name: "Nashe Si Chadh Gayi", src: "songs/Nashe Si Chadh Gayi Befikre 320 Kbps.mp3", cover: "covers/song12.jpg" },
    { name: "Sitaare (Ikkis)", src: "songs/Sitaare Ikkis 128 Kbps.mp3", cover: "covers/song13.jpg" },
    { name: "Vishal Mishra", src: "songs/Vishal_Mishra_-_Janiye_-_PagalNew_(mp3.pm).mp3", cover: "covers/song14.jpg" },
    { name: "Zaroorat (Ek Villain)", src: "songs/Zaroorat Ek Villain 320 Kbps.mp3", cover: "covers/Zaroorat Ek Villain 320 Kbps.jpg" },
    { name: "Matargashti tamasha", src: "songs/Matargashti Tamasha 320 Kbps.mp3", cover: "covers/Matargashti Tamasha 320 Kbps.jpg" },
    { name: "Sajde", src: "songs/Sajde Kill Dil 320 Kbps.mp3", cover: "covers/Sajde Kill Dil 320 Kbps.jpg" },
    { name: "Arbi Ghode", src: "songs/ARBI GHODE - PagaliWorld.mp3", cover: "covers/ARBI GHODE - PagaliWorld.jpg" },
    { name: "Financer", src: "songs/Financer Bintu Pabra 320 Kbps.mp3", cover: "covers/Financer Bintu Pabra 320 Kbps.jpg" },
];


// 2. VARIABLES

let songs = [];
let currentIndex = -1;
let shuffle = false;
let repeat = false;
let filterMode = "all";
let recentSongs = [];

let db;
let currentObjectURL = null;


// 3. HTML ELEMENTS

const audio = document.getElementById("audio");

const playlist = document.getElementById("playlist");
const songList = document.getElementById("songList");
const recentList = document.getElementById("recentList");

const songTitle = document.getElementById("songTitle");
const artist = document.getElementById("artist");
const songCount = document.getElementById("songCount");
const currentCover = document.getElementById("currentCover");

const fileInput = document.getElementById("fileInput");
const searchInput = document.getElementById("searchInput");

const playBtn = document.getElementById("playBtn");
const nextBtn = document.getElementById("nextBtn");
const prevBtn = document.getElementById("prevBtn");

const shuffleBtn = document.getElementById("shuffleBtn");
const repeatBtn = document.getElementById("repeatBtn");

const progress = document.getElementById("progress");
const volume = document.getElementById("volume");
const muteBtn = document.getElementById("muteBtn");

const currentTimeText = document.getElementById("currentTime");
const durationText = document.getElementById("duration");

const allFilter = document.getElementById("allFilter");
const favoritesFilter = document.getElementById("favoritesFilter");


// 4. INDEXEDDB DATABASE

function openDatabase() {
    return new Promise((resolve, reject) => {

        const request = indexedDB.open("MusicHubDB", 1);

        request.onupgradeneeded = () => {

            const database = request.result;

            if (!database.objectStoreNames.contains("uploads")) {
                database.createObjectStore("uploads", {
                    keyPath: "id"
                });
            }

        };

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });
}


function getUploads() {
    return new Promise((resolve, reject) => {

        const transaction = db.transaction("uploads", "readonly");

        const request = transaction.objectStore("uploads").getAll();

        request.onsuccess = () => resolve(request.result);

        request.onerror = () => reject(request.error);

    });
}


function saveUpload(song) {
    return new Promise((resolve, reject) => {

        const transaction = db.transaction("uploads", "readwrite");

        transaction.objectStore("uploads").put(song);

        transaction.oncomplete = () => resolve();

        transaction.onerror = () => reject(transaction.error);

    });
}


// 5. LOCAL STORAGE
function getFavorites() {
    try {
        return JSON.parse(localStorage.getItem("musicFavorites")) || [];
    } catch {
        return [];
    }
}

function getFavorites() {

    try {
        return JSON.parse(localStorage.getItem("musicFavorites")) || [];
    } catch {
        return [];
    }

}


function saveFavorites() {

    const favorites = songs
        .filter(song => song.favorite)
        .map(song => song.id);

    localStorage.setItem("musicFavorites", JSON.stringify(favorites));

}


function saveRecent() {

    localStorage.setItem("musicRecent", JSON.stringify(recentSongs));

}


// 6. TIME FORMAT

function formatTime(seconds) {

    if (!Number.isFinite(seconds)) return "0:00";

    const minutes = Math.floor(seconds / 60);

    const secs = Math.floor(seconds % 60);

    return `${minutes}:${String(secs).padStart(2, "0")}`;

}


// 7. ALBUM COVER

function makeCover(song) {

    const box = document.createElement("div");

    box.className = "song-cover";

    box.textContent = "♫";

    if (song.cover) {

        const img = document.createElement("img");

        img.src = song.cover;

        img.alt = song.name;

        img.onerror = () => {
            img.remove();
            box.textContent = "♫";
        };

        box.textContent = "";

        box.appendChild(img);

    }

    return box;

}


function updateCurrentCover(song) {

    currentCover.innerHTML = "";

    if (song.cover) {

        const img = document.createElement("img");

        img.src = song.cover;

        img.alt = song.name;

        img.onerror = () => {
            currentCover.textContent = "♫";
        };

        currentCover.appendChild(img);

    } else {

        currentCover.textContent = "♫";

    }

}


// 8. RENDER SONGS

function renderSongs() {

    playlist.innerHTML = "";

    songList.innerHTML = "";

    const search = searchInput.value.toLowerCase();

    const filtered = songs
        .map((song, index) => ({ ...song, index }))
        .filter(song =>
            song.name.toLowerCase().includes(search)
        )
        .filter(song =>
            filterMode === "all" || song.favorite
        );

    songCount.textContent = `${songs.length} Songs`;

    if (filtered.length === 0) {

        songList.textContent = "No songs found.";

        return;

    }

    filtered.forEach(song => {

        // SIDEBAR PLAYLIST

        const sideItem = document.createElement("div");

        sideItem.className = "playlist-item";

        sideItem.textContent = "♫  " + song.name;

        if (song.index === currentIndex) {
            sideItem.classList.add("active");
        }

        sideItem.addEventListener("click", () => {
            playSong(song.index);
        });

        playlist.appendChild(sideItem);


        // MAIN SONG ROW

        const row = document.createElement("div");

        row.className = "song-row";

        if (song.index === currentIndex) {
            row.classList.add("active");
        }

        const number = document.createElement("span");

        number.className = "song-number";

        number.textContent = song.index + 1;


        const cover = makeCover(song);


        const name = document.createElement("span");

        name.className = "song-name";

        name.textContent = song.name;


        const heart = document.createElement("button");

        heart.className = "favorite-btn";

        heart.textContent = song.favorite ? "♥" : "♡";

        if (song.favorite) {
            heart.classList.add("active");
        }

        heart.onclick = event => {

            event.stopPropagation();

            toggleFavorite(song.id);

        };


        const time = document.createElement("span");

        time.className = "song-duration";

        time.textContent = song.duration || "--:--";


        row.append(number, cover, name, heart, time);

        row.addEventListener("click", () => {
            playSong(song.index);
        });

        songList.appendChild(row);

    });

}


// 9. RECENTLY PLAYED

function renderRecent() {

    recentList.innerHTML = "";

    recentSongs.forEach(id => {

        const song = songs.find(item => item.id === id);

        if (!song) return;

        const card = document.createElement("div");

        card.className = "recent-card";

        card.appendChild(makeCover(song));

        const name = document.createElement("p");

        name.textContent = song.name;

        card.appendChild(name);

        card.onclick = () => {
            playSong(songs.indexOf(song));
        };

        recentList.appendChild(card);

    });


    if (recentList.children.length === 0) {

        const empty = document.createElement("p");

        empty.className = "empty-recent";

        empty.textContent = "Your recently played songs will appear here.";

        recentList.appendChild(empty);

    }

}


// 10. FAVOURITES

function toggleFavorite(id) {

    const song = songs.find(item => item.id === id);

    if (!song) return;

    song.favorite = !song.favorite;

    saveFavorites();

    renderSongs();

}


// 11. PLAY SONG

function playSong(index) {

    if (index < 0 || index >= songs.length) return;

    currentIndex = index;

    const song = songs[index];

    if (currentObjectURL) {

        URL.revokeObjectURL(currentObjectURL);

        currentObjectURL = null;

    }

    if (song.blob) {

        currentObjectURL = URL.createObjectURL(song.blob);

        audio.src = currentObjectURL;

    } else {

        audio.src = song.src;

    }

    songTitle.textContent = song.name;

    artist.textContent = "Your Music Library";

    updateCurrentCover(song);

    recentSongs = [
        song.id,
        ...recentSongs.filter(id => id !== song.id)
    ].slice(0, 10);

    saveRecent();

    renderRecent();

    renderSongs();

    progress.value = 0;

    currentTimeText.textContent = "0:00";

    durationText.textContent = "0:00";

    audio.play().catch(() => {

        playBtn.textContent = "▶";

        alert("Song nahi chal raha. MP3 filename aur path check karo.");

    });

}


// 12. PLAY AND PAUSE

function togglePlay() {

    if (currentIndex === -1) {

        playSong(0);

        return;

    }

    if (audio.paused) {

        audio.play().catch(() => {});

    } else {

        audio.pause();

    }

}

playBtn.addEventListener("click", togglePlay);


audio.addEventListener("play", () => {

    playBtn.textContent = "Ⅱ";

});


audio.addEventListener("pause", () => {

    playBtn.textContent = "▶";

});


// 13. NEXT AND PREVIOUS

function nextSong() {

    if (songs.length === 0) return;

    let index;

    if (shuffle && songs.length > 1) {

        do {

            index = Math.floor(Math.random() * songs.length);

        } while (index === currentIndex);

    } else {

        index = (currentIndex + 1) % songs.length;

    }

    playSong(index);

}


function previousSong() {

    if (songs.length === 0) return;

    if (audio.currentTime > 3) {

        audio.currentTime = 0;

        return;

    }

    playSong((currentIndex - 1 + songs.length) % songs.length);

}

nextBtn.addEventListener("click", nextSong);

prevBtn.addEventListener("click", previousSong);


// 14. SONG DURATION

audio.addEventListener("loadedmetadata", () => {

    durationText.textContent = formatTime(audio.duration);

    if (currentIndex !== -1) {

        songs[currentIndex].duration = formatTime(audio.duration);

        renderSongs();

    }

});


// 15. PROGRESS BAR

audio.addEventListener("timeupdate", () => {

    if (!Number.isFinite(audio.duration) || audio.duration === 0) return;

    progress.value = (audio.currentTime / audio.duration) * 100;

    currentTimeText.textContent = formatTime(audio.currentTime);

});


progress.addEventListener("input", () => {

    if (Number.isFinite(audio.duration) && audio.duration > 0) {

        audio.currentTime = (progress.value / 100) * audio.duration;

    }

});


// 16. VOLUME AND MUTE

audio.volume = 0.7;

volume.value = 70;

volume.addEventListener("input", () => {

    audio.volume = volume.value / 100;

    audio.muted = false;

    muteBtn.textContent = audio.volume === 0 ? "🔇" : "🔊";

});


muteBtn.addEventListener("click", () => {

    audio.muted = !audio.muted;

    muteBtn.textContent = audio.muted ? "🔇" : "🔊";

});


// 17. SHUFFLE

shuffleBtn.addEventListener("click", () => {

    shuffle = !shuffle;

    shuffleBtn.classList.toggle("selected", shuffle);

});


// 18. REPEAT

repeatBtn.addEventListener("click", () => {

    repeat = !repeat;

    audio.loop = repeat;

    repeatBtn.classList.toggle("selected", repeat);

});


audio.addEventListener("ended", () => {

    if (!repeat) nextSong();

});


// 19. SEARCH

searchInput.addEventListener("input", renderSongs);


// 20. FILTERS

allFilter.addEventListener("click", () => {

    filterMode = "all";

    allFilter.classList.add("active");

    favoritesFilter.classList.remove("active");

    renderSongs();

});


favoritesFilter.addEventListener("click", () => {

    filterMode = "favorites";

    favoritesFilter.classList.add("active");

    allFilter.classList.remove("active");

    renderSongs();

});


// 21. ADD MUSIC AND SAVE PERMANENTLY

fileInput.addEventListener("change", async () => {

    const files = Array.from(fileInput.files);

    for (const file of files) {

        if (!file.type.startsWith("audio/")) continue;

        const id = "upload-" + Date.now() + "-" + Math.random().toString(36).slice(2);

        const uploadedSong = {

            id: id,

            name: file.name.replace(/\.[^/.]+$/, ""),

            blob: file,

            favorite: false,

            duration: ""

        };

        try {

            await saveUpload(uploadedSong);

            songs.push({

                ...uploadedSong,

                src: ""

            });

        } catch (error) {

            console.error("Upload save error:", error);

            alert("Song save nahi hua. Browser storage check karo.");

        }

    }

    renderSongs();

    fileInput.value = "";

});


// 22. INITIALIZE MUSIC PLAYER

async function initializePlayer() {

    try {

        db = await openDatabase();

        const favorites = getFavorites();

        const defaults = defaultSongs.map((song, index) => ({

            ...song,

            id: "default-" + index,

            favorite: favorites.includes("default-" + index),

            duration: ""

        }));

        const uploads = await getUploads();

        const savedUploads = uploads.map(song => ({

            ...song,

            src: "",

            favorite: favorites.includes(song.id)

        }));

        songs = [...defaults, ...savedUploads];

        recentSongs = JSON.parse(
            localStorage.getItem("musicRecent") || "[]"
        );

        recentSongs = recentSongs.filter(id =>
            songs.some(song => song.id === id)
        );

        renderSongs();

        renderRecent();

    } catch (error) {

        console.error("MusicHub initialization error:", error);

        alert("MusicHub database open nahi ho paya. Browser storage check karo.");

    }

}


initializePlayer();
