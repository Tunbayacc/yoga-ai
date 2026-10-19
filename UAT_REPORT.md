# Báo cáo QA — Yoga AI · Samsung Innovation Campus

Ngày kiểm thử: **18/10/2026**, múi giờ Asia/Saigon. Báo cáo kỹ thuật của lượt kiểm thử này, không phải chứng nhận nghiệm thu của Samsung.

## Kết luận

**Đạt các kiểm tra chức năng tự động đã thực hiện; còn 2 lỗi xác nhận và chưa đủ bằng chứng nghiệm thu người tập/điện thoại thật.**

- Unit: **41/41 PASS**, 0 fail, 0 skipped. Build production: PASS, 47 modules.
- Production: **17/17 nhóm kiểm tra PASS** trong `production-results.json`. Đây là nhóm kiểm tra, không phải tỷ lệ bao phủ toàn hệ thống.
- Các bộ kiểm tra trình duyệt riêng: ảnh mẫu/GPU, điểm và giữ tư thế, 48 MP3, chuyển camera, toàn màn hình: PASS trong phạm vi ghi dưới đây.
- **QA-01, mức vừa:** hai bản thu cho bật giọng nói và không tìm thấy người giống hệt nhau trên local và production.
- **QA-02, mức nhẹ:** thông báo lỗi tải AI hiển thị lệnh npm cho người dùng cuối.
- **QA-03: ACCEPTED / DEFERRED** — ngày 19/10, người dùng chấp nhận giới hạn iPhone và yêu cầu không tiếp tục xử lý. Không tính là lỗi đang chờ sửa trong phạm vi hiện tại.
- Chưa xác minh trên iQOO Z10 Turbo Pro/iPhone thật, người tập thật, âm thanh qua loa thật hoặc độ chính xác đo góc thực tế. Không đánh dấu các mục này PASS.

## Môi trường và phạm vi

| Thành phần | Giá trị |
|---|---|
| Production | https://yoga-ai-six.vercel.app/ |
| Source kiểm thử | `334fa4cfccbc47f286480a5b4dd51c2bc2bb9372`, nhánh main, có bổ sung script QA local |
| Deployment đã biết | `dpl_6uihW59qCkHj2G4B4MQuCkSqpEsB` |
| Local integration | http://127.0.0.1:5174/ |
| Máy/trình duyệt | Windows, Microsoft Edge headless **155.0.4283.62**, Playwright có sẵn trong runtime |
| Runtime | Node 24.18.1; Vite 7.2.2; React 19.2.0; MediaPipe tasks-vision 0.10.32 |
| Responsive | 320, 360, 390, 768, 1024, 1440 px; UA Android chỉ mô phỏng nhận diện thiết bị |
| Dữ liệu | Video canvas trống; ảnh mẫu công khai MediaPipe; landmarks tổng hợp chỉ trong QA |

Không thu camera của người dùng. Giả lập lỗi quyền/stream/visibility không thay thế kiểm tra quyền và phần cứng thật. Bản production được kiểm thử qua HTTPS; lượt này không sửa mã ứng dụng, không triển khai lại và không push GitHub.

## Ma trận kết quả

