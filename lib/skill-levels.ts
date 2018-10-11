
export const skillLevelToText = (lvl: number) => {
    switch (lvl) {
        case 0:
            return "Introductory";
        case 1:
            return "Beginner";
        case 2:
            return "Intermediate";
        case 3:
            return "Advanced";
        case 4:
            return "Expert";
        default:
            return "Introductory"
    }
}
