'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import 'plyr-react/plyr.css'

const Plyr = dynamic(() => import('plyr-react').then((mod) => mod.Plyr), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-black">
      <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
    </div>
  ),
})

type VideoPlayerProps = {
  lessonId: string | number
  title?: string
  onEnded?: () => void
}

export default function VideoPlayer({
  lessonId,
  title,
  onEnded,
}: VideoPlayerProps) {
  useEffect(() => {
    const video = document.querySelector('.plyr-react video') as HTMLVideoElement | null
    if (!video) return

    const onVideoEnded = () => {
      if (onEnded) {
        onEnded()
      }
    }

    video.addEventListener('ended', onVideoEnded)

    return () => {
      video.removeEventListener('ended', onVideoEnded)
    }
  }, [lessonId, onEnded])

  const videoSrc = `/api/video/${lessonId}`

  return (
    <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-white/10">
      <div className="video-player-wrap w-full h-full">
        <Plyr
        source={{
          type: 'video',
          title: title || '',
          sources: [
            {
              src: videoSrc,
            },
          ],
        }}
        options={{
          controls: [
            'play-large',
            'play',
            'progress',
            'current-time',
            'duration',
            'mute',
            'volume',
            'settings',
            'fullscreen',
          ],
          settings: ['speed'],
          speed: {
            selected: 1,
            options: [0.5, 0.75, 1, 1.25, 1.5, 2],
          },
          tooltips: {
            controls: true,
            seek: true,
          },
          keyboard: {
            focused: true,
            global: true,
          },
          invertTime: false,
        }}
        />
      </div>
    </div>
  )
}
