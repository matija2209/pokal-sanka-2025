'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Users, PartyPopper, ArrowRight, AlertCircle } from 'lucide-react'
import { joinRandomTeamAction } from '@/app/actions'
import { initialTeamActionState } from '@/lib/types/action-states'
import type { TeamWithUsers } from '@/lib/prisma/types'

interface TeamResultRevealProps {
  currentUserId: string
  team: TeamWithUsers
  redirectUrl?: string
}

function playVictoryFanfare(audioCtx: AudioContext | null) {
  if (!audioCtx) return
  try {
    const chords = [
      { f: 523.25, t: 0.0 },  // C5
      { f: 659.25, t: 0.1 },  // E5
      { f: 783.99, t: 0.2 },  // G5
      { f: 1046.5, t: 0.35 }, // C6
      { f: 1318.5, t: 0.5 },  // E6
    ]
    chords.forEach(({ f, t }) => {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(f, audioCtx.currentTime + t)
      gain.gain.setValueAtTime(0.25, audioCtx.currentTime + t)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + t + 0.7)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(audioCtx.currentTime + t)
      osc.stop(audioCtx.currentTime + t + 0.7)
    })
  } catch {
    // Ignore
  }
}

// Canvas Confetti
function runConfetti(canvas: HTMLCanvasElement | null) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const pieces: Array<{
    x: number
    y: number
    w: number
    h: number
    color: string
    vx: number
    vy: number
    rotation: number
    vRot: number
    opacity: number
  }> = []

  const colors = ['#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6', '#ef4444', '#ffd700']

  for (let i = 0; i < 110; i++) {
    pieces.push({
      x: canvas.width / 2 + (Math.random() - 0.5) * 100,
      y: canvas.height * 0.45,
      w: Math.random() * 9 + 5,
      h: Math.random() * 7 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 22,
      vy: -Math.random() * 16 - 4,
      rotation: Math.random() * 360,
      vRot: (Math.random() - 0.5) * 14,
      opacity: 1,
    })
  }

  const startTime = Date.now()
  let animationFrame: number

  const render = () => {
    const elapsed = Date.now() - startTime
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    pieces.forEach((p) => {
      p.x += p.vx
      p.y += p.vy
      p.vy += 0.38 // gravity
      p.rotation += p.vRot
      p.opacity = Math.max(0, 1 - elapsed / 3200)

      ctx.save()
      ctx.globalAlpha = p.opacity
      ctx.translate(p.x, p.y)
      ctx.rotate((p.rotation * Math.PI) / 180)
      ctx.fillStyle = p.color
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h)
      ctx.restore()
    })

    if (elapsed < 3400) {
      animationFrame = requestAnimationFrame(render)
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
  }

  animationFrame = requestAnimationFrame(render)
}

export default function TeamResultReveal({
  currentUserId,
  team,
  redirectUrl = '/app/feed',
}: TeamResultRevealProps) {
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  const [isJoining, setIsJoining] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    runConfetti(canvasRef.current)

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioCtxRef.current = new AudioCtx()
      playVictoryFanfare(audioCtxRef.current)
    } catch {
      // Not supported
    }

    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleNavigateToTeam = async () => {
    if (isJoining) return
    setIsJoining(true)

    try {
      const formData = new FormData()
      formData.append('userId', currentUserId)
      formData.append('teamId', team.id)

      const res = await joinRandomTeamAction(initialTeamActionState, formData)
      if (res.success) {
        router.push(res.data?.redirectUrl || redirectUrl)
      } else {
        setIsJoining(false)
        setErrorMessage(res.message || 'Pridružitev ekipi ni uspela.')
      }
    } catch (err) {
      console.error('Error joining team:', err)
      setIsJoining(false)
      setErrorMessage('Prišlo je do napake pri shranjevanju ekipe.')
    }
  }

  return (
    <div className="relative w-full max-w-lg mx-auto flex flex-col items-center">
      {/* Canvas for Confetti */}
      <canvas
        ref={canvasRef}
        className="pointer-events-none fixed inset-0 z-50 h-full w-full"
      />

      {errorMessage && (
        <div className="mb-4 w-full p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* REVEAL CARD: "POIŠČI SVOJE SOIGRALCE!" */}
      <div className="w-full rounded-2xl border-2 border-primary/50 bg-card p-6 shadow-2xl space-y-5 animate-in fade-in-50 zoom-in-95 duration-400">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-full bg-amber-500/10 text-amber-500 mb-1 ring-8 ring-amber-500/10 animate-bounce">
            <PartyPopper className="h-8 w-8" />
          </div>
          <div className="text-xs font-bold tracking-widest uppercase text-muted-foreground">
            🎉 Tvoja izžrebana ekipa!
          </div>
          <div className="flex items-center justify-center gap-3">
            <div
              className="w-6 h-6 rounded-full shadow-md ring-4 ring-background border border-black/10"
              style={{ backgroundColor: team.color || '#3b82f6' }}
            />
            <h3 className="text-3xl font-extrabold text-foreground tracking-tight">
              {team.name}
            </h3>
          </div>
        </div>

        {/* Bonding prompt: POIŠČI SVOJE SOIGRALCE */}
        <div className="rounded-xl bg-muted/40 p-4 border border-border/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Users className="h-4 w-4 text-primary" />
              Poišči svoje soigralce!
            </span>
            <Badge variant="outline" className="text-xs font-semibold">
              {team.users.length + 1} v ekipi
            </Badge>
          </div>

          {team.users.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                Stopi do svojih soigralcev in se predstavite:
              </p>
              <div className="flex flex-wrap gap-2">
                {team.users.map((member) => (
                  <div
                    key={member.id}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background border shadow-xs text-xs font-medium"
                  >
                    <Avatar className="h-5 w-5">
                      {member.profile_image_url && (
                        <AvatarImage src={member.profile_image_url} alt={member.name} />
                      )}
                      <AvatarFallback className="text-[10px] bg-primary/20 text-primary font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span>{member.name}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              Ti si prvi član te ekipe! Soigralci se ti bodo kmalu pridružili z novimi žrebi.
            </p>
          )}
        </div>

        <Button
          onClick={handleNavigateToTeam}
          disabled={isJoining}
          size="lg"
          className="w-full h-12 rounded-xl font-bold gap-2 text-base shadow-lg bg-primary hover:bg-primary/90"
        >
          {isJoining ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Pridružujem se ekipi...</span>
            </>
          ) : (
            <>
              <span>Pojdi k svoji ekipi</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
