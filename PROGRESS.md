# Tiến độ

## Đẩy GitHub
- Xác minh tài khoản GitHub Tunbayacc bằng thông tin Git đã đăng nhập; dự án chưa có remote hoặc commit.
- Đã tạo repository riêng tư https://github.com/Tunbayacc/yoga-ai, đẩy nhánh main và thiết lập origin/main.
- Xác minh SHA trên GitHub khớp commit cục bộ; mã nguồn đã được đồng bộ.
- Kiểm tra trước khi đẩy: npm test 36/36 đạt, npm run build đạt; rà soát mã không phát hiện mẫu private key/token phổ biến.
- Mã nguồn, ảnh minh họa, tài liệu và kiểm thử được đưa vào Git. node_modules, dist, .env, log, WASM và model tải về được bỏ qua bằng .gitignore.

## Đổi mục tiêu giữ thành 5 giây
- Đổi HOLD_TARGET_SECONDS từ 10 thành 5; thanh tiến trình, mốc hoàn thành và thông báo trên camera/toàn màn hình dùng chung hằng số.
- Cập nhật test giữ liên tục, QA giao diện và tài liệu cho mốc 5s.
- npm test: 36/36 đạt; npm run build đạt. Server dev tiếp tục chạy.

## Toàn màn hình khung camera
- Thêm hooks/useFullscreen.js và nút Toàn màn hình/Thoát toàn màn hình ngay trong camera-stage; dùng Fullscreen API cho khung chứa cả video, canvas và trạng thái.
- Đồng bộ fullscreenchange, hỗ trợ Esc, chặn nhấn lặp khi đang chuyển, báo lỗi khi cửa sổ chặn API hoặc trình duyệt không hỗ trợ. Có nút Tắt camera trong fullscreen.
- CSS :fullscreen giữ video/canvas object-fit contain, không cắt tư thế; nút và trạng thái nằm trong khung fullscreen.
- Build và 36/36 unit test đạt. Edge QA Fullscreen API thật đạt vào/thoát bằng nút, sự kiện thoát, lỗi bị chặn; thêm xử lý keydown Esc sau khi Escape tự nhiên không thoát trong headless và QA Esc đã đạt.
- Đã xem docs/screenshots/fullscreen.png. Server dev tiếp tục chạy; thiết bị hoặc trình duyệt nhúng có thể chặn fullscreen và sẽ được thông báo.

## Điểm số, giữ tư thế và trạng thái trực tiếp
- Thêm services/practiceTracker.js và components/LiveProgress.jsx; nối vào vòng lặp camera và App.jsx, CSS cho thanh điểm/giữ, chấm sáng, chất lượng khớp, trạng thái trên video và giảm chuyển động.
- Điểm = tỷ lệ tiêu chí đạt, không phải độ chính xác AI; dữ liệu thiếu/pending không có điểm. Bộ đếm giữ mục tiêu giao diện 10s chỉ khi toàn bộ raw + smoothed criteria đạt.
- Reset ngay khi raw fail, mất điểm/người, chuyển tab, đổi tư thế/bên chân, dừng camera hoặc ngắt frame >500ms. Watchdog >600ms xóa kết quả cũ, hiện chờ hình ảnh mới.
- Thêm 7 test PracticeTracker; npm test **36/36 đạt**, build đạt.
- Edge QA tích hợp bằng route riêng có landmarks/video tổng hợp đạt: tìm người/ẩn điểm, điểm 100 khi đủ tiêu chí, giữ đủ 10s, reset khi sai/thiếu khớp/đổi tư thế/dừng camera, viewport 390px không tràn, không pageerror.
- QA camera/MediaPipe thực vẫn đạt: video trống không kết luận sai, ảnh mẫu chính thức nhận đủ 33 điểm và vẽ bộ xương, dọn/hủy camera hoạt động.
- Ảnh chụp live-desktop-qa.png/live-mobile-qa.png được đánh dấu là QA đầu vào tổng hợp; đã xem bố cục. Không dùng ảnh QA để tuyên bố nhận diện người thật.
- Cập nhật README/checklist. Server dev tiếp tục chạy; cần kiểm tra bộ đếm và điểm với webcam/người tập thật.

