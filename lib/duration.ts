export const minutesToText = (mins: number) => {
    if (mins < 60) {
        return `${Math.round(mins)} Minutes`
    }
    const hours = Math.round(mins / 60)
    return `${Math.round(hours)} Hour(s)`
}