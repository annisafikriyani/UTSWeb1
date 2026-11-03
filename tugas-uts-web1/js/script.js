/* =========================================================
   BLOOM BOOK - script.js
   Satu file untuk semua halaman. Halaman dikenali dari
   atribut <body data-page="...">. Data awal ada di data.js.
   ========================================================= */

/* ---------- 1. Utilitas ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

const KEY = {
  session: "kbm_session",
  users: "kbm_users",
  stok: "kbm_stok",
  cart: "kbm_cart",
  orders: "kbm_orders",
  terjual: "kbm_terjual",
  dihapus: "kbm_dihapus",
};
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ONGKIR = { "JNE": 15000, "Pos Indonesia": 12000, "J&T": 14000, "SiCepat": 13000 };
const BULAN = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
const TAHAP = ["Diproses", "Dikirim", "Dalam Perjalanan", "Terkirim"];
const PLACEHOLDER = "data:image/svg+xml;utf8," + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" width="120" height="160" viewBox="0 0 120 160"><rect width="120" height="160" rx="8" fill="#FFE0EA"/><rect x="14" y="14" width="6" height="132" fill="#F4A9C0"/><text x="64" y="86" font-family="sans-serif" font-size="14" text-anchor="middle" fill="#C94A74">Buku</text></svg>'
);

function load(key, fallback) {
  try {
    const v = JSON.parse(localStorage.getItem(key));
    return v === null || v === undefined ? fallback : v;
  } catch (e) {
    return fallback;
  }
}
function save(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true; }
  catch (e) { return false; }
}
function esc(text) {
  const d = document.createElement("div");
  d.textContent = String(text);
  return d.innerHTML;
}
function rupiah(n) { return "Rp " + Number(n).toLocaleString("id-ID"); }
function parseRupiah(s) { return parseInt(String(s).replace(/\D/g, ""), 10) || 0; }
function formatTanggal(iso) {
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  return m ? `${parseInt(m[3], 10)} ${BULAN[parseInt(m[2], 10) - 1]} ${m[1]}` : iso;
}
function pad(n) { return String(n).padStart(2, "0"); }
function stampSekarang() {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
function buatSel(tag, text, className) {
  const el = document.createElement(tag);
  if (text !== undefined) el.textContent = text;
  if (className) el.className = className;
  return el;
}

/* ---------- 2. Data (data.js + localStorage) ---------- */
function semuaPengguna() { return dataPengguna.concat(load(KEY.users, [])); }
// jumlah buku yang sudah terjual per kode barang: { "EKMA4002": 3, ... }
function getTerjual() { return load(KEY.terjual, {}); }
// katalog = data.js + stok tambahan, dengan stok dikurangi jumlah yang sudah dipesan
function getKatalog() {
  const terjual = getTerjual();
  const dihapus = load(KEY.dihapus, []); // kode buku bawaan data.js yang dihapus Admin
  return dataKatalogBuku.filter((b) => !dihapus.includes(b.kodeBarang)).concat(load(KEY.stok, [])).map((b) =>
    Object.assign({}, b, { stok: Math.max(0, b.stok - (terjual[b.kodeBarang] || 0)) })
  );
}
function getOrders() { return load(KEY.orders, []); }
function getUser() {
  try { return JSON.parse(sessionStorage.getItem(KEY.session)); } catch (e) { return null; }
}

/* ---------- 3. Modal & pop-up ---------- */
let fokusSebelum = null;

