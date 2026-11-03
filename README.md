# 🌸 BLOOM BOOK

### Website Pemesanan Buku Online | UTS Pemrograman Web 1

**BLOOM BOOK** adalah website toko buku online sederhana yang dibuat untuk memenuhi tugas Ujian Tengah Semester (UTS) mata kuliah Pemrograman Web 1. Website ini menyediakan fitur login, katalog dan stok buku, pemesanan, riwayat transaksi, serta pelacakan pengiriman.

**Tugas UTS — Pemrograman Web** 
| | |
|---|---|
| **Nama** | Annisa Fikriyani |
| **NIM** | 312510314 |
| **Kelas** | I252A |
| **Video penjelasan** | https://youtu.be/Xj-hFHoQaeE |

## Struktur Folder

```
tugas-uts-web1/
├── index.html          # halaman login
├── dashboard.html
├── stok.html
├── checkout.html
├── tracking.html
├── css/
│   └── style.css       # seluruh gaya tampilan 
├── js/
│   ├── data.js         # data pengguna, katalog buku, dan tracking
│   └── script.js       # logika semua halaman
└── img/                # sampul buku
```

## Teknologi yang Digunakan 

- **HTML5** untuk struktur halaman.
- **CSS3** untuk desain dan tampilan responsif.
- **JavaScript** untuk interaksi DOM, validasi formulir, pengelolaan data, dan modal/pop-up.
- **JSON/Array JavaScript** pada `js/data.js` sebagai data simulasi.

## Cara Menjalankan Website

1. Unduh folder project.
2. Buka folder `tugas-uts-web1` melalui Visual Studio Code.
3. Buka file `index.html` di browser, atau jalankan menggunakan ekstensi **Live Server**.
4. Login menggunakan salah satu akun simulasi yang sudah tersedia pada `js/data.js`, atau gunakan fitur **Daftar** untuk membuat akun baru.
5. Gunakan menu dashboard untuk mencoba masing-masing fitur.

## Akun untuk Mencoba

| Email | Password | Role |
|---|---|---|
| rina@gmail.com | rina123 | User |
| agus@gmail.com | agus123 | User |
| siti@gmail.com | siti123 | Admin |

### Perbedaan hak akses User dan Admin

| Fitur | User | Admin |
|---|---|---|
| Melihat katalog dan mencari buku | Ya | Ya |
| Menambah stok baru | Tidak | Ya |
| Menghapus buku dari katalog | Tidak | Ya |
| Membuat pesanan dan melacak pengiriman | Ya | Ya |
| Riwayat transaksi | Hanya pesanan sendiri | Semua pengguna |

Akun yang dibuat lewat tombol **Daftar** otomatis berperan **User**.

---

### 1. Halaman Login

**Langkah pengujian:** Buka `index.html`, isi email dan password yang valid, lalu klik tombol **Login**. Website akan mengarahkan pengguna ke dashboard. Coba juga memasukkan email atau password yang salah untuk menguji pop-up kesalahan.

Halaman Log in Pengguna, terdapat tombol Log in, Lupa Password dan juga Daftar Pengguna baru 
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/bc17632d-62c3-48e6-a771-3673490a9a46" />

- Jika email/password salah, muncul pop-up **"Email/password yang Anda masukkan salah"**,
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/b2e6212e-8d0d-4b1f-bdec-a022cadbc7b2" />
- Jika tidak memasukkan data 
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/2de33ae1-117b-40ca-a062-823e14ee7d96" />
- Jika Lupa password
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6bbb2994-d98a-4191-b36d-511c8a67f4dd" />
- Input Pengguna Baru
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1dd8bc7b-3bde-4e40-b759-f5872ccb4650" />
- Input email dan password dengan valid langsung masuk ke dashboard 
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/71708aa0-4ddd-4f7d-8294-023772a51895" />


### 2. Halaman Dashboard

**Langkah pengujian:** Setelah berhasil login, buka `dashboard.html`. Perhatikan sapaan yang menyesuaikan waktu lokal dan tombol navigasi menuju katalog, tracking, pemesanan, dan riwayat transaksi.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/eeaa090d-7c1d-4908-9a3f-dabce2391b79" /> 
- Greeting otomatis sesuai waktu lokal: **pagi, siang, sore, atau malam**.
- Jam digital yang berjalan dan tanggal hari ini.
- Ringkasan jumlah judul buku, total stok, dan jumlah pesanan.
- Menu navigasi ke Informasi Stok/Katalog, Tracking Pengiriman, Laporan Pemesanan, dan History Transaksi.