## Tối ưu lời nhắc chi tiết
- Thêm services/poseCoaching.js, dùng chung hướng dẫn chữ và giọng nói, nêu bộ phận/bên cơ thể, hướng chỉnh và thao tác nhẹ nhàng.
- Evaluator thêm direction dưới/trên/trong khoảng và missingParts; phân biệt gối trước gập sâu/còn duỗi, tay cao/thấp, chân Tree nâng thấp/cao, vai cao bên nào.
- Giọng nói nêu điểm mốc thiếu hoặc góc quay chưa phù hợp; có hướng dẫn giữ tư thế/thở riêng cho Mountain, Warrior II, Tree khi đạt tham chiếu. Không suy đoán lực tì/đau hoặc tiếp xúc chân chưa được đo.
- Hook đọc hết hướng dẫn còn phù hợp khi khớp khác thay đổi, hủy khi lỗi đang nhắc đã hết/đổi hướng hoặc mất dữ liệu; giữ debounce/cooldown và luân phiên lỗi.
- Thêm tests/poseCoaching.test.js: 7 test hướng chỉnh, đúng bên cơ thể, mất điểm, giữ tư thế và không ngắt câu vì lỗi khác.
- npm test: **29/29 đạt**. Edge QA Speech API giả lập đạt. Build bản cuối đạt. Chưa nghe thử loa hoặc kiểm tra người tập thật.
- Cập nhật README và checklist; server localhost tiếp tục chạy.

## Cập nhật nhắc bằng giọng nói
- Thêm services/voiceFeedback.js, hooks/useVoiceFeedback.js và nút Bật/Tắt giọng nói trong App.jsx; thêm CSS tương ứng.
- Đọc tên khớp và hướng dẫn điều chỉnh; xác nhận đạt tham chiếu chỉ khi tất cả tiêu chí đạt; thiếu dữ liệu nhắc chỉnh camera, không kết luận sai.
- Debounce 1.5 giây, cooldown 8 giây, lặp cùng nhóm sau 20 giây và luân phiên các tiêu chí lỗi. Hủy lời nhắc cũ khi kết quả đổi, dừng camera, đổi tư thế/bên chân, chuyển tab hoặc rời trang.
- Ưu tiên giọng tiếng Việt local; thông báo thiếu giọng/API/lỗi phát âm thanh. Giọng trực tuyến có chú thích cần mạng. Không thêm dependency, backend hoặc quyền microphone.
- npm test: 22/22 đạt (6 test giọng nói mới); build đạt.
- scripts/verify-voice.mjs: QA Edge với Speech API giả lập đạt bật/tắt vi-VN, lời nhắc khớp, hủy khi mất dữ liệu, không ngắt lời nhắc thiếu dữ liệu ở mỗi frame, dừng camera/đổi tư thế, viewport mobile.
- Các lỗi trong lượt QA đầu do mock utterance, export default React và đồng hồ/frame của harness đã sửa; không nới điều kiện kiểm tra ứng dụng.
- Đã cập nhật README và checklist nghe thử. Chưa xác minh âm thanh loa hoặc giọng tiếng Việt trên thiết bị người dùng; webcam thật vẫn cần kiểm tra theo checklist.

## Cập nhật ảnh minh họa tư thế
- Thay SVG trong components/PoseIllustration.jsx bằng ba ảnh người dùng gửi, lưu tại public/images/poses: mountain.png, warrior.png, tree.png.
- Điều chỉnh styles/app.css: ảnh lớn hơn, object-fit contain để giữ toàn bộ tư thế; bố cục responsive.
- Build đạt; Edge tải đủ 3 ảnh, viewport 390px không tràn ngang. Đã xem ảnh chụp desktop/mobile mới trong docs/screenshots.
- Server dev tiếp tục chạy trên http://127.0.0.1:5173/ để người dùng xem thay đổi.