function openModal(id) {
  const m = typeof id === "string" ? document.getElementById(id) : id;
  if (!m) return;
  fokusSebelum = document.activeElement;
  m.hidden = false;
  document.body.classList.add("no-scroll");
  const target = $("input, select, textarea, button:not(.modal__close)", m);
  if (target) target.focus();
}
function closeModal(m) {
  m.hidden = true;
  if (!$(".modal:not([hidden])")) document.body.classList.remove("no-scroll");
  if (fokusSebelum && document.contains(fokusSebelum)) fokusSebelum.focus();
  if (typeof m._onClose === "function") {
    const fn = m._onClose;
    m._onClose = null;
    fn();
  }
}
function showPopup(title, message, type = "info", onClose) {
  let m = document.getElementById("popup");
  if (!m) {
    m = document.createElement("div");
    m.id = "popup";
    m.className = "modal";
    m.hidden = true;
    m.innerHTML =
      '<div class="modal__box modal__box--sm" role="alertdialog" aria-modal="true" aria-labelledby="popupTitle" aria-describedby="popupMsg">' +
      '<div class="popup__icon" id="popupIcon" aria-hidden="true"></div>' +
      '<h2 id="popupTitle"></h2><p id="popupMsg" class="muted"></p>' +
      '<button class="btn btn--primary" type="button" data-close>Oke</button></div>';
    document.body.appendChild(m);
  }
  const icon = $("#popupIcon", m);
  icon.className = "popup__icon popup__icon--" + type;
  icon.textContent = type === "success" ? "\u2713" : type === "error" ? "!" : "i";
  $("#popupTitle", m).textContent = title;
  $("#popupMsg", m).textContent = message;
  m._onClose = onClose || null;
  openModal(m);
}

document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open]");
  if (opener) { openModal(opener.dataset.open); return; }
  const closer = e.target.closest("[data-close]");
  if (closer) { closeModal(closer.closest(".modal")); return; }
  if (e.target.classList.contains("modal")) closeModal(e.target);
});
document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const terbuka = $$(".modal:not([hidden])");
  if (terbuka.length) closeModal(terbuka[terbuka.length - 1]);
});

/* ---------- 4. Validasi form ---------- */
function setError(input, msg) {
  const field = input.closest(".field");
  const out = field && $(".field__error", field);
  if (out) out.textContent = msg || "";
  if (msg) input.setAttribute("aria-invalid", "true");
  else input.removeAttribute("aria-invalid");
  return !msg;
}
function clearErrors(form) {
  $$(".field__error", form).forEach((p) => (p.textContent = ""));
  $$("[aria-invalid]", form).forEach((i) => i.removeAttribute("aria-invalid"));
}
// jalankan semua cek, kembalikan true bila semua lolos; fokus ke field pertama yang salah
function semuaValid(cek) {
  let pertama = null;
  cek.forEach(([input, pesan]) => {
    if (!setError(input, pesan) && !pertama) pertama = input;
  });
  if (pertama) pertama.focus();
  return !pertama;
}

/* ---------- 5. Cangkang halaman (header, logout, proteksi) ---------- */
function initShell() {
  const user = getUser();
  if (!user) { location.replace("index.html"); return null; }
  const nama = $("#userName");
  if (nama) nama.textContent = user.nama;
  const role = $("#userRole");
  if (role) role.textContent = user.role;
  $$(".nav a").forEach((a) => {
    if (a.dataset.page === document.body.dataset.page) a.setAttribute("aria-current", "page");
  });
  const out = $("#btnLogout");
  if (out) out.addEventListener("click", () => {
    sessionStorage.removeItem(KEY.session);
    location.href = "index.html";
  });
  return user;
}

