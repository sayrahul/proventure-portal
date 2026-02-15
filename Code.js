const ALBUM_URL = 'https://photos.app.goo.gl/PKbE1PDMfGqYrhsw8';

function doGet() {
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('ProVenture Portfolio')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
    return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getAlbumData() {
    try {
        const response = UrlFetchApp.fetch(ALBUM_URL, {
            muteHttpExceptions: true,
            followRedirects: true
        });

        if (response.getResponseCode() !== 200) {
            throw new Error('Failed to load Google Photos album');
        }

        const html = response.getContentText();

        const photos = [];
        const videos = [];
        const processed = new Set();
        const videoUrls = new Set(); // To avoid adding videos as photos

        // 1. Find Videos first
        // Pattern: "https://video-downloads.googleusercontent.com/...",["https://lh3.googleusercontent.com/..."
        // We capture the lh3 URL to use as the base for both thumbnail and video stream (=dv)
        const videoRegex = /"(https:\/\/video-downloads\.googleusercontent\.com\/[^"]+)",\["(https:\/\/lh3\.googleusercontent\.com\/[^"]+)"/g;

        let vMatch;
        while ((vMatch = videoRegex.exec(html)) !== null) {
            const lh3Url = vMatch[2];

            // Extract width/height if possible, or default
            // complex to look ahead in regex, so we'll just set defaults or extracted later if we match the photo regex 
            // Actually, let's just use the lh3 matched here.

            if (!videoUrls.has(lh3Url)) {
                videos.push({
                    src: lh3Url + '=dv',      // Download Video stream
                    thumbnail: lh3Url + '=w500-h500-no',
                    caption: 'Video',
                    type: 'video'
                });
                videoUrls.add(lh3Url);
                processed.add(lh3Url);
            }
        }

        // 2. Find Photos (and remaining items)
        // Matches: [ "https://lh3.googleusercontent.com/...", width, height
        const itemRegex = /\["(https:\/\/lh3\.googleusercontent\.com\/[^"]+)",(\d+),(\d+)/g;
        let match;

        while ((match = itemRegex.exec(html)) !== null) {
            const url = match[1];
            const width = parseInt(match[2]);
            const height = parseInt(match[3]);

            // Filter out small icons/profile pics (usually < 100px)
            if (width > 200 && height > 200) {
                // Only add if NOT already identified as a video
                if (!videoUrls.has(url) && !processed.has(url)) {
                    photos.push({
                        src: url + '=w1920-h1080-no',      // 1080p
                        thumbnail: url + '=w500-h500-no',   // 500px thumbnail
                        w: width,
                        h: height,
                        caption: '',
                        type: 'photo'
                    });
                    processed.add(url);
                }
            }
        }

        return {
            photos: photos,
            videos: videos
        };

    } catch (e) {
        console.error(e);
        return { error: e.message };
    }
}
