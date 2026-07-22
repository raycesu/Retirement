import type { CliffWarning } from "@/lib/engine/types"

export type CollapsedCliffWarning = {
  kind: CliffWarning["kind"]
  startAge: number
  endAge: number
  calendarYear: number
  messageBody: string
}

const getMessageBody = (message: string) =>
  message.replace(/^Age \d+:\s*/, "")

export const formatCollapsedCliffMessage = (
  startAge: number,
  endAge: number,
  messageBody: string
) => {
  if (startAge === endAge) {
    return `Age ${startAge}: ${messageBody}`
  }

  return `Age ${startAge}-${endAge}: ${messageBody}`
}

export const collapseCliffWarnings = (
  warnings: CliffWarning[]
): CollapsedCliffWarning[] => {
  const unique = warnings.filter(
    (warning, index, list) =>
      list.findIndex(
        (item) =>
          item.age === warning.age &&
          item.kind === warning.kind &&
          item.message === warning.message
      ) === index
  )

  const sorted = [...unique].sort((left, right) => {
    if (left.kind !== right.kind) {
      return left.kind.localeCompare(right.kind)
    }

    return left.age - right.age
  })

  return sorted.reduce<CollapsedCliffWarning[]>((groups, warning) => {
    const messageBody = getMessageBody(warning.message)
    const previous = groups[groups.length - 1]

    if (
      previous &&
      previous.kind === warning.kind &&
      previous.endAge + 1 === warning.age &&
      previous.messageBody === messageBody
    ) {
      previous.endAge = warning.age
      return groups
    }

    groups.push({
      kind: warning.kind,
      startAge: warning.age,
      endAge: warning.age,
      calendarYear: warning.calendarYear,
      messageBody,
    })

    return groups
  }, [])
}
