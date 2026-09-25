---
title: Chuyển SRT sang VTT — Phụ Đề WebVTT Cho Video Web
metaDescription: >-
  Chuyển phụ đề SRT sang WebVTT cho video HTML5 và trình phát web. Tự sửa mốc thời gian, bảng mã và xuống dòng.
  Chạy ngay trong trình duyệt, miễn phí.
h1: Chuyển SRT sang VTT
shortDescription: >-
  Chuyển phụ đề SRT sang WebVTT để dùng với thẻ <track> của HTML5 và các trình phát video trên web.
intro: >-
  Khi gắn phụ đề cho video trên website, nền tảng khóa học hay trình phát HTML5, bạn thường cần file WebVTT (.vtt)
  thay vì SRT. Chỉ đổi đuôi file là không đủ: VTT cần dòng WEBVTT ở đầu, mốc thời gian dùng dấu chấm và một số ký
  tự đặc biệt phải được mã hóa.


  Công cụ này tự làm tất cả ngay trong trình duyệt. Bạn còn có thể dịch toàn bộ mốc thời gian khi phụ đề bị lệch
  và chuyển tối đa 50 file mỗi lần — hoặc chỉ cần dán nội dung SRT.
steps:
- >-
  Kéo thả file SRT vào khung chuyển đổi, chọn bằng “Chọn file”, hoặc mở tab “Dán văn bản” và dán nội dung SRT.
- >-
  Nếu phụ đề bị lệch, mở Cài đặt và nhập “Dịch toàn bộ thời gian” theo mili giây (giá trị dương làm phụ đề xuất
  hiện muộn hơn).
- >-
  Nhấn “Chuyển sang VTT”. Ở chế độ dán văn bản, kết quả hiện ngay khi bạn nhập.
- Sao chép kết quả hoặc tải file .vtt về.
sourceExplanation: >-
  SRT (SubRip) là định dạng phụ đề phổ biến nhất. Đây là file văn bản thuần gồm số thứ tự, mốc thời gian dùng dấu
  phẩy (00:01:02,500) và nội dung phụ đề. Hầu hết trình phát video và phần mềm dựng phim đều đọc được SRT.
targetExplanation: >-
  WebVTT (.vtt) là định dạng phụ đề dành cho video trên web. File bắt đầu bằng dòng WEBVTT, mốc thời gian dùng dấu
  chấm (00:01:02.500) và hỗ trợ vị trí, kiểu chữ CSS cũng như tên người nói. Thẻ <track> của video HTML5 chỉ nhận
  WebVTT.
useCases:
- title: Video trên website
  text: Thêm phụ đề cho video HTML5 bằng thẻ <track>, vốn chỉ nhận WebVTT.
- title: Nền tảng khóa học, trình phát web
  text: Nhiều LMS và trình phát video trên web yêu cầu file .vtt cho phụ đề.
- title: Sửa phụ đề bị lệch
  text: >-
    Dịch toàn bộ mốc thời gian trong lúc chuyển đổi, không phải sửa từng dòng.
limitations:
- >-
  Thẻ <font color> trong SRT không có tương đương trong WebVTT nên bị lược bỏ.
- >-
  SRT gần như không có thông tin vị trí. Thẻ {\an8} ở đầu dòng được chuyển thành vị trí phía trên; các thẻ kiểu
  ASS khác bị lược bỏ.
- >-
  Các dòng được sắp xếp theo thời gian bắt đầu; dòng có thời gian kết thúc trước thời gian bắt đầu sẽ được sửa và
  báo lại.
faq:
- q: SRT và VTT khác nhau thế nào?
  a: >-
    Chủ yếu ở phần đầu file và mốc thời gian. WebVTT bắt đầu bằng “WEBVTT”, dùng dấu chấm (00:01:02.500) thay cho
    dấu phẩy (00:01:02,500), số thứ tự là tùy chọn, và hỗ trợ vị trí, kiểu CSS, tên người nói.
- q: Có thể đổi đuôi .srt thành .vtt được không?
  a: >-
    Không. Trình duyệt từ chối file thiếu dòng WEBVTT và dùng dấu phẩy trong mốc thời gian. Các ký tự &, < và >
    cũng cần được mã hóa. Công cụ này xử lý tất cả.
- q: Phụ đề tiếng Việt bị lỗi font thành ký tự lạ, có sửa được không?
  a: >-
    Thường là được. File không phải UTF-8 sẽ được đọc theo bảng mã Windows-1252 phổ biến và VTT luôn được ghi ở
    UTF-8. Nếu file dùng bảng mã tiếng Việt cũ như TCVN3 hoặc VNI, công cụ không tự chuyển được; hãy lưu lại file
    ở UTF-8 trước.
- q: Công cụ có dịch phụ đề sang ngôn ngữ khác không?
  a: >-
    Không. Công cụ chỉ đổi định dạng file từ SRT sang VTT; nội dung phụ đề giữ nguyên ngôn ngữ gốc.
---
