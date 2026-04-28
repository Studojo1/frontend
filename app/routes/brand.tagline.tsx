export function meta() {
  return [{ title: "Studojo | Work on things that matter." }];
}

export default function BrandTagline() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0a0a",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Clash Display', sans-serif",
        padding: "40px 24px",
      }}
    >
      {/* The printable card */}
      <div
        id="print-card"
        style={{
          width: 1100,
          height: 500,
          backgroundColor: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 0,
          padding: "0 60px",
          border: "2px solid #222",
          borderRadius: 4,
        }}
      >
        <div
          style={{
            fontSize: 108,
            fontWeight: 570,
            color: "#ffffff",
            lineHeight: 1.05,
            letterSpacing: "-3px",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          Work on things
        </div>
        <div
          style={{
            fontSize: 108,
            fontWeight: 700,
            lineHeight: 1.05,
            letterSpacing: "-3px",
            textAlign: "center",
            whiteSpace: "nowrap",
          }}
        >
          <span style={{ color: "#ffffff", fontWeight: 570 }}>that </span>
          <span style={{ color: "#7c3aed" }}>matter.</span>
        </div>
      </div>

      {/* Controls */}
      <div style={{ marginTop: 32, display: "flex", gap: 12 }}>
        <button
          onClick={() => {
            const card = document.getElementById("print-card");
            if (!card) return;
            const original = card.style.border;
            card.style.border = "none";
            card.style.borderRadius = "0";
            window.print();
            card.style.border = original;
            card.style.borderRadius = "4px";
          }}
          style={{
            backgroundColor: "#7c3aed",
            color: "#fff",
            border: "none",
            padding: "12px 28px",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "'Satoshi', sans-serif",
          }}
        >
          Print / Save as PDF
        </button>
      </div>

      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=clash-display@400,500,600,700&f[]=satoshi@400,500,700&display=swap');
        @media print {
          body * { visibility: hidden; }
          #print-card, #print-card * { visibility: visible; }
          #print-card {
            position: fixed;
            top: 0; left: 0;
            width: 100vw; height: 100vh;
            border: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}