| ID | Chức năng / cách kiểm tra | Kết quả | Bằng chứng / giới hạn |
|---|---|---|---|
| Q01 | Unit: góc, ba tư thế/hai bên, chất lượng điểm, feedback, coaching, tracking, ánh xạ MP3 | PASS 41/41 | `unit-tests.txt`; đầu vào tổng hợp |
| Q02 | Build production | PASS | `build.txt`, 47 modules; CSS 22.10 kB, JS 374.95 kB trước gzip |
| Q03 | HTTPS, title, lang=vi | PASS | PROD-HTTP, HTTP 200 |
| Q04 | Model + 4 tệp JS/WASM | PASS | PROD-ASSETS, 5/5 HTTP 200; đúng loại WASM và kích thước |
| Q05 | Chọn Mountain/Warrior II/Tree, chân trước/chân trụ | PASS | PROD-POSES và verify-browser; đổi lựa chọn và aria-pressed đúng |
| Q06 | Responsive và Liquid Glass | PASS có giới hạn | 6 chiều rộng không tràn ngang, các nút trong viewport; đã xem ảnh 1440/390. Chưa đo hiệu năng blur trên điện thoại |
| Q07 | Bật/tắt khung xương | PASS | Canvas ẩn/hiện đúng; không thay đổi luồng đánh giá trong mã |
| Q08 | Từ chối quyền, không có webcam, webcam bận, cấu hình không hỗ trợ | PASS | 4 DOMException được tạo có kiểm soát; ứng dụng hiện lỗi. Không phải tình huống phần cứng thật |
| Q09 | MediaPipe thực với video trống | PASS | Production: 9 tiêu chí unknown, không có điểm/đạt giả; lần khởi động đo được 7,651 ms trên môi trường này, không phải SLA |
| Q10 | MediaPipe thực trên ảnh mẫu | PASS | Local: GPU, 33 landmarks + 33 worldLandmarks, canvas có pixel khung xương; không chứng minh độ chính xác trên người tập |
| Q11 | GPU không khởi tạo được → CPU | PASS có giới hạn | Route QA gây lỗi GPU, engine CPU thực trả 33 + 33 điểm; không phải thử thiết bị yếu thật |
| Q12 | Điểm/giữ 5 giây/reset | PASS | Local QA landmarks tổng hợp: 100 điểm khi đủ tiêu chí, hoàn thành 5s; sai/thiếu điểm/đổi tư thế/frame đứng đặt lại, không cộng bù |
| Q13 | Bật/tắt camera 5 lần | PASS | Production, mô hình thực, stream trống; mọi tracks ended sau dừng |
| Q14 | Track ended, hủy lúc chờ quyền, stream trả muộn | PASS | Production, sự kiện/stream có kiểm soát; video tháo stream, không giữ track đến muộn |
| Q15 | Ẩn tab/rời trang | PASS có giới hạn | Production visibilitychange/pagehide được dispatch, tracks ended; cần kiểm tra đèn camera và tab thật |
| Q16 | Điện thoại trước/sau; desktop không có nút đổi | PASS có giới hạn | Production, UA Android + stream tổng hợp; exact facingMode đúng, stream cũ ended, rear không lật. Chưa thử camera vật lý |
| Q17 | Native fullscreen + API thiếu + API từ chối | PASS có giới hạn | Production, 3 chế độ Edge; nút thoát ở trên, fallback 390×844, cuộn phục hồi, Escape hoạt động. Không phải Safari iPhone |
| Q18 | 48 MP3 tải và giải mã; không phụ thuộc giọng hệ thống | PASS kỹ thuật | Production verify-voice; Audio phát/dừng khi không có SpeechSynthesis. Phát hiện lỗi nội dung QA-01 bên dưới |
| Q19 | Audio: tắt, đổi tư thế, lỗi tải | PASS | Production: dừng phần tử audio, lỗi mạng hiện thông báo; chưa nghe đủ 48 bản thu/loa thật |
| Q20 | Lỗi tải model | PASS xử lý / UX FAIL | CPU/model-error: dừng track, hiện lỗi; nội dung lỗi chứa npm (QA-02) |
| Q21 | JavaScript và mạng trong kịch bản production | PASS có giới hạn | pageErrors=[], không quan sát request khác GET; không phải kiểm toán bảo mật đầy đủ |
| Q22 | Chạy liên tục | PASS có giới hạn | `production-soak.json`: 60,222 ms video trống + AI thực, đổi 3 tư thế, không pageerror, track kết thúc sau dừng; không thay bài 10 phút/người thật |

## Lỗi đã xác nhận

### QA-03 — Người dùng báo không bấm được nút phóng to trên iPhone

**Trạng thái: ACCEPTED / DEFERRED theo yêu cầu người dùng ngày 19/10/2026. Không tiếp tục điều tra hoặc sửa trong phạm vi hiện tại.**

