export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatCompactCurrency = (value: number): string => {
  const absValue = Math.abs(value)

  if (absValue >= 1_000_000) {
    const millions = value / 1_000_000
    const formatted =
      Math.abs(millions) >= 10
        ? millions.toFixed(0)
        : millions.toFixed(1).replace(/\.0$/, "")
    return `$${formatted}M`
  }

  if (absValue >= 1_000) {
    return `$${Math.round(value / 1_000)}k`
  }

  return formatCurrency(value)
}

export const formatPercent = (rate: number): string => {
  return `${(rate * 100).toFixed(1)}%`
}
