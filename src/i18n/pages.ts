/**
 * Static page chrome for localized pages (build-time only; never shipped to the client).
 * Conversion-specific prose lives in `src/content/localized/{locale}/{slug}.md`.
 */
import type { CategoryId } from '~/lib/catalog/types';
import type { LocalizedLocaleCode } from './locales';

export interface PageStrings {
  /** BCP 47 tag for dates and numbers. */
  intl: string;
  skipToContent: string;
  home: string;
  breadcrumb: string;
  allTools: string;
  mainNav: string;
  language: string;
  chooseLanguage: string;
  categories: Partial<Record<CategoryId, string>>;
  about: string;
  howTo: string;
  formats: string;
  whatIs: string;
  limits: {
    heading: string;
    acceptedInput: string;
    orPaste: string;
    output: string;
    combined: string;
    filesPerConversion: string;
    upTo: string;
    oneAtATime: string;
    maxFileSize: string;
    perFile: string;
    whereItRuns: string;
    onDevice: string;
    cost: string;
    costValue: string;
    note: string;
  };
  limitations: string;
  useCases: string;
  faq: string;
  onThisPage: string;
  related: string;
  relatedWithReverse: string;
  openConverter: string;
  moreInEnglish: string;
  englishVersion: string;
  noscript: string;
  trust: {
    deviceTitle: string;
    deviceText: string;
    accountTitle: string;
    accountText: string;
    fastTitle: string;
    fastText: string;
    freeTitle: string;
    freeText: string;
  };
  lazyAsset: { heic: string; pdfjs: string; pdfWriter: string };
  reviewed: string;
  editorialLinks: string;
  editorialPolicy: string;
  howItWorks: string;
  contact: string;
  ad: string;
  hub: {
    title: string;
    metaDescription: string;
    h1: string;
    intro: string;
    privacyHeading: string;
    privacyText: string;
    englishCatalog: string;
    test?: string;
  };
  footer: {
    tagline: string;
    languages: string;
    policies: string;
    privacy: string;
    cookies: string;
    terms: string;
    aboutUs: string;
    contactUs: string;
    englishNote: string;
  };
}

