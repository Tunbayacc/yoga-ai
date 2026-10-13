export const LANDMARKS = {
  leftShoulder: 11, rightShoulder: 12, leftElbow: 13, rightElbow: 14,
  leftWrist: 15, rightWrist: 16, leftHip: 23, rightHip: 24,
  leftKnee: 25, rightKnee: 26, leftAnkle: 27, rightAnkle: 28,
};
export const LANDMARK_LABELS = {
  11: 'vai trái', 12: 'vai phải', 13: 'khuỷu tay trái', 14: 'khuỷu tay phải',
  15: 'cổ tay trái', 16: 'cổ tay phải', 23: 'hông trái', 24: 'hông phải',
  25: 'gối trái', 26: 'gối phải', 27: 'cổ chân trái', 28: 'cổ chân phải',
};

// Giá trị tham chiếu ban đầu; thay đổi tại đây, không phải chuẩn lâm sàng.
export const QUALITY = { visibility: 0.65, presence: 0.65, frontalRatio: 0.35, shoulderDepthRatio: 0.7 };
export const yogaPoses = [
  { id: 'mountain', name: 'Mountain Pose', vietnamese: 'Tư thế ngọn núi', sanskrit: 'Tadasana', number: '01',
    description: 'Đứng vững, hai chân thẳng, vai và hông cân bằng.',
    guide: 'Đứng đối diện camera, tay thả tự nhiên. Giữ toàn bộ cơ thể trong khung hình.',
    thresholds: { knee: [165, 180], hip: [165, 180], torso: [0, 10], shoulderLevel: [0, 8], hipLevel: [0, 8], legTilt: [0, 12] } },
  { id: 'warrior', name: 'Warrior II', vietnamese: 'Tư thế chiến binh II', sanskrit: 'Virabhadrasana II', number: '02',
    description: 'Chân trước gập, chân sau duỗi, hai tay mở ngang.',
    guide: 'Hướng ngực về camera, mở chân và tay sang hai bên. Chọn chân trước theo bên cơ thể.',
    thresholds: { frontKnee: [80, 110], backKnee: [160, 180], elbow: [160, 180], armLevel: [0, 15], torso: [0, 12] } },
  { id: 'tree', name: 'Tree Pose', vietnamese: 'Tư thế cái cây', sanskrit: 'Vrksasana', number: '03',
    description: 'Giữ chân trụ thẳng, chân còn lại gập mở sang bên.',
    guide: 'Đứng đối diện camera. Đặt bàn chân vào mặt trong bắp chân hoặc đùi, tránh tì lên đầu gối.',
    thresholds: { standingKnee: [165, 180], bentKnee: [35, 110], torso: [0, 10], hipLevel: [0, 12], footDistance: [0, 0.38], kneeOpening: [0.25, 2], footHeight: [0.12, 0.9] } },
];
