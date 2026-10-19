# Checklist kiểm thử webcam thực tế

Cập nhật 18/10/2026: các ô bên dưới vẫn CHƯA XÁC MINH trên thiết bị thật. Kết quả tự động mới nhất và hai lỗi đang mở nằm trong UAT_REPORT.md. Ưu tiên nghe so sánh voice-enabled.mp3 với missing-person.mp3 vì hai tệp hiện giống hệt nhau.

Chưa được xác nhận trên webcam/người tập thật. Dùng website HTTPS https://yoga-ai-six.vercel.app/ trên Chrome/Edge hoặc Safari iPhone, camera ngang hông, ánh sáng tốt, toàn bộ cơ thể nằm trong ảnh. Ghi thiết bị, trình duyệt, góc quay và kết quả sau khi thử.

- [ ] Bật webcam, tự cho phép quyền; hình ảnh thật xuất hiện và bộ xương bám cơ thể.
- [ ] Kiểm tra 33 điểm (điểm có độ tin cậy thấp được ẩn khi vẽ).
- [ ] Mountain: đứng thẳng và gập riêng từng gối; góc và hướng dẫn thay đổi phù hợp.
- [ ] Warrior II: thử cả hai chân trước; gối gập/duỗi, tay hạ xuống hoặc gập khuỷu nhận phản hồi.
- [ ] Tree: thử cả hai chân trụ; bàn chân chưa nâng/xa chân trụ được báo điều chỉnh.
- [ ] Che gối/cổ chân hoặc rời khung hình: Không đủ dữ liệu; không giữ kết quả đạt cũ.
- [ ] Xoay nghiêng thân: Không đủ dữ liệu khi heuristic góc quay phát hiện được.
- [ ] Không có người: Chưa tìm thấy người, không có bộ xương hoặc góc cũ.
- [ ] Từ chối camera rồi cấp lại quyền: lỗi rõ ràng và mở lại được.
- [ ] Webcam bận/không kết nối/ngắt cáp: lỗi rõ ràng, không còn vòng lặp xử lý.
- [ ] Tắt/bật nhiều lần; tắt trong khi chờ quyền hoặc tải mô hình: không giữ camera đang chạy ngầm.
- [ ] Tắt camera/đóng trang: đèn webcam tắt, tài nguyên được giải phóng.
- [ ] Kiểm tra GPU và máy cần CPU fallback; ghi delegate thực tế.
- [ ] Chạy 10 phút, đổi tư thế liên tục: theo dõi độ trễ, bộ nhớ và nhấp nháy phản hồi.
- [ ] Điện thoại qua HTTPS: cấp quyền, khung hình và phản hồi dễ đọc.
- [ ] Nhấn Bật giọng nói: nghe câu xác nhận tiếng Việt; kiểm tra âm lượng, phát âm và nội dung đúng bản thu.
- [ ] Giữ lỗi tư thế: nghe tên khớp và cách điều chỉnh; lỗi còn tồn tại được nhắc luân phiên, không nói liên tục.
- [ ] Đạt toàn bộ tiêu chí: nghe xác nhận đạt tham chiếu; điểm khuất không được đọc lời khen cũ.
- [ ] Tắt giọng nói/tắt camera/đổi tư thế hoặc bên chân/chuyển tab: câu đang đọc dừng ngay.
- [ ] Thiết bị không cài giọng tiếng Việt: bộ MP3 vẫn phát; khi mất mạng/tải MP3 lỗi có thông báo và bật lại được.
- [ ] Warrior II: khi gối trước gập sâu nghe hướng nâng hông/duỗi bớt; khi còn duỗi nghe hướng gập nhẹ thêm; tay cao/thấp nghe hạ/nâng đúng bên.
- [ ] Tree: chân nâng thấp/cao nghe nâng nhẹ/hạ phù hợp; luôn có lời nhắc tránh tì bàn chân lên đầu gối.
- [ ] Che riêng cổ chân: không đủ dữ liệu, bản thu thiếu điểm chung được phát; không hướng dẫn gập/duỗi hoặc khen đạt khi thiếu dữ liệu.
- [ ] Lỗi khớp khác thay đổi trong khi đang nghe: hướng dẫn vẫn được đọc hết nếu còn đúng; sửa xong khớp đang nhắc thì câu cũ dừng.
- [ ] Bật camera: thấy thanh điểm/giữ và trạng thái trực tiếp; chưa thấy người thì không có điểm và thời gian là 0.
- [ ] Tư thế đủ tiêu chí: điểm đạt 100 và thời gian tăng đến 5s; đủ mốc xuất hiện hoàn thành.
- [ ] Gập sai một khớp đang giữ: bộ đếm về 0 ngay; điểm thay đổi sau xác nhận qua frame.
- [ ] Che khớp, xoay camera hoặc rời ảnh: điểm ẩn, thời gian không tăng, trạng thái thiếu dữ liệu/tìm cơ thể đúng.
- [ ] Camera đứng hình, chuyển tab rồi trở lại, đổi tư thế hoặc bên chân: không cộng bù thời gian cũ.
- [ ] Bật chế độ giảm chuyển động của thiết bị: chấm nhận diện không nhấp nháy, thanh vẫn phản ánh dữ liệu.
- [ ] Toàn màn hình: video và bộ xương khớp nhau, toàn bộ tư thế không bị cắt; thoát bằng nút ở góc trên bên phải/Esc, camera vẫn tiếp tục chạy.
- [ ] Tắt camera trong toàn màn hình; trên iPhone hoặc khi Fullscreen API không có, khung camera mở rộng trong trang, nút thoát vẫn bấm được; thanh trình duyệt có thể còn hiển thị.

Kết quả là tham chiếu 2D cho tư thế chọn sẵn, không thay thế hướng dẫn trực tiếp của giáo viên.

- [ ] iQOO Z10 Turbo Pro: đổi camera trước/sau khi tắt và khi chạy, camera cũ được đóng, kết quả và thời gian giữ đặt lại.
- [ ] Camera trước phản chiếu như gương; camera sau không phản chiếu, khung xương khớp video.
- [ ] Máy tính: không có nút chuyển camera; thu nhỏ cửa sổ không làm xuất hiện nút.
- [ ] Bật/tắt khung xương không làm dừng đánh giá/giọng nói, giữ lựa chọn khi đổi tư thế/camera.
- [ ] Liquid Glass: kiểm tra chữ trên nền/video thật, nút không chồng lấp, xoay ngang/dọc, hiệu năng/nhiệt máy khi chạy 10 phút.
