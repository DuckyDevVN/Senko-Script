import axios from "axios";

export function secondsToTime(rawSeconds: number, colons?: boolean) {
    rawSeconds = Math.round(rawSeconds); // cho chắc

    const hours = Math.floor(rawSeconds / 3600);
    const minutes = Math.floor((rawSeconds - hours * 3600) / 60);
    const seconds = rawSeconds - hours * 3600 - minutes * 60;

    return (
        (hours > 0 ? `${hours}${colons ? ":" : "h "}` : "") +
        minutes +
        (colons ? ":" : "m ") +
        (seconds < 10 ? "0" : "") +
        seconds +
        (!colons ? "s" : "")
    );
}

export function thumbnail(id: string, lowQuality: boolean = false) {
    if (lowQuality) return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
    return `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`;
}

export async function getAccessToken(clientId: string, clientSecret: string) {
    const authString = `${clientId}:${clientSecret}`;
    const base64AuthString = Buffer.from(authString).toString("base64");
    const headers = {
        "Authorization": `Basic ${base64AuthString}`,
        "Content-Type": "application/x-www-form-urlencoded"
    };
    const data = "grant_type=client_credentials";

    try {
        const response = await axios.post("https://accounts.spotify.com/api/token", data, { headers });
        if (response.status === 200) {
            const access_token = response.data.access_token;
            return access_token;
        } else {
            throw new Error(`Lỗi khi truy vấn api`)
        }
    } catch (err) {
        console.log(err);
    };
}

export async function checkLanguage(text: string) {
    const regex = /[\u3400-\u9FBF]/g; // regex để tìm các ký tự Hán
    return regex.test(text)
}