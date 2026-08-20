import { useCallback, useEffect, useRef, useState } from 'react'
import { ASSETS, preloadImage, preloadImages, ROOM_ASSETS, WALKTHROUGH_ROOMS } from './assets'
import AudioControl from './components/AudioControl'
import BuildingScreen from './components/BuildingScreen'
import LandscapeGuard from './components/LandscapeGuard'
import MasterplanScreen from './components/MasterplanScreen'
import OpeningScreen from './components/OpeningScreen'
import WalkthroughScreen from './components/WalkthroughScreen'
import {
  applyVisualViewportToRoot,
  attemptImmersiveMode,
  IS_IOS,
  nudgeBrowserChrome,
  subscribeVisualViewport,
} from './mobileViewport'
import type { BuildingMode, FloorId, RoomId, Screen } from './types'

export default function App() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [screen, setScreen] = useState<Screen>('opening')
  const [openingFade, setOpeningFade] = useState(false)
  const [openingReady, setOpeningReady] = useState(false)
  const [hoveredBuilding, setHoveredBuilding] = useState(false)
  const [buildingMode, setBuildingMode] = useState<BuildingMode>('floor-selection')
  const [hoveredFloor, setHoveredFloor] = useState<FloorId | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<FloorId | null>(null)
  const [hoveredApartment, setHoveredApartment] = useState<string | null>(null)
  const [selectedApartment, setSelectedApartment] = useState<string | null>(null)
  const [apartmentModalOpen, setApartmentModalOpen] = useState(false)
  const [currentRoom, setCurrentRoom] = useState<RoomId>('lounge')
  const [audioEnabled, setAudioEnabled] = useState(false)
  const [audioAvailable, setAudioAvailable] = useState(true)
  const [portrait, setPortrait] = useState(false)

  useEffect(() => {
    void preloadImage(ASSETS.masterplan).then(() => setOpeningReady(true))
  }, [])

  useEffect(() => subscribeVisualViewport(applyVisualViewportToRoot), [])

  const playAudio = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !audioAvailable) return
    audio.loop = true
    audio.volume = 0.22
    try {
      await audio.play()
      setAudioEnabled(true)
    } catch {
      setAudioEnabled(false)
    }
  }, [audioAvailable])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    if (portrait || !audioEnabled) {
      audio.pause()
      return
    }
    void audio.play().catch(() => setAudioEnabled(false))
  }, [portrait, audioEnabled])

  const handlePortraitChange = useCallback((next: boolean) => {
    setPortrait(next)
  }, [])

  const handleStart = useCallback(() => {
    const immersive = attemptImmersiveMode()
    void playAudio()
    void preloadImage(ASSETS.building)
    setOpeningFade(true)
    window.setTimeout(() => setScreen('masterplan'), 420)
    void immersive.then((entered) => {
      if (!entered) nudgeBrowserChrome()
    })
  }, [playAudio])

  const resetBuildingState = useCallback(() => {
    setBuildingMode('floor-selection')
    setHoveredFloor(null)
    setSelectedFloor(null)
    setHoveredApartment(null)
    setSelectedApartment(null)
    setApartmentModalOpen(false)
    setHoveredBuilding(false)
  }, [])

  const handleSelectBuilding = useCallback(() => {
    resetBuildingState()
    setScreen('building')
    if (IS_IOS) {
      void preloadImage(ROOM_ASSETS.lounge.src)
    } else {
      void preloadImages(WALKTHROUGH_ROOMS.map((room) => ROOM_ASSETS[room].src))
    }
  }, [resetBuildingState])

  const handleSelectFloor = useCallback((floor: FloorId) => {
    setSelectedFloor(floor)
    setHoveredFloor(null)
    setHoveredApartment(null)
    setSelectedApartment(null)
    setApartmentModalOpen(false)
    setBuildingMode('apartment-selection')
  }, [])

  const handleSelectApartment = useCallback((id: string) => {
    setSelectedApartment(id)
    setApartmentModalOpen(true)
  }, [])

  const handleStartWalkthrough = useCallback(() => {
    setCurrentRoom('lounge')
    void preloadImage(ROOM_ASSETS.lounge.src).finally(() => {
      setScreen('walkthrough')
    })
  }, [])

  const handleExitWalkthrough = useCallback(() => {
    setScreen('building')
  }, [])

  const handleReturnToMasterplan = useCallback(() => {
    resetBuildingState()
    setScreen('masterplan')
  }, [resetBuildingState])

  const handleToggleAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio || !audioAvailable) return
    if (audioEnabled) {
      audio.pause()
      setAudioEnabled(false)
      return
    }
    audio.volume = 0.22
    void audio.play()
      .then(() => setAudioEnabled(true))
      .catch(() => setAudioEnabled(false))
  }, [audioAvailable, audioEnabled])

  return (
    <LandscapeGuard onPortraitChange={handlePortraitChange}>
      <div className="app">
        <audio
          ref={audioRef}
          src={ASSETS.audio}
          loop
          preload="auto"
          playsInline
          onError={() => setAudioAvailable(false)}
        />

        {screen === 'opening' && (
          <OpeningScreen
            fading={openingFade}
            imageReady={openingReady}
            onStart={handleStart}
          />
        )}

        {screen === 'masterplan' && (
          <MasterplanScreen
            hovered={hoveredBuilding}
            onHoverChange={setHoveredBuilding}
            onSelectBuilding={handleSelectBuilding}
            onReturnToMasterplan={handleReturnToMasterplan}
          />
        )}

        {screen === 'building' && (
          <BuildingScreen
            buildingMode={buildingMode}
            hoveredFloor={hoveredFloor}
            selectedFloor={selectedFloor}
            hoveredApartment={hoveredApartment}
            selectedApartment={selectedApartment}
            apartmentModalOpen={apartmentModalOpen}
            onHoverFloor={setHoveredFloor}
            onSelectFloor={handleSelectFloor}
            onHoverApartment={setHoveredApartment}
            onSelectApartment={handleSelectApartment}
            onCloseModal={() => setApartmentModalOpen(false)}
            onStartWalkthrough={handleStartWalkthrough}
            onReturnToMasterplan={handleReturnToMasterplan}
          />
        )}

        {screen === 'walkthrough' && (
          <WalkthroughScreen
            currentRoom={currentRoom}
            onNavigate={setCurrentRoom}
            onExit={handleExitWalkthrough}
            onReturnToMasterplan={handleReturnToMasterplan}
            audioControl={
              <AudioControl
                enabled={audioEnabled && !portrait}
                available={audioAvailable}
                onToggle={handleToggleAudio}
              />
            }
          />
        )}

        {screen !== 'opening' && screen !== 'walkthrough' && (
          <AudioControl
            enabled={audioEnabled && !portrait}
            available={audioAvailable}
            onToggle={handleToggleAudio}
          />
        )}
      </div>
    </LandscapeGuard>
  )
}
