import { addWeeks, format } from 'date-fns'
import { enGB, eo, ru } from 'date-fns/locale'
import differenceInMilliseconds from 'date-fns/differenceInMilliseconds'
import { addDays, addYears } from 'date-fns/esm'

const locales: {
    [key: string]: Locale
} = { enGB, eo, ru }

// by providing a default string of 'PP' or any of its variants for `formatStr`
// it will format dates in whichever way is appropriate to the locale
export const formatDate = (date: number | Date | string, formatStr = 'Pp') => {
    let value = date;
    if (typeof(value) === 'string') {
        value = new Date(value);
    }

    return format(value, formatStr, {
        locale: locales[(window as any).__localeId__]
    })
}

export const getDurationInMilliseconds = (from: number | Date | string, to: number | Date | string): number => {
    from = typeof from === 'string' ? new Date(from) : from;
    to = typeof to === 'string' ? new Date(to) : to;

    return differenceInMilliseconds(to, from);
}

export const getTodayTime = (): Date => {
    return addDays(new Date(), 20) // DEBUG ONLY!!!
    // return new Date()
}

export const getNextYearTime = (): Date => {
    return addYears(getTodayTime(), 1)
}