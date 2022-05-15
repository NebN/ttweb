import { parseTransformation, transform } from 'transformations.js'

function t(code, input) {
    return transform(parseTransformation(code), input)
}

test('Grep test', () => {
    expect(t('grep "a"', "abc\ncde\nfgh")).toEqual("abc")
})

test('Replace test', () => {
    expect(t('replace "a" with "b"', "abc\ncde\nfgh")).toEqual("bbc\ncde\nfgh")

    const code = String.raw`replace "'(\d{4}-\d{2}-\d{2}\s*\d{2}:\d{2}:\d{2})(?:\.000)?'" with "to_timestamp('$1', 'yyyy-MM-dd HH:mm:ss', 'CET')"`
    const text = "'2022-05-13 13:45:30'"
    expect(t(code, text)).toEqual("to_timestamp('2022-05-13 13:45:30', 'yyyy-MM-dd HH:mm:ss', 'CET')")
})