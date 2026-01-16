# 🔒 Secure P2P File Sharing (E2EE) Manual

### 🛡️ Security Overview
This application utilizes **End-to-End Encryption (E2EE)** to ensure your files remain private. 

* **Encryption Standard:** AES-256-GCM (Authenticated Encryption).
* **Key Derivation:** PBKDF2 with 100,000 iterations and a unique salt.
* **Zero-Knowledge:** The signaling server (PeerJS) never has access to your password or file data.
* **Authentication:** A secure challenge-response handshake verifies passwords without ever sending them over the network.

---

### 🚀 Usage Instructions

#### 1. Start a Session
- Enter a unique **ID** or generate a random one.
- Click **Initialize Secure Session**.

#### 2. Connect Securely
- **The Initiator:** Enter the recipient's Peer ID and a **Shared Password**. Click **Connect**.
- **The Receiver:** When prompted, enter the **same Shared Password**. 
- Once verified, the status will turn **Green** and the file upload area will appear.

#### 3. Send and Receive
- **Sending:** Drag or select files into the upload box. They are encrypted in real-time before being sent.
- **Receiving:** Files will automatically decrypt and appear in your logs as clickable download links.

---

### ⚠️ Critical Notes
* **HTTPS:** This app requires a secure context (`https://` or `localhost`) to access the Web Crypto API.
* **Password Strength:** Your security is entirely dependent on the complexity of your shared password.
* **File Size:** Recommended for files up to **500MB** to avoid browser memory issues during encryption.
