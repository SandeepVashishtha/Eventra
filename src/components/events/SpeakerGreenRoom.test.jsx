import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import SpeakerGreenRoom, { ProtectedGreenRoom } from "./SpeakerGreenRoom";
import { ROLES } from "../../config/roles";

// Mock dependencies
vi.mock("lucide-react", () => ({
  Mic: () => <span>Mic</span>,
  MicOff: () => <span>MicOff</span>,
  Video: () => <span>Video</span>,
  VideoOff: () => <span>VideoOff</span>,
  Users: () => <span>Users</span>,
  MessageSquare: () => <span>MessageSquare</span>,
  Send: () => <span>Send</span>,
  Play: () => <span>Play</span>,
  StopCircle: () => <span>StopCircle</span>,
  User: () => <span>User</span>,
  Crown: () => <span>Crown</span>,
  Camera: () => <span>Camera</span>,
  CameraOff: () => <span>CameraOff</span>,
  Loader2: () => <span>Loader2</span>
}));

vi.mock("./useGreenRoomWebRTC", () => ({
  default: () => ({
    peerId: "test-peer",
    connectionStatus: "connected",
    activePeers: ["peer1", "peer2"],
    isAudioActive: true,
    isVideoActive: true,
    localStream: null,
    remoteStreams: {},
    isMuted: false,
    isCameraOff: false,
    chatMessages: [
      { sender: "peer1", message: "Hello", timestamp: new Date().toISOString(), isSystem: false },
      { sender: "test-peer", message: "Hi there", timestamp: new Date().toISOString(), isSystem: false }
    ],
    speakersInRoom: [
      { peerId: "peer1", user: { firstName: "Alice" }, isOrganizer: false },
      { peerId: "peer2", user: { firstName: "Bob" }, isOrganizer: true }
    ],
    isOrganizer: false,
    peerConnectionStats: {},
    startSession: vi.fn(),
    cleanup: vi.fn(),
    initLocalStream: vi.fn(),
    toggleAudio: vi.fn(),
    toggleVideo: vi.fn(),
    sendChatMessage: vi.fn(),
    requestStageTransition: vi.fn(),
    approveStageTransition: vi.fn(),
    getVideoRef: vi.fn()
  })
}));

vi.mock("../../context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user", firstName: "Test", username: "testuser", roles: [ROLES.SPEAKER] }
  })
}));

vi.mock("../../components/auth/Guard", () => ({
  default: ({ children }) => children
}));

// Mock navigator.mediaDevices
Object.defineProperty(global.navigator, "mediaDevices", {
  value: {
    getUserMedia: vi.fn().mockResolvedValue({
      getTracks: () => [],
      addTrack: vi.fn(),
      removeTrack: vi.fn()
    })
  },
  configurable: true
});

// Mock BroadcastChannel
class MockBroadcastChannel {
  constructor(name) {
    this.name = name;
    this.onmessage = null;
    this.onclose = null;
  }
  
  postMessage(message) {
    if (this.onmessage) {
      this.onmessage({ data: message });
    }
  }
  
  close() {
    if (this.onclose) {
      this.onclose();
    }
  }
}

global.BroadcastChannel = MockBroadcastChannel;

// Mock RTCPeerConnection
class MockRTCPeerConnection {
  constructor(config) {
    this.config = config;
    this.iceConnectionState = "connected";
    this.connectionState = "connected";
    this.onicecandidate = null;
    this.onconnectionstatechange = null;
    this.oniceconnectionstatechange = null;
    this.ontrack = null;
    this.ondatachannel = null;
    this.localDescription = null;
    this.remoteDescription = null;
  }
  
  addTrack(track, stream) {}
  
  createDataChannel(label, options) {
    return {
      readyState: "open",
      onopen: null,
      onclose: null,
      onmessage: null,
      send: vi.fn(),
      close: vi.fn()
    };
  }
  
  createOffer() {
    return Promise.resolve({ type: "offer", sdp: "test-offer" });
  }
  
  createAnswer() {
    return Promise.resolve({ type: "answer", sdp: "test-answer" });
  }
  
