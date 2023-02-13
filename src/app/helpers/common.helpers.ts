export const breakReferece = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj))
}