# Báo cáo Kiểm thử Nghiệm thu (UAT Report) — Yoga AI

Ngày: 13/10/2026 (Asia/Saigon). Dự án: D:\Yoga-AI-Codex.
URL đã xác minh: http://127.0.0.1:5173/ (fragment # không được gửi qua HTTP).

## Kết luận
Đạt các kiểm tra kỹ thuật dưới đây; CHƯA đủ điều kiện nghiệm thu trải nghiệm webcam/người tập thật. Không coi dữ liệu tổng hợp hoặc ảnh mẫu là bằng chứng độ chính xác trên người tập. Không tiếp tục Computer Use hoặc vượt cơ chế chặn URL của Brave. Kiểm thử trình duyệt thực hiện bằng Edge headless riêng, không dùng webcam thật và không thay đổi quyền camera.

## Bằng chứng và chức năng Pass
| ID | Kiểm tra | Kết quả và bằng chứng | Phạm vi |
|---|---|---|---|
| T01 | Tiến trình Vite/URL | PASS: node PID 8508 chạy vite.js --host 127.0.0.1 từ D:\Yoga-AI-Codex; TCP 127.0.0.1:5173 thuộc PID 8508 | Tiến trình hiện tại |
| T02 | HTTP trang chính | PASS: GET / trả 200, HTML lang=vi, title Yoga AI, entry /src/main.jsx | Dev server, chưa kiểm thử phục vụ production |
| T03 | Unit test | PASS: npm test, 36/36, fail=0, skipped=0, exit 0; chạy lại sau sửa | Toán góc 0/90/180, 3D, dữ liệu lỗi, ba tư thế/hai bên, thiếu dữ liệu, góc quay, ổn định phản hồi, tracking, coaching, voice |
| T04 | Build | PASS: npm run build, Vite 7.2.2, 43 modules, exit 0; build cuối 858ms | Build thành công không chứng minh mọi hành vi runtime |
| T05 | UI tương tác | PASS: scripts/verify-browser.mjs chọn Warrior II/Tree và bên chân; Tree aria-pressed=true; viewport 390px không tràn ngang | Edge headless; chưa đánh giá chủ quan bố cục/mượt trên thiết bị thật |
| T06 | Lỗi quyền | PASS: getUserMedia bị giả lập NotAllowedError -> alert tiếng Việt 'chưa cho phép' | Không phải thao tác từ chối quyền thật |
| T07 | MediaPipe thực | PASS: model/WASM khởi tạo GPU; video canvas trống không kết luận đạt, 9 tiêu chí unknown | AI thực, camera tổng hợp |
| T08 | 33 landmarks/skeleton | PASS: ảnh mẫu công khai MediaPipe pose_detector.png trả 33 landmarks và 33 worldLandmarks; canvas có pixel skeleton | Ảnh mẫu, chưa xác minh bám người thật hoặc FPS |
| T09 | Dừng/hủy camera | PASS: Tắt camera -> mọi tracks ended, video.srcObject=null; stream trả về muộn sau hủy cũng ended | Stream tổng hợp |
| T10 | Tích hợp feedback | PASS: scripts/verify-live.mjs: tìm người, ẩn điểm khi thiếu dữ liệu, giữ 5s, reset khi sai/mất khớp/đổi tư thế/frame đứng, mobile; pageerror=[] | Landmarks tổng hợp, detector được mock riêng trong QA |
| T11 | JavaScript/React | PASS có giới hạn: không pageerror trong hai kịch bản trên; kiểm tra sau sửa consoleErrors=[] | Không kết luận không có lỗi trong mọi tình huống |
| T12 | Vòng đời sau sửa | PASS: visibilitychange với document.hidden=true giả lập và pagehide được dispatch -> camera idle, tracks ended, video tháo stream | Sự kiện tổng hợp, tab/đóng trang thật cần xác nhận |

### Tài nguyên HTTP và runtime
Kiểm tra bằng Edge APIRequestContext, GET trực tiếp từng tài nguyên:

| Tài nguyên | HTTP | Bytes | Content-Type |
|---|---:|---:|---|
| /wasm/vision_wasm_internal.js | 200 | 204816 | text/javascript |
| /wasm/vision_wasm_internal.wasm | 200 | 11453626 | application/wasm |
| /wasm/vision_wasm_nosimd_internal.js | 200 | 204669 | text/javascript |
| /wasm/vision_wasm_nosimd_internal.wasm | 200 | 10647962 | application/wasm |
| /models/pose_landmarker_lite.task | 200 | 5777746 | không khai báo |

