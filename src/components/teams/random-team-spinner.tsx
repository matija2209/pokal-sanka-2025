'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sparkles, Users, AlertCircle, Volume2, VolumeX } from 'lucide-react'
import { TeamBadge } from '@/components/teams/team-badge'
import type { TeamWithUsers } from '@/lib/prisma/types'

interface RandomTeamSpinnerProps {
  currentUserId: string
  availableTeams: TeamWithUsers[]
}

// Sound effects using Web Audio API (zero external assets)
function playWheelTick(audioCtx: AudioContext | null, intensity = 1) {
  if (!audioCtx) return
  try {
    const osc = audioCtx.createOscillator()
    const gain = audioCtx.createGain()
    osc.type = 'triangle'
    const freq = 650 + Math.random() * 80
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.035)

    const vol = Math.min(0.22 * intensity, 0.3)
    gain.gain.setValueAtTime(vol, audioCtx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.035)

    osc.connect(gain)
    gain.connect(audioCtx.destination)
    osc.start()
    osc.stop(audioCtx.currentTime + 0.035)
  } catch {
    // Audio restricted
  }
}

export default function RandomTeamSpinner({
  currentUserId,
  availableTeams,
}: RandomTeamSpinnerProps) {
  const router = useRouter()
  const audioCtxRef = useRef<AudioContext | null>(null)

  const [isSpinning, setIsSpinning] = useState(false)
  const [rotationDegrees, setRotationDegrees] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [flapperAngle, setFlapperAngle] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)

  // Make sure wheel always has at least 6-8 visually exciting slices
  const wheelSlices = useMemo(() => {
    if (availableTeams.length === 0) return []
    if (availableTeams.length >= 6) {
      return availableTeams.map((t, idx) => ({ team: t, originalIndex: idx }))
    }
    const result: Array<{ team: TeamWithUsers; originalIndex: number }> = []
    const repeatCount = Math.ceil(8 / availableTeams.length)
    for (let r = 0; r < repeatCount; r++) {
      availableTeams.forEach((t, idx) => {
        result.push({ team: t, originalIndex: idx })
      })
    }
    return result
  }, [availableTeams])

  const sliceCount = wheelSlices.length
  const sliceDeg = 360 / (sliceCount || 1)

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [])

  const handleStartSpin = () => {
    if (isSpinning) return
    if (availableTeams.length === 0) {
      setErrorMessage('Na dogodku še ni ustvarjenih ekip.')
      return
    }

    if (!audioCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        audioCtxRef.current = new AudioCtx()
      } catch {
        // Not supported
      }
    } else if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume().catch(() => {})
    }

    setIsSpinning(true)
    setErrorMessage(null)

    // Balanced selection: find teams with fewest members
    const minMembers = Math.min(...availableTeams.map((t) => t.users.length))
    const candidateTeams = availableTeams.filter((t) => t.users.length === minMembers)
    const selectedTeam = candidateTeams[Math.floor(Math.random() * candidateTeams.length)]

    // Find all slices corresponding to this team
    const matchingIndices: number[] = []
    wheelSlices.forEach((s, idx) => {
      if (s.team.id === selectedTeam.id) {
        matchingIndices.push(idx)
      }
    })
    const targetSliceIndex = matchingIndices[Math.floor(Math.random() * matchingIndices.length)]

    // Pointer is at 12 o'clock (0° in our rotated SVG where group is at -90°).
    const sliceCenter = targetSliceIndex * sliceDeg + sliceDeg / 2
    const targetOffset = (360 - sliceCenter + 360) % 360

    // Add 6 full revolutions for dramatic suspense
    const extraRotations = 6 * 360
    const currentBase = Math.floor(rotationDegrees / 360) * 360
    const finalAngle = currentBase + extraRotations + targetOffset

    setRotationDegrees(finalAngle)

    // Ticker animation and sound ticks
    const spinDuration = 4800 // Full 4.8 seconds
    const startTime = Date.now()

    const tickerInterval = setInterval(() => {
      const now = Date.now()
      const elapsed = now - startTime
      const progress = elapsed / spinDuration

      if (progress >= 1) {
        clearInterval(tickerInterval)
        setFlapperAngle(0)
        return
      }

      // Cubic ease-out calculation for current wheel angle
      const easeOut = 1 - Math.pow(1 - progress, 3.5)
      const currentAngle = rotationDegrees + (finalAngle - rotationDegrees) * easeOut

      // Ticker flick animation
      const sliceProgress = (currentAngle % sliceDeg) / sliceDeg
      if (sliceProgress > 0.8 || sliceProgress < 0.2) {
        setFlapperAngle(16 * (1 - progress))
        if (soundEnabled) {
          playWheelTick(audioCtxRef.current, 1 - progress * 0.7)
        }
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          navigator.vibrate(8)
        }
      } else {
        setFlapperAngle(-4 * (1 - progress))
      }
    }, 45)

    // Navigate to the result screen after spin finishes (NO premature server action to avoid interrupting the animation)
    setTimeout(() => {
      router.push(`/app/select-team/result?team=${selectedTeam.id}`)
    }, spinDuration)
  }

  // SVG dimensions
  const center = 200
  const radius = 175
  const bulbRadius = 191
  const bulbCount = 24

  return (
    <div className="relative w-full max-w-xl mx-auto flex flex-col items-center">
      {/* Header */}
      <div className="text-center space-y-2 mb-4">
        <div className="flex items-center justify-center gap-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Zavrti kolo in se pridruži ekipi!
          </h2>
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
            title={soundEnabled ? 'Izklopi zvok' : 'Vklopi zvok'}
          >
            {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4 opacity-50" />}
          </button>
        </div>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Ekipe so pripravljene! Pritisni gumb, zavrti kolo sreče in <span className="font-semibold text-foreground">poišči svoje soigralce</span>.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-4 p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {availableTeams.length === 0 ? (
        <div className="text-center py-12 px-6 rounded-2xl border-2 border-dashed border-border/80 bg-muted/20 w-full">
          <Users className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
          <h3 className="text-base font-semibold mb-1">Ni še pripravljenih ekip</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Organizator mora najprej ustvariti ekipe za ta dogodek, preden se lahko zavrti kolo.
          </p>
        </div>
      ) : (
        <div className="relative flex flex-col items-center w-full">
          {/* WHEEL CONTAINER */}
          <div className="relative w-[340px] h-[340px] sm:w-[410px] sm:h-[410px] my-4 select-none flex items-center justify-center">
            {/* Outer Casino Bezel Glow */}
            <div
              className={`absolute inset-0 rounded-full transition-all duration-500 ${
                isSpinning
                  ? 'ring-8 ring-amber-400/40 shadow-[0_0_50px_rgba(245,158,11,0.45)]'
                  : 'shadow-2xl'
              }`}
            />

            {/* Top Indicator Flapper (Physical Ticker) */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center pointer-events-none drop-shadow-xl">
              {/* Golden mounting pin */}
              <div className="w-5 h-5 rounded-full bg-gradient-to-b from-amber-200 to-amber-600 border-2 border-amber-100 shadow-md flex items-center justify-center z-10">
                <div className="w-2 h-2 rounded-full bg-amber-900" />
              </div>

              {/* The flexible pointer blade */}
              <div
                className="w-0 h-0 border-x-[15px] border-x-transparent border-t-[34px] border-t-amber-500 transition-transform origin-top filter drop-shadow-md"
                style={{
                  transform: `rotate(${flapperAngle}deg)`,
                  transition: isSpinning ? 'transform 0.05s ease-out' : 'transform 0.2s ease-out',
                }}
              />
            </div>

            {/* The SVG Wheel */}
            <div className="w-full h-full relative">
              <svg viewBox="0 0 400 400" className="w-full h-full">
                {/* Outer Casino Frame (Metallic Bronze/Gold Ring) */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius + 18}
                  fill="#1e1b18"
                  stroke="#d97706"
                  strokeWidth="5"
                  className="shadow-inner"
                />

                {/* Animated Casino Bulbs around rim */}
                {Array.from({ length: bulbCount }).map((_, idx) => {
                  const bulbAngle = (idx * 2 * Math.PI) / bulbCount
                  const bx = center + bulbRadius * Math.cos(bulbAngle)
                  const by = center + bulbRadius * Math.sin(bulbAngle)
                  const isEven = idx % 2 === 0
                  return (
                    <circle
                      key={idx}
                      cx={bx}
                      cy={by}
                      r="4"
                      fill={isEven ? '#fbbf24' : '#ffffff'}
                      className={isSpinning ? 'animate-pulse' : ''}
                      style={{
                        animationDuration: isSpinning ? `${0.25 + (idx % 3) * 0.1}s` : '1.5s',
                        filter: isSpinning ? 'drop-shadow(0 0 3px #f59e0b)' : 'none',
                      }}
                    />
                  )
                })}

                {/* The Rotating Slices (Group rotated by -90° so 0° is 12 o'clock) */}
                <g
                  style={{
                    transformOrigin: `${center}px ${center}px`,
                    transform: `rotate(${rotationDegrees}deg)`,
                    transitionDuration: isSpinning ? '4.8s' : '0s',
                    transitionTimingFunction: 'cubic-bezier(0.15, 0.95, 0.35, 1.0)',
                  }}
                >
                  <g transform={`rotate(-90 ${center} ${center})`}>
                    {wheelSlices.map((slice, idx) => {
                      const startRad = (idx * sliceDeg * Math.PI) / 180
                      const endRad = ((idx + 1) * sliceDeg * Math.PI) / 180
                      const x1 = center + radius * Math.cos(startRad)
                      const y1 = center + radius * Math.sin(startRad)
                      const x2 = center + radius * Math.cos(endRad)
                      const y2 = center + radius * Math.sin(endRad)
                      const largeArc = sliceDeg > 180 ? 1 : 0
                      const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`

                      // Text positioning along radius
                      const midRad = (startRad + endRad) / 2
                      const textDist = radius * 0.62
                      const tx = center + textDist * Math.cos(midRad)
                      const ty = center + textDist * Math.sin(midRad)
                      const textRot = (midRad * 180) / Math.PI

                      const teamColor = slice.team.color || '#3b82f6'

                      return (
                        <g key={idx}>
                          {/* Colored Wedge */}
                          <path
                            d={pathData}
                            fill={teamColor}
                            stroke="#ffffff"
                            strokeWidth="2.5"
                            strokeLinejoin="round"
                          />

                          {/* Sector Divider Pins / Pegs on the outer edge */}
                          <circle
                            cx={x1}
                            cy={y1}
                            r="3.5"
                            fill="#f8fafc"
                            stroke="#64748b"
                            strokeWidth="1.5"
                          />

                          {/* Team Name Label */}
                          <text
                            x={tx}
                            y={ty}
                            fill="#ffffff"
                            fontSize={sliceCount > 8 ? '10.5' : sliceCount > 5 ? '12.5' : '14'}
                            fontWeight="800"
                            textAnchor="middle"
                            dominantBaseline="central"
                            transform={`rotate(${textRot}, ${tx}, ${ty})`}
                            style={{
                              textShadow: '0 2px 4px rgba(0,0,0,0.9)',
                              letterSpacing: '0.03em',
                            }}
                          >
                            {slice.team.name.length > 13
                              ? slice.team.name.slice(0, 11) + '…'
                              : slice.team.name}
                          </text>
                        </g>
                      )
                    })}
                  </g>
                </g>

                {/* Outer metallic rim separator */}
                <circle
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="2"
                  opacity="0.6"
                />

                {/* Center 3D Hub Button */}
                <circle
                  cx={center}
                  cy={center}
                  r="38"
                  fill="url(#goldHub)"
                  stroke="#78350f"
                  strokeWidth="4"
                  className="cursor-pointer shadow-2xl"
                  onClick={handleStartSpin}
                />
                <circle
                  cx={center}
                  cy={center}
                  r="28"
                  fill="#0f172a"
                  className="cursor-pointer"
                  onClick={handleStartSpin}
                />

                <defs>
                  <radialGradient id="goldHub" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#fef08a" />
                    <stop offset="60%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#78350f" />
                  </radialGradient>
                </defs>

                {/* Center Text / Icon */}
                <text
                  x={center}
                  y={center}
                  fill="#fbbf24"
                  fontSize="10"
                  fontWeight="900"
                  textAnchor="middle"
                  dominantBaseline="central"
                  className="cursor-pointer select-none tracking-widest uppercase font-black"
                  onClick={handleStartSpin}
                >
                  {isSpinning ? '...' : 'SPIN'}
                </text>
              </svg>
            </div>
          </div>

          {/* Action Button */}
          <div className="mt-6 text-center space-y-3 w-full max-w-xs">
            <Button
              size="lg"
              onClick={handleStartSpin}
              disabled={isSpinning}
              className="w-full h-14 text-base font-extrabold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-200 gap-2 bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:to-red-600 text-white border-0 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              {isSpinning ? (
                <>
                  <span className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  <span className="tracking-wide">Kolo se vrti... 🎲</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 animate-bounce" />
                  <span className="tracking-wide">ZAVRTI KOLO SREČE!</span>
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground">
              Klikni gumb ali osrednji krog za zagon žreba!
            </p>
          </div>

          {/* Seeded Teams list preview */}
          <div className="mt-8 pt-6 border-t border-border/60 w-full max-w-lg text-center">
            <p className="text-xs font-medium text-muted-foreground mb-3">
              Vse ekipe v žrebu ({availableTeams.length}):
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {availableTeams.map((team) => (
                <div key={team.id} className="inline-flex items-center gap-1.5">
                  <TeamBadge team={team} className="text-xs px-2.5 py-1" />
                  <span className="text-[10px] text-muted-foreground">({team.users.length})</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
