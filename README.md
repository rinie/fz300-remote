# FZ300 Remote

Node.js web app for remote control of the Panasonic Lumix FZ300 (and compatible Lumix cameras) over WiFi.

## How it works

The FZ300 runs a small HTTP server at `192.168.54.1` when it acts as a WiFi access point.
All control commands are plain HTTP GET requests to `/cam.cgi` with query parameters.
This app wraps those commands in a REST API and serves a mobile-friendly web UI.

## Setup

```bash
npm install
```

### Connect to the camera

1. On the FZ300: **Menu → WiFi → WiFi Function → Remote Shooting & View**
2. On your PC/phone: join the camera's WiFi network (SSID shown on camera screen)
3. Camera IP will be `192.168.54.1`

### Run the server

```bash
# Default camera IP (192.168.54.1 — camera hotspot mode)
node server.js

# Custom IP (if camera is joined to your home network)
CAMERA_IP=192.168.1.42 node server.js

# Custom port
PORT=8080 node server.js
```

Open `http://localhost:3000` in your browser.

## Usage

1. Click **Connect** first — this authenticates with the camera
2. Click **Record mode** to enter live-view/shooting mode
3. Use the Capture, Zoom, Focus controls as needed

## File structure

```
server.js          Express server + REST API routes
cameraCommands.js  All camera URL command definitions (edit this to add/change commands)
public/index.html  Web UI
```

## API endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/connect | Authenticate with camera |
| GET | /api/state | Get camera state |
| GET | /api/capability | Get supported features |
| GET | /api/allmenu | Get all menu items |
| GET | /api/curmenu | Get current menu |
| GET | /api/lens | Get lens info |
| POST | /api/mode/rec | Enter record/liveview mode |
| POST | /api/mode/play | Enter playback mode |
| POST | /api/capture | Take a photo |
| POST | /api/capture/touch | Take photo with touch AF `{x,y}` |
| POST | /api/af/on | AF half-press |
| POST | /api/af/off | AF release |
| POST | /api/video/start | Start video recording |
| POST | /api/video/stop | Stop video recording |
| POST | /api/zoom/tele/slow | Zoom in slow |
| POST | /api/zoom/tele/fast | Zoom in fast |
| POST | /api/zoom/wide/slow | Zoom out slow |
| POST | /api/zoom/wide/fast | Zoom out fast |
| POST | /api/zoom/stop | Stop zoom |
| POST | /api/focus/far/slow | Focus far slow |
| POST | /api/focus/far/fast | Focus far fast |
| POST | /api/focus/near/slow | Focus near slow |
| POST | /api/focus/near/fast | Focus near fast |
| POST | /api/focus/stop | Stop focus |
| GET/POST | /api/setting/iso | Get/set ISO |
| GET/POST | /api/setting/shutter | Get/set shutter speed |
| GET/POST | /api/setting/aperture | Get/set aperture |
| GET/POST | /api/setting/expcomp | Get/set exposure comp |
| GET/POST | /api/setting/wb | Get/set white balance |
| GET/POST | /api/setting/afmode | Get/set AF mode |
| GET/POST | /api/setting/quality | Get/set image quality |
| POST | /api/stream/start | Start MJPEG stream `{port}` |
| POST | /api/stream/stop | Stop stream |
| GET | /api/liveview | Proxied live view JPEG |

## Notes

- The camera WiFi times out after ~3 minutes of inactivity; reconnect if needed
- Some settings (aperture) only work in Manual or Aperture Priority mode
- Zoom/focus controls are "hold" commands — send stop when releasing the button
- The `cameraCommands.js` file is intentionally separate so you can extend it without touching server logic