MediaPipe khởi tạo và detect thành công với GPU. requestfailed=[] và HTTP errors trong các request được Playwright theo dõi=[]. Console ban đầu có favicon 404 (request favicon do browser tạo không xuất hiện trong mảng response của page); kiểm tra riêng console.location và GET /favicon.ico xác nhận 404. Không bỏ qua lỗi chỉ vì mảng HTTP errors rỗng.
Cảnh báo MediaPipe: 'OpenGL error checking is disabled'. Inference vẫn thành công; chưa có bằng chứng đây là lỗi chức năng. CPU fallback chưa được kiểm chứng ở lượt này. HTTP 200 cho WASM nosimd chứng minh phục vụ tài nguyên, không chứng minh đã chạy nhánh nosimd.

## Issues / UX Bugs và xử lý
1. UAT-01 — Nhỏ: favicon thiếu, console báo 404 tại /favicon.ico. Đã sửa index.html khai báo favicon SVG inline dùng ký hiệu thương hiệu hiện có. Kiểm tra trang sau sửa consoleErrors=[]; không thêm tính năng.
2. UAT-02 — Trung bình: usePoseCamera trước sửa chỉ reset tracking khi visibilitychange; stream webcam vẫn được giữ khi ẩn tab, không đáp ứng tiêu chí giải phóng tài nguyên của UAT. Đã gọi dispose và reset state khi document.hidden. Khi quay lại trang, người dùng phải bấm Bật camera. Kiểm tra sự kiện tổng hợp xác nhận tracks ended và srcObject=null; đèn webcam thật vẫn Pending.
3. Bất cập nhỏ còn lại qua rà soát mã: lỗi khởi tạo AI chung gợi ý 'npm run setup:assets', khó hiểu với người dùng cuối. Chưa gây lỗi này trong trình duyệt nên không đánh dấu một bug runtime đã xác nhận và không sửa thông báo ở lượt này.

Không có bằng chứng đo được FPS/độ trễ, sai số góc thực tế hoặc flickering trên người thật. Unit test ổn định qua nhiều frame không thay thế việc thử dao động quanh ngưỡng trên camera. Chưa kiểm thử webcam bận/ngắt cáp, cấp quyền thật, CPU fallback phần cứng, điều kiện ánh sáng/xoay/che thật hoặc tải dài.

## Hướng dẫn kiểm thử thủ công — Chrome hoặc Edge
Mở http://127.0.0.1:5173/ trong Chrome/Edge. Ghi phiên bản trình duyệt, hệ điều hành, webcam, độ phân giải, ánh sáng, ngày giờ; camera ngang hông, toàn thân trong ảnh. Người dùng tự thao tác quyền camera. Mở DevTools Console và Network, lọc wasm/task và ghi lỗi; không coi nhãn '33 điểm mốc' là bằng chứng đủ 33 điểm đang nhìn thấy.

