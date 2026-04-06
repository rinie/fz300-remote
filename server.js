'use strict';

const express = require('express');
const http = require('http');
const path = require('path');
const { COMMANDS, SETTING_VALUES } = require('./cameraCommands');

const app = express();
const PORT = process.env.PORT || 3000;
const CAMERA_IP = process.env.CAMERA_IP || '192.168.54.1';

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Camera HTTP helper ───────────────────────────────────────────────────────

async function camGet(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.on('timeout', () => { req.destroy(); reject(new Error('Camera request timed out')); });
  });
}

async function sendCommand(url, res) {
  try {
    const result = await camGet(url);
    res.json({ ok: true, url, response: result.body });
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message, url });
  }
}

// ─── API routes ───────────────────────────────────────────────────────────────

// Session
app.get('/api/connect', async (req, res) => {
  const url = COMMANDS.requestAccess(CAMERA_IP);
  await sendCommand(url, res);
});

// State & info
app.get('/api/state',      async (req, res) => sendCommand(COMMANDS.getState(CAMERA_IP), res));
app.get('/api/capability', async (req, res) => sendCommand(COMMANDS.getCapability(CAMERA_IP), res));
app.get('/api/allmenu',    async (req, res) => sendCommand(COMMANDS.getAllMenu(CAMERA_IP), res));
app.get('/api/curmenu',    async (req, res) => sendCommand(COMMANDS.getCurMenu(CAMERA_IP), res));
app.get('/api/lens',       async (req, res) => sendCommand(COMMANDS.getLensInfo(CAMERA_IP), res));

// Mode
app.post('/api/mode/rec',  async (req, res) => sendCommand(COMMANDS.recMode(CAMERA_IP), res));
app.post('/api/mode/play', async (req, res) => sendCommand(COMMANDS.playMode(CAMERA_IP), res));

// Capture
app.post('/api/capture', async (req, res) => sendCommand(COMMANDS.capture(CAMERA_IP), res));

app.post('/api/capture/touch', async (req, res) => {
  const { x = 500, y = 500 } = req.body;
  await sendCommand(COMMANDS.touchCapture(CAMERA_IP, x, y), res);
});

app.post('/api/af/on',  async (req, res) => sendCommand(COMMANDS.afOn(CAMERA_IP), res));
app.post('/api/af/off', async (req, res) => sendCommand(COMMANDS.afOff(CAMERA_IP), res));

// Video
app.post('/api/video/start', async (req, res) => sendCommand(COMMANDS.videoStart(CAMERA_IP), res));
app.post('/api/video/stop',  async (req, res) => sendCommand(COMMANDS.videoStop(CAMERA_IP), res));

// Zoom
app.post('/api/zoom/tele/slow', async (req, res) => sendCommand(COMMANDS.zoomTeleSlow(CAMERA_IP), res));
app.post('/api/zoom/tele/fast', async (req, res) => sendCommand(COMMANDS.zoomTeleFast(CAMERA_IP), res));
app.post('/api/zoom/wide/slow', async (req, res) => sendCommand(COMMANDS.zoomWideSlow(CAMERA_IP), res));
app.post('/api/zoom/wide/fast', async (req, res) => sendCommand(COMMANDS.zoomWideFast(CAMERA_IP), res));
app.post('/api/zoom/stop',      async (req, res) => sendCommand(COMMANDS.zoomStop(CAMERA_IP), res));

// Focus
app.post('/api/focus/far/slow',  async (req, res) => sendCommand(COMMANDS.focusFarSlow(CAMERA_IP), res));
app.post('/api/focus/far/fast',  async (req, res) => sendCommand(COMMANDS.focusFarFast(CAMERA_IP), res));
app.post('/api/focus/near/slow', async (req, res) => sendCommand(COMMANDS.focusNearSlow(CAMERA_IP), res));
app.post('/api/focus/near/fast', async (req, res) => sendCommand(COMMANDS.focusNearFast(CAMERA_IP), res));
app.post('/api/focus/stop',      async (req, res) => sendCommand(COMMANDS.focusStop(CAMERA_IP), res));

// Settings — GET to read, POST to write
app.get('/api/setting/iso',       async (req, res) => sendCommand(COMMANDS.getISO(CAMERA_IP), res));
app.post('/api/setting/iso',      async (req, res) => sendCommand(COMMANDS.setISO(CAMERA_IP, req.body.value), res));

app.get('/api/setting/shutter',   async (req, res) => sendCommand(COMMANDS.getShutterSpeed(CAMERA_IP), res));
app.post('/api/setting/shutter',  async (req, res) => sendCommand(COMMANDS.setShutterSpeed(CAMERA_IP, req.body.value), res));

app.get('/api/setting/aperture',  async (req, res) => sendCommand(COMMANDS.getAperture(CAMERA_IP), res));
app.post('/api/setting/aperture', async (req, res) => sendCommand(COMMANDS.setAperture(CAMERA_IP, req.body.value), res));

app.get('/api/setting/expcomp',   async (req, res) => sendCommand(COMMANDS.getExposureComp(CAMERA_IP), res));
app.post('/api/setting/expcomp',  async (req, res) => sendCommand(COMMANDS.setExposureComp(CAMERA_IP, req.body.value), res));

app.get('/api/setting/wb',        async (req, res) => sendCommand(COMMANDS.getWhiteBalance(CAMERA_IP), res));
app.post('/api/setting/wb',       async (req, res) => sendCommand(COMMANDS.setWhiteBalance(CAMERA_IP, req.body.value), res));

app.get('/api/setting/afmode',    async (req, res) => sendCommand(COMMANDS.getAFMode(CAMERA_IP), res));
app.post('/api/setting/afmode',   async (req, res) => sendCommand(COMMANDS.setAFMode(CAMERA_IP, req.body.value), res));

app.get('/api/setting/quality',   async (req, res) => sendCommand(COMMANDS.getQuality(CAMERA_IP), res));
app.post('/api/setting/quality',  async (req, res) => sendCommand(COMMANDS.setQuality(CAMERA_IP, req.body.value), res));

// Setting values reference
app.get('/api/setting-values', (req, res) => res.json(SETTING_VALUES));

// Stream
app.post('/api/stream/start', async (req, res) => {
  const { port = 49152 } = req.body;
  await sendCommand(COMMANDS.startStream(CAMERA_IP, port), res);
});
app.post('/api/stream/stop', async (req, res) => sendCommand(COMMANDS.stopStream(CAMERA_IP), res));

// Proxy live view JPEG (avoids browser CORS issues)
app.get('/api/liveview', async (req, res) => {
  const url = COMMANDS.liveViewJpeg(CAMERA_IP);
  try {
    const proxyReq = http.get(url, { timeout: 3000 }, (camRes) => {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'no-cache');
      camRes.pipe(res);
    });
    proxyReq.on('error', (err) => res.status(502).json({ ok: false, error: err.message }));
  } catch (err) {
    res.status(502).json({ ok: false, error: err.message });
  }
});

// Camera IP info
app.get('/api/camera-ip', (req, res) => res.json({ ip: CAMERA_IP }));

// ─── Start ────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`FZ300 Remote running at http://localhost:${PORT}`);
  console.log(`Camera IP: ${CAMERA_IP}`);
  console.log(`Override with: CAMERA_IP=192.168.x.x node server.js`);
});
