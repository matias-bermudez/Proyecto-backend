export function wantsHTML(req) {
    return !!req.accepts('html');
}

export function wantsJSON(req) {
    return !!req.accepts('json');
}
