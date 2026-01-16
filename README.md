# FL-SH : Secure E2EE P2P File Transfer
A high-performance, browser-based peer-to-peer file sharing application built with PeerJS and the Web Crypto API. This tool enables users to transfer files directly between browsers with End-to-End Encryption (E2EE), ensuring that no intermediary—not even the signaling server—can access the data.

**✨ Key Features**
 * Direct P2P Transfer: Powered by WebRTC (via PeerJS) for low-latency, serverless data transfer.
 * End-to-End Encryption: Implements AES-256-GCM to ensure confidentiality and data integrity.
 * Zero-Knowledge Handshake: A secure challenge-response mechanism authenticates peers without ever transmitting the actual password.
 * No Persistence: Data exists only in memory during transit; no files are stored on any server.
 * Responsive UI: A clean, modern interface built with Tailwind CSS, featuring a real-time terminal-style log.
🛡️ Security Architecture
The application implements a multi-layered security protocol:
 * Key Derivation: Uses PBKDF2 with 100,000 iterations and a unique 16-byte salt to derive a 256-bit AES key from the user's password.
 * Handshake Protocol: - The initiator sends an encrypted "magic string" challenge.
   * The receiver must decrypt this challenge using the shared password.
   * If the decrypted string matches, the secure session is established.
 * Encrypted Payload: Each file chunk is encrypted with a unique Initialization Vector (IV), preventing pattern recognition attacks.
 * Data Integrity: The GCM (Galois/Counter Mode) provides "Authenticated Encryption," automatically detecting if any part of the file was tampered with during transit.

**🚀 Getting Started**
Prerequisites
 * A modern web browser (Chrome, Firefox, Edge, or Safari).
 * HTTPS Environment: The Web Crypto API is disabled by browsers on insecure http origins (except localhost).
Local Setup
 * Clone the repository:
   ```bash
   git clone https://github.com/kode-cat/fl-sh.git
   ```

 * Open index.html in your browser:
   * On Windows: start index.html
   * On Mac: open index.html
 * Or visit [https://fl-sh.pages.dev](https://fl-sh.pages.dev).

Usage
 * Host: Set a unique Peer ID and click "Initialize".
 * Connect: The sender enters the Host's ID and a pre-agreed Shared Password.
 * Verify: The host enters the same password to accept the connection.
 * Transfer: Once the status turns green, drag and drop files to begin the encrypted transfer.
🛠️ Built With
 * PeerJS - WebRTC wrapper for P2P communication.
 * Web Crypto API - Native browser-grade encryption.
 * Tailwind CSS - Utility-first CSS framework.

**📜 License**

This project is licensed under the MIT License - see the LICENSE file for details.
> Note: This tool is intended for private, direct file transfers. Security is dependent on the strength of the shared password used during the handshake.
