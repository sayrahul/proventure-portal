const ALBUM_URL = 'https://photos.app.goo.gl/PKbE1PDMfGqYrhsw8';

function doGet() {
    return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle('ProVenture Portfolio')
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
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
        const seenUrls = {}; // Use object for faster lookups

        // 1. Find Videos first
        // Pattern: "https://video-downloads.googleusercontent.com/...","https://lh3.googleusercontent.com/pw/..."
        const videoPattern = /"https:\/\/video-downloads\.googleusercontent\.com\/[^"]+","(https:\/\/lh3\.googleusercontent\.com\/pw\/[^"]+)"/g;

        let vMatch;
        while ((vMatch = videoPattern.exec(html)) !== null) {
            const lh3Url = vMatch[1];
            if (!seenUrls[lh3Url]) {
                videos.push({
                    src: lh3Url + '=dv',      // Download Video stream
                    thumbnail: lh3Url + '=w500-h500-no',
                    caption: '',
                    type: 'video'
                });
                seenUrls[lh3Url] = true;
            }
        }

        // 2. Find ALL Photos
        // Matches: ["https://lh3.googleusercontent.com/pw/...",width,height
        const itemPattern = /\["(https:\/\/lh3\.googleusercontent\.com\/pw\/[^"]+)",(\d+),(\d+)/g;

        let match;
        while ((match = itemPattern.exec(html)) !== null) {
            const url = match[1];
            const width = parseInt(match[2]);
            const height = parseInt(match[3]);

            // Filter out small icons (profile pics, etc)
            if (width > 200 && height > 200 && !seenUrls[url]) {
                photos.push({
                    src: url + '=w1920-h1080-no',
                    thumbnail: url + '=w500-h500-no',
                    w: width,
                    h: height,
                    caption: '',
                    type: 'photo'
                });
                seenUrls[url] = true;
            }
        }

        Logger.log('Found ' + photos.length + ' photos and ' + videos.length + ' videos');

        return {
            photos: photos,
            videos: videos
        };

    } catch (e) {
        Logger.log('Error: ' + e.message);
        return { error: e.message };
    }
}
