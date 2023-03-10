import { body } from "express-validator";
import xss from "xss";

export const stringValidator = ({
    field = '',
    valueRequired = true,
    maxLength = 0,
    optional = false,
} = {}) => {
    const val = body(field)
        .trim()
        .isString()
        .isLength({
            min: valueRequired ? 1 : undefined,
            max: maxLength ? maxLength : undefined,
        })
        .withMessage(
            [
                field,
                valueRequired ? 'required' : '',
                maxLength ? `max ${maxLength} characters` : '',
            ]
                .filter((i) => Boolean(i))
                .join(' '),
        );

    if (optional) {
        return val.optional();
    }
    return val;
} 

export const xssSanitizer = (param: string) =>
    body(param).customSanitizer((v) => xss(v));

export const valueToSementer = (semester: string | undefined) => {
    switch (semester) {
        case 'Haust':
            return 'Haust';
        case 'Vor':
            return 'Vor';
        case 'Sumar':
            return 'Sumar';
        case 'Heilsárs':
            return 'Heilsárs';
        default:
            return undefined;
    }
}