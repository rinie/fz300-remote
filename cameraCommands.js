'use strict';

// Panasonic Lumix FZ300 WiFi HTTP API command definitions
// Camera IP when connected to camera's own hotspot: 192.168.54.1
// Camera IP when camera is joined to your home WiFi: check your router

const BASE = (ip) => `http://${ip}/cam.cgi`;

const COMMANDS = {

  // ─── Session ───────────────────────────────────────────────────────────────

  // Must be called first to authenticate. value = UUID, value2 = device name.
  // Use any UUID; the camera remembers authorised devices.
  requestAccess: (ip, uuid = '4D454930-0100-1000-8000-F02765BACACE', deviceName = 'FZ300Remote') =>
    `${BASE(ip)}?mode=accctrl&type=req_acc&value=${encodeURIComponent(uuid)}&value2=${encodeURIComponent(deviceName)}`,

  // ─── State & Info ──────────────────────────────────────────────────────────

  getState:      (ip) => `${BASE(ip)}?mode=getstate`,
  getCapability: (ip) => `${BASE(ip)}?mode=getinfo&type=capability`,
  getAllMenu:     (ip) => `${BASE(ip)}?mode=getinfo&type=allmenu`,
  getCurMenu:    (ip) => `${BASE(ip)}?mode=getinfo&type=curmenu`,
  getLensInfo:   (ip) => `${BASE(ip)}?mode=getinfo&type=lens`,

  // ─── Mode switching ────────────────────────────────────────────────────────

  // Enter record/live-view mode (required before capture/zoom/etc.)
  recMode:  (ip) => `${BASE(ip)}?mode=camcmd&value=recmode`,
  // Enter playback mode
  playMode: (ip) => `${BASE(ip)}?mode=camcmd&value=playmode`,

  // ─── Capture ───────────────────────────────────────────────────────────────

  // Trigger shutter (must be in recMode first)
  capture: (ip) => `${BASE(ip)}?mode=camcmd&value=capture`,

  // Touch-to-capture with AF on specific coordinate (0–1000 / 0–1000)
  touchCapture: (ip, x = 500, y = 500) =>
    `${BASE(ip)}?mode=camctrl&type=touchcapt&value=${x}/${y}&value2=on`,
  touchCaptureOff: (ip) =>
    `${BASE(ip)}?mode=camctrl&type=touchcapt&value=0/0&value2=off`,

  // AF half-press (focus lock)
  afOn:  (ip) => `${BASE(ip)}?mode=camcmd&value=af_push`,
  afOff: (ip) => `${BASE(ip)}?mode=camcmd&value=af_release`,

  // ─── Video ─────────────────────────────────────────────────────────────────

  videoStart: (ip) => `${BASE(ip)}?mode=camcmd&value=video_recstart`,
  videoStop:  (ip) => `${BASE(ip)}?mode=camcmd&value=video_recstop`,

  // ─── Zoom ──────────────────────────────────────────────────────────────────

  zoomTeleSlow:  (ip) => `${BASE(ip)}?mode=camcmd&value=tele-normal`,
  zoomTeleFast:  (ip) => `${BASE(ip)}?mode=camcmd&value=tele-fast`,
  zoomWideSlow:  (ip) => `${BASE(ip)}?mode=camcmd&value=wide-normal`,
  zoomWideFast:  (ip) => `${BASE(ip)}?mode=camcmd&value=wide-fast`,
  zoomStop:      (ip) => `${BASE(ip)}?mode=camcmd&value=zoomstop`,

  // ─── Focus ─────────────────────────────────────────────────────────────────

  focusFarSlow:  (ip) => `${BASE(ip)}?mode=camcmd&value=stepzoom_tele_slow`,
  focusFarFast:  (ip) => `${BASE(ip)}?mode=camcmd&value=stepzoom_tele_fast`,
  focusNearSlow: (ip) => `${BASE(ip)}?mode=camcmd&value=stepzoom_wide_slow`,
  focusNearFast: (ip) => `${BASE(ip)}?mode=camcmd&value=stepzoom_wide_fast`,
  focusStop:     (ip) => `${BASE(ip)}?mode=camcmd&value=focusstop`,

  // Touch-to-focus on coordinate (0–1000 / 0–1000)
  touchFocusStart:    (ip, x = 500, y = 500) =>
    `${BASE(ip)}?mode=camctrl&type=touch_trace&value=start&value2=${x}/${y}`,
  touchFocusContinue: (ip, x = 500, y = 500) =>
    `${BASE(ip)}?mode=camctrl&type=touch_trace&value=continue&value2=${x}/${y}`,

  // ─── Exposure & Settings ───────────────────────────────────────────────────

  setISO: (ip, value) =>
    `${BASE(ip)}?mode=setsetting&type=iso&value=${encodeURIComponent(value)}`,
  getISO: (ip) =>
    `${BASE(ip)}?mode=getsetting&type=iso`,

  setShutterSpeed: (ip, value) =>
    `${BASE(ip)}?mode=setsetting&type=shtrspeed&value=${encodeURIComponent(value)}`,
  getShutterSpeed: (ip) =>
    `${BASE(ip)}?mode=getsetting&type=shtrspeed`,

  setAperture: (ip, value) =>
    `${BASE(ip)}?mode=setsetting&type=focal&value=${encodeURIComponent(value)}`,
  getAperture: (ip) =>
    `${BASE(ip)}?mode=getsetting&type=focal`,

  setExposureComp: (ip, value) =>
    `${BASE(ip)}?mode=setsetting&type=expcomp&value=${encodeURIComponent(value)}`,
  getExposureComp: (ip) =>
    `${BASE(ip)}?mode=getsetting&type=expcomp`,

  setWhiteBalance: (ip, value) =>
    `${BASE(ip)}?mode=setsetting&type=wb&value=${encodeURIComponent(value)}`,
  getWhiteBalance: (ip) =>
    `${BASE(ip)}?mode=getsetting&type=wb`,

  setAFMode: (ip, value) =>
    `${BASE(ip)}?mode=setsetting&type=afmode&value=${encodeURIComponent(value)}`,
  getAFMode: (ip) =>
    `${BASE(ip)}?mode=getsetting&type=afmode`,

  setQuality: (ip, value) =>
    `${BASE(ip)}?mode=setsetting&type=quality&value=${encodeURIComponent(value)}`,
  getQuality: (ip) =>
    `${BASE(ip)}?mode=getsetting&type=quality`,

  // ─── Live view / streaming ─────────────────────────────────────────────────

  // Camera streams MJPEG/RTP to the given UDP port on the client
  startStream: (ip, port = 49152) =>
    `${BASE(ip)}?mode=startstream&value=${port}`,
  stopStream: (ip) =>
    `${BASE(ip)}?mode=stopstream`,

  // Live view image (JPEG snapshot, poll this for a makeshift live view)
  liveViewJpeg: (ip) =>
    `http://${ip}/cam.cgi?mode=getimage&value=liveview`,

  // ─── Known setting values (for reference) ─────────────────────────────────
};

const SETTING_VALUES = {
  iso: ['auto', '200', '400', '800', '1600', '3200', '6400', '12800', '25600'],
  wb:  ['auto', 'daylight', 'cloudy', 'shade', 'flash', 'fluorescent1',
        'fluorescent2', 'fluorescent3', 'incandescent', 'manual1'],
  afmode: ['afs', 'afc', 'mf', 'facedetection'],
  quality: ['fin', 'std', 'raw', 'rawfine', 'rawstd'],
  // Shutter speed examples (camera accepts many values; see capability response)
  shutterSpeed: ['b', '1/4000', '1/2000', '1/1000', '1/500', '1/250',
                 '1/125', '1/60', '1/30', '1/15', '1/8', '1/4', '1/2', '1', '2', '4'],
  // Exposure comp steps
  expcomp: ['-3', '-2.66', '-2.33', '-2', '-1.66', '-1.33', '-1',
            '-0.66', '-0.33', '0', '0.33', '0.66', '1', '1.33', '1.66', '2',
            '2.33', '2.66', '3'],
};

module.exports = { COMMANDS, SETTING_VALUES };