## Giai đoạn 1 — Môi trường
- Thư mục ban đầu trống. Node 24.18.1, npm 11.16.0, Git 2.55.0.
- Đã tạo PLAN.md và PROGRESS.md.
- Đã đọc tài liệu MediaPipe Web chính thức và kiểm tra API trong vision.d.ts của gói đã cài.
- Đã khóa React/React DOM 19.2.0, Vite 7.2.2, plugin-react 5.1.0, MediaPipe 0.10.32; có package-lock.json.
- Tạo package.json, index.html, vite.config.js, src/main.jsx, .gitignore, AGENTS.md. Git init đã hoàn thành, chưa commit/push.
- npm install thành công sau cấp quyền mạng. Sandbox ban đầu bị ENOTFOUND.
- Build Vite thành công sau cấp quyền vì sandbox Windows bị EPERM khi realpath. Không sửa quyền hệ thống hoặc tắt sandbox.

## Giai đoạn 2 — Camera
- Tạo src/hooks/usePoseCamera.js, src/App.jsx, components/PoseIllustration.jsx và styles/app.css.
- Bật/tắt camera, video như gương, trạng thái, lỗi quyền/thiết bị/bận, dọn tracks khi dừng/unmount/pagehide, xử lý ngắt camera.
- Edge QA: lỗi NotAllowedError giả lập hiển thị tiếng Việt; stream tổng hợp được stop và srcObject=null khi tắt.
- Edge QA: hủy lúc đang chờ getUserMedia; stream trả về muộn được đóng ngay.
- Chưa thử webcam phần cứng hoặc thao tác cấp quyền thật.

## Giai đoạn 3 — MediaPipe
- Tạo services/poseDetector.js và scripts/setup-assets.mjs.
- Tải mô hình Lite chính thức 5,777,746 bytes; sao chép WASM từ gói npm đúng phiên bản, phục vụ cục bộ.
- VIDEO, một người, GPU fallback CPU khi khởi tạo GPU thất bại; requestAnimationFrame tối đa ~12.5 inference/giây, state tối đa 5 lần/giây.
- Vẽ kết nối PoseLandmarker.POSE_CONNECTIONS và điểm đáng tin cậy; đánh dấu cam các khớp liên quan tiêu chí chưa đạt.
- Edge headless: mô hình/WASM khởi tạo thực và chạy detectForVideo trên video trống tổng hợp; không có người => Không đủ dữ liệu, không kết quả giả.
- Chưa xác minh bộ xương trên người thật hoặc CPU fallback trên phần cứng GPU không tương thích.

## Giai đoạn 4 — Góc
- Tạo services/angleCalculator.js và tests/angleCalculator.test.js.
- Góc 2D/3D, độ nghiêng, null khi tọa độ lỗi hoặc vector bằng 0. Đánh giá góc 2D với tỷ lệ pixel của video.
- 4 test toán học đạt: góc 0/90/180, góc 3D, dữ liệu lỗi/degenerate, độ nghiêng.

## Giai đoạn 5 — Đánh giá
- Tạo data/yogaPoses.js, services/poseEvaluator.js, services/feedbackEngine.js và tests/poseEvaluator.test.js.
- Mountain: gối/hông/trục chân/vai/hông/thân. Warrior II: chân trước/sau/khuỷu/tay ngang/hướng tay/thân. Tree: chân trụ/gập/vị trí chân/nâng chân/mở gối/hông/thân.
- Ngưỡng riêng có thể sửa trong data; nhận overrides. Kiểm tra visibility/presence, khớp ngoài ảnh, heuristic góc quay.
- Làm mượt 4 frame; dữ liệu thiếu xóa phản hồi đạt cũ ngay. Chọn bên trái/phải theo cơ thể.
- 12 test đánh giá/feedback đạt, gồm hai bên Warrior/Tree, trường hợp sai và thiếu dữ liệu, mất một vai, tỷ lệ ảnh, ngưỡng cấu hình, góc quay và nhiễu.
- Một assertion ban đầu dùng fixture có khuỷu trùng nhau dẫn tới unknown; sửa test để kiểm tra riêng tiêu chí gối trước bị fail, không nới kiểm tra dữ liệu.

