export default function PoseIllustration({ pose }) {
  return <img src={`${import.meta.env.BASE_URL}images/poses/${pose}.png`} alt="" width="1086" height="1448" decoding="async" />;
}
