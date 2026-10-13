# Checklist kiểm thử webcam thực tế

Chưa được xác nhận trên webcam/người tập thật. Dùng Chrome hoặc Edge trên localhost, camera ngang hông, ánh sáng tốt, toàn bộ cơ thể nằm trong ảnh. Ghi thiết bị, trình duyệt, góc quay và kết quả sau khi thử.

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
- [ ] Nhấn Bật giọng nói: nghe câu xác nhận tiếng Việt; kiểm tra âm lượng, phát âm và giọng được chọn.
- [ ] Giữ lỗi tư thế: nghe tên khớp và cách điều chỉnh; lỗi còn tồn tại được nhắc luân phiên, không nói liên tục.
- [ ] Đạt toàn bộ tiêu chí: nghe xác nhận đạt tham chiếu; điểm khuất không được đọc lời khen cũ.
- [ ] Tắt giọng nói/tắt camera/đổi tư thế hoặc bên chân/chuyển tab: câu đang đọc dừng ngay.
- [ ] Thiết bị không có giọng tiếng Việt: thấy thông báo và phản hồi chữ vẫn hoạt động.
- [ ] Warrior II: khi gối trước gập sâu nghe hướng nâng hông/duỗi bớt; khi còn duỗi nghe hướng gập nhẹ thêm; tay cao/thấp nghe hạ/nâng đúng bên.
- [ ] Tree: chân nâng thấp/cao nghe nâng nhẹ/hạ phù hợp; luôn có lời nhắc tránh tì bàn chân lên đầu gối.
- [ ] Che riêng cổ chân: lời nhắc nêu đúng vùng chưa thấy rõ, không yêu cầu gập/duỗi gối khi thiếu dữ liệu.
- [ ] Lỗi khớp khác thay đổi trong khi đang nghe: hướng dẫn vẫn được đọc hết nếu còn đúng; sửa xong khớp đang nhắc thì câu cũ dừng.
- [ ] Bật camera: thấy thanh điểm/giữ và trạng thái trực tiếp; chưa thấy người thì không có điểm và thời gian là 0.
- [ ] Tư thế đủ tiêu chí: điểm đạt 100 và thời gian tăng đến 5s; đủ mốc xuất hiện hoàn thành.
- [ ] Gập sai một khớp đang giữ: bộ đếm về 0 ngay; điểm thay đổi sau xác nhận qua frame.
- [ ] Che khớp, xoay camera hoặc rời ảnh: điểm ẩn, thời gian không tăng, trạng thái thiếu dữ liệu/tìm cơ thể đúng.
- [ ] Camera đứng hình, chuyển tab rồi trở lại, đổi tư thế hoặc bên chân: không cộng bù thời gian cũ.
- [ ] Bật chế độ giảm chuyển động của thiết bị: chấm nhận diện không nhấp nháy, thanh vẫn phản ánh dữ liệu.
- [ ] Toàn màn hình: video và bộ xương khớp nhau, toàn bộ tư thế không bị cắt; thoát bằng nút/Esc, camera vẫn tiếp tục chạy.
- [ ] Tắt camera trong toàn màn hình; thử trình duyệt nhúng và điện thoại để kiểm tra thông báo khi Fullscreen API không được hỗ trợ.

Kết quả là tham chiếu 2D cho tư thế chọn sẵn, không thay thế hướng dẫn trực tiếp của giáo viên.