## Giai đoạn 6 — Tích hợp và tài liệu
- npm test: **16/16 đạt**. npm run build: **đạt**, không cảnh báo CSS sau sửa import trống.
- scripts/verify-browser.mjs sử dụng Playwright có sẵn trong runtime, không thêm thư viện vào ứng dụng.
- Edge QA đạt: chọn tư thế/bên chân, lỗi quyền, MediaPipe trên video trống, dọn stream, hủy khởi động, viewport 390px không tràn ngang, không pageerror.
- Edge QA trên ảnh mẫu công khai chính thức của MediaPipe: **33 landmarks và 33 worldLandmarks**, suy luận bằng GPU; canvas thực có nét vẽ bộ xương. Đây là ảnh mẫu, không phải kiểm thử webcam thật.
- Kiểm tra bổ sung phát hiện phép đo hướng cánh tay cần cả hai vai; đã bổ sung danh sách điểm bắt buộc và test mất một vai để tránh lỗi truy cập điểm thiếu.
- Server localhost HTTP 200; giao diện đã mở trong panel Codex. Ảnh desktop/mobile nằm trong docs/screenshots, đã xem để kiểm tra bố cục.
- Tạo README.md và docs/MANUAL_TESTS.md với cài đặt, ngưỡng, giới hạn và checklist kiểm thử phần cứng.
- Giữ cấu trúc ngay ở thư mục dự án, không thêm yoga-ai lồng bên trong; không cần pages cho ứng dụng một trang.

## Giới hạn và bước tiếp theo
- Cần người dùng kiểm tra webcam và ba tư thế thật theo docs/MANUAL_TESTS.md; chưa xác nhận độ chính xác thực tế, khả năng chịu tải dài hoặc CPU fallback trên thiết bị thật.
- Tư thế được người dùng chọn, không có phân loại tự động. Ngưỡng và heuristic góc quay là tham chiếu ban đầu, chưa hiệu chuẩn chuyên môn.
- detectForVideo đồng bộ trên main thread; máy yếu có thể chậm. Chỉ cân nhắc worker nếu đo thực tế cần thiết.
- Không có lỗi tự động còn tồn tại tại lần kiểm tra này. Không backend/database/tài khoản/chức năng ngoài phạm vi.

# Tiến độ UAT — Yoga AI

## Dọn và đồng bộ kết quả QA — 19/10/2026
- Người dùng chấp nhận giới hạn iPhone, yêu cầu hoãn xử lý QA-03; cập nhật ACCEPTED/DEFERRED trong báo cáo, không coi iPhone đã PASS hay nguyên nhân đã được QA xác minh.
- Gom ảnh và log kiểm thử vào docs/qa/2026-10-18, giữ ảnh lịch sử docs/screenshots; bỏ dòng .vercel trùng trong gitignore. Giữ báo cáo cũ, script tái chạy và bằng chứng hai lỗi âm thanh/thông báo đang mở.
- Không thay đổi mã ứng dụng hoặc deploy; kiểm thử gần nhất 41/41 và build đạt, diff --check được kiểm tra trước commit.

## Phản hồi thiết bị thật — 19/10/2026
- Người dùng báo iPhone không bấm được nút phóng to; thêm QA-03 (P2, REPORTED) vào UAT_REPORT.md. Chưa biết thiết bị/iOS/browser hoặc thời điểm/bản website được thử, chưa kết luận nguyên nhân và chưa tái hiện trực tiếp.
- Phân biệt với kiểm thử Edge mô phỏng API thiếu/bị chặn đã PASS; chưa coi iPhone đã được sửa thành công. Không đổi mã ứng dụng hoặc deploy.

