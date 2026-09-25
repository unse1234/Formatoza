---
title: CSV JSON Dönüştürme — Online ve Tarayıcıda
metaDescription: >-
  CSV dosyalarını JSON nesne dizisine dönüştürün. Ayırıcıyı otomatik algılar, tırnaklı alanları işler, hatalı satırları
  bildirir. Dosya yüklenmez, ücretsiz.
h1: CSV’yi JSON’a Dönüştürme Aracı
shortDescription: >-
  CSV satırlarını ayırıcı algılama ve hatalı satır raporlarıyla birlikte bir JSON nesne dizisine dönüştürün.
intro: >-
  Excel’den veya bir veritabanından dışa aktardığınız CSV dosyasını bir API’ye, JavaScript uygulamasına ya da NoSQL
  veritabanına aktarmanız gerektiğinde JSON’a ihtiyaç duyarsınız. Bu araç CSV’yi, ilk satırdaki sütun adlarını anahtar
  olarak kullanan bir JSON nesne dizisine dönüştürür — tamamen tarayıcınızda.


  Türkçe Excel’in varsayılan olarak kullandığı noktalı virgül dahil ayırıcı otomatik algılanır; tırnak içindeki
  virgüller ve satır sonları doğru işlenir. Dosya bırakabilir veya CSV’yi doğrudan yapıştırabilirsiniz; veriler
  hiçbir sunucuya gönderilmez.
steps:
- >-
  CSV dosyasını dönüştürücüye sürükleyin, “Dosya seç” ile seçin veya “Metin yapıştır” sekmesinde veriyi yapıştırın.
- >-
  Gerekirse Ayarlar’dan ayırıcıyı, ilk satırın sütun adı olup olmadığını, sayı algılamayı ve girintiyi değiştirin.
- >-
  “JSON formatına dönüştür” düğmesine basın. Yapıştırılan veride sonuç siz yazdıkça güncellenir.
- JSON’u kopyalayın veya .json dosyası olarak indirin.
sourceExplanation: >-
  CSV (virgülle ayrılmış değerler), her satırın bir kayıt ve her alanın ayırıcıyla ayrıldığı düz metin tablo formatıdır.
  Excel, Google E-Tablolar ve veritabanları CSV’yi dışa aktarır. Türkçe bölge ayarlarında ondalık ayırıcı virgül
  olduğu için Excel çoğunlukla noktalı virgül kullanır.
targetExplanation: >-
  JSON (JavaScript Object Notation), web API’lerinin ve JavaScript uygulamalarının standart veri formatıdır. Nesneler,
  diziler, sayılar, true/false ve metin değerlerini iç içe yapılarla saklayabilir; neredeyse tüm programlama dilleri
  JSON okuyup yazabilir.
useCases:
- title: API ve uygulamalara veri aktarmak
  text: >-
    Excel’den alınan ürün veya müşteri listelerini REST API’lerin ve JavaScript uygulamalarının beklediği JSON yapısına
    çevirin.
- title: Test ve örnek veri
  text: >-
    Tablo halindeki test verilerini geliştirme ortamında kullanmak için hızlıca JSON’a dönüştürün.
- title: NoSQL veritabanları
  text: >-
    MongoDB veya Firebase gibi JSON tabanlı veritabanlarına içe aktarım için veri hazırlayın.
limitations:
- >-
  CSV’de iç içe yapı yoktur. İç içe JSON yalnızca “Noktalı sütun adlarını iç içe yap” açıksa oluşturulur; bu seçenek
  address.city gibi sütunları iç içe nesnelere çevirir.
- >-
  Tarihler yazıldığı gibi metin olarak kalır; CSV hangi tarih biçiminin kullanıldığını güvenilir şekilde belirtmez.
- >-
  Değerler yalnızca kayıpsızsa sayıya çevrilir; bu yüzden 1.50, 1e3, +90 ve çok uzun kimlik numaraları metin olarak
  kalır.
- >-
  Boş hücreler null değil boş metin ("") olur; böylece olmayan bilgi eklenmez.
faq:
- q: JSON çıktısı nasıl görünür?
  a: >-
    Başlık satırı varsa bir nesne dizisi: [{"id": 1, "ad": "Ayşe"}, …]. Ayarlar’dan başlık satırını kapatırsanız
    her satır için bir dizi içeren dizi elde edersiniz.
- q: Excel’den aldığım CSV noktalı virgüllü. Çalışır mı?
  a: >-
    Evet. Ayırıcı veriden otomatik algılanır; isterseniz Ayarlar’dan virgül, noktalı virgül, sekme veya dikey çizgiyi
    zorunlu kılabilirsiniz.
- q: Sayılarım neden hâlâ metin?
  a: >-
    Sayılar yalnızca geri yazıldığında birebir aynı kalıyorsa dönüştürülür. Baştaki sıfırlar, sondaki sıfırlar,
    artı işaretleri, üslü gösterim ve JavaScript’in tam temsil edemediği büyük tam sayılar metin olarak kalır.
- q: Tekrarlanan veya boş sütun adları ne olur?
  a: >-
    JSON anahtarları benzersiz olmalıdır; tekrarlananlar sonek alır (ad, ad_2), boş başlıklar column_1, column_2
    gibi adlandırılır.
---
