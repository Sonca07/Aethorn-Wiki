'use client'

import { useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// YouTube IFrame API types
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    YT: {
      Player: new (el: string | HTMLElement, opts: YTPlayerOptions) => YTPlayer
      PlayerState: { PLAYING: 1; PAUSED: 2; ENDED: 0; BUFFERING: 3; CUED: 5 }
    }
    onYouTubeIframeAPIReady: () => void
  }
}

interface YTPlayerOptions {
  width?: number
  height?: number
  videoId?: string
  playerVars?: Record<string, number | string>
  events?: {
    onReady?: (e: { target: YTPlayer }) => void
    onStateChange?: (e: { data: number; target: YTPlayer }) => void
  }
}

interface YTPlayer {
  playVideo(): void
  pauseVideo(): void
  mute(): void
  unMute(): void
  isMuted(): boolean
  setVolume(vol: number): void
  getPlayerState(): number
  destroy(): void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const VIDEO_ID   = 'TAnoryONNWI'
const PLAYLIST   = 'RDTAnoryONNWI'
const LS_KEY     = 'aethorn-music-playing'
const MOUNT_ID   = 'aethorn-yt-mount'

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function MusicPlayer() {
  const playerRef      = useRef<YTPlayer | null>(null)
  const initializedRef = useRef(false)

  // Default state: playing (true). Read from localStorage after mount.
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume]       = useState(50)
  // Track whether user has interacted — unmute happens on first interaction
  const [unmuted, setUnmuted]     = useState(false)

  // ── Restore saved preference (client only) ─────────────────────────────
  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY)
    if (saved !== null) setIsPlaying(saved === 'true')
  }, [])

  // ── Load YouTube IFrame API & create player ────────────────────────────
  useEffect(() => {
    if (initializedRef.current) return
    initializedRef.current = true

    const createPlayer = () => {
      playerRef.current = new window.YT.Player(MOUNT_ID, {
        width:   1,
        height:  1,
        videoId: VIDEO_ID,
        playerVars: {
          autoplay:    1,
          loop:        1,
          list:        PLAYLIST,
          listType:    'playlist',
          controls:    0,
          disablekb:   1,
          fs:          0,
          rel:         0,
          playsinline: 1,
          mute:        1,   // start muted — browser autoplay policy
        },
        events: {
          onReady: (e) => {
            // Always start muted so autoplay is allowed
            e.target.mute()
            e.target.setVolume(50)
            // Honour saved preference
            const saved = localStorage.getItem(LS_KEY)
            const shouldPlay = saved === null ? true : saved === 'true'
            if (shouldPlay) {
              e.target.playVideo()
              setIsPlaying(true)
            } else {
              e.target.pauseVideo()
              setIsPlaying(false)
            }
          },
        },
      })
    }

    if (window.YT?.Player) {
      createPlayer()
    } else {
      // Chain onto any existing callback (e.g. from StrictMode double-invoke)
      const prev = window.onYouTubeIframeAPIReady
      window.onYouTubeIframeAPIReady = () => {
        prev?.()
        createPlayer()
      }
      if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const s   = document.createElement('script')
        s.src     = 'https://www.youtube.com/iframe_api'
        s.async   = true
        document.head.appendChild(s)
      }
    }
  }, [])

  // ── Controls ───────────────────────────────────────────────────────────

  const unmute = () => {
    if (!unmuted && playerRef.current) {
      playerRef.current.unMute()
      playerRef.current.setVolume(volume)
      setUnmuted(true)
    }
  }

  const handlePlayPause = () => {
    if (!playerRef.current) return
    unmute()
    const next = !isPlaying
    next ? playerRef.current.playVideo() : playerRef.current.pauseVideo()
    setIsPlaying(next)
    localStorage.setItem(LS_KEY, String(next))
  }

  const handleVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value)
    setVolume(val)
    unmute()
    if (playerRef.current) {
      playerRef.current.setVolume(val)
      if (val === 0) playerRef.current.mute()
      else if (unmuted) playerRef.current.unMute()
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <>
      {/* Keyframe for pulsing music note */}
      <style>{`
        @keyframes aethorn-note-pulse {
          0%,100% { opacity: 1;   transform: scale(1);    }
          50%      { opacity: 0.5; transform: scale(1.2);  }
        }
        .aethorn-note-anim {
          animation: aethorn-note-pulse 2s ease-in-out infinite;
          display: inline-block;
        }
        #${MOUNT_ID} {
          position: absolute;
          width: 1px; height: 1px;
          overflow: hidden; opacity: 0; pointer-events: none;
        }
      `}</style>

      {/* Hidden YouTube player mount point */}
      <div id={MOUNT_ID} />

      {/* ── Player UI ── */}
      <div
        role="region"
        aria-label="Reproductor de música"
        style={{
          position:       'fixed',
          bottom:         '1rem',
          right:          '1rem',
          zIndex:         9999,
          width:          '196px',
          background:     '#16140eee',
          border:         '1px solid #3a3020',
          borderRadius:   '6px',
          padding:        '0.45rem 0.6rem 0.4rem',
          backdropFilter: 'blur(10px)',
          boxShadow:      '0 4px 28px rgba(0,0,0,0.65), 0 0 0 1px rgba(201,168,76,0.06)',
          userSelect:     'none',
        }}>

        {/* Row: note · label · play/pause */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>

          <span
            className={isPlaying ? 'aethorn-note-anim' : ''}
            aria-hidden="true"
            style={{ color: '#c9a84c', fontSize: '1rem', lineHeight: 1, flexShrink: 0, width: '14px', textAlign: 'center' }}>
            ♪
          </span>

          <span style={{
            flex: 1,
            color: '#8a7a5a',
            fontSize: '0.6rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            fontFamily: 'Georgia, serif',
          }}>
            OST de Aethorn
          </span>

          <button
            onClick={handlePlayPause}
            title={isPlaying ? 'Pausar música' : 'Reproducir música'}
            aria-label={isPlaying ? 'Pausar música' : 'Reproducir música'}
            style={{
              background:  'transparent',
              border:      'none',
              color:       '#c9a84c',
              cursor:      'pointer',
              fontSize:    '0.8rem',
              lineHeight:  1,
              padding:     '0 0.1rem',
              flexShrink:  0,
              opacity:     0.9,
              transition:  'opacity 0.15s',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.9' }}>
            {isPlaying ? '⏸' : '▶'}
          </button>

        </div>

        {/* Volume slider */}
        <div style={{ marginTop: '0.3rem', paddingLeft: '18px' }}>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={handleVolume}
            aria-label="Volumen"
            style={{
              width:       '100%',
              height:      '3px',
              accentColor: '#c9a84c',
              cursor:      'pointer',
              display:     'block',
            }}
          />
        </div>

      </div>
    </>
  )
}
