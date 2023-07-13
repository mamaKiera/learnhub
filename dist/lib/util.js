"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVideoContent = void 0;
async function getVideoContent(videoUrl) {
    const res = await fetch(`https://iframe.ly/api/oembed?url=${videoUrl}&api_key=279a74be426f14f23421cc`);
    const content = await res.json();
    const { title, author, author_url, thumbnail_url } = content;
    return {
        videoTitle: title,
        creatorName: author,
        creatorUrl: author_url,
        thumbnailUrl: thumbnail_url,
    };
}
exports.getVideoContent = getVideoContent;
//# sourceMappingURL=util.js.map