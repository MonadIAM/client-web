import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { NotificationManager } from "../notification.manager";

export function useNotificationSound(): Notifications.Sound.Use.Result {
    const { t } = useTranslation();
    const context = useRef<Nullable<AudioContext>>(null);
    const toneRef = useRef<Nullable<OscillatorNode>>(null);
    const [playing, setPlaying] = useState(false);
    const [ready, setReady] = useState(false);
    const prepare = useCallback<Notifications.Sound.Prepare.Signature>(() => {
        if (!context.current) {
            const audio = new AudioContext();
            context.current = audio;
            audio.onstatechange = () => setReady(audio.state === "running");
            setReady(audio.state === "running");
        }
        return context.current;
    }, []);

    useEffect(() => {
        const unlock = () => {
            const audio = prepare();
            if (audio.state === "suspended") {
                void audio.resume().catch(() => undefined);
            }
        };
        document.addEventListener("pointerdown", unlock);
        document.addEventListener("keydown", unlock);

        return () => {
            document.removeEventListener("pointerdown", unlock);
            document.removeEventListener("keydown", unlock);
            const audio = context.current;
            context.current = null;
            toneRef.current?.stop();
            toneRef.current = null;
            if (audio) {
                audio.onstatechange = null;
                if (audio.state !== "closed") {
                    void audio.close();
                }
            }
        };
    }, [prepare]);

    const play: Notifications.Sound.Play.Signature = async ({ automatic = false } = {}) => {
        if (toneRef.current || (automatic && context.current?.state !== "running")) {
            return false;
        }

        try {
            const audio = prepare();
            await audio.resume();

            if (context.current === audio && !toneRef.current) {
                setPlaying(true);
                const tone = audio.createOscillator();
                const gain = audio.createGain();
                const start = audio.currentTime;
                toneRef.current = tone;
                tone.frequency.setValueAtTime(660, start);
                tone.frequency.setValueAtTime(880, start + 0.15);
                gain.gain.setValueAtTime(0, start);
                gain.gain.linearRampToValueAtTime(0.12, start + 0.01);
                gain.gain.exponentialRampToValueAtTime(0.001, start + 0.5);
                tone.connect(gain);
                gain.connect(audio.destination);
                await new Promise<void>((resolve) => {
                    tone.onended = () => {
                        tone.disconnect();
                        gain.disconnect();
                        if (context.current === audio) {
                            toneRef.current = null;
                            setPlaying(false);
                        }
                        resolve();
                    };
                    tone.start(start);
                    tone.stop(start + 0.5);
                });
                return true;
            }
        } catch (cause) {
            toneRef.current = null;
            setPlaying(false);
            if (!automatic) {
                NotificationManager.error({
                    cause,
                    title: t("notificationSettings.soundPreviewError"),
                });
            }
        }
        return false;
    };

    return { play, playing, ready };
}
