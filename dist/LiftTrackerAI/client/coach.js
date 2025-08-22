"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.askCoach = askCoach;
async function askCoach(messages) {
    const resp = await fetch("/api/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
    });
    if (!resp.ok) {
        let msg = "Coach API error";
        try {
            const j = await resp.json();
            if (j?.error)
                msg = j.error;
        }
        catch { }
        throw new Error(msg);
    }
    return (await resp.json());
}
