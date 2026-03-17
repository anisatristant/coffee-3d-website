// Mengimpor semua library yang dibutuhkan dari Three.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// =================================================================
// BAGIAN 1: KODE UNTUK MENGURUS SCENE 3D (VERSI DISEMPURNAKAN)
// =================================================================

// --- SETUP DASAR ---
const canvas = document.getElementById('bg-canvas');
const scene = new THREE.Scene();
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
};

// --- KAMERA ---
// Perspektif kamera tidak diubah, sudah bagus
const camera = new THREE.PerspectiveCamera(45, sizes.width / sizes.height, 0.1, 100);
camera.position.z = 15; // Jarak kamera dari objek
scene.add(camera);

// --- PENCAHAYAAN ---
// Nilai intensitas dinaikkan agar model lebih terang
const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Dari 0.8 menjadi 1.2
const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5); // Dari 1.5 menjadi 2.5
directionalLight.position.set(3, 5, 4);
scene.add(ambientLight);
scene.add(directionalLight);

// Tambahan: Cahaya dari arah lain untuk menonjolkan bentuk
const backlight = new THREE.DirectionalLight(0xffffff, 0.8);
backlight.position.set(-5, -3, -5);
scene.add(backlight);

// --- RENDERER ---
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true,      // Membuat background canvas transparan
    antialias: true   // Menghaluskan tepi objek 3D
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
// Tambahan: Mengatur output encoding untuk warna yang lebih akurat
renderer.outputEncoding = THREE.sRGBEncoding;

// --- KONTROL MOUSE (ORBIT CONTROLS) ---
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;
controls.enableZoom = false; // Zoom dimatikan agar user tidak "hilang"
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5; // Kecepatan putar sedikit diperlambat
// Batasi rotasi vertikal agar user tidak bisa membalikkan model
controls.minPolarAngle = Math.PI / 4; // Batas atas
controls.maxPolarAngle = Math.PI / 1.6; // Batas bawah

// --- LOADING MANAGER (BARU & PENTING) ---
// Ini akan memantau proses loading dan menangani error secara global
const loadingManager = new THREE.LoadingManager(
    // Fungsi yang dijalankan saat semua model berhasil dimuat
    () => {
        console.log('Semua aset berhasil dimuat!');
    },
    // Fungsi (opsional) untuk memantau progres
    (itemUrl, itemsLoaded, itemsTotal) => {
        const progress = (itemsLoaded / itemsTotal) * 100;
        console.log(`Memuat: ${itemUrl}. Progres: ${progress.toFixed(2)}%`);
    },
    // Fungsi yang dijalankan JIKA ADA ERROR saat memuat
    (errorUrl) => {
        console.error('Terjadi error saat memuat aset dari:', errorUrl);
        // Anda bisa menambahkan pemberitahuan di halaman web di sini
    }
);

// --- MEMUAT MODEL 3D (.GLTF) ---
const gltfLoader = new GLTFLoader(loadingManager); // Gunakan loader dengan loading manager

gltfLoader.load(
    'coffee/scene.gltf', // PASTIKAN PATH INI 100% BENAR!
    (gltf) => {
        console.log('Model berhasil dimuat!', gltf);
        const coffeeCup = gltf.scene;
        
        // --- PENYESUAIAN MODEL OTOMATIS (CARA PROFESIONAL) ---
        // 1. Hitung bounding box dari model untuk mengetahui ukurannya
        const box = new THREE.Box3().setFromObject(coffeeCup);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // 2. Atur skala agar ukuran model pas di layar
        const maxDim = Math.max(size.x, size.y, size.z);
        const desiredSize = 8; // Ukuran yang kita inginkan di scene (bisa diubah)
        const scale = desiredSize / maxDim;
        coffeeCup.scale.set(scale, scale, scale);
        
        // 3. Pindahkan model agar pusatnya berada di titik (0,0,0) scene
        coffeeCup.position.sub(center.multiplyScalar(scale));

        // 4. (Opsional) Penyesuaian posisi akhir secara manual jika perlu
        coffeeCup.position.y -= 1; // Sedikit turunkan agar terlihat lebih baik

        scene.add(coffeeCup);
    },
    undefined, // Kita sudah handle progress di loading manager
    (error) => {
        // Error ini spesifik untuk loader ini
        console.error('Terjadi error pada GLTFLoader:', error);
    }
);


// --- LOOP ANIMASI ---
const animate = () => {
    controls.update(); // Wajib ada jika enableDamping = true
    renderer.render(scene, camera);
    window.requestAnimationFrame(animate);
};
animate();

// --- MENANGANI RESIZE JENDELA BROWSER ---
window.addEventListener('resize', () => {
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});


// =================================================================
// BAGIAN 2: KODE UNTUK INTERAKSI HALAMAN (SCROLL)
// Tidak ada yang perlu diubah di sini, kodenya sudah bagus.
// =================================================================
const header = document.getElementById('header');
const navLinks = document.querySelectorAll('nav ul li a');
const sections = document.querySelectorAll('main section');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }

    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= sectionTop - 150) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});