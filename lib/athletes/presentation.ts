export function getAthleteAge(value: string, today = new Date()): number | null {
  const text = value.trim()
  const iso = text.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  const french = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (!iso && !french) return null
  const [year, month, day] = iso
    ? [Number(iso[1]), Number(iso[2]), Number(iso[3])]
    : [Number(french![3]), Number(french![2]), Number(french![1])]
  const birth = new Date(year, month - 1, day)
  if (birth.getFullYear() !== year || birth.getMonth() !== month - 1 || birth.getDate() !== day || birth > today) return null
  let age = today.getFullYear() - year
  if (today.getMonth() < month - 1 || (today.getMonth() === month - 1 && today.getDate() < day)) age--
  return age >= 0 ? age : null
}
