export function DashboardHeroVideo({ title, subtitle, badge, actions }) {
  return (
    <section className="dashboard-hero-fullbleed">
      <video
        className="dashboard-hero-fullbleed__video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/assets/freelancer_remotiva.mp4" type="video/mp4" />
      </video>

      <div className="dashboard-hero-fullbleed__overlay" />

      <div className="dashboard-hero-fullbleed__inner">
        {badge && <span className="dashboard-hero-fullbleed__badge">{badge}</span>}
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {actions && <div className="dashboard-hero-fullbleed__actions">{actions}</div>}
      </div>

      <style>{`
        .dashboard-hero-fullbleed {
          position: relative;
          width: 100vw;
          min-height: 420px;
          margin-left: calc(50% - 50vw);
          margin-right: calc(50% - 50vw);
          overflow: hidden;
          display: flex;
          align-items: center;
          background: #0F172A;
          border-radius: 0 !important;
          box-shadow: none !important;
        }

        .dashboard-hero-fullbleed__video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dashboard-hero-fullbleed__overlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(15, 23, 42, .88), rgba(15, 23, 42, .58), rgba(15, 23, 42, .18)),
            linear-gradient(180deg, rgba(15, 23, 42, .10), rgba(15, 23, 42, .45));
        }

        .dashboard-hero-fullbleed__inner {
          position: relative;
          z-index: 1;
          width: min(100% - 64px, 1400px);
          margin: 0 auto;
          padding: 48px 0;
          color: #fff;
        }

        .dashboard-hero-fullbleed__badge {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          margin-bottom: 18px;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(45, 118, 255, .22);
          border: 1px solid rgba(255, 255, 255, .28);
          color: #fff;
          font-size: 13px;
          font-weight: 800;
          backdrop-filter: blur(12px);
        }

        .dashboard-hero-fullbleed__inner h1 {
          margin: 0 0 14px;
          font-size: clamp(36px, 5vw, 56px);
          line-height: 1.05;
          letter-spacing: -0.04em;
          font-weight: 700;
        }

        .dashboard-hero-fullbleed__inner p {
          max-width: 560px;
          margin: 0;
          color: rgba(255, 255, 255, .86);
          font-size: 17px;
          line-height: 1.6;
        }

        .dashboard-hero-fullbleed__actions {
          margin-top: 24px;
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .dashboard-hero-action {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          background: #2D76FF;
          color: #fff;
          border: none;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }

        .dashboard-hero-action:hover {
          background: #1F66EC;
          transform: translateY(-1px);
        }

        @media (max-width: 768px) {
          .dashboard-hero-fullbleed {
            min-height: 340px;
          }

          .dashboard-hero-fullbleed__inner {
            width: min(100% - 32px, 100%);
            padding: 36px 0;
          }

          .dashboard-hero-fullbleed__inner h1 {
            font-size: clamp(28px, 6vw, 40px);
          }
        }
      `}</style>
    </section>
  )
}