/* ---------- 6. Halaman Login ---------- */
function initLogin() {
  if (getUser()) { location.replace("dashboard.html"); return; }

  // tombol lihat/sembunyikan password
  $$("[data-toggle-pw]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.parentElement.querySelector("input");
      const tampil = input.type === "password";
      input.type = tampil ? "text" : "password";
      btn.textContent = tampil ? "Sembunyi" : "Lihat";
      btn.setAttribute("aria-label", tampil ? "Sembunyikan password" : "Tampilkan password");
    });
  });

  // Login
  const form = $("#formLogin");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = form.elements.email;
    const pw = form.elements.password;
    const ok = semuaValid([
      [email, !email.value.trim() ? "Email wajib diisi." : !EMAIL_RE.test(email.value.trim()) ? "Format email belum benar." : ""],
      [pw, !pw.value ? "Password wajib diisi." : ""],
    ]);
    if (!ok) return;

    const user = semuaPengguna().find(
      (u) => u.email.toLowerCase() === email.value.trim().toLowerCase() && u.password === pw.value
    );
    if (!user) {
      showPopup("Gagal masuk", "Email/password yang Anda masukkan salah.", "error");
      return;
    }
    sessionStorage.setItem(KEY.session, JSON.stringify({ id: user.id, nama: user.nama, email: user.email, role: user.role }));
    location.href = "dashboard.html";
  });

  // Lupa password (simulasi)
  const lupa = $("#formLupa");
  lupa.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = lupa.elements.email;
    const ada = semuaPengguna().some((u) => u.email.toLowerCase() === email.value.trim().toLowerCase());
    const ok = semuaValid([
      [email, !email.value.trim() ? "Email wajib diisi." : !EMAIL_RE.test(email.value.trim()) ? "Format email belum benar." : !ada ? "Email ini belum terdaftar." : ""],
    ]);
    if (!ok) return;
    closeModal($("#modalLupa"));
    lupa.reset();
    showPopup("Tautan terkirim", "Periksa kotak masuk email Anda untuk mengatur ulang password.", "success");
  });

  // Daftar
  const daftar = $("#formDaftar");
  daftar.addEventListener("submit", (e) => {
    e.preventDefault();
    const { nama, email, password, konfirmasi } = daftar.elements;
    const sudahAda = semuaPengguna().some((u) => u.email.toLowerCase() === email.value.trim().toLowerCase());
    const ok = semuaValid([
      [nama, nama.value.trim().length < 3 ? "Nama minimal 3 karakter." : ""],
      [email, !email.value.trim() ? "Email wajib diisi." : !EMAIL_RE.test(email.value.trim()) ? "Format email belum benar." : sudahAda ? "Email sudah terdaftar." : ""],
      [password, password.value.length < 6 ? "Password minimal 6 karakter." : ""],
      [konfirmasi, konfirmasi.value !== password.value ? "Konfirmasi password tidak sama." : ""],
    ]);
    if (!ok) return;

    const baru = load(KEY.users, []);
    const id = Math.max(...semuaPengguna().map((u) => u.id)) + 1;
    baru.push({ id, nama: nama.value.trim(), email: email.value.trim(), password: password.value, role: "User" });
    save(KEY.users, baru);
    $("#loginEmail").value = email.value.trim();
    closeModal($("#modalDaftar"));
    daftar.reset();
    showPopup("Akun dibuat", "Pendaftaran berhasil. Silakan login dengan akun baru Anda.", "success");
  });

  // bersihkan error saat modal dibuka ulang
  $$("#modalLupa form, #modalDaftar form").forEach(clearErrors);
}

/* ---------- 7. Dashboard ---------- */
function sapaanWaktu(jam) {
  if (jam >= 4 && jam < 11) return "Selamat pagi";
  if (jam >= 11 && jam < 15) return "Selamat siang";
  if (jam >= 15 && jam < 18) return "Selamat sore";
  return "Selamat malam";
}
function initDashboard(user) {
  const katalog = getKatalog();
  const orders = getOrders().filter((o) => user.role === "Admin" || o.userEmail === user.email);
  $("#statJudul").textContent = katalog.length;
  $("#statStok").textContent = katalog.reduce((t, b) => t + b.stok, 0).toLocaleString("id-ID");
  $("#statPesanan").textContent = orders.length;
  $("#statPesananLabel").textContent = user.role === "Admin" ? "Semua pesanan" : "Pesanan Anda";

  function tick() {
    const now = new Date();
    $("#sapaan").textContent = `${sapaanWaktu(now.getHours())}, ${user.nama.split(" ")[0]}!`;
    $("#jam").textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    $("#tanggal").textContent = `${now.getDate()} ${BULAN[now.getMonth()]} ${now.getFullYear()}`;
  }
  tick();
  setInterval(tick, 1000);
}

