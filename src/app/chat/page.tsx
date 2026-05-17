"use client";

import { useEffect, useRef, useState, type ChangeEvent, type KeyboardEvent } from "react";
import { io, Socket } from "socket.io-client";

type ChatMessage = {
    name: string;
    text?: string;
    image?: string;
    time: string;
};

type Entry =
    | { kind: "chat"; data: ChatMessage }
    | { kind: "system"; text: string };

export default function ChatPage() {
    const socketRef = useRef<Socket | null>(null);
    const messagesRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);

    const [joined, setJoined] = useState(false);
    const [myName, setMyName] = useState("");
    const [nameInput, setNameInput] = useState("");
    const [entries, setEntries] = useState<Entry[]>([]);
    const [users, setUsers] = useState<string[]>([]);
    const [text, setText] = useState("");
    const [pastedImage, setPastedImage] = useState<string | null>(null);
    const [filter, setFilter] = useState<"all" | "images">("all");
    const [modalImg, setModalImg] = useState<string | null>(null);

    useEffect(() => {
        const url = process.env.NEXT_PUBLIC_API_URL || undefined;
        const socket = url ? io(url, { transports: ["websocket", "polling"] }) : io({ transports: ["websocket", "polling"] });
        socketRef.current = socket;

        socket.on("chat", (data: ChatMessage) => {
            setEntries((prev) => [...prev, { kind: "chat", data }]);
        });
        socket.on("system", (msg: string) => {
            setEntries((prev) => [...prev, { kind: "system", text: msg }]);
        });
        socket.on("users", (list: string[]) => {
            setUsers(list);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    useEffect(() => {
        if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
    }, [entries]);

    useEffect(() => {
        const handlePaste = (e: ClipboardEvent) => {
            if (!joined) return;
            const items = e.clipboardData?.items;
            if (!items) return;
            for (const item of Array.from(items)) {
                if (item.type.startsWith("image/")) {
                    e.preventDefault();
                    const file = item.getAsFile();
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        if (typeof ev.target?.result === "string") {
                            setPastedImage(ev.target.result);
                        }
                    };
                    reader.readAsDataURL(file);
                    break;
                }
            }
        };
        document.addEventListener("paste", handlePaste);
        return () => document.removeEventListener("paste", handlePaste);
    }, [joined]);

    const join = () => {
        const name = nameInput.trim();
        if (!name) return;
        setMyName(name);
        socketRef.current?.emit("join", name);
        setJoined(true);
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const send = () => {
        const trimmed = text.trim();
        if (!trimmed && !pastedImage) return;
        socketRef.current?.emit("chat", { text: trimmed, image: pastedImage });
        setText("");
        setPastedImage(null);
        if (inputRef.current) {
            inputRef.current.style.height = "auto";
        }
    };

    const onTextKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    const onTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
        const el = e.target;
        el.style.height = "auto";
        el.style.height = Math.min(el.scrollHeight, 100) + "px";
    };

    const captureScreen = async () => {
        try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const track = stream.getVideoTracks()[0];
            // ImageCapture has incomplete typings in some envs
            const ImageCaptureCtor = (window as unknown as { ImageCapture?: new (t: MediaStreamTrack) => { grabFrame: () => Promise<ImageBitmap> } }).ImageCapture;
            if (!ImageCaptureCtor) {
                track.stop();
                return;
            }
            const imageCapture = new ImageCaptureCtor(track);
            const bitmap = await imageCapture.grabFrame();
            track.stop();
            const canvas = document.createElement("canvas");
            canvas.width = bitmap.width;
            canvas.height = bitmap.height;
            const ctx = canvas.getContext("2d");
            if (!ctx) return;
            ctx.drawImage(bitmap, 0, 0);
            const dataUrl = canvas.toDataURL("image/png", 0.8);
            socketRef.current?.emit("screen-capture", { image: dataUrl });
        } catch (err) {
            const e = err as { name?: string };
            if (e?.name !== "NotAllowedError") {
                console.error("Screen capture error:", err);
            }
        }
    };

    const visible = entries.filter((e) => {
        if (filter === "all") return true;
        return e.kind === "chat" && !!e.data.image;
    });

    return (
        <div style={styles.wrap}>
            {!joined && (
                <div style={styles.loginScreen}>
                    <div style={styles.loginBox}>
                        <h1 style={styles.loginTitle}>{"// WorkChat Console"}</h1>
                        <p style={styles.loginHint}>{"// Enter your handle to connect"}</p>
                        <input
                            style={styles.loginInput}
                            type="text"
                            placeholder="username_"
                            maxLength={20}
                            autoComplete="off"
                            value={nameInput}
                            onChange={(e) => setNameInput(e.target.value)}
                            onKeyDown={(e) => { if (e.key === "Enter") join(); }}
                        />
                        <br />
                        <button style={styles.loginBtn} onClick={join}>connect()</button>
                    </div>
                </div>
            )}

            {joined && (
                <div style={styles.chatScreen}>
                    <div style={styles.tabBar}>
                        <div style={{ ...styles.tab, ...styles.tabActive }}>Console</div>
                        <div style={styles.userList}>
                            <span style={{ color: "#5a5a5a" }}>connected:</span>{" "}
                            {users.map((u, i) => (
                                <span key={`${u}-${i}`} style={{ color: u === myName ? "#dcdcaa" : "#4ec9b0" }}>
                                    {u}{i < users.length - 1 ? ", " : ""}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div style={styles.toolbar}>
                        <span style={{ color: "#969696" }}>Filter:</span>
                        <button
                            style={{ ...styles.toolbarBtn, ...(filter === "all" ? styles.toolbarBtnActive : {}) }}
                            onClick={() => setFilter("all")}
                        >All</button>
                        <button
                            style={{ ...styles.toolbarBtn, ...(filter === "images" ? styles.toolbarBtnActive : {}) }}
                            onClick={() => setFilter("images")}
                        >Images</button>
                        <span style={{ marginLeft: "auto", color: "#5a5a5a" }}>
                            {entries.filter((e) => e.kind === "chat").length} messages
                        </span>
                    </div>
                    <div ref={messagesRef} style={styles.messages}>
                        {visible.map((entry, idx) => {
                            if (entry.kind === "system") {
                                return (
                                    <div key={idx} style={styles.systemEntry}>{"// " + entry.text}</div>
                                );
                            }
                            const isMe = entry.data.name === myName;
                            return (
                                <div key={idx} style={styles.logEntry}>
                                    <span style={styles.arrow}>▶</span>
                                    <span style={styles.timestamp}>{entry.data.time}</span>
                                    <span style={{ ...styles.sender, ...(isMe ? styles.senderMe : {}) }}>
                                        {entry.data.name}
                                    </span>
                                    <span style={styles.content}>
                                        {entry.data.text}
                                        {entry.data.image && (
                                            <>
                                                {entry.data.text ? <br /> : null}
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img
                                                    src={entry.data.image}
                                                    alt=""
                                                    style={styles.contentImg}
                                                    onClick={() => entry.data.image && setModalImg(entry.data.image)}
                                                />
                                            </>
                                        )}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                    {pastedImage && (
                        <div style={styles.pastePreview}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={pastedImage} alt="" style={{ maxHeight: 80, border: "1px solid #3c3c3c", borderRadius: 4 }} />
                            <span style={styles.pasteRemove} onClick={() => setPastedImage(null)}>×</span>
                        </div>
                    )}
                    <div style={styles.inputArea}>
                        <span style={styles.promptSymbol}>&gt;</span>
                        <textarea
                            ref={inputRef}
                            style={styles.msgInput}
                            rows={1}
                            placeholder="Type a message... (Ctrl+V to paste image)"
                            value={text}
                            onChange={onTextChange}
                            onKeyDown={onTextKeyDown}
                        />
                        <button style={styles.consoleBtn} onClick={captureScreen} title="Screen capture">capture()</button>
                        <button style={{ ...styles.consoleBtn, ...styles.consoleBtnPrimary }} onClick={send}>send()</button>
                    </div>
                </div>
            )}

            {modalImg && (
                <div style={styles.imgModal} onClick={() => setModalImg(null)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={modalImg} alt="" style={{ maxWidth: "95%", maxHeight: "95%", borderRadius: 4 }} />
                </div>
            )}
        </div>
    );
}

const monospace = "Consolas, Monaco, 'Courier New', monospace";

const styles: Record<string, React.CSSProperties> = {
    wrap: {
        fontFamily: monospace,
        background: "#1e1e1e",
        color: "#d4d4d4",
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
    },
    loginScreen: { display: "flex", alignItems: "center", justifyContent: "center", flex: 1, background: "#1e1e1e" },
    loginBox: { background: "#252526", border: "1px solid #3c3c3c", padding: "32px 40px", borderRadius: 4 },
    loginTitle: { color: "#569cd6", fontSize: 20, fontWeight: "normal", marginBottom: 4 },
    loginHint: { color: "#6a9955", fontSize: 13, marginBottom: 16 },
    loginInput: {
        padding: "8px 12px", background: "#1e1e1e", border: "1px solid #3c3c3c",
        color: "#ce9178", fontFamily: monospace, fontSize: 14, width: 280, outline: "none", borderRadius: 2,
    },
    loginBtn: {
        marginTop: 12, padding: "8px 24px", background: "#0e639c", color: "#fff",
        border: "none", fontFamily: monospace, fontSize: 13, cursor: "pointer", borderRadius: 2,
    },
    chatScreen: { display: "flex", flexDirection: "column", flex: 1, minHeight: 0 },
    tabBar: {
        background: "#252526", display: "flex", alignItems: "center",
        borderBottom: "1px solid #3c3c3c", padding: "0 8px", height: 36, fontSize: 12,
    },
    tab: {
        background: "#1e1e1e", color: "#969696", padding: "6px 16px",
        border: "1px solid #3c3c3c", borderBottom: "none", borderRadius: "4px 4px 0 0",
        marginRight: 2, fontFamily: monospace, fontSize: 12, position: "relative", top: 1,
    },
    tabActive: { color: "#d4d4d4", borderBottom: "1px solid #1e1e1e" },
    userList: { marginLeft: "auto", color: "#6a9955", fontSize: 11, paddingRight: 8 },
    toolbar: {
        background: "#252526", borderBottom: "1px solid #3c3c3c", padding: "4px 12px",
        display: "flex", alignItems: "center", gap: 12, fontSize: 11,
    },
    toolbarBtn: {
        background: "none", border: "none", color: "#969696", cursor: "pointer",
        fontFamily: monospace, fontSize: 11, padding: "2px 6px", borderRadius: 2,
    },
    toolbarBtnActive: { color: "#d4d4d4" },
    messages: { flex: 1, overflowY: "auto", padding: 0, background: "#1e1e1e", fontSize: 13 },
    logEntry: {
        padding: "3px 12px", borderBottom: "1px solid #2a2a2a",
        display: "flex", alignItems: "flex-start", gap: 8, lineHeight: 1.6,
    },
    arrow: { color: "#569cd6", fontSize: 10, marginTop: 4, flexShrink: 0, userSelect: "none" },
    timestamp: { color: "#5a5a5a", fontSize: 11, flexShrink: 0, minWidth: 70, marginTop: 1 },
    sender: { color: "#4ec9b0", fontWeight: "bold", flexShrink: 0, minWidth: 80 },
    senderMe: { color: "#dcdcaa" },
    content: { color: "#d4d4d4", wordBreak: "break-word", whiteSpace: "pre-wrap", flex: 1 },
    contentImg: {
        maxWidth: 400, maxHeight: 300, borderRadius: 4, marginTop: 4,
        cursor: "pointer", border: "1px solid #3c3c3c", display: "block",
    },
    systemEntry: {
        padding: "2px 12px", color: "#6a9955", fontSize: 12, fontStyle: "italic", borderBottom: "1px solid #2a2a2a",
    },
    pastePreview: { padding: "6px 12px", background: "#252526", borderTop: "1px solid #3c3c3c" },
    pasteRemove: { color: "#f44747", cursor: "pointer", marginLeft: 8, fontSize: 16, verticalAlign: "top" },
    inputArea: {
        background: "#1e1e1e", borderTop: "1px solid #3c3c3c", padding: "8px 12px",
        display: "flex", alignItems: "flex-end", gap: 8,
    },
    promptSymbol: { color: "#569cd6", fontSize: 14, lineHeight: "32px", flexShrink: 0, userSelect: "none" },
    msgInput: {
        flex: 1, padding: "6px 8px", background: "#1e1e1e", border: "1px solid #3c3c3c",
        color: "#ce9178", fontFamily: monospace, fontSize: 13, resize: "none", outline: "none",
        maxHeight: 100, minHeight: 28, borderRadius: 2, lineHeight: 1.5,
    },
    consoleBtn: {
        background: "#2d2d2d", border: "1px solid #3c3c3c", color: "#d4d4d4",
        padding: "6px 12px", cursor: "pointer", fontFamily: monospace, fontSize: 12, borderRadius: 2, whiteSpace: "nowrap",
    },
    consoleBtnPrimary: { background: "#0e639c", borderColor: "#0e639c", color: "#fff" },
    imgModal: {
        display: "flex", position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
        background: "rgba(0,0,0,0.85)", zIndex: 1000, alignItems: "center", justifyContent: "center", cursor: "pointer",
    },
};
