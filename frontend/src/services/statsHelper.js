/**
 * Frontend stats calculation helper.
 * This allows us to calculate metrics in real-time from a subset of invoices
 * without needing a backend round-trip.
 */

export const calculateStats = (invoices) => {
  if (!invoices || invoices.length === 0) {
    return {
      total_count: 0,
      total_spend: 0,
      total_tax: 0,
      avg_invoice: 0,
      vendor_spend: {},
      currency_spend: {},
      status_breakdown: {},
      monthly_spend: {},
      recent_invoices: []
    };
  }

  const total_count = invoices.length;
  const total_spend = invoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
  const total_tax = invoices.reduce((sum, inv) => sum + (Number(inv.tax_amount) || 0), 0);
  const avg_invoice = total_spend / total_count;

  const vendor_spend = invoices.reduce((acc, inv) => {
    const v = inv.vendor || 'Unknown';
    acc[v] = (acc[v] || 0) + (Number(inv.amount) || 0);
    return acc;
  }, {});

  const currency_spend = invoices.reduce((acc, inv) => {
    const c = inv.currency || 'USD';
    acc[c] = (acc[c] || 0) + (Number(inv.amount) || 0);
    return acc;
  }, {});

  const status_breakdown = invoices.reduce((acc, inv) => {
    const s = inv.payment_status || 'Unknown';
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const monthly_spend = invoices.reduce((acc, inv) => {
    const date = inv.date || '';
    // Format: YYYY-MM-DD -> YYYY-MM
    if (date.length >= 7) {
      const monthKey = date.substring(0, 7);
      acc[monthKey] = (acc[monthKey] || 0) + (Number(inv.amount) || 0);
    }
    return acc;
  }, {});

  return {
    total_count,
    total_spend,
    total_tax,
    avg_invoice: Number(avg_invoice.toFixed(2)),
    vendor_spend,
    currency_spend,
    status_breakdown,
    monthly_spend,
    recent_invoices: [...invoices].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)
  };
};
