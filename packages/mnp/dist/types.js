/**
 * IPV7 Protocol Types
 *
 * THEORETICAL FRAMEWORK - This is an AI-generated conceptual protocol
 * that extends beyond IPv6 with mesh-native, cryptographically-secure,
 * geolocation-aware addressing for P2P networks.
 *
 * IPV7 = "1 better than IPv6":
 * - 256-bit addresses (vs IPv6's 128-bit)
 * - Built-in cryptographic identity
 * - Native geolocation for proximity routing
 * - Mesh-first design for P2P networks
 * - Multi-path routing support
 */
/**
 * Address flags for special routing behavior
 */
export var AddressFlags;
(function (AddressFlags) {
    /** Standard unicast address */
    AddressFlags[AddressFlags["UNICAST"] = 0] = "UNICAST";
    /** Multicast to group */
    AddressFlags[AddressFlags["MULTICAST"] = 1] = "MULTICAST";
    /** Anycast - route to nearest */
    AddressFlags[AddressFlags["ANYCAST"] = 2] = "ANYCAST";
    /** Broadcast to all reachable nodes */
    AddressFlags[AddressFlags["BROADCAST"] = 3] = "BROADCAST";
    /** Reserved for future use */
    AddressFlags[AddressFlags["RESERVED"] = 15] = "RESERVED";
})(AddressFlags || (AddressFlags = {}));
/**
 * IPV7 Packet Types
 */
export var PacketType;
(function (PacketType) {
    /** Standard data packet */
    PacketType[PacketType["DATA"] = 1] = "DATA";
    /** Control/signaling packet */
    PacketType[PacketType["CONTROL"] = 2] = "CONTROL";
    /** Route discovery request */
    PacketType[PacketType["ROUTE_REQUEST"] = 3] = "ROUTE_REQUEST";
    /** Route discovery reply */
    PacketType[PacketType["ROUTE_REPLY"] = 4] = "ROUTE_REPLY";
    /** Peer discovery announcement */
    PacketType[PacketType["ANNOUNCE"] = 5] = "ANNOUNCE";
    /** Keep-alive/heartbeat */
    PacketType[PacketType["HEARTBEAT"] = 6] = "HEARTBEAT";
    /** Error/rejection */
    PacketType[PacketType["ERROR"] = 7] = "ERROR";
    /** Acknowledgment */
    PacketType[PacketType["ACK"] = 8] = "ACK";
})(PacketType || (PacketType = {}));
export var ExtensionType;
(function (ExtensionType) {
    /** Routing hints */
    ExtensionType[ExtensionType["ROUTING"] = 1] = "ROUTING";
    /** Fragmentation info */
    ExtensionType[ExtensionType["FRAGMENT"] = 2] = "FRAGMENT";
    /** Encryption metadata */
    ExtensionType[ExtensionType["ENCRYPTION"] = 3] = "ENCRYPTION";
    /** Quality of service */
    ExtensionType[ExtensionType["QOS"] = 4] = "QOS";
    /** Source routing path */
    ExtensionType[ExtensionType["SOURCE_ROUTE"] = 5] = "SOURCE_ROUTE";
})(ExtensionType || (ExtensionType = {}));
export var TransportType;
(function (TransportType) {
    /** Direct WiFi (ad-hoc or mesh) */
    TransportType["WIFI_DIRECT"] = "wifi-direct";
    /** Standard WiFi through router */
    TransportType["WIFI"] = "wifi";
    /** Ethernet LAN */
    TransportType["ETHERNET"] = "ethernet";
    /** WebRTC for browser compatibility */
    TransportType["WEBRTC"] = "webrtc";
    /** TCP socket */
    TransportType["TCP"] = "tcp";
    /** UDP socket */
    TransportType["UDP"] = "udp";
    /** LoRa radio (long range) */
    TransportType["LORA"] = "lora";
    /** Bluetooth */
    TransportType["BLUETOOTH"] = "bluetooth";
})(TransportType || (TransportType = {}));
//# sourceMappingURL=types.js.map