/* ---------- 8. Stok / Katalog ---------- */
function buatBarisStok(b, isAdmin) {
  const tr = document.createElement("tr");
  tr.dataset.kode = b.kodeBarang;

  const tdCover = document.createElement("td");
  const img = document.createElement("img");
  img.className = "thumb";
  img.src = b.cover || PLACEHOLDER;
  img.alt = "Sampul " + b.namaBarang;
  img.loading = "lazy";
  img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; };
  tdCover.appendChild(img);

  const tdStok = buatSel("td", "", "num");
  tdStok.appendChild(buatSel("span", b.stok.toLocaleString("id-ID") + (b.stok < 200 ? " (menipis)" : ""), "badge " + (b.stok < 200 ? "badge--low" : "badge--ok")));

  const tdAksi = document.createElement("td");
  const hapus = buatSel("button", "Hapus", "btn btn--danger btn--small");
  hapus.type = "button";
  hapus.dataset.hapus = b.kodeBarang;
  hapus.setAttribute("aria-label", "Hapus " + b.namaBarang);
  tdAksi.appendChild(hapus);

  tr.append(
    tdCover,
    buatSel("td", b.kodeBarang),
    buatSel("td", b.namaBarang),
    buatSel("td", b.jenisBarang),
    buatSel("td", "Edisi " + b.edisi, "num"),
    tdStok,
    buatSel("td", b.harga, "num")
  );
  if (isAdmin) tr.appendChild(tdAksi); // kolom Aksi hanya ada untuk Admin
  return tr;
}

function initStok(user) {
  const isAdmin = user.role === "Admin";
  const tbody = $("#bodyStok");

  // User biasa hanya boleh melihat katalog: buang tombol/modal tambah stok dan kolom Aksi
  if (isAdmin) {
    $("#infoAdmin").hidden = false;
  } else {
    $("#infoUser").hidden = false;
    $$('[data-open="modalTambah"]').forEach((el) => el.remove());
    const modal = $("#modalTambah");
    if (modal) modal.remove();
    const thAksi = $("#tabelStok thead th:last-child");
    if (thAksi) thAksi.remove();
  }
  const ringkas = $("#ringkasanStok");

  function perbarui() {
    const katalog = getKatalog();
    const baris = $$("tr[data-kode]", tbody).filter((tr) => !tr.hidden);
    const kosong = $("#barisKosong");
    if (kosong) kosong.hidden = baris.length > 0;
    const kodeTampil = baris.map((tr) => tr.dataset.kode);
    const tampil = katalog.filter((b) => kodeTampil.includes(b.kodeBarang));
    ringkas.textContent = `Menampilkan ${tampil.length} dari ${katalog.length} judul, total stok ${tampil.reduce((t, b) => t + b.stok, 0).toLocaleString("id-ID")}.`;
  }

  getKatalog().forEach((b) => tbody.appendChild(buatBarisStok(b, isAdmin)));

  const kosong = document.createElement("tr");
  kosong.id = "barisKosong";
  kosong.className = "empty-row";
  kosong.hidden = true;
  const td = buatSel("td", "Tidak ada buku yang cocok dengan pencarian.");
  td.colSpan = isAdmin ? 8 : 7;
  kosong.appendChild(td);
  tbody.appendChild(kosong);
  perbarui();

  // Cari
  $("#cariBuku").addEventListener("input", (e) => {
    const q = e.target.value.trim().toLowerCase();
    $$("tr[data-kode]", tbody).forEach((tr) => { tr.hidden = !tr.textContent.toLowerCase().includes(q); });
    perbarui();
  });

  if (!isAdmin) return; // semua fitur di bawah ini khusus Admin

  // Hapus baris tambahan
  tbody.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hapus]");
    if (!btn) return;
    const kode = btn.dataset.hapus;
    const buku = getKatalog().find((b) => b.kodeBarang === kode);
    if (!confirm(`Hapus "${buku ? buku.namaBarang : kode}" (${kode}) dari katalog?`)) return;
    if (dataKatalogBuku.some((b) => b.kodeBarang === kode)) {
      // buku bawaan data.js tidak diubah; kodenya dicatat sebagai "dihapus"
      const dihapus = load(KEY.dihapus, []);
      if (!dihapus.includes(kode)) dihapus.push(kode);
      save(KEY.dihapus, dihapus);
    } else {
      // buku tambahan Admin dihapus dari penyimpanan
      save(KEY.stok, load(KEY.stok, []).filter((b) => b.kodeBarang !== kode));
      const terjual = getTerjual();
      delete terjual[kode];
      save(KEY.terjual, terjual);
    }
    btn.closest("tr").remove();
    perbarui();
  });

  // Tambah stok
  const form = $("#formTambah");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { kode, jenis, nama, edisi, stok, harga, cover } = form.elements;
    const kodeVal = kode.value.trim().toUpperCase();
    const duplikat = getKatalog().some((b) => b.kodeBarang === kodeVal) || dataKatalogBuku.some((b) => b.kodeBarang === kodeVal);
    const file = cover.files[0];
    const ok = semuaValid([
      [kode, !kodeVal ? "Kode wajib diisi." : !/^[A-Z0-9]{5,12}$/.test(kodeVal) ? "Kode 5-12 huruf/angka tanpa spasi." : duplikat ? "Kode sudah dipakai." : ""],
      [nama, nama.value.trim().length < 3 ? "Judul minimal 3 karakter." : ""],
      [edisi, !(parseInt(edisi.value, 10) >= 1) ? "Edisi minimal 1." : ""],
      [stok, stok.value === "" || parseInt(stok.value, 10) < 0 ? "Stok wajib diisi (0 atau lebih)." : ""],
      [harga, !(parseInt(harga.value, 10) >= 1000) ? "Harga minimal Rp 1.000." : ""],
      [cover, file && !file.type.startsWith("image/") ? "File harus berupa gambar." : file && file.size > 300 * 1024 ? "Ukuran gambar maksimal 300 KB." : ""],
    ]);
    if (!ok) return;

    function simpan(coverData) {
      const item = {
        kodeBarang: kodeVal,
        namaBarang: nama.value.trim(),
        jenisBarang: jenis.value,
        edisi: String(parseInt(edisi.value, 10)),
        stok: parseInt(stok.value, 10),
        harga: rupiah(parseInt(harga.value, 10)),
        cover: coverData || "",
        custom: true,
      };
      const tersimpan = load(KEY.stok, []);
      tersimpan.push(item);
      if (!save(KEY.stok, tersimpan)) {
        showPopup("Gagal menyimpan", "Penyimpanan peramban penuh. Coba tanpa gambar sampul.", "error");
        return;
      }
      const tr = buatBarisStok(item, true);
      tr.classList.add("row-new");
      tbody.insertBefore(tr, $("#barisKosong"));
      tr.scrollIntoView({ block: "nearest", behavior: "smooth" });
      perbarui();
      form.reset();
      closeModal($("#modalTambah"));
    }

    if (file) {
      const reader = new FileReader();
      reader.onload = () => simpan(reader.result);
      reader.readAsDataURL(file);
    } else {
      simpan("");
    }
  });
}

