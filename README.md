# GestureFlow - Hand Gesture Recognition

A modern web application that uses your webcam to detect hand gestures (numbers 0-10) and displays them in real-time with a unique cyberpunk holographic visual style.

## 🎯 Features

### Core Functionality
- **Two-Hand Detection** - Track both hands simultaneously for numbers 0-10
- **Real-Time Recognition** - Process video frames at 30+ FPS using MediaPipe Hands
- **Finger Counting Algorithm** - Accurately detect extended fingers on both hands

### Visual Design
- **Cyberpunk Holographic Theme** - Dark background with neon cyan/magenta accents
- **Split Screen Layout** - Video feed on left, gesture history on right
- **Floating Number Display** - Large detected number at center top of video
- **Dynamic Particle Background** - 150 particles that react to hand movements
- **Neon Hand Landmarks** - Glowing cyan (right hand) / magenta (left hand) tracking lines

### User Experience
- **Gesture History Log** - Last 10 detected gestures with timestamps
- **Confidence Indicator** - Visual bar showing detection confidence percentage
- **Sound Effects** - Unique tone for each number (0-10)
- **Full-Screen Mode** - Immersive experience (press 'F' key or click button)
- **Camera Switching** - Toggle between front/back cameras
- **Export History** - Download gesture history as JSON file

### Accessibility
- **Responsive Design** - Works on desktop and mobile devices
- **Keyboard Shortcuts** - 'F' for fullscreen, 'Escape' to exit
- **Visual Feedback** - Clear UI for all interactions

## 🎨 Visual Style

### Color Palette
- **Background**: Deep Space Black (`#0A0A0F`)
- **Right Hand**: Electric Cyan (`#00FFFF`)
- **Left Hand**: Photon Magenta (`#FF33CC`)
- **Accent**: Ion Yellow (`#FFF700`)

### Design Features
- Glassmorphism panels with backdrop blur
- Neon text glow effects
- Animated particle system
- Pulsing number display

## 📁 File Structure

```
GestureFlow/
├── index.html          # Main HTML structure
├── style.css           # Cyberpunk holographic styles
├── camera.js           # Camera handling and permissions
├── gesture.js          # MediaPipe gesture recognition
├── audio.js            # Sound effects management
├── history.js          # Gesture history (last 10 entries)
├── fullscreen.js       # Full-screen mode handler
├── particles.js        # Dynamic particle system
├── confidence.js       # Confidence indicator
├── main.js             # Application integration
└── README.md           # This file
```

## 🚀 How It Works

1. **Camera Access** - User grants permission to access webcam
2. **MediaPipe Hands** - Real-time hand detection using Google's MediaPipe framework
3. **Finger Counting** - Algorithm counts extended fingers (0-5 per hand)
4. **Total Calculation** - Combines both hands for 0-10 range
5. **Display & Sound** - Shows number and plays corresponding tone

## 🛠️ Technology Stack

| Component | Technology |
|-----------|------------|
| **Hand Tracking** | MediaPipe Hands (Google) |
| **Camera Access** | WebRTC (getUserMedia) |
| **Styling** | CSS3 with Glassmorphism |
| **Audio** | Web Audio API |
| **Storage** | LocalStorage (for history) |

## 📱 Browser Support

- ✅ Chrome (Desktop & Mobile)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ⚠️ Safari iOS (requires user interaction for fullscreen)

## 🎮 Controls

| Action | Method |
|--------|--------|
| **Toggle Fullscreen** | Button or 'F' key |
| **Switch Camera** | Button (front/back) |
| **Toggle Sound** | Button (ON/OFF) |
| **Clear History** | Button |
| **Export History** | Button (downloads JSON) |

## 📊 Gesture Detection Logic

### Finger Detection
- **Thumb**: Extended if tip.x < IP.x (right hand) or tip.x > IP.x (left hand)
- **Other Fingers**: Extended if tip.y < pip.y (tip above middle joint)

### Number Mapping
- Count = Number of extended fingers (0-5 per hand)
- Total = Left hand + Right hand (0-10)

## 🔧 Configuration

### MediaPipe Settings (in gesture.js)
```javascript
maxNumHands: 2,           // Track up to 2 hands
modelComplexity: 1,       // 0=faster, 1=balanced, 2=accurate
minDetectionConfidence: 0.7,
minTrackingConfidence: 0.5
```

### Particle System Settings (in particles.js)
```javascript
particleCount: 150,       // Number of particles
attractionForce: 0.8,     // Strength of hand attraction
damping: 0.95,            // Velocity damping
```

## 🚨 Troubleshooting

### Camera Not Working
1. Check browser permissions for camera access
2. Ensure no other application is using the camera
3. Try switching cameras using the "Switch Camera" button

### Gestures Not Detected
1. Ensure good lighting on your hands
2. Keep hands within the camera frame
3. Show fingers clearly (not partially hidden)

### Performance Issues
1. Close other browser tabs
2. Reduce browser zoom level
3. Ensure WebGL is enabled in browser settings

## 📝 Notes

- Camera access requires HTTPS (or localhost for development)
- The app requests camera permission on page load
- Gesture history is saved to localStorage and persists across sessions
- Sound must be enabled by clicking anywhere on the page (browser requirement)

## 🎯 Future Enhancements

- [ ] Add more gestures (thumbs up, peace sign, etc.)
- [ ] Multi-language support
- [ ] Gesture recording and playback
- [ ] Integration with other web applications
- [ ] Machine learning model customization

---

## License

MIT License - Free to use and modify.

## Credits

- **MediaPipe Hands** by Google for hand tracking
- **Orbitron & Rajdhani fonts** by Google Fonts
- **Inspired by** cyberpunk and holographic design aesthetics
