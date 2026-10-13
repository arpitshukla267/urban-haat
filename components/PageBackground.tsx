// Full-screen background that stays put while the phone's address bar slides in and out.
// It is a fixed layer sized to the LARGEST phone viewport (100lvh), so it always covers the
// screen and never shows white/black strips or re-draws with a jerk (which is what
// `bg-fixed` on <main> does on mobile browsers).
export default function PageBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-[100lvh] bg-cover bg-center bg-no-repeat"
      style={{
        minHeight: "100vh", // fallback for old browsers that don't know lvh
        backgroundImage: "url('/background.webp')",
        backgroundColor: "#1c1410", // shown only while the image loads
      }}
    />
  );
}
