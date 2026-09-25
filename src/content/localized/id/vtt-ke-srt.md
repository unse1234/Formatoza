---
title: Ubah VTT ke SRT — Konversi Subtitle WebVTT
metaDescription: >-
  Ubah subtitle WebVTT ke SRT untuk aplikasi edit video, pemutar, dan platform unggah. Pengaturan posisi, catatan,
  dan gaya ditangani rapi. Di browser Anda.
h1: Konverter VTT ke SRT
shortDescription: >-
  Ubah subtitle WebVTT yang diunduh dari web menjadi SRT untuk aplikasi edit video, pemutar, dan platform lain.
intro: >-
  Subtitle yang diunduh dari situs video, platform kursus, atau rapat online sering berformat WebVTT (.vtt). Padahal
  aplikasi edit video, pemutar di TV, dan banyak pemutar desktop lebih mengenal SRT. Alat ini mengubah VTT ke SRT
  di browser Anda, tanpa mengunggah file.


  Header WEBVTT, blok NOTE, gaya CSS, dan pengaturan posisi yang tidak dikenal SRT dibersihkan, sementara teks dan
  waktu setiap baris dipertahankan. Anda bisa mengonversi hingga 50 file sekaligus atau cukup menempelkan isi VTT.
steps:
- >-
  Seret file VTT ke konverter, pilih dengan “Pilih file”, atau buka tab “Tempel teks” dan tempel isi VTT.
- >-
  Bila subtitle tidak sinkron, isi “Geser semua waktu” di Pengaturan (dalam milidetik).
- Klik “Konversi ke SRT”. Saat menempel teks, hasil langsung muncul.
- Salin hasilnya atau unduh file .srt.
sourceExplanation: >-
  WebVTT (.vtt) adalah format subtitle untuk video di web. File diawali baris WEBVTT, waktu memakai titik (00:01:02.500),
  dan mendukung pengaturan posisi, gaya CSS, serta nama pembicara. Elemen <track> pada video HTML5 hanya menerima
  WebVTT.
targetExplanation: >-
  SRT (SubRip) adalah format subtitle paling populer. Isinya teks biasa: nomor urut, rentang waktu dengan koma (00:01:02,500),
  lalu teks subtitle. Hampir semua pemutar video dan aplikasi edit video bisa membaca SRT.
useCases:
- title: Edit video
  text: >-
    Masukkan subtitle dari web ke CapCut, Premiere Pro, DaVinci Resolve, atau aplikasi edit lain yang memakai SRT.
- title: Pemutar video offline
  text: Pemutar di TV, HP, dan komputer umumnya membaca SRT dengan andal.
- title: Arsip rekaman rapat atau kelas
  text: >-
    Simpan transkrip dari rapat atau kelas online dalam format subtitle yang paling umum.
limitations:
- >-
  Gaya WebVTT (CSS ::cue, kelas), region, dan sebagian besar pengaturan posisi tidak punya padanan di SRT dan dihapus.
- >-
  Nama pembicara dalam tag <v> dihapus; hanya teks ucapannya yang tersisa.
- Blok komentar NOTE tidak disertakan.
faq:
- q: Apa yang terjadi pada gaya dan posisi WebVTT?
  a: >-
    SRT tidak bisa menyimpannya, jadi dihapus. Pengecualiannya, baris yang diletakkan di bagian atas layar ditandai
    dengan {\an8}, tag yang dikenali banyak pemutar.
- q: Apakah subtitle otomatis YouTube bisa dikonversi?
  a: >-
    Bisa, tetapi subtitle otomatis mengulang baris dalam cue yang tumpang tindih, sehingga SRT juga akan berisi
    pengulangan tersebut.
- q: Encoding apa yang dipakai file SRT?
  a: >-
    UTF-8 dengan akhir baris Windows (CRLF) agar kompatibel dengan sebanyak mungkin pemutar dan editor.
---