/* ---------- 9. Checkout / Pemesanan ---------- */
function initCheckout(user) {
  let katalog = getKatalog();
  const sel = $("#selBuku");

  function isiPilihan() {
    const dipilih = sel.value;
    sel.length = 1; // sisakan opsi "Pilih buku..."
    katalog.forEach((b) => {
      const o = buatSel("option", `${b.namaBarang} - ${b.harga} (${b.stok > 0 ? "stok " + b.stok : "habis"})`);
      o.value = b.kodeBarang;
      o.disabled = b.stok === 0;
      sel.appendChild(o);
    });
    sel.value = dipilih;
  }
  isiPilihan();

  // buang item keranjang yang bukunya habis, dan sesuaikan jumlah dengan stok terbaru
  let cart = load(KEY.cart, []).filter((c) => {
    const b = katalog.find((x) => x.kodeBarang === c.kode);
    if (!b || b.stok < 1) return false;
    c.qty = Math.min(c.qty, b.stok);
    return true;
  });
  const form = $("#formPesan");
  form.elements.nama.value = user.nama;
  form.elements.email.value = user.email;

  const cari = (kode) => katalog.find((b) => b.kodeBarang === kode);
  const ongkir = () => (cart.length ? ONGKIR[form.elements.ekspedisi.value] || 0 : 0);
  const subtotal = () => cart.reduce((t, c) => t + parseRupiah(cari(c.kode).harga) * c.qty, 0);

  function renderKeranjang() {
    const tbody = $("#bodyKeranjang");
    tbody.textContent = "";
    if (!cart.length) {
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      const td = buatSel("td", "Keranjang masih kosong. Pilih buku lalu klik Tambah.");
      td.colSpan = 4;
      tr.appendChild(td);
      tbody.appendChild(tr);
    }
    cart.forEach((c) => {
      const b = cari(c.kode);
      const tr = document.createElement("tr");
      const tdNama = document.createElement("td");
      tdNama.append(buatSel("strong", b.namaBarang), document.createElement("br"), buatSel("span", b.harga + " / buku", "muted"));

      const tdQty = buatSel("td", "", "num");
      const qty = document.createElement("input");
      qty.type = "number";
      qty.className = "input qty-input";
      qty.min = "1";
      qty.max = String(b.stok);
      qty.value = c.qty;
      qty.dataset.kode = c.kode;
      qty.setAttribute("aria-label", "Jumlah " + b.namaBarang);
      tdQty.appendChild(qty);

      const tdHapus = document.createElement("td");
      const hapus = buatSel("button", "Hapus", "btn btn--danger btn--small");
      hapus.type = "button";
      hapus.dataset.hapus = c.kode;
      tdHapus.appendChild(hapus);

      tr.append(tdNama, tdQty, buatSel("td", rupiah(parseRupiah(b.harga) * c.qty), "num"), tdHapus);
      tbody.appendChild(tr);
    });
    $("#totSub").textContent = rupiah(subtotal());
    $("#totOngkir").textContent = rupiah(ongkir());
    $("#totTotal").textContent = rupiah(subtotal() + ongkir());
    save(KEY.cart, cart);
  }

  // tambah ke keranjang
  $("#btnTambah").addEventListener("click", () => {
    const kode = sel.value;
    const qty = parseInt($("#qtyBuku").value, 10);
    if (!kode) { showPopup("Pilih buku dulu", "Pilih buku dari daftar sebelum menambahkannya ke keranjang.", "error"); return; }
    if (!(qty >= 1)) { showPopup("Jumlah belum benar", "Jumlah buku minimal 1.", "error"); return; }
    const b = cari(kode);
    const ada = cart.find((c) => c.kode === kode);
    const total = (ada ? ada.qty : 0) + qty;
    if (total > b.stok) { showPopup("Stok tidak cukup", `Stok "${b.namaBarang}" hanya ${b.stok} buku.`, "error"); return; }
    if (ada) ada.qty = total; else cart.push({ kode, qty });
    renderKeranjang();
  });

  // ubah jumlah & hapus
  $("#bodyKeranjang").addEventListener("change", (e) => {
    const input = e.target.closest("input.qty-input");
    if (!input) return;
    const item = cart.find((c) => c.kode === input.dataset.kode);
    const b = cari(item.kode);
    const val = parseInt(input.value, 10);
    if (!(val >= 1) || val > b.stok) {
      showPopup("Jumlah tidak valid", `Jumlah harus antara 1 dan ${b.stok}.`, "error");
    } else {
      item.qty = val;
    }
    renderKeranjang();
  });
  $("#bodyKeranjang").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-hapus]");
    if (!btn) return;
    cart = cart.filter((c) => c.kode !== btn.dataset.hapus);
    renderKeranjang();
  });
  form.elements.ekspedisi.addEventListener("change", renderKeranjang);

  // kirim pesanan
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const { nama, email, telp, alamat, ekspedisi, bayar } = form.elements;
    const ok = semuaValid([
      [nama, nama.value.trim().length < 3 ? "Nama minimal 3 karakter." : ""],
      [email, !email.value.trim() ? "Email wajib diisi." : !EMAIL_RE.test(email.value.trim()) ? "Format email belum benar." : ""],
      [telp, !/^(\+62|62|0)8\d{7,11}$/.test(telp.value.replace(/[\s-]/g, "")) ? "Nomor telepon belum benar (contoh 08123456789)." : ""],
      [alamat, alamat.value.trim().length < 10 ? "Alamat minimal 10 karakter." : ""],
      [ekspedisi, !ekspedisi.value ? "Pilih ekspedisi." : ""],
      [bayar, !bayar.value ? "Pilih metode pembayaran." : ""],
    ]);
    if (!ok) return;
    if (!cart.length) { showPopup("Keranjang kosong", "Tambahkan minimal satu buku sebelum membuat pesanan.", "error"); return; }
    katalog = getKatalog(); // ambil stok terbaru (bisa berubah dari tab lain)
    const kurang = cart.find((c) => c.qty > cari(c.kode).stok);
    if (kurang) {
      const b = cari(kurang.kode);
      isiPilihan();
      renderKeranjang();
      showPopup("Stok tidak cukup", `Stok "${b.namaBarang}" tinggal ${b.stok} buku. Ubah jumlah di keranjang.`, "error");
      return;
    }

    const orders = getOrders();
    let nomorDO;
    do { nomorDO = String(new Date().getFullYear()) + String(Math.floor(1000 + Math.random() * 9000)); }
    while (orders.some((o) => o.nomorDO === nomorDO) || dataTracking[nomorDO]);

    const order = {
      nomorDO,
      tanggal: stampSekarang(),
      userEmail: user.email,
      nama: nama.value.trim(),
      email: email.value.trim(),
      telp: telp.value.trim(),
      alamat: alamat.value.trim(),
      ekspedisi: ekspedisi.value,
      pembayaran: bayar.value,
      items: cart.map((c) => ({ kode: c.kode, nama: cari(c.kode).namaBarang, qty: c.qty, harga: cari(c.kode).harga })),
      total: subtotal() + ongkir(),
      status: "Diproses",
    };
    orders.push(order);
    save(KEY.orders, orders);

    // kurangi stok katalog sesuai jumlah yang dipesan
    const terjual = getTerjual();
    cart.forEach((c) => { terjual[c.kode] = (terjual[c.kode] || 0) + c.qty; });
    save(KEY.terjual, terjual);
    katalog = getKatalog();
    isiPilihan();

    cart = [];
    renderKeranjang();
    renderRiwayat();
    form.elements.alamat.value = "";
    form.elements.telp.value = "";
    form.elements.ekspedisi.value = "";
    form.elements.bayar.value = "";
    renderKeranjang();
    $("#nomorDOBaru").textContent = nomorDO;
    $("#linkLacak").href = "tracking.html?do=" + nomorDO;
    openModal("modalSukses");
  });

  function renderRiwayat() {
    const tbody = $("#bodyRiwayat");
    tbody.textContent = "";
    const daftar = getOrders()
      .filter((o) => user.role === "Admin" || o.userEmail === user.email)
      .sort((a, b) => b.tanggal.localeCompare(a.tanggal));
    if (!daftar.length) {
      const tr = document.createElement("tr");
      tr.className = "empty-row";
      const td = buatSel("td", "Belum ada transaksi. Pesanan yang Anda buat akan muncul di sini.");
      td.colSpan = 7;
      tr.appendChild(td);
      tbody.appendChild(tr);
      return;
    }
    daftar.forEach((o) => {
      const tr = document.createElement("tr");
      const tdStatus = document.createElement("td");
      tdStatus.appendChild(buatSel("span", o.status, "badge badge--pink"));
      const tdLink = document.createElement("td");
      const a = buatSel("a", "Lacak");
      a.href = "tracking.html?do=" + o.nomorDO;
      tdLink.appendChild(a);
      tr.append(
        buatSel("td", o.nomorDO),
        buatSel("td", formatTanggal(o.tanggal)),
        buatSel("td", o.nama),
        buatSel("td", o.items.map((i) => `${i.nama} x${i.qty}`).join(", ")),
        buatSel("td", rupiah(o.total), "num"),
        tdStatus,
        tdLink
      );
      tbody.appendChild(tr);
    });
  }

  if (user.role === "Admin") $("#judulRiwayat").textContent = "History transaksi (semua pengguna)";
  renderKeranjang();
  renderRiwayat();
}

