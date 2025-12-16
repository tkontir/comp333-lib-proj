/// <reference types="node" />

import * as https from 'https';
import { URLSearchParams } from 'url';
import { IncomingMessage } from 'http';
import * as zlib from 'zlib';

// Basic type definitions for Vercel-like request/response
interface VercelRequest {
    method?: string;
    query: Record<string, any>;
    body?: any;
}

interface VercelResponse {
    status(code: number): VercelResponse;
    json(data: any): VercelResponse;
}

// Global declarations for Node.js environment
declare global {
    var Buffer: typeof Buffer;
    var console: Console;
}

// The main handler function for your Vercel API endpoint
export default async function handler(req: VercelRequest, res: VercelResponse) {
    
    // Optional: Only allow GET or POST to this API route
    if (req.method !== 'GET' && req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // Compute today's date in EST timezone and use it as `start`. Also compute `end` as tomorrow.
        const pad2 = (n: number) => String(n).padStart(2, '0');
        
        // Get current date/time in EST timezone
        const now = new Date();
        const estDateString = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
        const today = new Date(estDateString);
        
        const formatDate = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const startDate = formatDate(today);
        const endDate = formatDate(tomorrow);
        console.log(`Using start date: ${startDate}, end date: ${endDate}`);

        // Allow client to override which room to query by passing a payload
        // Payload can be sent as JSON body: { payload: [lid, gid, eid] } or
        // individual fields { lid, gid, eid } or via query string for GET.
        let lid = '8176';
        let gid = '14568';
        let eid = '107918';
        let referer = 'https://libcal.wesleyan.edu/reserve';

        if (req.method === 'GET') {
            const q = req.query as Record<string, any>;
            if (q.lid) lid = String(q.lid);
            if (q.gid) gid = String(q.gid);
            if (q.eid) eid = String(q.eid);
            if (q.referer) referer = String(q.referer);
            if (q.link) referer = String(q.link);
        } else if (req.method === 'POST') {
            const body = (req as any).body || {};
            if (Array.isArray(body.payload) && body.payload.length >= 3) {
                [lid, gid, eid] = body.payload.map((v: any) => String(v));
            } else {
                if (body.lid) lid = String(body.lid);
                if (body.gid) gid = String(body.gid);
                if (body.eid) eid = String(body.eid);
            }
            if (body.referer) referer = String(body.referer);
            if (body.link) referer = String(body.link);
        }

        const form = new URLSearchParams({
            // alter these params to switch rooms
            lid: lid,
            gid: gid,
            eid: eid,

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
                'Referer': referer,
                'X-Requested-With': 'XMLHttpRequest',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36',
                // Many of these headers are often unnecessary for a server-to-server call 
                // but kept for fidelity to the original site's request.
            }
        };

        const result = await new Promise<string>((resolve, reject) => {
            const req = https.request(options, (externalRes: IncomingMessage) => {
                const chunks: Buffer[] = [];
                externalRes.on('data', (chunk: Buffer) => chunks.push(chunk));
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

            req.on('error', (err: Error) => reject(err));
            
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