  setLocalDescription(desc) {
    this.localDescription = desc;
    return Promise.resolve();
  }
  
  setRemoteDescription(desc) {
    this.remoteDescription = desc;
    return Promise.resolve();
  }
  
  addIceCandidate(candidate) {
    return Promise.resolve();
  }
  
  close() {}
}

global.RTCPeerConnection = MockRTCPeerConnection;
global.RTCSessionDescription = class {
  constructor(desc) {
    this.type = desc.type;
    this.sdp = desc.sdp;
  }
};

global.RTCIceCandidate = class {
  constructor(candidate) {
    Object.assign(this, candidate);
  }
};

// Mock HTMLVideoElement
Object.defineProperty(global.HTMLVideoElement.prototype, "play", {
  value: vi.fn().mockResolvedValue(undefined),
  configurable: true
});

describe("SpeakerGreenRoom", () => {
  let consoleError;

  beforeEach(() => {
    consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    consoleError.mockRestore();
  });

  it("renders the Speaker Green Room component", async () => {
    render(
      <MemoryRouter>
        <SpeakerGreenRoom eventId="test-event" roomId="test-room" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Speaker Green Room/i)).toBeInTheDocument();
      expect(screen.getByText(/Room: test-room/i)).toBeInTheDocument();
    });
  });

  it("displays chat messages", async () => {
    render(
      <MemoryRouter>
        <SpeakerGreenRoom eventId="test-event" roomId="test-room" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Hello")).toBeInTheDocument();
      expect(screen.getByText("Hi there")).toBeInTheDocument();
    });
  });

  it("displays participants", async () => {
    render(
      <MemoryRouter>
        <SpeakerGreenRoom eventId="test-event" roomId="test-room" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
    });
  });

  it("shows connection status", async () => {
    render(
      <MemoryRouter>
        <SpeakerGreenRoom eventId="test-event" roomId="test-room" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/2 speakers online/i)).toBeInTheDocument();
    });
  });

  it("has chat input functionality", async () => {
    render(
      <MemoryRouter>
        <SpeakerGreenRoom eventId="test-event" roomId="test-room" />
      </MemoryRouter>
    );

    await waitFor(() => {
      const input = screen.getByPlaceholderText(/Type a message.../i);
      expect(input).toBeInTheDocument();
      
      fireEvent.change(input, { target: { value: "Test message" } });
      expect(input.value).toBe("Test message");
    });
  });

  it("displays microphone and camera controls", async () => {
    render(
      <MemoryRouter>
        <SpeakerGreenRoom eventId="test-event" roomId="test-room" />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTitle(/Mute Microphone/i)).toBeInTheDocument();
      expect(screen.getByTitle(/Turn Off Camera/i)).toBeInTheDocument();
    });
  });

  it("renders ProtectedGreenRoom with role protection", async () => {
    render(
      <MemoryRouter>
        <Routes>
          <Route path="/events/:eventId/green-room" element={<ProtectedGreenRoom />} />
        </Routes>
      </MemoryRouter>
    );

    // The component should render without errors
    await waitFor(() => {
      expect(screen.getByText(/Speaker Green Room/i)).toBeInTheDocument();
    });
  });
});

describe("SpeakerGreenRoom Tests - Roles Configuration", () => {
  it("correctly imports ROLES with SPEAKER role", () => {
    expect(ROLES.SPEAKER).toBe("SPEAKER");
  });

  it("SPEAKER role is defined in ROLES object", () => {
    expect(ROLES).toHaveProperty("SPEAKER");
  });
});

describe("SpeakerGreenRoom Tests - Permissions", () => {
  it("imports PERMISSIONS with Green Room permissions", () => {
    const { PERMISSIONS } = require("../../config/roles");
    expect(PERMISSIONS.ACCESS_GREEN_ROOM).toBe("ACCESS_GREEN_ROOM");
    expect(PERMISSIONS.MANAGE_GREEN_ROOM).toBe("MANAGE_GREEN_ROOM");
  });
});