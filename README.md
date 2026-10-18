# Yoga AI

Repository: [Tunbayacc/yoga-ai](https://github.com/Tunbayacc/yoga-ai) (riêng tư), nhánh `main`.

Website luyện tập Yoga bằng React + Vite + JavaScript. MediaPipe Pose Landmarker xử lý webcam ngay trong trình duyệt, vẽ 33 điểm mốc và bộ xương, tính góc và đánh giá tư thế đã chọn: Mountain, Warrior II, Tree. Không backend, database, tài khoản, ghi hình hoặc gửi ảnh đến máy chủ.

## Cài đặt và chạy

Yêu cầu Node.js >= 22.12 và npm; Chrome/Edge có webcam. Dự án đã được kiểm tra với Node 24.18.1.

```sh
npm ci
npm run setup:assets
npm run dev
```

Mở địa chỉ localhost được Vite in ra (mặc định http://127.0.0.1:5173). Nhấn **Bật camera** và tự cấp quyền camera trong trình duyệt. Chọn tư thế; với Warrior II chọn chân trước, với Tree chọn chân trụ. Trái/phải theo cơ thể thật, dù hình hiển thị như gương. Nhấn **Tắt camera** để dừng cả webcam và bộ nhận diện.

`setup:assets` sao chép WASM đúng phiên bản npm và tải mô hình Lite float16 phiên bản 1 từ Google (~5.8 MB). Cần mạng khi cài đặt/tải mô hình; lúc luyện tập không tải ảnh lên dịch vụ bên ngoài. Tài nguyên nằm trong `public/wasm` và `public/models`, được bỏ qua trong Git; chạy lại setup khi cài mới hoặc thay phiên bản MediaPipe. Không mở index.html trực tiếp bằng file://. Thiết bị khác truy cập cần HTTPS; localhost chỉ áp dụng trên chính thiết bị đó.

```sh
npm test
npm run build
npm run preview
```

## Cách đánh giá

Nhấn **Tắt khung xương / Bật khung xương** trong camera để ẩn hoặc hiện các điểm khớp và đường nối. Nút cũng có trong toàn màn hình. AI vẫn nhận diện, chấm điểm và nhắc bằng giọng nói khi khung xương bị ẩn.

### Camera trên điện thoại

Trong khung camera có nút **Camera sau / Camera trước** trên thiết bị di động. Có thể chọn trước khi bật hoặc đổi khi đang luyện tập; nút tạm khóa khi khởi động. Đổi camera sẽ dừng camera cũ và bắt đầu lại tiến trình giữ tư thế. Camera trước hiển thị như gương, camera sau không lật hình. Máy tính chỉ dùng camera trước, không hiển thị nút đổi. Thiết bị không có camera đã chọn sẽ hiển thị lỗi để đổi lại. Cần kiểm tra hai camera thật trên điện thoại; scripts/verify-camera-switch.mjs chỉ dùng stream tổng hợp trong QA.

### Toàn màn hình camera

Nhấn **Toàn màn hình** ở góc dưới bên phải khung camera. Video, bộ xương và trạng thái nhận diện phóng ra toàn màn hình với tỷ lệ hình ảnh giữ nguyên. Thoát bằng **Thoát toàn màn hình** hoặc **Esc**; vẫn có nút **Tắt camera** trong khung. Có thể vào toàn màn hình trước khi bật camera. Nếu trình duyệt nhúng không cho phép Fullscreen API, mở địa chỉ localhost trong Chrome hoặc Edge.

### Điểm số và tiến trình trực tiếp

Khi bật camera, khung bên dưới video hiển thị điểm 0–100 theo **số tiêu chí đạt / tổng tiêu chí** và thanh giữ liên tục đến mốc 5 giây. Chỉ chấm điểm khi các tiêu chí đủ dữ liệu và đã qua xác nhận; trường hợp thiếu điểm/góc quay xấu/đang xác nhận hiển thị dấu gạch, không giả lập điểm.

Bộ đếm chỉ tích lũy thời gian giữa các frame nhận diện thật khi toàn bộ tiêu chí thô và tiêu chí đã làm mượt đều đạt. Cần chỉnh, mất dữ liệu, ngắt frame trên 500ms, đổi tư thế/bên chân, chuyển tab hoặc dừng camera sẽ bắt đầu lại từ 0. Đủ 5 giây hiện dấu hoàn thành, giữ mức 100% cho đến khi điều kiện thay đổi. Đây là mục tiêu giao diện, không phải thời lượng luyện tập bắt buộc.

Trạng thái trên video và chấm sáng đổi màu: đang tìm cơ thể, đang xác nhận, thiếu dữ liệu, cần chỉnh, đang giữ, hoàn thành. Các vạch chất lượng đếm điểm mốc đủ tin cậy trong nhóm khớp mà tư thế cần kiểm tra, không phải xác suất AI chính xác. Video không cập nhật quá 600ms sẽ xóa kết quả cũ và hiện chờ hình ảnh mới. Hiệu ứng nhẹ hỗ trợ `prefers-reduced-motion`.

Logic nằm trong `src/services/practiceTracker.js`; UI trong `src/components/LiveProgress.jsx`. `scripts/verify-live.mjs` dùng landmarks/video tổng hợp chỉ trong route QA, có nhãn trên ảnh chụp; mã ứng dụng không chứa dữ liệu nhận diện giả.

### Nhắc bằng giọng nói

Nhấn **Bật giọng nói** để nghe bộ 48 bản thu tiếng Việt trong public/audio/vi. Không cần cài giọng tiếng Việt trên điện thoại; không dùng SpeechSynthesis hoặc dịch vụ tạo giọng trực tuyến. Các tệp được tải từ website khi cần phát, nên cần kết nối mạng. Nội dung bản thu và tên tệp nằm trong docs/VOICE_RECORDING_SCRIPT.md; bảng nội dung trong src/data/voiceClips.js. Lời nhắc gần nhất hiển thị đúng nội dung bản thu.

Chờ kết quả ổn định 1.5 giây; cách nhau ít nhất 8 giây, cùng nhóm kết quả nhắc lại sau 20 giây và luân phiên bộ phận. Giữ bản thu đang phát nếu hướng dẫn còn phù hợp; dừng khi lỗi hết, dữ liệu thiếu, đổi tư thế/bên chân, dừng camera, chuyển tab hoặc rời trang. Thiếu điểm dùng bản thu chung, không xác nhận đạt. Không xin quyền microphone.

Logic chọn bản thu: src/services/recordedVoice.js. Hook dùng cùng một phần tử Audio sau cú nhấn để hỗ trợ trình duyệt điện thoại. Lỗi phát/tải âm thanh sẽ tắt giọng và cho phép bật lại. scripts/verify-voice.mjs kiểm tra giải mã 48 tệp, phát/dừng khi không có SpeechSynthesis, đổi tư thế và lỗi tải ở viewport 390px; không chứng minh loa và chính sách phát trên điện thoại thật.

Nội dung chi tiết nằm trong `src/services/poseCoaching.js`, dùng chung cho giọng nói và hướng dẫn chữ. Lời nhắc gồm bộ phận/bên cơ thể, dấu hiệu đo được trong hình, hướng điều chỉnh và cách giữ thoải mái. Gối trước Warrior II có hướng dẫn khác nhau khi gập quá sâu hoặc còn duỗi; tay cao/thấp nhận hướng hạ/nâng tương ứng; Tree có hướng dẫn riêng cho chân trụ, chân gập, độ nâng và vị trí bàn chân. Khi thiếu điểm mốc, lời nhắc nêu vùng chưa được quan sát thay vì chẩn đoán lỗi tư thế.

Lời nhắc dài được đọc hết nếu lỗi đang hướng dẫn vẫn còn phù hợp, dù khớp khác thay đổi. Nếu lỗi đó đã hết, hướng điều chỉnh thay đổi hoặc dữ liệu không đủ, hệ thống hủy lời nhắc cũ. Không đọc số đo thay đổi liên tục và không khẳng định camera biết lực tì, tiếp xúc bàn chân hoặc mức đau. Các câu yêu cầu tự kiểm tra vị trí chân là hướng dẫn thực hành, không phải kết luận đã nhận diện các chi tiết này.

Tham khảo cách căn chỉnh cơ bản: [Warrior II — The Yoga Collective](https://www.theyogacollective.com/poses/warrior-2-virabhadrasana-2/) và [Tree Pose — Yoga Journal](https://www.yogajournal.com/poses/tree-pose-2/?scope=anon). Nội dung nhắc và ngưỡng kỹ thuật chưa được hiệu chuẩn với chuyên gia trên từng người tập.

- `src/services/poseDetector.js`: khởi tạo một Pose Landmarker cho mỗi phiên camera, VIDEO, một người; thử GPU rồi CPU nếu GPU không khởi tạo được.
- `src/hooks/usePoseCamera.js`: requestAnimationFrame, suy luận tối đa khoảng 12.5 lần/giây, React state tối đa 5 lần/giây, dọn stream/model khi dừng hoặc pagehide/unmount. Không khởi tạo model mỗi frame.
- `src/services/angleCalculator.js`: góc 2D/3D, kiểm tra tọa độ, tránh chia 0. Đánh giá hiện dùng góc chiếu 2D đã nhân kích thước ảnh để tránh sai lệch tỷ lệ khung hình; không dùng z chuẩn hóa như tọa độ 3D trong mét.
- `src/services/poseEvaluator.js`: đánh giá mỗi tiêu chí; thiếu điểm, visibility/presence thấp, điểm ngoài ảnh hoặc góc quay xấu thì không kết luận đạt. Màu cam trên bộ xương đánh dấu các khớp liên quan tiêu chí chưa đạt.
- `src/services/feedbackEngine.js`: cần 4 frame liên tiếp để xác nhận thay đổi; thiếu dữ liệu hủy kết quả cũ ngay lập tức.
- `src/data/yogaPoses.js`: ngưỡng riêng cho từng tư thế và độ tin cậy có thể điều chỉnh. Evaluator cũng hỗ trợ `options.thresholds` và `options.quality` khi tích hợp.

Mountain kiểm tra gối, hông, trục hông-cổ chân, vai, hông và thân. Warrior II kiểm tra gối trước/sau, khuỷu tay, tay ngang và mở ra hai phía, thân. Tree kiểm tra chân trụ, chân gập, gối mở, chân được nâng và gần chân trụ, hông và thân.

Đây là hệ thống quy tắc cho **tư thế được chọn**, chưa có mô hình phân loại tự động ba tư thế. Ngưỡng là tham chiếu kỹ thuật ban đầu, chưa hiệu chuẩn với tập dữ liệu người tập hoặc chuyên gia Yoga. Điểm 3D từ mô hình, góc quay và che khuất đều có sai số; heuristic góc quay không phát hiện được mọi trường hợp. Kết quả không xác nhận độ an toàn hoặc tư thế chính xác tuyệt đối. Không cố đạt số đo nếu thấy đau.

## Xử lý lỗi

- Từ chối quyền: cấp lại quyền camera cho localhost trong trình duyệt rồi nhấn Bật camera.
- Không tìm thấy camera: kết nối webcam; camera bận: đóng ứng dụng đang dùng camera.
- Không tải được AI: chạy `npm run setup:assets`, kiểm tra đường dẫn mô hình và WASM rồi thử lại.
- Không đủ dữ liệu: hướng ngực về camera, giữ toàn thân và tay trong khung hình, tăng ánh sáng, tránh quần áo/nền khó phân biệt.
- Máy yếu: giảm tần suất suy luận trong hook; API suy luận hiện đồng bộ trên main thread, có thể gây giật ở máy yếu. Worker là hướng tối ưu sau nếu đo thực tế cho thấy cần thiết.

## Kiểm thử

`npm test` dùng Node test runner, không thêm thư viện unit test. Fixture nhân tạo chỉ tồn tại trong tests. Checklist thiết bị thật: `docs/MANUAL_TESTS.md`. Kết quả tự động và giới hạn kiểm chứng: `PROGRESS.md`.

`scripts/verify-browser.mjs` là QA tùy chọn, dùng Playwright có sẵn ở môi trường phát triển (không phải phụ thuộc của ứng dụng). Nhận đường dẫn node_modules chứa Playwright làm tham số và cần Edge cài sẵn, server dev trên cổng 5173. Kiểm tra UI, camera trống tổng hợp, lỗi quyền, dọn stream, hủy khởi động và suy luận/vẽ 33 điểm trên ảnh mẫu công khai chính thức của MediaPipe (cần mạng để tải ảnh mẫu); không chứng minh webcam người tập thật hoạt động chính xác.

Thư mục dự án đặt trực tiếp ở thư mục hiện tại theo yêu cầu. Không có thư mục pages vì chỉ một trang luyện tập.

## Tài liệu API đã kiểm tra

- [MediaPipe Pose Landmarker Web](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker/web_js)
- [MediaPipe Pose Landmarker overview và mô hình](https://ai.google.dev/edge/mediapipe/solutions/vision/pose_landmarker)

Phiên bản được khóa trong package.json/package-lock.json; tài nguyên mô hình đến từ Google, WASM từ gói npm tương ứng. Mã nguồn được quản lý bằng Git; sau khi clone cần chạy các lệnh cài đặt và setup tài nguyên ở trên.
