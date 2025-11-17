'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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
};

type MessageState = { type: 'error' | 'info'; text: string } | null;

export default function CourseDetailsPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params?.courseId;

  const [course, setCourse] = useState<CourseWithVideos | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<MessageState>(null);
  const [activeVideo, setActiveVideo] = useState<VideoItem | null>(null);

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
      } catch (error: any) {
        console.error('Error loading course details:', error);
        setMessage({ type: 'error', text: error.message || 'Error loading course details.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 px-6 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Course ID: {courseId}</p>
            <h1 className="mt-1 text-2xl font-bold">Course Videos</h1>
          </div>
          <button
            type="button"
            onClick={() => router.push('/dashboard/video-management')}
            className="px-4 py-2 rounded-md border border-slate-700 text-sm font-medium text-slate-100 hover:bg-slate-800/70 transition"
          >
            Back to Management
          </button>
        </div>

        {message && (
          <div
            className={`p-4 rounded-lg border text-sm ${
              message.type === 'error'
                ? 'border-red-500/40 bg-red-500/10 text-red-200'
                : 'border-sky-500/40 bg-sky-500/10 text-sky-100'
            }`}
          >
            {message.text}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
            Loading course and videos…
          </div>
        ) : !course ? (
          <div className="py-10 text-center text-sm text-slate-400">No course found.</div>
        ) : (
          <div className="space-y-6">
            {/* Main watch area: player + playlist */}
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left: video player + info (only after a video is selected) */}
              <div className="flex-1 space-y-4">
                {activeVideo ? (
                  <>
                    <div className="rounded-2xl border border-slate-800 bg-black overflow-hidden shadow-xl">
                      <video
                        key={activeVideo.videoId}
                        controls
                        className="w-full max-h-[480px] bg-black"
                        src={activeVideo.videoUrl}
                      />
                    </div>

                    <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <h2 className="text-lg sm:text-xl font-semibold text-slate-50">
                          {activeVideo.title}
                        </h2>
                        <span className="text-[11px] px-2 py-0.5 rounded-full border border-cyan-500/40 bg-cyan-500/10 text-cyan-200">
                          {course.vedios?.length || 0} video{course.vedios?.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {activeVideo.postDate} | {activeVideo.postTime}
                      </p>
                      <p className="text-sm text-slate-300 leading-relaxed">
                        {activeVideo.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-[11px] text-slate-400">
                        <span>
                          <span className="uppercase tracking-wide text-slate-500">Course ID:</span>{' '}
                          <span className="font-mono text-slate-200">{course.courseId}</span>
                        </span>
                        <span>
                          <span className="uppercase tracking-wide text-slate-500">Price:</span>{' '}
                          <span className="text-emerald-300 font-semibold">₹{course.price}</span>
                        </span>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full min-h-[220px] rounded-2xl border border-dashed border-slate-800 bg-slate-950/60 flex items-center justify-center text-center px-6">
                    <div>
                      <p className="text-sm font-medium text-slate-100 mb-1">No video selected</p>
                      <p className="text-xs text-slate-400">
                        First select a video from the list on the right to start playing it here.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Right: playlist */}
              <div className="w-full lg:w-80 xl:w-96 space-y-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-semibold text-slate-50">Playlist · Course videos</h3>
                  <span className="text-[11px] text-slate-400">
                    {course.vedios?.length || 0} video{course.vedios?.length === 1 ? '' : 's'}
                  </span>
                </div>

                {course.vedios && course.vedios.length > 0 ? (
                  <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                    {course.vedios.map((video) => {
                      const isActive = activeVideo?.videoId === video.videoId;
                      return (
                        <button
                          key={video.videoId}
                          type="button"
                          onClick={() => setActiveVideo(video)}
                          className={`w-full text-left rounded-xl border px-3 py-2 text-xs transition ${
                            isActive
                              ? 'border-cyan-500/60 bg-cyan-500/15 text-slate-50'
                              : 'border-slate-800 bg-slate-900/60 text-slate-200 hover:bg-slate-900'
                          }`}
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[13px] font-semibold line-clamp-2">{video.title}</span>
                            {video.description && (
                              <span className="text-[11px] text-slate-400 line-clamp-2">{video.description}</span>
                            )}
                            <span className="text-[10px] text-slate-500">
                              {video.postDate} · {video.postTime}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400">No videos available for this course.</p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-end text-xs">
              <button
                type="button"
                onClick={() => router.push(`/dashboard/courses/${course.courseId}`)}
                className="px-4 py-2 rounded-md border border-slate-700 bg-slate-900/70 text-slate-100 hover:bg-slate-800/90 transition"
              >
                Edit Course
              </button>
              <button
                type="button"
                onClick={() => router.push('/dashboard/video-management')}
                className="px-4 py-2 rounded-md bg-cyan-500 text-slate-950 font-medium hover:bg-cyan-400 transition"
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

