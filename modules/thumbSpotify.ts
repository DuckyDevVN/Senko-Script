import getColor from "get-image-colors";
import config from "config";
import { Canvas, loadImage } from "canvas";
import { getAccessToken } from "modules/utils"

export async function getThumb(id : string) {
    const y = await getAccessToken(config.spotify.clientId, config.spotify.clientSecret)
    const headers = {
        "Authorization": `Bearer ${y}`
    };
    const url = `https://api.spotify.com/v1/tracks/${id}`;
    try {
        const response = await fetch(url, { headers });
        if (response.status === 200) {
            const track_info = await response.json();
            const album_images = track_info.album.images;
            const artists_id = track_info.artists[0].id;
            const urlAthor = `https://api.spotify.com/v1/artists/${artists_id}`;
            const artists_images = await fetch(urlAthor, { headers });
            const artists_info = await artists_images.json()
            
            if (album_images.length > 0) {
                const thumbnail_url = album_images[0].url;
                const color = await getColor(thumbnail_url);
                const [r, g, b] = color[0].rgb();

                const canvas = new Canvas(970, 540);
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                ctx.fillRect(0, 0, 970, 540);
                ctx.drawImage(await loadImage(thumbnail_url), (970 - 540)/2, 0, 540, 540);

                const result = canvas.toBuffer();
                const artists_thumb_url = artists_info.images[0].url;

                return {
                    thumbnail_url,
                    artists_thumb_url,
                    result
                }
            } else {
                throw new Error("Không tìm thấy ảnh thumbnail cho bài hát này");
            }
        } else {
            throw new Error(`Lỗi khi truy vấn Spotify API: ${response.status} - ${await response.text()}`);
        }
    } catch (error) {
        throw error;
    }
}