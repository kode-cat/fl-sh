# FL-SH: Offline P2P File Sharing PWA

A Progressive Web App (PWA) for secure peer-to-peer file sharing that works offline.

## Features

- **Offline Capability**: Works without an internet connection after installation
- **P2P File Sharing**: Direct file transfers between peers using WebRTC
- **No Server Storage**: Files are transferred directly between browsers, not stored on any server
- **Password Protection**: Optional password protection for connections
- **PWA Support**: Install on desktop or mobile for offline use
- **Local Network**: Works on local networks even when internet is unavailable

## How to Use

1. **Install the PWA**:
   - Visit the website in a modern browser
   - Click the "Install App" button or use the browser's install option
   - Once installed, the app can be used offline

2. **Share Files**:
   - Enter a unique Peer ID or generate a random one
   - Share your Peer ID with the person you want to connect with
   - Enter their Peer ID to connect
   - Once connected, select files to share

3. **Offline Usage**:
   - The app works offline after installation
   - Both peers must be on the same local network when offline
   - All core functionality remains available without internet

## Technical Details

- Built with vanilla JavaScript
- Uses PeerJS for WebRTC connections
- Tailwind CSS for styling
- Service Worker for offline caching
- Web App Manifest for PWA installation

## Development

To set up for development:

1. Clone the repository
2. Generate PWA icons and place them in the `/icons` directory
3. Test the PWA functionality using a local server
4. Use Lighthouse to audit PWA compliance

## License

See the LICENSE file for details.