/* ---------- 10. Tracking ---------- */
function cariPengiriman(nomor) {
  if (dataTracking[nomor]) return dataTracking[nomor];
  const o = getOrders().find((x) => x.nomorDO === nomor);
  if (!o) return null;
  return {
    nomorDO: o.nomorDO,
    nama: o.nama,
    status: o.status,
    ekspedisi: o.ekspedisi,
    tanggalKirim: o.tanggal.slice(0, 10),
    paket: `Paket Reguler (${o.items.reduce((t, i) => t + i.qty, 0)} buku)`,
    total: rupiah(o.total),
    perjalanan: [{ waktu: o.tanggal, keterangan: "Pesanan diterima dan sedang diproses oleh Universitas Terbuka" }],
  };
}
function indeksTahap(data) {
  const terakhir = data.perjalanan[data.perjalanan.length - 1];
  if (terakhir && /selesai antar/i.test(terakhir.keterangan)) return 3;
  const i = TAHAP.findIndex((t) => t.toLowerCase() === String(data.status).toLowerCase());
  return i === -1 ? 0 : i;
}

function initTracking() {
  const form = $("#formCari");
  const input = $("#inputDO");
  const err = $("#errDO");
  const hasil = $("#hasil");

  function tampilkan(data) {
    const idx = indeksTahap(data);
    const persen = Math.round(((idx + 1) / TAHAP.length) * 100);
    const detail = [
      ["Ekspedisi", data.ekspedisi],
      ["Tanggal kirim", formatTanggal(data.tanggalKirim)],
      ["Jenis paket", data.paket],
      ["Total pembayaran", data.total],
    ];
    const riwayat = data.perjalanan.slice().reverse();
    hasil.innerHTML =
      '<div class="result__head"><div><p class="muted" style="margin:0">Nama pemesan</p>' +
      `<h2>${esc(data.nama)}</h2><span class="muted">No. DO ${esc(data.nomorDO)}</span></div>` +
      `<span class="badge badge--pink">${esc(data.status)}</span></div>` +
      `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${persen}" aria-label="Progres pengiriman"><div class="progress__fill" style="width:0"></div></div>` +
      '<ol class="steps">' +
      TAHAP.map((t, i) => `<li class="${i < idx ? "is-done" : i === idx ? "is-current" : ""}">${esc(t)}</li>`).join("") +
      "</ol>" +
      '<dl class="detail-grid">' +
      detail.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("") +
      "</dl><h3>Perjalanan paket</h3>" +
      '<ol class="timeline">' +
      riwayat.map((p) => `<li><time>${esc(p.waktu)}</time><p>${esc(p.keterangan)}</p></li>`).join("") +
      "</ol>";
    hasil.hidden = false;
    // animasi progress bar
    requestAnimationFrame(() => requestAnimationFrame(() => {
      const fill = $(".progress__fill", hasil);
      if (fill) fill.style.width = persen + "%";
    }));
  }

  function cari(nomor) {
    nomor = nomor.trim();
    err.textContent = "";
    input.removeAttribute("aria-invalid");
    if (!nomor || !/^\d+$/.test(nomor)) {
      err.textContent = !nomor ? "Nomor DO wajib diisi." : "Nomor DO hanya boleh berisi angka.";
      input.setAttribute("aria-invalid", "true");
      input.focus();
      hasil.hidden = true;
      return;
    }
    const data = cariPengiriman(nomor);
    if (!data) {
      hasil.hidden = false;
      hasil.innerHTML = `<div class="empty-state"><h2>Nomor DO tidak ditemukan</h2><p>Periksa kembali nomor ${esc(nomor)}, lalu coba lagi.</p></div>`;
      showPopup("Data tidak ditemukan", `Nomor DO ${nomor} belum terdaftar.`, "error");
      return;
    }
    tampilkan(data);
  }

  form.addEventListener("submit", (e) => { e.preventDefault(); cari(input.value); });
  $$(".chip").forEach((c) => c.addEventListener("click", () => { input.value = c.dataset.do; cari(c.dataset.do); }));

  const param = new URLSearchParams(location.search).get("do");
  if (param) { input.value = param; cari(param); }
}

/* ---------- 11. Router sederhana ---------- */
document.addEventListener("DOMContentLoaded", () => {
  const page = document.body.dataset.page;
  if (page === "login") { initLogin(); return; }
  const user = initShell();
  if (!user) return;
  if (page === "dashboard") initDashboard(user);
  if (page === "stok") initStok(user);
  if (page === "checkout") initCheckout(user);
  if (page === "tracking") initTracking();
});
