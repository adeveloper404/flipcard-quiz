// Ganti dengan URL CSV dari Google Sheet Anda
const googleSheetURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRF57Bc9TKitjZKJVwowhPtyHoHXvm77Qt-kKh2yXHoXH9wDaDkcYMlkx43vYm_8k9zefs9bu-iq-hr/pub?gid=0&single=true&output=csv';

// Elemen DOM
const setupContainer = document.getElementById('setup-container');
const gameContainer = document.getElementById('game-container');
const cardContainer = document.getElementById('card-container');
const cardCountInput = document.getElementById('card-count-input');
const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const loader = document.querySelector('.loader');

let bankSoal = [];
let flippedCard = null;
let zoomedCard = null;

// PERBAIKAN: Buat elemen overlay sekali saja
const overlay = document.createElement('div');
overlay.className = 'overlay';
document.body.appendChild(overlay);

function showLoading(isLoading) {
    if (isLoading) {
        loader.classList.remove('hidden');
        startBtn.classList.add('hidden');
    } else {
        loader.classList.add('hidden');
        startBtn.classList.remove('hidden');
    }
}

async function fetchSoal() {
    showLoading(true);
    try {
        const response = await fetch(googleSheetURL);
        const data = await response.text();
        const rows = data.split('\n').slice(1);
        bankSoal = rows.map(row => {
            const cleanRow = row.trim();
            return { soal: cleanRow };
        }).filter(item => item.soal);
    } catch (error) {
        console.error('Gagal mengambil data dari Google Sheet:', error);
        alert('Gagal memuat soal. Periksa kembali URL Google Sheet Anda dan koneksi internet.');
    } finally {
        showLoading(false);
    }
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function closeZoomedCard() {
    if (zoomedCard) {
        zoomedCard.classList.remove('zoomed');
        overlay.classList.remove('active'); // Sembunyikan overlay
        
        setTimeout(() => {
            if (!zoomedCard) return; // Pastikan kartu tidak null
            zoomedCard.classList.remove('flipped');
            const closeBtn = zoomedCard.querySelector('.close-card-btn');
            if (closeBtn) closeBtn.remove();
            zoomedCard = null;
            flippedCard = null;
        }, 300);
    }
}

function createCards(jumlah) {
    cardContainer.innerHTML = '';
    closeZoomedCard();

    const soalDiacak = shuffleArray([...bankSoal]);
    const soalTerpilih = soalDiacak.slice(0, jumlah);

    soalTerpilih.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'flip-card';
        card.style.animationDelay = `${index * 0.07}s`;

        card.innerHTML = `
            <div class="flip-card-inner">
                <div class="flip-card-front">?</div>
                <div class="flip-card-back">
                    <p>${item.soal}</p>
                </div>
            </div>
        `;

        card.addEventListener('click', () => {
            if (zoomedCard || card.classList.contains('flipped')) return;
            handleCardFlipAndZoom(card);
        });

        cardContainer.appendChild(card);
    });
}

function handleCardFlipAndZoom(card) {
    if (flippedCard) {
        flippedCard.classList.remove('flipped');
    }
    
    card.classList.add('flipped');
    flippedCard = card;

    setTimeout(() => {
        if (!card.classList.contains('flipped')) return;
        card.classList.add('zoomed');
        zoomedCard = card;
        overlay.classList.add('active'); // Tampilkan overlay

        const closeBtn = document.createElement('button');
        closeBtn.className = 'close-card-btn';
        closeBtn.innerHTML = '&times;'; // Simbol 'X' yang lebih baik
        closeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            closeZoomedCard();
        });
        card.querySelector('.flip-card-back').appendChild(closeBtn);

    }, 600);
}

startBtn.addEventListener('click', () => {
    const jumlahKartu = parseInt(cardCountInput.value);

    if (bankSoal.length === 0) {
        alert('Soal belum termuat. Mohon tunggu sebentar.');
        return;
    }
    if (isNaN(jumlahKartu) || jumlahKartu < 1) {
        alert('Masukkan jumlah kartu yang valid.');
        return;
    }
    if (jumlahKartu > bankSoal.length) {
        alert(`Jumlah soal yang tersedia hanya ${bankSoal.length}. Mohon masukkan angka yang lebih kecil.`);
        return;
    }

    setupContainer.classList.add('hidden');
    gameContainer.classList.remove('hidden');
    createCards(jumlahKartu);
});

restartBtn.addEventListener('click', () => {
    closeZoomedCard();
    gameContainer.classList.add('hidden');
    setupContainer.classList.remove('hidden');
});

// Panggil fetchSoal saat halaman dimuat
fetchSoal();