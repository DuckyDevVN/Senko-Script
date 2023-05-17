import { Canvas, Image, loadImage, registerFont } from "canvas";
import axios from "axios";
import config from "config";

export default async function createImage(prompt: string) {
    const post = await axios.post('https://api.openai.com/v1/images/generations', {
        prompt: prompt,
        n: 4,
        size: '512x512',
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.openai.api_key}`,
        },
    });
    const result = post.data.data as { url: string }[];

    const canvas = new Canvas(1024, 1024);
    const ctx = canvas.getContext("2d");
    let x = 0,
        y = 0;
    for (let i = 0; i < result.length; i++) {
        ctx.drawImage(await loadImage(result[i].url), x, y);
        x += 512;
        if (i === 1) {
            x = 0;
            y += 512;
        };
    };

    return canvas.toBuffer();
}
