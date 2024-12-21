// server.js
const express = require('express');
const path = require('path');
const app = express();


// Menyajikan Halaman Utama dari direktori 'main' pada rute '/'
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Menyajikan halaman1 dari direktori 'public' pada rute '/halaman1'
app.use('/rulebased', express.static(path.join(__dirname, 'public')));

// Menyajikan halaman2 dari direktori 'public2' pada rute '/halaman2'
app.use('/minmax', express.static(path.join(__dirname, 'public2')));

app.use('/media', express.static(path.join(__dirname, 'media')));
// Menangani permintaan root (/) dan mengarahkan ke salah satu halaman atau halaman utama
// app.get('/', (req, res) => {
//   res.send(`
//     <h1>Selamat Datang!</h1>
//     <p>Pilih halaman:</p>
//     <ul>
//       <li><a href="/halaman1">Halaman 1</a></li>
//       <li><a href="/halaman2">Halaman 2</a></li>
//     </ul>
//   `);
// });

// Menangani 404 - Halaman Tidak Ditemukan
app.use((req, res, next) => {
  res.status(404).send(`
    <h1>404 - Halaman Tidak Ditemukan</h1>
    <p>Maaf, halaman yang Anda cari tidak ada.</p>
    <a href="/">Kembali ke Halaman Utama</a>
  `);
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});