export const PAGE_STRINGS: Record<LocalizedLocaleCode, PageStrings> = {
  id: {
    intl: 'id-ID',
    skipToContent: 'Langsung ke konten',
    home: 'Beranda',
    breadcrumb: 'Navigasi remah roti',
    allTools: 'Semua alat',
    mainNav: 'Navigasi utama',
    language: 'Bahasa',
    chooseLanguage: 'Pilih bahasa',
    categories: {
      image: 'Konverter gambar',
      pdf: 'Konverter PDF',
      subtitle: 'Konverter subtitle',
      data: 'Konverter data',
    },
    about: 'Tentang konverter {from} ke {to} ini',
    howTo: 'Cara mengubah {from} ke {to}',
    formats: '{from} vs {to}',
    whatIs: 'Apa itu {name}?',
    limits: {
      heading: 'File yang didukung dan batasannya',
      acceptedInput: 'Input yang diterima',
      orPaste: ' — atau tempel teks',
      output: 'Hasil',
      combined: ', beberapa file digabung menjadi satu',
      filesPerConversion: 'File per konversi',
      upTo: 'Hingga {n}',
      oneAtATime: 'Satu per satu',
      maxFileSize: 'Ukuran file maksimal',
      perFile: '{size} per file',
      whereItRuns: 'Tempat pemrosesan',
      onDevice: 'Di browser, di perangkat Anda',
      cost: 'Biaya',
      costValue: 'Gratis, tanpa akun, tanpa watermark',
      note: 'Batasan ini melindungi browser Anda agar tidak kehabisan memori; file yang sangat besar tetap bisa lambat di ponsel lama.',
    },
    limitations: 'Keterbatasan dan kualitas hasil',
    useCases: 'Kapan alat ini berguna',
    faq: 'Pertanyaan yang sering diajukan',
    onThisPage: 'Di halaman ini',
    related: 'Konverter terkait',
    relatedWithReverse: 'Konverter terkait (termasuk {to} ke {from})',
    openConverter: 'Buka konverter',
    moreInEnglish: 'Lebih dari 60 konverter lainnya (dalam bahasa Inggris)',
    englishVersion: 'Halaman ini dalam bahasa Inggris',
    noscript:
      'Konverter ini berjalan di browser Anda dan membutuhkan JavaScript. Aktifkan JavaScript untuk mengonversi file — tidak ada yang diunggah.',
    trust: {
      deviceTitle: 'Tetap di perangkat Anda',
      deviceText: 'File diproses oleh browser Anda dan tidak pernah diunggah.',
      accountTitle: 'Tanpa akun',
      accountText: 'Tanpa daftar, tanpa email, tanpa watermark.',
      fastTitle: 'Cepat',
      fastText: 'Tanpa unggah dan antrean — konversi langsung dimulai.',
      freeTitle: 'Gratis',
      freeText: 'Semua alat gratis, didukung oleh iklan.',
    },
    lazyAsset: {
      heic: 'Safari 17+ membaca HEIC secara bawaan. Browser lain mengunduh dekoder HEIC (sekitar 700 KB) sekali saat konversi pertama; dekoder ini berjalan di perangkat Anda.',
      pdfjs:
        'Perender PDF.js (sekitar 530 KB) diunduh saat Anda mengonversi PDF pertama dan berjalan di perangkat Anda.',
      pdfWriter:
        'Pustaka penulis PDF (sekitar 160 KB) diunduh saat konversi dimulai dan berjalan di perangkat Anda.',
    },
    reviewed: 'Ditulis dan diuji oleh tim {site}; terakhir ditinjau {date}.',
    editorialLinks: 'Selengkapnya (dalam bahasa Inggris):',
    editorialPolicy: 'kebijakan editorial',
    howItWorks: 'cara kerja konversi di browser',
    contact: 'hubungi kami',
    ad: 'Iklan',
    hub: {
      title: 'Konverter File Online Gratis Tanpa Unggah',
      metaDescription:
        'Ubah HEIC ke JPG, PDF ke JPG, SRT ke VTT dan lainnya langsung di browser. Gratis, tanpa daftar, dan file Anda tidak pernah diunggah ke server.',
      h1: 'Konverter file yang bekerja di perangkat Anda',
      intro:
        'Semua alat di halaman ini mengonversi file langsung di browser Anda. Foto, PDF, dan subtitle tidak dikirim ke server mana pun, sehingga tetap privat dan konversi dimulai tanpa menunggu unggahan.',
      privacyHeading: 'Mengapa tanpa unggah?',
      privacyText:
        'Konverter online biasa mengunggah file Anda ke server, memprosesnya di sana, lalu mengirim hasilnya kembali. Formatoza melakukan semua pekerjaan itu di tab browser Anda. Setelah halaman terbuka, konversi tetap berjalan meski koneksi internet terputus.',
      englishCatalog: 'Lihat semua konverter (bahasa Inggris)',
    },
    footer: {
      tagline:
        'Konversi file yang terjadi di perangkat Anda. File yang didukung diproses oleh browser Anda dan tidak pernah diunggah.',
      languages: 'Bahasa',
      policies: 'Kebijakan (bahasa Inggris)',
      privacy: 'Kebijakan privasi',
      cookies: 'Kebijakan cookie',
      terms: 'Ketentuan layanan',
      aboutUs: 'Tentang kami',
      contactUs: 'Kontak',
      englishNote: 'Halaman kebijakan saat ini hanya tersedia dalam bahasa Inggris.',
    },
  },
  vi: {
    intl: 'vi-VN',
    skipToContent: 'Chuyển đến nội dung',
    home: 'Trang chủ',
    breadcrumb: 'Đường dẫn trang',
    allTools: 'Tất cả công cụ',
    mainNav: 'Điều hướng chính',
    language: 'Ngôn ngữ',
    chooseLanguage: 'Chọn ngôn ngữ',
    categories: {
      image: 'Chuyển đổi ảnh',
      pdf: 'Chuyển đổi PDF',
      subtitle: 'Chuyển đổi phụ đề',
    },
    about: 'Giới thiệu công cụ chuyển {from} sang {to}',
    howTo: 'Cách chuyển {from} sang {to}',
    formats: '{from} và {to}',
    whatIs: '{name} là gì?',
    limits: {
      heading: 'File được hỗ trợ và giới hạn',
      acceptedInput: 'Định dạng đầu vào',
      orPaste: ' — hoặc dán văn bản',
      output: 'Kết quả',
      combined: ', nhiều file được gộp thành một',
      filesPerConversion: 'Số file mỗi lần',
      upTo: 'Tối đa {n}',
      oneAtATime: 'Mỗi lần một file',
      maxFileSize: 'Dung lượng tối đa',
      perFile: '{size} mỗi file',
      whereItRuns: 'Nơi xử lý',
      onDevice: 'Trong trình duyệt, trên thiết bị của bạn',
      cost: 'Chi phí',
      costValue: 'Miễn phí, không cần tài khoản, không có watermark',
      note: 'Các giới hạn này giúp trình duyệt không bị hết bộ nhớ; file rất lớn vẫn có thể chạy chậm trên điện thoại đời cũ.',
    },
    limitations: 'Giới hạn và độ chính xác',
    useCases: 'Khi nào nên dùng',
    faq: 'Câu hỏi thường gặp',
    onThisPage: 'Trong trang này',
    related: 'Công cụ liên quan',
    relatedWithReverse: 'Công cụ liên quan (gồm cả {to} sang {from})',
    openConverter: 'Mở công cụ',
    moreInEnglish: 'Hơn 60 công cụ chuyển đổi khác (tiếng Anh)',
    englishVersion: 'Trang này bằng tiếng Anh',
    noscript:
      'Công cụ này chạy trong trình duyệt và cần JavaScript. Hãy bật JavaScript để chuyển đổi file — không có gì được tải lên.',
    trust: {
      deviceTitle: 'Ở lại trên thiết bị của bạn',
      deviceText: 'File được trình duyệt xử lý và không bao giờ bị tải lên.',
      accountTitle: 'Không cần tài khoản',
      accountText: 'Không đăng ký, không email, không watermark.',
      fastTitle: 'Nhanh',
      fastText: 'Không phải tải lên hay xếp hàng — chuyển đổi bắt đầu ngay.',
      freeTitle: 'Miễn phí',
      freeText: 'Mọi công cụ đều miễn phí, được duy trì nhờ quảng cáo.',
    },
    lazyAsset: {
      heic: 'Safari 17+ đọc HEIC sẵn. Các trình duyệt khác sẽ tải bộ giải mã HEIC (khoảng 700 KB) một lần ở lần chuyển đổi đầu tiên; bộ giải mã chạy trên thiết bị của bạn.',
      pdfjs:
        'Bộ hiển thị PDF.js (khoảng 530 KB) được tải khi bạn chuyển PDF đầu tiên và chạy trên thiết bị của bạn.',
      pdfWriter:
        'Thư viện tạo PDF (khoảng 160 KB) được tải khi bắt đầu chuyển đổi và chạy trên thiết bị của bạn.',
    },
    reviewed: 'Được đội ngũ {site} viết và kiểm thử; cập nhật lần cuối {date}.',
    editorialLinks: 'Tìm hiểu thêm (tiếng Anh):',
    editorialPolicy: 'chính sách biên tập',
    howItWorks: 'cách chuyển đổi trong trình duyệt hoạt động',
    contact: 'liên hệ',
    ad: 'Quảng cáo',
    hub: {
      title: 'Chuyển Đổi File Online Miễn Phí, Không Tải Lên',
      metaDescription:
        'Chuyển HEIC sang JPG, PDF sang JPG, SRT sang VTT ngay trong trình duyệt. Miễn phí, không cần đăng ký và file của bạn không bao giờ bị tải lên máy chủ.',
      h1: 'Công cụ chuyển đổi file chạy ngay trên thiết bị của bạn',
      intro:
        'Mọi công cụ ở đây đều chuyển đổi file ngay trong trình duyệt. Ảnh, PDF và phụ đề không được gửi tới máy chủ nào, vì vậy dữ liệu luôn riêng tư và bạn không phải chờ tải lên.',
      privacyHeading: 'Vì sao không cần tải lên?',
      privacyText:
        'Các trang chuyển đổi thông thường tải file của bạn lên máy chủ, xử lý rồi gửi kết quả về. Formatoza làm toàn bộ việc đó trong tab trình duyệt của bạn. Sau khi trang đã mở, bạn vẫn chuyển đổi được kể cả khi mất mạng.',
      englishCatalog: 'Xem tất cả công cụ (tiếng Anh)',
    },
    footer: {
      tagline:
        'Chuyển đổi file ngay trên thiết bị của bạn. File được trình duyệt xử lý và không bao giờ bị tải lên.',
      languages: 'Ngôn ngữ',
      policies: 'Chính sách (tiếng Anh)',
      privacy: 'Chính sách quyền riêng tư',
      cookies: 'Chính sách cookie',
      terms: 'Điều khoản dịch vụ',
      aboutUs: 'Giới thiệu',
      contactUs: 'Liên hệ',
      englishNote: 'Các trang chính sách hiện chỉ có bằng tiếng Anh.',
    },
  },
  tr: {
    intl: 'tr-TR',
    skipToContent: 'İçeriğe geç',
    home: 'Ana sayfa',
    breadcrumb: 'Sayfa yolu',
    allTools: 'Tüm araçlar',
    mainNav: 'Ana menü',
    language: 'Dil',
    chooseLanguage: 'Dil seçin',
    categories: {
      image: 'Görüntü dönüştürücüler',
      pdf: 'PDF dönüştürücüler',
      subtitle: 'Altyazı dönüştürücüler',
      data: 'Veri dönüştürücüler',
    },
    about: 'Bu {from} → {to} dönüştürücü hakkında',
    howTo: '{from} dosyası {to} formatına nasıl çevrilir?',
    formats: '{from} ve {to} karşılaştırması',
    whatIs: '{name} nedir?',
    limits: {
      heading: 'Desteklenen dosyalar ve sınırlar',
      acceptedInput: 'Kabul edilen giriş',
      orPaste: ' — veya metin yapıştırın',
      output: 'Çıktı',
      combined: ', birden fazla dosya tek dosyada birleştirilir',
      filesPerConversion: 'Dönüştürme başına dosya',
      upTo: 'En fazla {n}',
      oneAtATime: 'Tek seferde bir dosya',
      maxFileSize: 'Maksimum dosya boyutu',
      perFile: 'Dosya başına {size}',
      whereItRuns: 'Nerede çalışır',
      onDevice: 'Tarayıcınızda, kendi cihazınızda',
      cost: 'Ücret',
      costValue: 'Ücretsiz, hesap gerekmez, filigran yok',
      note: 'Bu sınırlar tarayıcınızın belleğinin dolmasını önler; çok büyük dosyalar eski telefonlarda yine de yavaş olabilir.',
    },
    limitations: 'Sınırlamalar ve doğruluk',
    useCases: 'Ne zaman kullanılır?',
    faq: 'Sık sorulan sorular',
    onThisPage: 'Bu sayfada',
    related: 'İlgili dönüştürücüler',
    relatedWithReverse: 'İlgili dönüştürücüler ({to} → {from} dahil)',
    openConverter: 'Dönüştürücüyü aç',
    moreInEnglish: '60’tan fazla başka dönüştürücü (İngilizce)',
    englishVersion: 'Bu sayfanın İngilizcesi',
    noscript:
      'Bu dönüştürücü tarayıcınızda çalışır ve JavaScript gerektirir. Dosya dönüştürmek için JavaScript’i etkinleştirin — hiçbir şey yüklenmez.',
    trust: {
      deviceTitle: 'Cihazınızda kalır',
      deviceText: 'Dosyalar tarayıcınız tarafından işlenir ve asla yüklenmez.',
      accountTitle: 'Hesap yok',
      accountText: 'Kayıt yok, e-posta yok, filigran yok.',
      fastTitle: 'Hızlı',
      fastText: 'Yükleme veya sıra yok — dönüştürme hemen başlar.',
      freeTitle: 'Ücretsiz',
      freeText: 'Tüm araçlar ücretsizdir ve reklamlarla desteklenir.',
    },
    lazyAsset: {
      heic: 'Safari 17+ HEIC dosyalarını yerleşik olarak açar. Diğer tarayıcılar ilk dönüştürmede bir kez HEIC kod çözücüsü (yaklaşık 700 KB) indirir; bu kod çözücü cihazınızda çalışır.',
      pdfjs:
        'PDF.js görüntüleyicisi (yaklaşık 530 KB) ilk PDF’nizi dönüştürdüğünüzde indirilir ve cihazınızda çalışır.',
      pdfWriter:
        'Bir PDF oluşturma kitaplığı (yaklaşık 160 KB) dönüştürme başladığında indirilir ve cihazınızda çalışır.',
    },
    reviewed: '{site} ekibi tarafından yazıldı ve test edildi; son inceleme {date}.',
    editorialLinks: 'Daha fazlası (İngilizce):',
    editorialPolicy: 'editoryal politika',
    howItWorks: 'tarayıcı içi dönüştürme nasıl çalışır',
    contact: 'bize yazın',
    ad: 'Reklam',
    hub: {
      title: 'Ücretsiz Online Dosya Dönüştürücü — Yükleme Yok',
      metaDescription:
        'HEIC’i JPG’ye, PDF’yi JPG’ye, SRT’yi VTT’ye doğrudan tarayıcınızda çevirin. Ücretsiz, kayıt gerekmez ve dosyalarınız asla bir sunucuya yüklenmez.',
      h1: 'Cihazınızda çalışan dosya dönüştürücüler',
      intro:
        'Buradaki tüm araçlar dosyaları doğrudan tarayıcınızda dönüştürür. Fotoğraflar, PDF’ler ve altyazılar hiçbir sunucuya gönderilmez; böylece gizli kalır ve dönüştürme yükleme beklemeden başlar.',
      privacyHeading: 'Neden yükleme yok?',
      privacyText:
        'Klasik online dönüştürücüler dosyanızı bir sunucuya yükler, orada işler ve sonucu geri gönderir. Formatoza bu işin tamamını tarayıcı sekmenizde yapar. Sayfa açıldıktan sonra internet bağlantınız kesilse bile dönüştürme çalışmaya devam eder.',
      englishCatalog: 'Tüm dönüştürücüleri gör (İngilizce)',
    },
    footer: {
      tagline:
        'Cihazınızda gerçekleşen dosya dönüştürme. Desteklenen dosyalar tarayıcınız tarafından işlenir ve asla yüklenmez.',
      languages: 'Diller',
      policies: 'Politikalar (İngilizce)',
      privacy: 'Gizlilik politikası',
      cookies: 'Çerez politikası',
      terms: 'Hizmet şartları',
      aboutUs: 'Hakkımızda',
      contactUs: 'İletişim',
      englishNote: 'Politika sayfaları şimdilik yalnızca İngilizce olarak sunulmaktadır.',
    },
  },
  pt: {
    intl: 'pt-BR',
    skipToContent: 'Pular para o conteúdo',
    home: 'Início',
    breadcrumb: 'Trilha de navegação',
    allTools: 'Todas as ferramentas',
    mainNav: 'Navegação principal',
    language: 'Idioma',
    chooseLanguage: 'Escolher idioma',
    categories: {
      subtitle: 'Conversores de legenda',
      data: 'Conversores de dados',
    },
    about: 'Sobre este conversor de {from} para {to}',
    howTo: 'Como converter {from} para {to}',
    formats: '{from} x {to}',
    whatIs: 'O que é {name}?',
    limits: {
      heading: 'Arquivos aceitos e limites',
      acceptedInput: 'Entrada aceita',
      orPaste: ' — ou cole o texto',
      output: 'Saída',
      combined: ', vários arquivos juntados em um',
      filesPerConversion: 'Arquivos por conversão',
      upTo: 'Até {n}',
      oneAtATime: 'Um por vez',
      maxFileSize: 'Tamanho máximo',
      perFile: '{size} por arquivo',
      whereItRuns: 'Onde roda',
      onDevice: 'No seu navegador, no seu dispositivo',
      cost: 'Custo',
      costValue: 'Grátis, sem cadastro, sem marca d’água',
      note: 'Esses limites evitam que o navegador fique sem memória; arquivos muito grandes ainda podem ficar lentos em celulares antigos.',
    },
    limitations: 'Limitações e fidelidade',
    useCases: 'Quando usar',
    faq: 'Perguntas frequentes',
    onThisPage: 'Nesta página',
    related: 'Conversores relacionados',
    relatedWithReverse: 'Conversores relacionados (incluindo {to} para {from})',
    openConverter: 'Abrir conversor',
    moreInEnglish: 'Mais de 60 outros conversores (em inglês)',
    englishVersion: 'Esta página em inglês',
    noscript:
      'Este conversor roda no seu navegador e precisa de JavaScript. Ative o JavaScript para converter arquivos — nada é enviado.',
    trust: {
      deviceTitle: 'Fica no seu dispositivo',
      deviceText: 'Os arquivos são processados pelo navegador e nunca são enviados.',
      accountTitle: 'Sem cadastro',
      accountText: 'Sem conta, sem e-mail, sem marca d’água.',
      fastTitle: 'Rápido',
      fastText: 'Sem upload nem fila — a conversão começa na hora.',
      freeTitle: 'Grátis',
      freeText: 'Todas as ferramentas são gratuitas, mantidas por anúncios.',
    },
    lazyAsset: {
      heic: 'O Safari 17+ lê HEIC nativamente. Outros navegadores baixam uma vez um decodificador de HEIC (cerca de 700 KB) na primeira conversão; ele roda no seu dispositivo.',
      pdfjs:
        'O renderizador PDF.js (cerca de 530 KB) é baixado quando você converte o primeiro PDF e roda no seu dispositivo.',
      pdfWriter:
        'Uma biblioteca para gerar PDF (cerca de 160 KB) é baixada quando a conversão começa e roda no seu dispositivo.',
    },
    reviewed: 'Escrito e testado pela equipe {site}; revisado pela última vez em {date}.',
    editorialLinks: 'Saiba mais (em inglês):',
    editorialPolicy: 'política editorial',
    howItWorks: 'como funciona a conversão no navegador',
    contact: 'fale conosco',
    ad: 'Publicidade',
    hub: {
      title: 'Conversor de Legendas e Dados Online, Sem Upload',
      metaDescription:
        'Converta SRT para VTT, VTT para SRT, CSV para JSON e JSON para CSV direto no navegador. Grátis, sem cadastro, e seus arquivos nunca são enviados.',
      h1: 'Conversores que funcionam no seu dispositivo',
      intro:
        'As ferramentas desta página convertem legendas e dados direto no seu navegador. Os arquivos não são enviados a nenhum servidor, então continuam privados e a conversão começa sem esperar upload.',
      privacyHeading: 'Por que sem upload?',
      privacyText:
        'Conversores online comuns enviam o arquivo para um servidor, processam lá e devolvem o resultado. O Formatoza faz tudo isso na aba do seu navegador. Depois que a página abre, a conversão funciona até sem internet.',
      englishCatalog: 'Ver todos os conversores (em inglês)',
      test: 'Estamos começando pelas legendas e pelos dados. Outras ferramentas estão disponíveis em inglês.',
    },
    footer: {
      tagline:
        'Conversão de arquivos que acontece no seu dispositivo. Os arquivos aceitos são processados pelo navegador e nunca são enviados.',
      languages: 'Idiomas',
      policies: 'Políticas (em inglês)',
      privacy: 'Política de privacidade',
      cookies: 'Política de cookies',
      terms: 'Termos de uso',
      aboutUs: 'Sobre',
      contactUs: 'Contato',
      englishNote: 'As páginas de políticas estão disponíveis apenas em inglês por enquanto.',
    },
  },
};
