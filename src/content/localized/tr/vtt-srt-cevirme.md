---
title: VTT SRT Çevirme — WebVTT Altyazıyı SRT Yapın
metaDescription: >-
  WebVTT altyazılarını video düzenleyiciler, oynatıcılar ve yükleme formları için SRT’ye dönüştürün. Konum, not
  ve stiller temizlenir. Tarayıcınızda çalışır.
h1: VTT’yi SRT’ye Dönüştürme Aracı
shortDescription: >-
  Web’den indirdiğiniz WebVTT altyazıları video düzenleyiciler, oynatıcılar ve platformlar için SRT’ye dönüştürün.
intro: >-
  Video sitelerinden, online kurslardan veya toplantı kayıtlarından indirilen altyazılar çoğunlukla WebVTT (.vtt)
  formatındadır. Oysa video düzenleme programları, televizyonlardaki oynatıcılar ve pek çok masaüstü oynatıcı SRT’yi
  daha iyi tanır. Bu araç VTT’yi dosya yüklemeden tarayıcınızda SRT’ye dönüştürür.


  WEBVTT başlığı, NOTE blokları, CSS stilleri ve SRT’nin desteklemediği konum ayarları temizlenir; her satırın metni
  ve zamanı korunur. “Çevirme” burada format dönüştürme anlamındadır, altyazının dili değişmez. Tek seferde 50 dosyaya
  kadar dönüştürebilir veya VTT içeriğini yapıştırabilirsiniz.
steps:
- >-
  VTT dosyasını dönüştürücüye sürükleyin, “Dosya seç” ile seçin veya “Metin yapıştır” sekmesinde içeriği yapıştırın.
- >-
  Altyazı senkron değilse Ayarlar’daki “Tüm zamanlamaları kaydır” alanını milisaniye olarak doldurun.
- >-
  “SRT formatına dönüştür” düğmesine basın. Metin yapıştırırken sonuç hemen görünür.
- Sonucu kopyalayın veya .srt dosyasını indirin.
sourceExplanation: >-
  WebVTT (.vtt) web videoları için altyazı formatıdır. Dosya WEBVTT satırıyla başlar, zamanlarda nokta kullanır
  (00:01:02.500) ve konum, CSS stili ve konuşmacı adlarını destekler. HTML5 videodaki <track> öğesi yalnızca WebVTT
  kabul eder.
targetExplanation: >-
  SRT (SubRip) en yaygın altyazı formatıdır. Düz metin dosyasıdır: sıra numarası, virgüllü zaman aralığı (00:01:02,500)
  ve altyazı metni. Neredeyse tüm video oynatıcılar ve video düzenleme programları SRT okur.
useCases:
- title: Video düzenleme
  text: >-
    Web’den alınan altyazıları CapCut, Premiere Pro, DaVinci Resolve gibi SRT kullanan programlara aktarın.
- title: Çevrimdışı izleme
  text: >-
    Televizyon, telefon ve bilgisayardaki oynatıcılar SRT’yi en güvenilir şekilde okur.
- title: Toplantı ve ders kayıtları
  text: >-
    Online toplantı veya derslerin altyazılarını en yaygın altyazı formatında saklayın.
limitations:
- >-
  WebVTT stilleri (CSS ::cue, sınıflar), bölgeler ve çoğu konum ayarının SRT’de karşılığı yoktur ve kaldırılır.
- >-
  <v> etiketlerindeki konuşmacı adları kaldırılır; yalnızca konuşma metni kalır.
- NOTE yorum blokları aktarılmaz.
faq:
- q: WebVTT stilleri ve konumları ne olur?
  a: >-
    SRT bunları ifade edemediği için kaldırılır. Tek istisna ekranın üstüne yerleştirilen satırlardır; bunlar birçok
    oynatıcının anladığı {\an8} etiketiyle işaretlenir.
- q: YouTube’un otomatik altyazıları dönüştürülebilir mi?
  a: >-
    Evet, ancak otomatik altyazılar üst üste binen satırlarda cümleleri tekrarlar; SRT de bu tekrarları içerir.
- q: SRT dosyası hangi kodlamayı kullanır?
  a: >-
    Oynatıcı ve düzenleyicilerle en geniş uyum için UTF-8 ve Windows (CRLF) satır sonları.
---
