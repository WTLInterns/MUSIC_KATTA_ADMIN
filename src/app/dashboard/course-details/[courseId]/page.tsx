'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { FiThumbsUp, FiThumbsDown, FiShare2, FiSave, FiMoreHorizontal, FiPlay, FiPause, FiVolume2, FiVolumeX, FiMaximize, FiSkipBack, FiSkipForward } from 'react-icons/fi';

const BACKEND_BASE_URL = 'http://localhost:8085';

type VideoItem = {
  videoId: string;
  title: string;
  description: string;
  videoUrl: string;
  postDate: string;
  postTime: string;
};

type CourseWithVideos = {
  courseId: string;
  courseName: string;
  details: string;
  postDate: string;
  postTime: string;
  price: string;
  vedios: VideoItem[];
  courseImageUrl?: string;
};

type MessageState = { type: 'error' | 'info'; text: string } | null;

export default function CourseDetailsPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params?.courseId;
  const videoRef = useRef<HTMLVideoElement>(null);

  const [course, setCourse] = useState<CourseWithVideos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<MessageState>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [controlsTimeout, setControlsTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) {
        setMessage({ type: 'error', text: 'No course ID provided.' });
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setMessage(null);

        // Same endpoint shape as video-management: course + videos by courseId
        const response = await fetch(`${BACKEND_BASE_URL}/api/videos/by-course/${courseId}`);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to load course details.');
        }

        const data = (await response.json()) as CourseWithVideos;
        setCourse(data);
        
        // Set the first video as active by default
        if (data.vedios && data.vedios.length > 0) {
          setActiveVideo(data.vedios[0]);
        }
      } catch (error: any) {
        console.error('Error loading course details:', error);
        setMessage({ type: 'error', text: error.message || 'Error loading course details.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  // Video player functions
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
      setIsMuted(newVolume === 0);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newProgress = parseFloat(e.target.value);
    setProgress(newProgress);
    if (videoRef.current) {
      const time = (newProgress / 100) * duration;
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const duration = videoRef.current.duration;
      setCurrentTime(currentTime);
      setDuration(duration);
      setProgress((currentTime / duration) * 100);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeout) {
      clearTimeout(controlsTimeout);
    }
    const timeout = setTimeout(() => {
      setShowControls(false);
    }, 3000);
    setControlsTimeout(timeout);
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
    // Auto-play next video if available
    if (course && course.vedios && activeVideo) {
      const currentIndex = course.vedios.findIndex(v => v.videoId === activeVideo.videoId);
      if (currentIndex < course.vedios.length - 1) {
        setActiveVideo(course.vedios[currentIndex + 1]);
      }
    }
  };

  // Reset controls timeout when component unmounts
  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout);
      }
    };
  }, [controlsTimeout]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white px-4 py-6 sm:px-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm text-gray-400">Course ID: {courseId}</p>
            <h1 className="mt-1 text-2xl font-bold text-white">Course Videos</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/video-management')}
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Back to Management
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl border text-sm animate-fade-in ${
              message.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-sky-500/40 bg-sky-500/10 text-sky-100'
            }`}
          >
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mb-3"></div>
              <p>Loading course and videos…</p>
            </div>
          </div>
        ) : !course ? (
          <div className="py-10 text-center text-sm text-gray-400">No course found.</div>
        ) : (
          <div className="space-y-6">
            {/* Course Header with Image */}
            {course.courseImageUrl && (
              <div className="rounded-2xl overflow-hidden shadow-2xl">
                <img 
                  src={course.courseImageUrl} 
                  alt={course.courseName} 
                  className="w-full h-64 object-cover"
                />
              </div>
            )}
            
            {/* Main watch area: player + playlist */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left: video player + info */}
              <div className="flex-1 space-y-4">
                {activeVideo ? (
                  <>
                    {/* Video Player Container */}
                    <div 
                      className="relative rounded-2xl overflow-hidden shadow-2xl bg-black group"
                      onMouseMove={handleMouseMove}
                      onMouseLeave={() => setTimeout(() => setShowControls(false), 3000)}
                    >
                      {/* Video Element */}
                      <video
                        key={activeVideo.videoId}
                        ref={videoRef}
                        className="w-full max-h-[70vh] bg-black"
                        src={activeVideo.videoUrl}
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleVideoEnd}
                        onClick={togglePlay}
                      />
                      
                      {/* Custom Video Controls Overlay */}
                      <div 
                        className={`absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end transition-opacity duration-300 ${
                          showControls ? 'opacity-100' : 'opacity-0'
                        }`}
                      >
                        {/* Progress Bar */}
                        <div className="px-4 pb-2">
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={progress}
                            onChange={handleProgressChange}
                            className="w-full h-1.5 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                          />
                          <div className="flex justify-between text-xs text-gray-300 mt-1">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        </div>
                        
                        {/* Control Buttons */}
                        <div className="flex items-center justify-between px-4 pb-4">
                          <div className="flex items-center space-x-4">
                            <button 
                              onClick={togglePlay}
                              className="text-white hover:text-purple-400 transition-colors"
                            >
                              {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                            </button>
                            
                            <button 
                              onClick={toggleMute}
                              className="text-white hover:text-purple-400 transition-colors"
                            >
                              {isMuted ? <FiVolumeX size={20} /> : <FiVolume2 size={20} />}
                            </button>
                            
                            <input
                              type="range"
                              min="0"
                              max="1"
                              step="0.01"
                              value={volume}
                              onChange={handleVolumeChange}
                              className="w-20 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                            />
                          </div>
                          
                          <div className="flex items-center space-x-4">
                            <button className="text-white hover:text-purple-400 transition-colors">
                              <FiMaximize size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                      
                      {/* Play Button Overlay */}
                      {!isPlaying && (
                        <div 
                          className="absolute inset-0 flex items-center justify-center cursor-pointer transition-opacity duration-300"
                          onClick={togglePlay}
                        >
                          <div className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
                            <FiPlay size={32} className="text-white ml-1" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Video Info Section */}
                    <div className="space-y-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-5 shadow-xl border border-gray-700">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <h2 className="text-xl sm:text-2xl font-bold text-white">
                          {activeVideo.title}
                        </h2>
                        <span className="text-xs px-3 py-1 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                          {course.vedios?.length || 0} video{course.vedios?.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-700">
                        <div>
                          <p className="text-sm text-gray-300">
                            {course.courseName}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            Published on {activeVideo.postDate} at {activeVideo.postTime}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <FiThumbsUp size={16} />
                            <span className="text-sm">245</span>
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <FiThumbsDown size={16} />
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <FiShare2 size={16} />
                            <span className="text-sm">Share</span>
                          </button>
                          <button className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <FiSave size={16} />
                            <span className="text-sm">Save</span>
                          </button>
                          <button className="px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 transition-colors">
                            <FiMoreHorizontal size={16} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-700">
                        <p className="text-gray-300 leading-relaxed">
                          {activeVideo.description || "No description available for this video."}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-3 border-t border-gray-700">
                        <span>
                          <span className="uppercase tracking-wide text-gray-500">Course ID:</span>{' '}
                          <span className="font-mono text-gray-200">{course.courseId}</span>
                        </span>
                        <span>
                          <span className="uppercase tracking-wide text-gray-500">Price:</span>{' '}
                          <span className="text-emerald-400 font-semibold">₹{course.price}</span>
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full min-h-[300px] rounded-2xl border-2 border-dashed border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-center px-6 py-12">
                    <div>
                      <div className="text-5xl mb-4">🎬</div>
                      <p className="text-lg font-medium text-white mb-2">No video selected</p>
                      <p className="text-gray-400">
                        Select a video from the playlist to start watching.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: playlist */}
              <div className="w-full lg:w-80 xl:w-96 space-y-4 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 p-5 shadow-xl border border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Playlist</h3>
                  <span className="text-sm text-gray-400">
                    {course.vedios?.length || 0} video{course.vedios?.length === 1 ? '' : 's'}
                  </span>
                </div>

                {course.vedios && course.vedios.length > 0 ? (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
                    {course.vedios.map((video) => {
                      const isActive = activeVideo?.videoId === video.videoId;
                      return (
                        <div
                          key={video.videoId}
                          onClick={() => setActiveVideo(video)}
                          className={`rounded-xl p-3 cursor-pointer transition-all duration-300 ${
                            isActive
                              ? 'bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30'
                              : 'bg-gray-700/50 hover:bg-gray-700 border border-gray-600'
                          }`}
                        >
                          <div className="flex gap-3">
                            <div className="relative flex-shrink-0">
                              <div className="w-24 h-14 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                                <FiPlay className="text-white ml-1" size={16} />
                              </div>
                              {isActive && (
                                <div className="absolute inset-0 rounded-lg border-2 border-purple-500"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-white line-clamp-2 mb-1">
                                {video.title}
                              </h4>
                              <p className="text-xs text-gray-400 line-clamp-2">
                                {video.description || "No description"}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {video.postDate}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-400">No videos available for this course.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/courses/${course.courseId}`)}
                className="px-5 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-all duration-300"
              >
                Edit Course
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/video-management')}
                className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Manage Videos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}