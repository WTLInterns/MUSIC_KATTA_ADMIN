'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

const BACKEND_BASE_URL = 'http://localhost:8085';

type Course = {
  courseId: string;
  courseName: string;
  details: string;
  postDate: string;
  postTime: string;
  price: string;
};

type MessageState = { type: 'success' | 'error'; text: string } | null;

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params?.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [courseName, setCourseName] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

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
        const response = await fetch(`${BACKEND_BASE_URL}/course/get-course/${courseId}`);

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to load course details.');
        }

        const data = (await response.json()) as Course;
        setCourse(data);
        setCourseName(data.courseName ?? '');
        setDetails(data.details ?? '');
        setPrice(data.price ?? '');
      } catch (error: any) {
        console.error('Error fetching course:', error);
        setMessage({ type: 'error', text: error.message || 'Error loading course.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseId) return;

    if (!courseName || !details || !price) {
      setMessage({ type: 'error', text: 'Please fill in course name, details and price.' });
      return;
    }

    try {
      setIsSaving(true);
      setMessage(null);

      // Adjust method/path if your backend uses PUT or a different URL for updates
      const response = await fetch(`${BACKEND_BASE_URL}/course/update-course/${courseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseName,
          details,
          price,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to update course');
      }

      setMessage({ type: 'success', text: 'Course updated successfully.' });
    } catch (error: any) {
      console.error('Error updating course:', error);
      setMessage({ type: 'error', text: error.message || 'Error updating course.' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500">Course ID: {courseId}</p>
          <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard/video-management')}
          className="px-4 py-2 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Back to Management
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.type === 'error'
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-500 text-sm">Loading course details…</p>
      ) : !course ? (
        <p className="text-gray-500 text-sm">Course not found.</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-lg shadow p-6">
          <div>
            <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 mb-1">
              Course Name
            </label>
            <input
              id="course-name"
              type="text"
              value={courseName}
              onChange={(e) => setCourseName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter course name"
              required
            />
          </div>

          <div>
            <label htmlFor="course-details" className="block text-sm font-medium text-gray-700 mb-1">
              Details
            </label>
            <textarea
              id="course-details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Describe the course"
              required
            />
          </div>

          <div>
            <label htmlFor="course-price" className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              id="course-price"
              type="text"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter price"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSaving ? 'Saving…' : 'Update Course'}
          </button>
        </form>
      )}
    </div>
  );
}
