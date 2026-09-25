---
title: Chuyển VTT sang SRT — Đổi Phụ Đề WebVTT
metaDescription: >-
  Chuyển phụ đề WebVTT sang SRT cho phần mềm dựng phim, trình phát và nền tảng tải video. Tự xử lý vị trí, ghi chú
  và kiểu chữ. Chạy trong trình duyệt.
h1: Chuyển VTT sang SRT
shortDescription: >-
  Chuyển phụ đề WebVTT tải từ web sang SRT cho phần mềm dựng phim, trình phát và các nền tảng khác.
intro: >-
  Phụ đề tải về từ các trang video, khóa học online hay cuộc họp trực tuyến thường ở dạng WebVTT (.vtt), trong khi
  phần mềm dựng phim, trình phát trên TV và nhiều trình phát máy tính quen dùng SRT hơn. Công cụ này chuyển VTT
  sang SRT ngay trong trình duyệt, không tải file lên.


  Dòng WEBVTT, khối NOTE, kiểu CSS và thông số vị trí mà SRT không hỗ trợ sẽ được lược bỏ gọn gàng, còn nội dung
  và mốc thời gian của từng dòng được giữ nguyên. Bạn có thể chuyển tối đa 50 file mỗi lần hoặc dán thẳng nội dung
  VTT.
steps:
- >-
  Kéo thả file VTT vào khung chuyển đổi, chọn bằng “Chọn file”, hoặc mở tab “Dán văn bản” và dán nội dung.
- >-
  Nếu phụ đề bị lệch, nhập “Dịch toàn bộ thời gian” (mili giây) trong Cài đặt.
- Nhấn “Chuyển sang SRT”. Ở chế độ dán văn bản, kết quả hiện ngay.
- Sao chép kết quả hoặc tải file .srt về.
sourceExplanation: >-
  WebVTT (.vtt) là định dạng phụ đề dành cho video trên web. File bắt đầu bằng dòng WEBVTT, mốc thời gian dùng dấu
  chấm (00:01:02.500) và hỗ trợ vị trí, kiểu chữ CSS cũng như tên người nói. Thẻ <track> của video HTML5 chỉ nhận
  WebVTT.
targetExplanation: >-
  SRT (SubRip) là định dạng phụ đề phổ biến nhất. Đây là file văn bản thuần gồm số thứ tự, mốc thời gian dùng dấu
  phẩy (00:01:02,500) và nội dung phụ đề. Hầu hết trình phát video và phần mềm dựng phim đều đọc được SRT.
useCases:
- title: Dựng video
  text: >-
    Đưa phụ đề tải từ web vào CapCut, Premiere Pro, DaVinci Resolve hoặc phần mềm dựng dùng SRT.
- title: Xem phim offline
  text: Trình phát trên TV, điện thoại và máy tính đọc SRT ổn định nhất.
- title: Lưu biên bản họp, buổi học
  text: Lưu phụ đề của buổi họp hay lớp học online ở định dạng phổ biến nhất.
limitations:
- >-
  Kiểu chữ WebVTT (CSS ::cue, class), vùng hiển thị và phần lớn thông số vị trí không có trong SRT nên bị lược bỏ.
- Tên người nói trong thẻ <v> bị bỏ; chỉ giữ lại lời thoại.
- Các khối ghi chú NOTE không được chuyển sang.
faq:
- q: Kiểu chữ và vị trí của WebVTT sẽ ra sao?
  a: >-
    SRT không lưu được nên chúng bị lược bỏ. Ngoại lệ là dòng đặt ở phía trên màn hình được đánh dấu bằng {\an8},
    thẻ mà nhiều trình phát hiểu được.
- q: Có chuyển được phụ đề tự động của YouTube không?
  a: >-
    Được, nhưng phụ đề tự động lặp lại câu ở các dòng chồng nhau nên file SRT cũng sẽ có những đoạn lặp đó.
- q: File SRT dùng bảng mã gì?
  a: >-
    UTF-8, xuống dòng kiểu Windows (CRLF), để tương thích với nhiều trình phát và phần mềm nhất.
---
