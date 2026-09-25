---
title: Ubah SRT ke VTT — Subtitle WebVTT untuk Video Web
metaDescription: >-
  Ubah subtitle SRT ke WebVTT untuk video HTML5 dan pemutar web. Format waktu, encoding, dan baris diperbaiki otomatis.
  Langsung di browser, gratis.
h1: Konverter SRT ke VTT
shortDescription: >-
  Ubah subtitle SRT menjadi WebVTT yang diterima elemen <track> HTML5 dan pemutar video di web.
intro: >-
  Jika Anda memasang video di situs web sendiri, platform kursus online, atau pemutar HTML5, subtitle biasanya harus
  berformat WebVTT (.vtt), bukan SRT. Mengganti nama file saja tidak cukup: VTT butuh baris pembuka WEBVTT, format
  waktu dengan titik, dan karakter khusus yang di-escape.


  Konverter ini melakukan semuanya secara otomatis di browser Anda. Anda juga bisa menggeser seluruh waktu subtitle
  bila tidak sinkron dengan video, dan memproses hingga 50 file sekaligus — atau cukup menempelkan isi SRT.
steps:
- >-
  Seret file SRT ke konverter, pilih dengan “Pilih file”, atau buka tab “Tempel teks” dan tempel isi SRT.
- >-
  Jika subtitle tidak sinkron, buka Pengaturan dan isi “Geser semua waktu” dalam milidetik (nilai positif menunda
  subtitle).
- >-
  Klik “Konversi ke VTT”. Saat menempel teks, hasil langsung muncul ketika Anda mengetik.
- Salin hasilnya atau unduh file .vtt.
sourceExplanation: >-
  SRT (SubRip) adalah format subtitle paling populer. Isinya teks biasa: nomor urut, rentang waktu dengan koma (00:01:02,500),
  lalu teks subtitle. Hampir semua pemutar video dan aplikasi edit video bisa membaca SRT.
targetExplanation: >-
  WebVTT (.vtt) adalah format subtitle untuk video di web. File diawali baris WEBVTT, waktu memakai titik (00:01:02.500),
  dan mendukung pengaturan posisi, gaya CSS, serta nama pembicara. Elemen <track> pada video HTML5 hanya menerima
  WebVTT.
useCases:
- title: Video di situs web sendiri
  text: >-
    Tambahkan subtitle ke video HTML5 dengan elemen <track>, yang hanya menerima WebVTT.
- title: Platform kursus dan pemutar web
  text: >-
    Banyak LMS dan pemutar video web meminta file .vtt untuk teks terjemahan.
- title: Perbaiki subtitle yang tidak sinkron
  text: >-
    Geser semua waktu sekaligus saat mengonversi, tanpa mengedit baris satu per satu.
limitations:
- Tag <font color> di SRT tidak punya padanan di WebVTT dan dihapus.
- >-
  SRT hampir tidak punya pengaturan posisi. Tag {\an8} di awal baris diubah menjadi posisi atas; tag gaya ASS lainnya
  dihapus.
- >-
  Baris diurutkan berdasarkan waktu mulai; baris yang berakhir sebelum dimulai diperbaiki dan dilaporkan.
faq:
- q: Apa bedanya SRT dan VTT?
  a: >-
    Terutama pada header dan format waktu. File WebVTT diawali “WEBVTT”, memakai titik (00:01:02.500) alih-alih
    koma (00:01:02,500), nomor baris bersifat opsional, dan mendukung posisi, gaya CSS, serta nama pembicara.
- q: Bisakah file .srt cukup diganti namanya menjadi .vtt?
  a: >-
    Tidak. Browser menolak file tanpa header WEBVTT dan dengan waktu berformat koma. Karakter &, < dan > juga perlu
    di-escape. Konverter ini menangani semuanya.
- q: Subtitle saya menampilkan karakter aneh seperti Ã©. Bisa diperbaiki?
  a: >-
    Biasanya bisa. File yang bukan UTF-8 dibaca sebagai Windows-1252, encoding lama yang paling umum, dan VTT ditulis
    dalam UTF-8.
- q: Apakah alat ini menerjemahkan subtitle?
  a: >-
    Tidak. Alat ini hanya mengubah format file dari SRT ke VTT; teks subtitle tetap dalam bahasa aslinya.
---
