const sideName = side => side === 'left' ? 'trái' : 'phải';

// Chỉ mô tả những gì phép đo 2D hỗ trợ; không suy đoán đau, lực hoặc tiếp xúc thật.
export function jointCoaching(poseId, id, { side, role, direction, raisedSide, armPosition } = {}) {
  const limb = sideName(side);
  if (id === 'torso') return 'Trong hình camera, thân người đang lệch khỏi trục dọc. Đưa vai về phía trên hông, kéo dài thân nhẹ nhàng và giữ đầu thẳng. Điều chỉnh chậm, tiếp tục thở đều.';
  if (id === 'shoulders') return `Trong hình camera, vai ${sideName(raisedSide)} đang cao hơn vai còn lại. Thả lỏng vai ${sideName(raisedSide)}, đưa vai ra xa tai và để hai tay buông tự nhiên. Giữ cổ thoải mái, không cố kéo vai xuống.`;
  if (id === 'hips') return poseId === 'tree'
    ? 'Trong hình camera, hai bên hông chưa cân bằng. Đưa thân về phía trên chân trụ và giảm độ nâng chân gập nếu khó giữ thăng bằng. Có thể chạm nhẹ tay vào tường để hỗ trợ.'
    : 'Trong hình camera, hai bên hông chưa cân bằng. Đưa thân về giữa hai chân, kiểm tra lại vị trí hai bàn chân trên thảm. Điều chỉnh từng chút, không vặn hoặc đẩy hông mạnh.';
  if (poseId === 'mountain') {
    if (id.endsWith('Knee')) return `Gối ${limb} trong hình đang gập hơn khoảng tham chiếu. Giữ bàn chân ${limb} trên thảm, từ từ duỗi nhẹ chân để hông, gối và cổ chân gần cùng một trục. Giữ gối mềm, không ép khóa khớp.`;
    if (id.endsWith('Hip')) return `Vai, hông và gối bên ${limb} chưa nằm gần cùng một trục trong hình. Đưa vai về phía trên hông, giữ thân dài và kiểm tra chân ${limb} ở dưới người. Chỉnh nhẹ, không ưỡn lưng để cố đứng thẳng.`;
    if (id.endsWith('Leg')) return `Trục chân ${limb} đang nghiêng trong hình camera. Đưa bàn chân ${limb} về gần phía dưới hông cùng bên, điều chỉnh khoảng cách hai chân cho thoải mái. Giữ cả bàn chân chạm thảm rồi kiểm tra lại.`;
  }
  if (poseId === 'warrior') {
    if (id === 'frontKnee') return direction === 'below'
      ? `Gối chân trước bên ${limb} đang gập sâu hơn khoảng tham chiếu. Từ từ nâng hông lên một chút và duỗi bớt gối ${limb}. Tự kiểm tra gối ở phía trên cổ chân, hướng theo mũi chân; chỉ giữ độ gập thoải mái.`
      : `Gối chân trước bên ${limb} còn duỗi hơn khoảng tham chiếu. Từ từ gập gối ${limb} thêm một chút, hạ hông trong phạm vi thoải mái. Tự kiểm tra gối ở phía trên cổ chân và hướng theo mũi chân, không cố hạ sâu.`;
    if (id === 'backKnee') return `Gối chân sau bên ${limb} trong hình chưa duỗi đủ. Giữ bàn chân sau vững trên thảm rồi duỗi nhẹ chân ${limb}, không khóa cứng gối. Giữ thân ở giữa hai chân và không nghiêng theo chân trước.`;
    if (id.endsWith('Elbow')) return `Khuỷu tay ${limb} đang gập hơn khoảng tham chiếu. Vươn các đầu ngón tay ${limb} ra xa thân, từ từ duỗi khuỷu để vai, khuỷu và cổ tay gần thành một đường. Thả lỏng vai, không ép khóa khuỷu.`;
    if (id.endsWith('Arm')) return `Cánh tay ${limb} đang ${armPosition === 'above' ? 'cao hơn' : 'thấp hơn'} đường ngang vai trong hình. ${armPosition === 'above' ? 'Hạ' : 'Nâng'} cả cánh tay ${limb} chậm rãi đến gần ngang vai, giữ khuỷu duỗi nhẹ. Để vai xa tai và hướng các ngón tay ra ngoài.`;
    if (id.endsWith('Outward')) return `Cánh tay ${limb} chưa mở ra phía ngoài thân trong hình. Mở tay ${limb} sang bên ${limb} của cơ thể, để hai tay vươn về hai phía đối diện. Giữ tay gần ngang vai và thân hướng về camera.`;
  }
  if (poseId === 'tree') {
    if (id === 'standingKnee') return `Gối chân trụ bên ${limb} đang gập hơn khoảng tham chiếu. Giữ bàn chân ${limb} vững trên thảm rồi duỗi nhẹ chân trụ, không khóa cứng đầu gối. Nếu chao đảo, hạ chân gập hoặc chạm nhẹ tay vào tường.`;
    if (id === 'bentKnee') return direction === 'below'
      ? `Gối chân gập bên ${limb} đang gập sâu hơn khoảng tham chiếu. Hạ bàn chân ${limb} xuống vị trí thấp hơn và duỗi bớt gối nhẹ nhàng. Chọn mặt trong bắp chân hoặc đùi chân trụ, tránh đặt bàn chân lên đầu gối.`
      : `Chân gập bên ${limb} còn duỗi hơn khoảng tham chiếu. Gập nhẹ gối ${limb}, đưa bàn chân về mặt trong bắp chân hoặc đùi chân trụ. Mở gối sang bên trong phạm vi thoải mái, không dùng tay kéo ép gối.`;
    if (id === 'footPosition') return `Bàn chân ${limb} trong hình còn xa trục chân trụ bên ${sideName(role)}. Đưa bàn chân ${limb} về gần mặt trong bắp chân hoặc đùi chân trụ. Tự kiểm tra điểm đặt chân, tránh tì trực tiếp lên đầu gối; có thể chọn vị trí thấp để dễ cân bằng.`;
    if (id === 'footHeight') return direction === 'above'
      ? `Bàn chân ${limb} đang được nâng cao hơn khoảng tham chiếu. Hạ chân gập xuống vị trí thoải mái hơn ở mặt trong bắp chân hoặc đùi. Giữ hông cân bằng, không kéo bàn chân lên bằng tay hoặc tì vào đầu gối.`
      : `Bàn chân ${limb} trong hình còn thấp so với chân trụ. Nếu đang đứng vững, nâng nhẹ bàn chân lên mặt trong bắp chân; chỉ nâng lên đùi khi thấy thoải mái. Không đặt chân lên đầu gối và không cần nâng cao để cố đạt số đo.`;
    if (id === 'kneeOpening') return direction === 'above'
      ? `Gối chân gập bên ${limb} đang mở rộng hơn khoảng tham chiếu trong hình. Thu nhẹ gối về vị trí thoải mái, giữ hông hướng về camera. Không kéo ép khớp háng; hạ chân nếu khó giữ thăng bằng.`
      : `Gối chân gập bên ${limb} chưa mở rõ sang bên trong hình. Giữ hông hướng về camera rồi mở nhẹ gối ${limb} sang bên ${limb}. Không xoay cả thân theo gối hoặc dùng tay ép gối ra ngoài.`;
  }
  return 'Điều chỉnh nhẹ nhàng trong phạm vi thoải mái, giữ toàn bộ cơ thể trong hình rồi kiểm tra lại.';
}

export const holdCoaching = {
  mountain: 'Giữ hai bàn chân vững trên thảm, đầu gối mềm, vai thả lỏng và thân vươn dài. Hít vào nhẹ nhàng, thở ra chậm; không cần gồng để giữ số đo.',
  warrior: 'Giữ chân trước gập thoải mái, chân sau duỗi nhẹ và hai tay gần ngang vai. Thả lỏng vai, giữ thân ở giữa hai chân, tiếp tục hít thở đều.',
  tree: 'Giữ chân trụ vững, nhìn vào một điểm cố định phía trước và thả lỏng vai. Thở đều; nếu mất thăng bằng, hạ chân gập hoặc chạm nhẹ vào tường.',
};