- Người dùng xác nhận: “Trên Iphone không thể bấm nút phóng to màn hình vì Ip không hỗ trợ”. Đây là phản hồi sử dụng thiết bị thật do người dùng cung cấp, không phải quan sát trực tiếp của QA.
- Chưa biết mẫu iPhone, phiên bản iOS/trình duyệt, thời điểm thử hoặc trang có tải lại bản sửa mới nhất chưa. Chưa xác nhận nguyên nhân của hiện tượng hiện tại.
- Bản sửa đã có chế độ mở rộng trong trang khi Fullscreen API không hỗ trợ; kiểm thử tự động trên Edge vẫn PASS cho trường hợp thiếu/bị từ chối API. Kết quả đó không bác bỏ lỗi người dùng gặp trên iPhone và không chứng minh Safari/iPhone hoạt động.
- Người dùng yêu cầu chấp nhận giới hạn iPhone và không tiếp tục xử lý. Nếu mở lại phạm vi hỗ trợ sau này, cần ghi thiết bị/iOS/trình duyệt và tái hiện trên bản production mới nhất. Chấp nhận giới hạn không có nghĩa là đã xác minh nguyên nhân hoặc đánh dấu PASS trên iPhone.
- Không sửa mã hoặc triển khai thêm từ phản hồi này.

### QA-01 — Hai tình huống phát cùng một bản thu

**Mức độ: vừa (P2). Trạng thái: OPEN, chưa sửa.**

- Tệp: `public/audio/vi/voice-enabled.mp3` và `missing-person.mp3`.
- Cả hai tệp production trả 200, cùng **15,840 bytes**, cùng SHA-256:
  `7ee4e15bbf17e42e1261dc1c8338576289661100e551cdb01bf51bb5c710b46b`.
- Kỳ vọng: bật giọng đọc câu xác nhận; không tìm thấy người đọc hướng dẫn đưa toàn thân vào khung hình.
- Thực tế: dữ liệu MP3 giống hệt nhau, nên hai tình huống phát cùng âm thanh. Không cần suy đoán bản nào được thu đúng để kết luận hai nội dung riêng chưa được cung cấp.
- Tác động: ít nhất một tình huống có lời nhắc không phù hợp; chữ “lời nhắc gần nhất” có thể khác câu nghe được.
- Tái hiện: bật giọng để nghe câu xác nhận, sau đó bật camera không có người và chờ qua thời gian ổn định/khoảng nghỉ; so sánh âm thanh. Bằng chứng kỹ thuật: `duplicate-audio.json` (hash production và local trùng).
- Đề xuất: nghe đối chiếu hai tệp, thu lại tệp sai theo kịch bản. Sau thay thế cần kiểm tra bằng tai và hash, rồi deploy.

### QA-02 — Thông báo phục hồi lỗi AI dành cho lập trình viên

**Mức độ: nhẹ (P3). Trạng thái: OPEN, chưa sửa.**

- Tái hiện local: chặn tải `/models/pose_landmarker_lite.task` trong route QA rồi bật camera.
- Thực tế: “Không thể khởi động camera hoặc AI. Kiểm tra tài nguyên mô hình (npm run setup:assets), tải lại trang và thử lại.” Tracks vẫn được dừng đúng.
- Kỳ vọng: hướng dẫn người dùng kiểm tra mạng/tải lại/thử lại; lệnh npm chỉ nằm trong tài liệu kỹ thuật.
- Bằng chứng: `cpu-and-model-error.json`. Chưa tái hiện riêng trên production vì không gây gián đoạn dịch vụ thật; lỗi được tạo trong phiên QA local cùng source.

Cảnh báo OpenGL “error checking is disabled” xuất hiện khi khởi tạo mô hình. Inference thành công; chưa có bằng chứng đây là lỗi chức năng. Các lỗi mạng có chủ đích trong ca lỗi không được tính là sự cố production.

## Các mục chưa được xác minh

