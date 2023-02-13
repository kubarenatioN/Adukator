import { format } from 'date-fns'
import { enGB, eo, ru } from 'date-fns/locale'

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