## QA toàn hệ thống — 18/10/2026 (Samsung Innovation Campus)
- Kiểm tra source main 334fa4c và production https://yoga-ai-six.vercel.app; cập nhật UAT_REPORT.md, checklist thủ công và bằng chứng trong docs/qa/2026-10-18. Lưu báo cáo cũ tại docs/qa/UAT_REPORT_2026-10-13.md.
- npm test 41/41, build 47 modules; production 17/17 nhóm HTTP/UI/lifecycle đạt. Responsive 320–1440px không tràn; model + 4 JS/WASM đều 200. Không pageerror trong kịch bản production và không quan sát upload khác GET.
- GPU thực trên ảnh mẫu trả 33+33 điểm/vẽ skeleton; CPU thực sau lỗi GPU có kiểm soát cũng trả 33+33. Các bộ live/voice/camera switch/fullscreen đạt trong phạm vi QA; 48 MP3 giải mã được.
- Soak production 60,222ms, video trống + AI thực, đổi 3 tư thế: đạt, không pageerror, không điểm đạt giả, tracks ended sau dừng; không thay thế 10 phút trên người/điện thoại thật.
- Phát hiện QA-01 (P2): voice-enabled.mp3 và missing-person.mp3 trùng SHA-256, cùng 15,840 bytes trên local và production; ít nhất một lời nhắc sai nội dung. QA-02 (P3): lỗi tải model hiện lệnh npm cho người dùng cuối, đã tái hiện local bằng chặn model. Chưa sửa hai lỗi trong lượt kiểm thử.
- Chưa nghiệm thu toàn hệ thống: iQOO/iPhone, camera/người tập thật, nghe đối chiếu 48 bản thu, sai số góc, nhiệt/pin/FPS và tải dài vẫn NOT TESTED. Không sửa/deploy mã ứng dụng hoặc push GitHub trong lượt QA.

## Thoát toàn màn hình và iPhone — 18/10/2026
- Đã triển khai READY dpl_6uihW59qCkHj2G4B4MQuCkSqpEsB tại https://yoga-ai-six.vercel.app.
- Thay nhãn Esc bằng nút Thoát toàn màn hình góc trên bên phải, có safe-area; bỏ nút thoát trùng ở dưới.
- Không khóa nút khi Fullscreen API thiếu/bị chặn: dùng mở rộng camera fixed trong trang, giữ video/canvas/điều khiển, khóa cuộn và khôi phục khi thoát. Thanh trình duyệt có thể vẫn hiện trên iPhone. Esc vẫn hoạt động.
- npm test 41/41 đạt, build đạt. verify-fullscreen.mjs: native/thiếu API/reject API đều đạt, nút thoát ở trên, kích thước mobile, toggle khung xương, khôi phục cuộn và Escape.
- Chưa kiểm tra iPhone thật, camera thật và xoay thiết bị; cần xác minh thủ công.

## Đồng bộ GitHub — 18/10/2026
- Gom các thay đổi đã triển khai: cấu hình Vercel, 48 MP3 và chọn bản thu, đổi camera mobile, bật/tắt khung xương, giao diện Liquid Glass đã duyệt, tài liệu và QA.
- Bao gồm mã/ảnh bản xem thử để lưu lịch sử thiết kế; .vercel, node_modules, dist, model/WASM và môi trường riêng vẫn được bỏ qua theo .gitignore.
- Kiểm tra git diff --check đạt; kiểm thử gần nhất 41/41 và build production đạt, không thay logic sau lần kiểm tra đó.

## Áp dụng Liquid Glass đã duyệt — 18/10/2026
- Production READY: dpl_KnaCJyvdPj6P48HBwkEKpkxubX2z, https://yoga-ai-six.vercel.app.
- Người dùng đã đồng ý áp dụng bản xem thử. Sao chép theme sang src/styles/liquidglass.css và import sau app.css trong main.jsx; trang chính không có nhãn bản thử.
- npm test 41/41 đạt; npm run build đạt (47 modules). Edge desktop 1440px/mobile 390px: theme tải đúng, không tràn ngang, nút camera nằm trong khung, đổi tư thế và bật/tắt khung xương hoạt động, không pageerror.
- Không thay đổi logic MediaPipe/quy tắc tư thế. Hiệu năng kính mờ và webcam trên điện thoại thật cần kiểm tra thủ công.

