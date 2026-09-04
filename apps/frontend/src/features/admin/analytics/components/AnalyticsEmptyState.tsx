export function AnalyticsEmptyState() {
  return (
    <div className="admin-analytics-empty">
      <p className="admin-analytics-empty-title">No analytics available.</p>
      <p className="admin-analytics-empty-copy">
        Analytics will appear once Chronivs records orders, payments, customers, or published
        experiences.
      </p>
    </div>
  );
}