| ID | Mục cần làm trên phần cứng thật | Trạng thái |
|---|---|---|
| M01 | iQOO Z10 Turbo Pro: Chrome, cấp/từ chối quyền thật; trước/sau, xoay ngang/dọc | NOT TESTED — chưa có phiên thiết bị |
| M02 | iPhone: Safari và Chrome, mở rộng camera, tai thỏ, nút thoát, thanh trình duyệt | NOT TESTED — mô phỏng API không thay Safari |
| M03 | Người tập thật: đủ 3 tư thế và 2 bên chân | NOT TESTED |
| M04 | Ánh sáng yếu, xoay nghiêng, che từng khớp, rời/đi vào khung hình thật | NOT TESTED |
| M05 | Sai số góc so với đo độc lập/chuyên gia, độ trễ và nhấp nháy quanh ngưỡng | NOT TESTED — chưa có ngưỡng nghiệm thu được thống nhất |
| M06 | Nghe đủ 48 bản thu: đúng câu, trái/phải, nâng/hạ, phát âm và âm lượng | NOT TESTED — giải mã thành công không chứng minh nội dung đúng |
| M07 | Lời nhắc tự phát sau cú nhấn ban đầu và chạy lâu trên iOS/Android | NOT TESTED |
| M08 | Camera bận/ngắt kết nối thật; chỉ báo camera tắt khi rời tab/đóng trang | NOT TESTED |
| M09 | Chạy ít nhất 10 phút trên điện thoại: FPS, nhiệt, pin, bộ nhớ và blur | NOT TESTED — bài video trống ngắn không thay thế |
| M10 | CPU fallback trên thiết bị GPU không tương thích thật | NOT TESTED — mới kiểm tra đường dự phòng bằng lỗi QA |
| M11 | Hỗ trợ tiếp cận đầy đủ: trình đọc màn hình, tương phản trên video thật, bàn phím | NOT TESTED đầy đủ — mới kiểm tra ngữ nghĩa/chức năng liên quan |

Soak 60 giây: JS heap lấy mẫu từ 12,328,942 đến 13,090,834 bytes; mẫu cuối 12,469,307 bytes. Đây không phải toàn bộ bộ nhớ WASM/GPU và không đủ kết luận không rò rỉ bộ nhớ.

Ngày 19/10/2026 đã nhận phản hồi người dùng không bấm được nút phóng to trên iPhone (QA-03); người dùng đã chấp nhận giới hạn và hoãn xử lý. M02 vẫn chưa được QA trực tiếp tái hiện, không đánh dấu PASS. Các mục còn lại chưa có kết quả thiết bị thật. Không quy đổi các mục NOT TESTED thành PASS.

## Bằng chứng và chạy lại

Bằng chứng nằm ở `docs/qa/2026-10-18/`: JSON kết quả production, hash âm thanh, CPU/model error, soak, log unit/build/voice/camera/fullscreen/live và ảnh desktop/mobile. Ảnh production-mobile dùng viewport mobile trên Edge desktop, không phải ảnh chụp iPhone/iQOO. Ảnh tích hợp mới có điểm tổng hợp trong docs/qa/2026-10-18/local-live-*-qa.png được gắn nhãn QA; ảnh lịch sử trong docs/screenshots được giữ nguyên.

Chạy `npm test`, `npm run build`. Script browser nhận đối số thứ nhất là đường dẫn node_modules có Playwright; không thêm dependency vào ứng dụng. `verify-browser.mjs` và `verify-live.mjs` cần Vite dev vì import/intercept module source; không dùng hai script này để khẳng định đã thử bundle production. `verify-voice.mjs`, `verify-camera-switch.mjs`, `verify-fullscreen.mjs` nhận URL ở đối số thứ hai để chạy production.

Các script bổ sung: `qa-production.mjs` (HTTP/UI/lifecycle), `qa-cpu-model-error.mjs` (local CPU/fault injection), `qa-soak.mjs` (60s production video trống). Dữ liệu tổng hợp và fault injection chỉ ở script QA. Báo cáo cũ được giữ tại `docs/qa/UAT_REPORT_2026-10-13.md`.

## Đề nghị nghiệm thu

Chưa ký nghiệm thu toàn hệ thống trên người thật. Ưu tiên xử lý QA-01, sau đó chạy checklist trên iQOO; các mục iPhone được hoãn theo yêu cầu người dùng, nghe đối chiếu bản thu và thử 3 tư thế thật. QA-02 là lỗi hướng dẫn phục hồi nhẹ. Các kiểm tra kỹ thuật đã thực hiện đạt trong phạm vi nêu trên, không phải cam kết AI đánh giá chính xác hoặc an toàn tuyệt đối.