| ID | Thao tác | Kỳ vọng / bằng chứng cần ghi | Trạng thái |
|---|---|---|---|
| M01 | Vào trang mới; chọn lần lượt Mountain, Warrior II, Tree | Camera/phản hồi phân biệt rõ; hướng dẫn dễ hiểu; thẻ chọn và nội dung đúng, không dữ liệu cũ | Pending |
| M02 | Bấm Bật camera, tự cho phép | Ghi thời gian tới prompt và từ cho phép tới video+skeleton; có trạng thái tải, không treo hoặc lỗi Console | Pending |
| M03 | Đứng đủ toàn thân rồi di chuyển chậm | Skeleton khớp cơ thể, không lệch ảnh gương; ghi độ trễ/giật; điểm tin cậy thấp có thể bị ẩn hợp lệ | Pending |
| M04 | Mountain: đứng thẳng, gập riêng từng gối, nghiêng thân | Góc thay đổi đúng hướng; lời nhắc tiếng Việt nêu vùng cần chỉnh; không giữ đạt khi sai | Pending |
| M05 | Warrior II: thử cả hai chân trước; gập/duỗi gối, nâng/hạ tay, gập khuỷu | Bên trái/phải theo cơ thể; hướng nâng/hạ/gập/duỗi đúng; đổi bên reset kết quả | Pending |
| M06 | Tree: thử cả hai chân trụ; nâng/hạ chân, đưa chân xa chân trụ | Tiêu chí và lời nhắc đúng bên, không yêu cầu nâng thêm khi đã quá cao; tránh tì chân lên gối | Pending |
| M07 | Với mỗi tư thế: bước xa, xoay nghiêng, che cổ chân/gối, rời ảnh, che camera | Không đủ dữ liệu/chưa thấy người; bỏ kết quả đạt và skeleton cũ, bộ đếm về 0; không kết luận sai khi thiếu dữ liệu | Pending |
| M08 | Di chuyển chậm quanh ranh giới góc đúng/sai trong 20–30 giây | Ghi video màn hình nếu đồng ý hoặc số lần phản hồi đổi; xác nhận phản hồi ổn định nhưng vẫn cập nhật, không nhấp nháy liên tục | Pending |
| M09 | Từ chối quyền; sau đó tự cấp lại và bấm Bật camera | Lỗi thân thiện, giao diện dùng được, mở lại thành công; ghi nguyên văn lỗi | Pending |
| M10 | Tắt camera; lặp bật/tắt 5 lần; tắt lúc đang tải | Đèn/chỉ báo webcam tắt, không stream muộn; mở lại được | Pending |
| M11 | Đang chạy -> chuyển tab hoặc thu nhỏ cửa sổ -> trở lại | Camera đã tắt, đèn tắt; quay lại bấm Bật camera để tiếp tục, không cộng bù thời gian giữ | Pending |
| M12 | Đang chạy -> tải lại/đóng trang | Đèn/chỉ báo webcam tắt; không giữ tài nguyên sau thoát (đóng các app khác dùng webcam để tránh nhiễu) | Pending |
| M13 | Chạy 10 phút và đổi ba tư thế | Ghi giật/độ trễ, lỗi Console, bộ nhớ và phản hồi; không treo, không kẹt camera | Pending |

### Xác minh số landmarks và góc
Skeleton không nhất thiết vẽ mọi điểm: drawSkeleton ẩn điểm visibility/presence thấp. Muốn kiểm chứng 33 phần tử trên người thật, dùng DevTools Sources đặt breakpoint sau dòng `const landmarks = result?.landmarks?.[0]` trong usePoseCamera.js, quan sát `landmarks.length === 33` và `result.worldLandmarks[0].length === 33` khi có người. Tháo breakpoint trước khi đánh giá độ mượt vì pause sẽ làm video dừng.
Để đánh giá sai số góc, chọn một frame ổn định, ghi tọa độ ba khớp và kích thước video, tính góc 2D độc lập với tỷ lệ pixel, so với UI (được làm tròn). Ghi sai số và ngưỡng chấp nhận do nhóm sản phẩm thống nhất trước khi nghiệm thu; góc chiếu 2D không phải góc giải phẫu 3D thực.

Mẫu kết quả từng ca: ID | thiết bị/browser | bước | expected | actual | Pass/Fail/Blocked | ảnh/log | độ trễ hoặc sai số | người kiểm/ngày giờ.
Chỉ ký nghiệm thu camera/AI sau khi hoàn tất các ca Pending và xác định các lỗi còn lại.

## Đề xuất nhỏ
- Dùng lời nhắc phục hồi lỗi AI phù hợp người dùng cuối; giữ lệnh npm trong tài liệu kỹ thuật.
- Ghi rõ camera tự tắt khi rời tab để người dùng hiểu vì sao cần bật lại.
- Đặt ngưỡng chấp nhận độ trễ/sai số/flickering và đo trên thiết bị mục tiêu trước nghiệm thu.

## Ghi chú quá trình kiểm tra
Lần kiểm tra lifecycle đầu dùng canvas chưa phát frame liên tục nên chưa đi tới trạng thái nhận diện; đã dừng, sửa harness QA phát frame liên tục rồi chạy đạt. Đây là lỗi chuẩn bị đầu vào test, không phải lỗi ứng dụng. Không tính lần chưa hoàn thành là Pass.
Các script QA bổ sung được lưu ở scripts/uat-runtime-check.cjs, scripts/uat-lifecycle-check.cjs và scripts/uat-check404.cjs; sử dụng Playwright của runtime hiện có (đường dẫn cố định máy này), không thêm dependency ứng dụng. verify-browser.mjs và verify-live.mjs có sẵn. Unit test/build đã chạy lại sau sửa; không chạy lại toàn bộ hai script cũ vì các thay đổi chỉ ảnh hưởng favicon và visibility lifecycle, đã kiểm tra trực tiếp hai điểm này.
