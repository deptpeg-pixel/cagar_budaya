========================================================================
PANDUAN PENYIMPANAN FOTO CAGAR BUDAYA GPIB
========================================================================

Folder ini digunakan untuk menyimpan seluruh file foto bangunan cagar budaya GPIB.

Format file yang didukung:
- JPG / JPEG (.jpg, .jpeg)
- PNG (.png)
- WEBP (.webp)

REKOMENDASI PENAMAAN & STRUKTUR FOLDER:
----------------------------------------
Opsi 1: Buat sub-folder per nomor bangunan (Sangat Rapi)
  images/b01/depan.jpg
  images/b01/interior.jpg
  images/b02/tampak_muka.jpg
  images/b03/menara.jpg

Opsi 2: Simpan langsung di folder images/ dengan nama jelas
  images/b01_immanuel_jakarta_01.jpg
  images/b01_immanuel_jakarta_02.jpg
  images/b02_immanuel_semarang.jpg

CARA MENGHUBUNGKAN FOTO KE HALAMAN WEB:
----------------------------------------
1. Buka file data: data/cagar_budaya_data.js
2. Temukan bangunan yang diinginkan (misal no: 1 untuk GPIB Immanuel, Jakarta)
3. Tambahkan path foto pada bagian "fotos", contoh:

   fotos: [
     { src: "images/b01/depan.jpg", cap: "Tampak depan Willemskerk tahun 1839" },
     { src: "images/b01/interior.jpg", cap: "Kubah dan ruang ibadah utama" }
   ],

Atau Anda juga dapat menggunakan tombol "＋ Path Foto" langsung dari Mode Edit pada tampilan web!
========================================================================
