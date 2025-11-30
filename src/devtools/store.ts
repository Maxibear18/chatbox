import { useState, useEffect } from 'react'
import { Settings, createSession, Session, Message } from './types'
import * as defaults from './defaults'
import * as openai from './openai-node'
import { v4 as uuidv4 } from 'uuid';
import { ThemeMode } from './theme';

// ipc

export const writeStore = (key: string, value: any) => {
    return (window as any).api.invoke('setStoreValue', key, value)
}
export const readStore = (key: string) => {
    return (window as any).api.invoke('getStoreValue', key)
}
export const getVersion = () => {
    return (window as any).api.invoke('getVersion')
}
export const openLink = (link: string) => {
    return (window as any).api.invoke('openLink', link)
}

export const shouldUseDarkColors = (): Promise<boolean> => {
    return api.invoke('shouldUseDarkColors');
};

// setting store

export function getDefaultSettings(): Settings {
    return {
        openaiKey: '',
        apiHost: 'https://api.openai.com',
        showWordCount: false,
        showTokenCount: false,
        theme: ThemeMode.System,
    }
}

export async function readSettings(): Promise<Settings> {
    const setting = await readStore('settings')
    if (!setting) {
        return getDefaultSettings()
    }
    // 兼容早期版本
    if (!setting.apiHost) {
        setting.apiHost = getDefaultSettings().apiHost
    }
    if (setting.showWordCount === undefined) {
        setting.showWordCount = getDefaultSettings().showWordCount
    }
    if (setting.showTokenCount === undefined) {
        setting.showTokenCount = getDefaultSettings().showTokenCount
    }
    if (setting.theme === undefined) {
        setting.theme = getDefaultSettings().theme;
    }
    return setting
}

export async function writeSettings(settings: Settings) {
    if (!settings.apiHost) {
        settings.apiHost = getDefaultSettings().apiHost
    }
    console.log('writeSettings.apiHost', settings.apiHost)
    openai.setHost(settings.apiHost)
    return writeStore('settings', settings)
}

// session store

export async function readSessions(): Promise<Session[]> {
    let sessions = await readStore('chat-sessions')
    if (!sessions) {
        return defaults.sessions
    }
    if (sessions.length === 0) {
        return [createSession()]
    }
    // Ensure backward compatibility: add draft field to sessions that don't have it
    return sessions.map((session: Session) => ({
        ...session,
        draft: session.draft ?? ''
    }))
}

export async function writeSessions(sessions: Session[]) {
    return writeStore('chat-sessions', sessions)
}

// react hook

export default function useStore() {
    const [version, _setVersion] = useState('unknown')
    useEffect(() => {
        getVersion().then((version: any) => {
            _setVersion(version)
        })
    }, [])

    const [settings, _setSettings] = useState<Settings>(getDefaultSettings())
    const [needSetting, setNeedSetting] = useState(false)
    useEffect(() => {
        readSettings().then((settings) => {
            _setSettings(settings)
            if (settings.openaiKey === '') {
                setNeedSetting(true)
            }
        })
    }, [])
    const setSettings = (settings: Settings) => {
        _setSettings(settings)
        writeSettings(settings)
    }

    const [chatSessions, _setChatSessions] = useState<Session[]>([createSession()])
    const [currentSession, _switchCurrentSession] = useState<Session>(chatSessions[0])
    useEffect(() => {
        readSessions().then((sessions: Session[]) => {
            _setChatSessions(sessions)
            _switchCurrentSession(sessions[0])
        })
    }, [])
    const setSessions = (sessions: Session[]) => {
        _setChatSessions(sessions)
        writeSessions(sessions)
    }

    // Draft management functions
    const setDraft = (sessionId: string, draft: string) => {
        const sessions = chatSessions.map((s) => {
            if (s.id === sessionId) {
                return { ...s, draft: draft ?? '' }
            }
            return s
        })
        setSessions(sessions)
        // Update current session if it's the one being modified
        if (sessionId === currentSession.id) {
            _switchCurrentSession({ ...currentSession, draft: draft ?? '' })
        }
    }

    const getDraft = (sessionId: string): string => {
        const session = chatSessions.find((s) => s.id === sessionId)
        return session?.draft ?? ''
    }

    const clearDraft = (sessionId: string) => {
        setDraft(sessionId, '')
    }

    // Enhanced switchCurrentSession that saves current draft before switching
    const switchCurrentSession = (session: Session) => {
        // Save current session's draft before switching
        if (currentSession) {
            const currentDraft = currentSession.draft ?? ''
            const sessions = chatSessions.map((s) => {
                if (s.id === currentSession.id) {
                    return { ...s, draft: currentDraft }
                }
                return s
            })
            _setChatSessions(sessions)
            writeSessions(sessions)
        }
        // Switch to new session
        _switchCurrentSession(session)
    }

    const deleteChatSession = (target: Session) => {
        const sessions = chatSessions.filter((s) => s.id !== target.id)
        if (sessions.length === 0) {
            sessions.push(createSession())
        }
        if (target.id === currentSession.id) {
            // When deleting current session, switch to new session without saving draft
            // (since the session is being deleted, we don't need to preserve its draft)
            _switchCurrentSession(sessions[0])
        }
        setSessions(sessions)
    }
    const updateChatSession = (session: Session) => {
        const sessions = chatSessions.map((s) => {
            if (s.id === session.id) {
                return session
            }
            return s
        })
        setSessions(sessions)
        if (session.id === currentSession.id) {
            switchCurrentSession(session)
        }
    }
    const createChatSession = (session: Session, ix?: number) => {
        const sessions = [...chatSessions, session]
        setSessions(sessions)
        switchCurrentSession(session)
    }
    const createEmptyChatSession = () => {
        createChatSession(createSession())
    }

    const setMessages = (session: Session, messages: Message[]) => {
        updateChatSession({
            ...session,
            messages,
        })
    }

    const [toasts, _setToasts] = useState<{id: string, content: string}[]>([])
    const addToast = (content: string) => {
        const id = uuidv4()
        _setToasts([...toasts, {id, content}])
    }
    const removeToast = (id: string) => {
        _setToasts(toasts.filter((t) => t.id !== id))
    }

    return {
        version,

        settings,
        setSettings,
        needSetting,

        chatSessions,
        createChatSession,
        updateChatSession,
        deleteChatSession,
        createEmptyChatSession,

        currentSession,
        switchCurrentSession,

        // Draft management
        setDraft,
        getDraft,
        clearDraft,

        toasts,
        addToast,
        removeToast,
    }
}