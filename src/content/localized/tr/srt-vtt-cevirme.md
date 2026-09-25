---
title: SRT VTT Çevirme — HTML5 İçin WebVTT Altyazı
metaDescription: >-
  SRT altyazılarını HTML5 video ve web oynatıcıları için WebVTT formatına dönüştürün. Zaman damgaları, kodlama ve
  satır sonları düzeltilir. Ücretsiz.
h1: SRT’yi VTT’ye Dönüştürme Aracı
shortDescription: >-
  SRT altyazıları HTML5 <track> öğesinin ve web video oynatıcılarının kabul ettiği WebVTT formatına dönüştürün.
intro: >-
  Kendi sitenizde, bir eğitim platformunda veya HTML5 oynatıcıda video yayınlıyorsanız altyazının genellikle SRT
  değil WebVTT (.vtt) olması gerekir. Dosya uzantısını değiştirmek yetmez: VTT’nin WEBVTT başlığına, noktalı zaman
  damgalarına ve kaçış karakterlerine ihtiyacı vardır.


  Bu araç hepsini tarayıcınızda otomatik yapar. Not: “çevirme” burada format dönüştürmedir — altyazının dili değişmez.
  Altyazı videoyla senkron değilse tüm zamanlamaları kaydırabilir, tek seferde 50 dosyaya kadar dönüştürebilir ya
  da SRT içeriğini doğrudan yapıştırabilirsiniz.
steps:
- >-
  SRT dosyasını dönüştürücüye sürükleyin, “Dosya seç” ile seçin veya “Metin yapıştır” sekmesini açıp SRT içeriğini
  yapıştırın.
- >-
  Altyazı senkron değilse Ayarlar’ı açın ve “Tüm zamanlamaları kaydır” alanına milisaniye cinsinden bir değer girin
  (pozitif değer altyazıyı geciktirir).
- >-
  “VTT formatına dönüştür” düğmesine basın. Metin yapıştırırken sonuç siz yazdıkça görünür.
- Sonucu kopyalayın veya .vtt dosyasını indirin.
sourceExplanation: >-
  SRT (SubRip) en yaygın altyazı formatıdır. Düz metin dosyasıdır: sıra numarası, virgüllü zaman aralığı (00:01:02,500)
  ve altyazı metni. Neredeyse tüm video oynatıcılar ve video düzenleme programları SRT okur.
targetExplanation: >-
  WebVTT (.vtt) web videoları için altyazı formatıdır. Dosya WEBVTT satırıyla başlar, zamanlarda nokta kullanır
  (00:01:02.500) ve konum, CSS stili ve konuşmacı adlarını destekler. HTML5 videodaki <track> öğesi yalnızca WebVTT
  kabul eder.
useCases:
- title: Kendi sitenizdeki videolar
  text: >-
    Yalnızca WebVTT kabul eden <track> öğesiyle HTML5 videolara altyazı ekleyin.
- title: Eğitim platformları ve web oynatıcılar
  text: Birçok LMS ve web video oynatıcısı altyazı için .vtt dosyası ister.
- title: Kayık altyazıyı düzeltmek
  text: >-
    Dönüştürürken tüm zamanlamaları tek seferde kaydırın, satırları tek tek düzenlemeyin.
limitations:
- >-
  SRT’deki <font color> etiketlerinin WebVTT’de karşılığı yoktur ve kaldırılır.
- >-
  SRT’de neredeyse hiç konum bilgisi yoktur. Satır başındaki {\an8} etiketi üst konuma çevrilir; diğer ASS tarzı
  etiketler kaldırılır.
- >-
  Satırlar başlangıç zamanına göre sıralanır; başlamadan biten satırlar düzeltilir ve bildirilir.
faq:
- q: SRT ile VTT arasındaki fark nedir?
  a: >-
    Başlıca fark başlık ve zaman damgalarıdır. WebVTT dosyaları “WEBVTT” ile başlar, virgül yerine nokta kullanır
    (00:01:02,500 yerine 00:01:02.500), satır numaraları isteğe bağlıdır ve konum, CSS stili ve konuşmacı etiketlerini
    destekler.
- q: .srt dosyasının adını .vtt yapmak yeterli mi?
  a: >-
    Hayır. Tarayıcılar WEBVTT başlığı olmayan ve virgüllü zaman damgası kullanan dosyaları reddeder. &, < ve > karakterlerinin
    de kaçışlanması gerekir. Dönüştürme bunların hepsini halleder.
- q: Türkçe karakterler bozuk görünüyor (ş, ğ, ı yerine garip işaretler). Düzelir mi?
  a: >-
    Dosya UTF-8 ise karakterler olduğu gibi kalır. UTF-8 olmayan dosyalar Windows-1252 olarak okunur; eski Türkçe
    kodlamayla (Windows-1254) kaydedilmiş dosyalarda ş, ğ ve ı yanlış çıkabilir. Bu durumda dosyayı önce bir metin
    düzenleyicide UTF-8 olarak kaydedin.
- q: Bu araç altyazıyı başka bir dile çevirir mi?
  a: >-
    Hayır. Araç yalnızca dosya formatını SRT’den VTT’ye dönüştürür; altyazı metni orijinal dilinde kalır.
---
