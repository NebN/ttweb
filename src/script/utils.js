export function stringIsEmpty(string) {
    return (string == null || string.length == 0 || string.trim().length == 0)
}

export function arrayEquals(a, b) {
    if (a === b) {
        return true
    }
    
    if (a.length != b.length) {
        return false
    }
    
    for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            return false
        }
    }

    return true
}