import { useState, useRef } from "preact/hooks";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
    const [state, setState] = useState<FormState>("idle");
    const [errorMsg, setErrorMsg] = useState("");
    const formRef = useRef<HTMLFormElement>(null);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (state === "submitting") return;

        setState("submitting");
        setErrorMsg("");

        const form = formRef.current;
        if (!form) return;

        const data = new FormData(form);
        const payload = {
            name: data.get("name") as string,
            email: data.get("email") as string,
            message: data.get("message") as string,
        };

        // Basic client-side validation
        if (!payload.name || !payload.email || !payload.message) {
            setState("error");
            setErrorMsg("All fields are required.");
            return;
        }

        try {
            const res = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                setState("success");
                form.reset();
            } else {
                const body = await res.json().catch(() => ({}));
                setState("error");
                setErrorMsg(body.error ?? "Something went wrong. Please try again.");
            }
        } catch {
            setState("error");
            setErrorMsg("Network error. Please check your connection.");
        }
    };

    return (
        <form ref={formRef} onSubmit={handleSubmit} class="flex flex-col gap-8" noValidate>
            <div class="flex flex-col gap-2">
                <label for="name" class="text-dim text-[13px]">
                    Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Your name"
                    class="bg-transparent border-b border-[var(--border)] py-3 text-sm text-[var(--fg)] focus:border-[var(--fg)] transition-colors focus:outline-none placeholder:text-[var(--faint)]"
                    required
                    disabled={state === "submitting"}
                />
            </div>

            <div class="flex flex-col gap-2">
                <label for="email" class="text-dim text-[13px]">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    placeholder="you@example.com"
                    class="bg-transparent border-b border-[var(--border)] py-3 text-sm text-[var(--fg)] focus:border-[var(--fg)] transition-colors focus:outline-none placeholder:text-[var(--faint)]"
                    required
                    disabled={state === "submitting"}
                />
            </div>

            <div class="flex flex-col gap-2">
                <label for="message" class="text-dim text-[13px]">
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    rows={5}
                    placeholder="What would you like to discuss?"
                    class="bg-transparent border-b border-[var(--border)] py-3 text-sm text-[var(--fg)] focus:border-[var(--fg)] transition-colors focus:outline-none resize-none placeholder:text-[var(--faint)]"
                    required
                    disabled={state === "submitting"}
                />
            </div>

            {/* Submit button — changes appearance by state */}
            <button
                type="submit"
                disabled={state === "submitting"}
                class={`inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors h-10 px-4 py-2 text-[13px] w-full sm:w-auto self-start disabled:pointer-events-none disabled:opacity-50 ${
                    state === "success"
                        ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--fg)]"
                        : state === "error"
                          ? "bg-[var(--surface)] border border-[var(--border)] text-[var(--fg)]"
                          : "bg-[var(--fg)] text-[var(--bg)] hover:opacity-90"
                }`}
            >
                {state === "idle" && (
                    <>
                        {/* Send icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
                            <path d="m21.854 2.147-10.94 10.939" />
                        </svg>
                        Send message
                    </>
                )}
                {state === "submitting" && (
                    <>
                        {/* Spinner */}
                        <svg
                            class="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
                        >
                            <circle
                                class="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                stroke-width="4"
                            />
                            <path
                                class="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        Sending...
                    </>
                )}
                {state === "success" && (
                    <>
                        {/* CheckCircle icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="m9 12 2 2 4-4" />
                        </svg>
                        Sent successfully!
                    </>
                )}
                {state === "error" && (
                    <>
                        {/* AlertCircle icon */}
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            aria-hidden="true"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" x2="12" y1="8" y2="12" />
                            <line x1="12" x2="12.01" y1="16" y2="16" />
                        </svg>
                        Try again
                    </>
                )}
            </button>

            {/* Error message */}
            {state === "error" && errorMsg && (
                <p class="text-[#f85149] text-[13px] -mt-4" role="alert">
                    {errorMsg}
                </p>
            )}
        </form>
    );
}
