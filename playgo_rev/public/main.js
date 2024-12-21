import { GobanRenderer } from "goban";
import Goban from "goban-engine";

// Membuat instance Goban
const goban = new Goban();
const renderer = new GobanRenderer(goban);

// Menggunakan elemen DOM untuk merender papan permainan
const container = document.getElementById("goban-container");
renderer.render(container);

// Tambahkan fungsionalitas tambahan di sini, misalnya menangani langkah pemain
