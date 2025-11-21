import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as https from 'https'; // Use * as https for ES module environments
import { URLSearchParams } from 'url';
import * as zlib from 'zlib'; // Use * as zlib

// The main handler function for your Vercel API endpoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
    
    // Optional: Only allow GET or POST to this API route
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Compute today's date and use it as `start`. Also compute `end` as tomorrow.
        const pad2 = (n: number) => String(n).padStart(2, '0');
        const formatDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startDate = formatDate(today);
        const endDate = formatDate(tomorrow);

        const form = new URLSearchParams({
            // alter these params to switch rooms
            lid: '8176',
            gid: '14568',
            eid: '107918',

            seat: '0',
            seatId: '0',
            zone: '0',
            start: startDate,
            end: endDate,
            pageIndex: '0',
            pageSize: '18'
        });

        const postData = form.toString();

        const options = {
            method: 'POST',
            hostname: 'libcal.wesleyan.edu',
            path: '/spaces/availability/grid',
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                // Crucial for the receiving server: data is URL-encoded
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8', 
                'Content-Length': Buffer.byteLength(postData), // Important for POST requests
                'Accept-Language': 'en-US,en;q=0.9',
                'Origin': 'https://libcal.wesleyan.edu',
                'Referer': 'https://libcal.wesleyan.edu/reserve/olin-group/251',
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
                // Many of these headers are often unnecessary for a server-to-server call 
                // but kept for fidelity to the original site's request.
            }
        };

        const result = await new Promise<string>((resolve, reject) => {
            const req = https.request(options, (externalRes) => {
                const chunks: Buffer[] = [];
                externalRes.on('data', (c) => chunks.push(c));
                externalRes.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const enc = (externalRes.headers['content-encoding'] || '').toLowerCase();

                    function done(err: Error | null, out: Buffer) {
                        if (err) return reject(err);
                        const text = out.toString('utf8');
                        resolve(text); // Resolve with the response body
                    }

                    // Handle decompression based on Content-Encoding header
                    if (enc === 'br') {
                        zlib.brotliDecompress(buffer, done);
                    } else if (enc === 'gzip') {
                        zlib.gunzip(buffer, done);
                    } else if (enc === 'deflate') {
                        zlib.inflate(buffer, done);
                    } else {
                        done(null, buffer);
                    }
                });
            });

            req.on('error', (err) => reject(err));
            
            // Write the post data and end the request
            req.write(postData);
            req.end();
        });

        // --- YOUR ORIGINAL REQUEST LOGIC END ---

        // 5. Send the external API response back to the client that called your Vercel function
        // We assume the external API returns JSON, so we parse it before sending.
        const responseJson = JSON.parse(result);
        return res.status(200).json(responseJson);

    } catch (error) {
        // Handle any errors that occurred during the external API call
        console.error('External request failed:', error);
        return res.status(500).json({ 
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : 'An unknown error occurred'
        });
    }
}