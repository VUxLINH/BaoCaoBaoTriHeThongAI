export default function MobileAppLayout({ children }) {
  return (
    <div className="app-viewport">
      <div className="app-mobile-shell">{children}</div>
    </div>
  );
}