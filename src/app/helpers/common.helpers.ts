export const breakObjectReference = <T>(obj: T): T => {
    return JSON.parse(JSON.stringify(obj))
}