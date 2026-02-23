import { useState, useEffect, useRef } from "preact/hooks";

interface Frame {
    lines: { type: "prompt" | "output"; text: string }[];
    cursorLine: number;
}

const SCRIPT = [
    { type: "prompt", text: "harshit@arch:~$ whoami" },
    { type: "output", text: "Harshit Sharma — Systems engineer & full-stack developer." },
    { type: "prompt", text: "harshit@arch:~$ cat about.txt" },
    { type: "output", text: "I build high-performance distributed systems, write competitive programming solutions, and obsess over clean architecture." },
    { type: "prompt", text: "harshit@arch:~$ ls skills/" },
    { type: "output", text: "rust/  go/  typescript/  python/  c++/  react/  kubernetes/  postgres/  redis/  linux/" },
    { type: "prompt", text: "harshit@arch:~$ uptime --career" },
    { type: "output", text: "Systems running for 5+ years. 0 critical failures." },
] as const;

const PROMPT_PREFIX = "harshit@arch:~$";

function buildFrames(): Frame[] {
    const frames: Frame[] = [];
    let currentLines: { type: "prompt" | "output"; text: string }[] = [];

    SCRIPT.forEach((line) => {
        if (line.type === "prompt") {
            const command = line.text.slice(PROMPT_PREFIX.length + 1);
            for (let i = 0; i <= command.length; i++) {
                frames.push({
                    lines: [
                        ...currentLines,
                        { type: "prompt", text: `${PROMPT_PREFIX} ${command.slice(0, i)}` },
                    ],
                    cursorLine: currentLines.length,
                });
            }
        } else {
            frames.push({
                lines: [...currentLines, { type: "output", text: line.text }],
                cursorLine: currentLines.length,
            });
        }
        currentLines.push(line);
    });

    frames.push({
        lines: [...currentLines, { type: "prompt", text: `${PROMPT_PREFIX} ` }],
        cursorLine: currentLines.length,
    });

    return frames;
}

const FRAMES = buildFrames();

export function TerminalHero() {
    const [frameIdx, setFrameIdx] = useState(0);
    const [cursorVisible, setCursorVisible] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
        if (mq.matches) {
            setFrameIdx(FRAMES.length - 1);
            return;
        }

        let timeoutId: number;

        const step = () => {
            setFrameIdx((currentIdx) => {
                if (currentIdx >= FRAMES.length - 1) return currentIdx;

                const currentFrame = FRAMES[currentIdx];
                const nextFrame = FRAMES[currentIdx + 1];

                let delay = 50 + Math.floor(Math.random() * 40);

                if (currentFrame.lines.length < nextFrame.lines.length) {
                    const lastLine = currentFrame.lines[currentFrame.lines.length - 1];
                    delay = lastLine.type === "prompt" ? 380 : 520;
                }

                timeoutId = window.setTimeout(step, delay);
                return currentIdx + 1;
            });
        };

        timeoutId = window.setTimeout(step, 600);

        const blinkId = window.setInterval(() => {
            setCursorVisible((v) => !v);
        }, 530);

        return () => {
            window.clearTimeout(timeoutId);
            window.clearInterval(blinkId);
        };
    }, []);

    const currentFrame = FRAMES[frameIdx];

    // Dark-only terminal colors
    const colors = {
        promptUser: "#3fb950",
        separator: "#7d8590",
        path: "#58a6ff",
        command: "#e6edf3",
        output: "#d2dae4",
        cursor: "#00e5a0",
        headerBg: "rgba(22, 27, 34, 0.9)",
        bodyBg: "linear-gradient(145deg, #0a0e14 0%, #0d1117 50%, #0f1318 100%)",
        titleText: "#7d8590",
        shadow: [
            "0 0 0 1px rgba(0, 229, 160, 0.12)",
            "0 16px 50px rgba(0, 0, 0, 0.7)",
            "0 40px 100px rgba(0, 0, 0, 0.5)",
            "0 0 120px rgba(0, 229, 160, 0.15)",
            "inset 0 1px 0 rgba(255,255,255,0.05)",
        ].join(", "),
    };

    const renderPromptLine = (text: string, showCursor: boolean) => {
        const promptEnd = text.indexOf("$") + 1;
        const prefix = text.slice(0, promptEnd);
        const command = text.slice(promptEnd + 1);
        const [userHost] = prefix.split(":");

        return (
            <div className="font-mono text-[13px] leading-relaxed break-words whitespace-pre-wrap">
                <span style={{ color: colors.promptUser }}>{userHost}</span>
                <span style={{ color: colors.separator }}>:</span>
                <span style={{ color: colors.path }}>~</span>
                <span style={{ color: colors.command }}>$ </span>
                <span style={{ color: colors.command }}>{command}</span>
                {showCursor && (
                    <span
                        className="inline-block w-[7px] h-[1.15em] align-middle ml-[1px]"
                        style={{
                            backgroundColor: colors.cursor,
                            opacity: cursorVisible ? 1 : 0,
                        }}
                        aria-hidden="true"
                    />
                )}
            </div>
        );
    };

    return (
        <div
            ref={containerRef}
            className="terminal-hero rounded-xl overflow-hidden border border-border relative"
            style={{
                background: colors.bodyBg,
                transform: "perspective(800px) rotateY(-5deg) rotateX(3deg) translateY(-6px)",
                willChange: "transform",
                boxShadow: colors.shadow,
            }}
            aria-hidden="true"
        >
            {/* Title Bar */}
            <div
                className="flex items-center px-4 py-2.5 border-b border-border"
                style={{ background: colors.headerBg }}
            >
                <div className="flex gap-2 mr-4">
                    <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                    <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                    <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span
                    className="text-xs font-mono flex-1 text-center -ml-12"
                    style={{ color: colors.titleText }}
                >
                    harshit@arch: ~
                </span>
            </div>

            {/* Terminal Body */}
            <div className="p-5 sm:p-6 min-h-[300px]">
                {currentFrame.lines.map((line, idx) => (
                    <div
                        key={`${idx}-${line.text.slice(0, 20)}`}
                        className={line.type === "output" ? "mt-0.5 mb-3" : "mb-1"}
                    >
                        {line.type === "prompt" ? (
                            renderPromptLine(line.text, idx === currentFrame.cursorLine)
                        ) : (
                            <div
                                className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap"
                                style={{ color: colors.output }}
                            >
                                {line.text}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