## Xem thử Liquid Glass — 18/10/2026
- Tạo previews/liquidglass/index.html, preview.js và theme.css riêng; chỉ trang xem thử import lớp giao diện mới, không sửa giao diện chính, không deploy Vercel khi chưa có người dùng chấp thuận.
- Nền ngọc/lam, thanh điều hướng kính mờ, nút capsule viền sáng, nội dung nền ít trong suốt để dễ đọc; có fallback và giảm chuyển động/độ trong suốt.
- Đã xem ảnh desktop 1440px và mobile 390px; mobile không tràn ngang, bật/tắt khung xương hoạt động. Chưa đo hiệu năng blur trên điện thoại thật.

## Bật/tắt khung xương — 18/10/2026
- Thêm nút Tắt/Bật khung xương trong khung camera và toàn màn hình trên mọi thiết bị; mặc định bật, giữ lựa chọn khi đổi tư thế/camera trong phiên trang.
- Chỉ ẩn/hiện canvas, không thay đổi nhận diện, chấm điểm hoặc giọng nói.
- npm test 41/41 đạt, npm run build đạt. Edge viewport 390px kiểm tra ẩn/hiện canvas, aria-pressed và giữ lựa chọn khi đổi tư thế: đạt. Webcam thật vẫn cần kiểm tra thủ công.

## Đổi camera điện thoại — 18/10/2026
- Đã triển khai production READY: dpl_Bh4X2oXoGwAfQevac1q4W5TJ128T, https://yoga-ai-six.vercel.app.
- Điện thoại có nút Camera sau/Camera trước trong khung camera và toàn màn hình; chọn khi tắt hoặc chuyển trực tiếp khi đang chạy. Máy tính không có nút đổi, tiếp tục yêu cầu camera trước.
- Đóng stream/model cũ trước khi mở camera mới, reset feedback/thời gian giữ và lời nhắc; khóa đổi khi đang tải. Yêu cầu đúng facingMode trên mobile, báo lỗi nếu camera không có thay vì âm thầm dùng camera khác.
- Camera trước lật gương, camera sau không lật; video và canvas dùng cùng phép biến đổi. Không sửa quy tắc đánh giá tư thế.
- npm test: 41/41 đạt; npm run build đạt (46 modules). scripts/verify-camera-switch.mjs đạt trên Edge với UA Android và stream tổng hợp: chọn sau/trước, kết thúc track cũ, dừng camera, rear không lật, desktop 390px không hiện nút, không pageerror.
- Camera vật lý trước/sau trên iQOO và hiệu năng khi chuyển cần người dùng thử thủ công; QA tổng hợp không xác minh phần cứng thật.

## Tích hợp MP3 tiếng Việt — 15/10/2026
- Đã triển khai production dpl_EbmaaXBXrhrhLjGqDeCDAVnNDp3G tại https://yoga-ai-six.vercel.app. Chạy lại QA âm thanh trên URL production: đạt đủ 48 tệp, phát/dừng, đổi tư thế và lỗi mạng.
- Đã nhận đủ 48 MP3 trong public/audio/vi, thêm bảng nội dung ngắn và ánh xạ từ tiêu chí sang đúng tệp theo bên, vai cao và hướng gập/duỗi/nâng/hạ.
- Hook chuyển từ SpeechSynthesis sang Audio tái sử dụng sau cú nhấn; không yêu cầu giọng tiếng Việt hệ thống. Hiển thị nội dung đúng bản thu, xử lý lỗi tải/phát và dọn audio khi tắt, đổi tư thế, đổi phiên camera, ẩn trang hoặc unmount.
- npm test: 39/39 đạt; npm run build đạt (45 modules). Edge QA viewport 390px: giải mã đủ 48 MP3, phát khi không có SpeechSynthesis, tắt/đổi tư thế dừng audio, lỗi mạng hiện thông báo; không pageerror.
- Chưa nghe xác minh nội dung từng bản thu; chưa kiểm chứng loa, quyền phát dài hạn và webcam thật trên iQOO/Android. Cần thử thủ công.