### 3. Halaman Katalog dan Stok Buku

**Langkah pengujian:** Pada dashboard, pilih **Informasi Stok/Katalog**. Halaman `stok.html` menampilkan daftar buku dari variabel `dataKatalogBuku` di `js/data.js`, termasuk informasi harga dan stok. Coba mencari buku menggunakan kolom pencarian.
- Tampilan User
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/ae1fffe1-8af5-4759-bf09-f9cf56616c28" />
- Tampilan Admin (dapat menambah dan menghapus stok buku)
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/677dd206-0e84-4602-a948-f45710f4b3de" />
  
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/48d626cc-ced6-446a-95d4-beb071b1b5f1" />
  
  <img width="1421" height="451" alt="image" src="https://github.com/user-attachments/assets/c93d1426-2c45-47c2-9276-3dbc5df13fdd" />
  
- Pencarian langsung berdasarkan kode, judul, atau jenis buku.
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/d8f18b96-2069-498d-9898-7303d9c1f291" />
  
### 4. Halaman Pemesanan Buku

**Langkah pengujian:** Buka `checkout.html`, pilih judul buku dan jumlah pembelian, lalu klik **Tambah**. Isi informasi pemesan, pilih ekspedisi dan metode pembayaran, kemudian selesaikan pemesanan.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/fc5062fb-041a-4859-bcf7-6eb30ee9f123" />

- Keranjang yang bisa **ditambah, diubah jumlahnya, dan dihapus**, dengan pengecekan batas stok.
  
  <img width="787" height="612" alt="image" src="https://github.com/user-attachments/assets/2fe7e496-88b7-4895-800f-f1c0c2f0bf92" />

  <img width="767" height="727" alt="image" src="https://github.com/user-attachments/assets/06c2b46c-3490-4712-80ba-7791cc3099ce" />

- Form data pemesan (nama, email, telepon, alamat) dan pembayaran (ekspedisi, metode), dengan pesan error per kolom.
  <img width="687" height="856" alt="image" src="https://github.com/user-attachments/assets/bcdb8f97-446f-496c-b776-1705dfa19d94" />

- Subtotal, ongkos kirim (menurut ekspedisi), dan total bayar dihitung otomatis.

  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/3a3a9f95-00e0-4816-8df6-b35cb2d0d221" />

- Setelah pesanan dibuat, muncul **nomor Delivery Order** dan pesanan masuk ke tabel **History Transaksi**.
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/6ff60638-347a-4f8a-84bf-fe86ed548c73" />

### 5. Riwayat Transaksi

**Langkah pengujian:** Setelah membuat pesanan, lihat bagian **History Transaksi** pada halaman pemesanan atau akses dari dashboard. Periksa data transaksi yang telah dibuat. Pesanan yang dibuat dari halaman pemesanan juga bisa dilacak.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/7cf6426c-b4f7-4641-91eb-ea666dc4db05" />

- Pada Role Admin, bisa melihat semua riwayat transaksi user
  <img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/1b87c06d-86f2-43f7-ae72-1b38829e4c6f" />


### 6. Halaman Tracking Pengiriman

**Langkah pengujian:** Buka `tracking.html`, masukkan nomor Delivery Order (DO) dari data simulasi, misalnya **20230012**, lalu klik **Cari**. Halaman menampilkan nama pemesan, status, ekspedisi, tanggal pengiriman, jenis paket, dan total pembayaran.

<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/17ba3049-4728-484a-a28a-1f7381470483" />

- Menampilkan nama pemesan, status pengiriman (**progress bar** dan tahapan status), detail ekspedisi, tanggal kirim, jenis paket, total pembayaran, serta **timeline perjalanan paket**.
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/3eca40f1-2b7d-42e9-b25d-582fd989d8aa" />


## Kesimpulan

Melalui project **BLOOM BOOK**, saya menerapkan HTML, CSS, dan JavaScript untuk membangun website toko buku online sederhana. Project ini juga melatih penerapan manipulasi DOM, validasi formulir, pemrosesan data Array JavaScript, interaksi modal, dan penyimpanan data pada browser.



