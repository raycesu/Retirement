export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatPercent = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`
}