## Kịch bản ghi âm — 15/10/2026
- Rút gọn 48 lời nhắc trong docs/VOICE_RECORDING_SCRIPT.md; giữ nguyên tên tệp, thứ tự, bên cơ thể và hướng điều chỉnh.
- Giữ các lưu ý về không khóa khớp, tránh tì bàn chân lên gối và hạ chân khi mất thăng bằng trong các câu liên quan.
- Chỉ sửa tài liệu thu âm, chưa đổi logic hoặc triển khai âm thanh lên website. Kiểm tra đủ 48 mục và 48 câu.

## Chuẩn bị triển khai Vercel — 15/10/2026
- Thêm vercel.json: Vite, build chạy setup:assets trước npm run build, xuất dist; bỏ qua .vercel trong Git.
- npm test: 36/36 đạt. setup:assets thành công; dist chứa mô hình 5,777,746 bytes và cả hai bộ WASM.
- npm run build đạt (43 modules) khi chạy ngoài sandbox; lần chạy trong sandbox bị EPERM realpath.
- Đã đăng nhập và triển khai production vào tunbayacc/yoga-ai: https://yoga-ai-six.vercel.app (deployment dpl_4TgdhLeG1Jg9pWY4cV1nuxnRjdJE, READY).
- Kiểm tra HTTP không xác thực: trang chủ, model và vision_wasm_internal.wasm đều 200. Build trên Vercel thành công.
- Tự động kết nối GitHub riêng tư thất bại do quyền truy cập; bản hiện tại triển khai trực tiếp qua CLI, chưa tự deploy khi push.
- Camera thật và hiệu năng trên Android/iPhone vẫn cần kiểm tra thủ công.

13/10/2026 (Asia/Saigon)
- Xác minh D:\Yoga-AI-Codex, Vite PID 8508, localhost 127.0.0.1:5173, HTTP 200.
- Đã đọc AGENTS.md; không thêm chức năng hoặc dependency, không dùng camera thật hay vượt chặn Computer Use.
- npm test: 36/36 đạt trước và sau sửa. npm run build: đạt trước và sau sửa (43 modules, build cuối 858ms).
- verify-browser.mjs đạt: chọn tư thế/bên chân, lỗi quyền mô phỏng, MediaPipe thực trên video trống và ảnh mẫu (33 + 33 landmarks, skeleton GPU), dọn stream/hủy khởi động, mobile, không pageerror.
- verify-live.mjs đạt với landmarks tổng hợp: giữ 5s, reset khi sai/mất dữ liệu/đổi tư thế/đứng frame, dừng camera, mobile, không pageerror.
- WASM/JS/model đều HTTP 200; model 5,777,746 bytes. MediaPipe GPU chạy được; cảnh báo OpenGL không ngăn inference. CPU fallback chưa xác minh.
- Xác nhận và sửa favicon 404 bằng favicon SVG inline.
- Xác nhận và sửa webcam không đóng khi tab bị ẩn: dispose/reset khi document.hidden. Stream tổng hợp kết thúc trên visibilitychange mô phỏng và pagehide dispatch; console sau sửa không lỗi.
- Harness lifecycle đầu chưa phát frame; dừng và sửa harness, chạy lại đạt; không tính lần đầu là Pass.
- Lưu UAT_REPORT.md với ma trận bằng chứng và checklist Chrome/Edge. Webcam thật, prompt quyền thật, độ mượt, góc thật, flickering, che/xoay/xa, đèn webcam và tải dài vẫn Pending.
- Phạm vi sửa mã: index.html, src/hooks/usePoseCamera.js. Cần người dùng hoàn tất kiểm tra thủ công trước nghiệm thu chính thức.
