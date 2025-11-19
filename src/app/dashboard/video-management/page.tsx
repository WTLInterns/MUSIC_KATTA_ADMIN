'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getUserInfo } from '@/lib/auth';

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
  originalPrice?: string;
  discountPercentage?: string;
  status?: string;
  courseDuration?: string;
  keywords?: string | string[];
  vedios: VideoItem[];
};

type Course = {
  courseId: string;
  courseName: string;
  details: string;
  postDate: string;
  postTime: string;
  price: string;
  originalPrice?: string;
  discountPercentage?: string;
  status?: string;
  courseDuration?: string;
  keywords?: string | string[];
};

const BACKEND_BASE_URL = 'http://localhost:8085';

export default function VideoManagement() {
  const [isUser, setIsUser] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Course creation state
  const [isCreatingCourse, setIsCreatingCourse] = useState(false);
  const [courseName, setCourseName] = useState('');
  const [courseDetails, setCourseDetails] = useState('');
  const [coursePrice, setCoursePrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [courseDuration, setCourseDuration] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Course videos management state
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [loadedCourse, setLoadedCourse] = useState<CourseWithVideos | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);
  const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
  const [isFetchingCourseDetails, setIsFetchingCourseDetails] = useState(false);

  // Video upload state
  const [videoTitle, setVideoTitle] = useState('');
  const [videoDescription, setVideoDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);

  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  const router = useRouter();

  // Check if user is logged in and has admin role
  useEffect(() => {
    const checkAuth = () => {
      const userInfo = getUserInfo();
      if (!userInfo || !userInfo.isLoggedIn) {
        router.push('/login');
        return;
      }
      setIsUser(true);
    };

    checkAuth();
  }, [router]);

  // Calculate discount percentage when prices change
  useEffect(() => {
    if (originalPrice && coursePrice) {
      const original = parseFloat(originalPrice);
      const discounted = parseFloat(coursePrice);
      
      if (!isNaN(original) && !isNaN(discounted) && original > 0) {
        const discount = ((original - discounted) / original) * 100;
        setDiscountPercentage(discount.toFixed(0));
      } else {
        setDiscountPercentage('');
      }
    } else {
      setDiscountPercentage('');
    }
  }, [originalPrice, coursePrice]);

  useEffect(() => {
    if (!isUser) return;

    const fetchCourses = async () => {
      try {
        setIsLoadingCourses(true);
        setMessage(null);
        const response = await fetch(`${BACKEND_BASE_URL}/course/all-courses`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || 'Failed to load courses');
        }
        const data = (await response.json()) as Course[];
        setCourses(data);
      } catch (error: any) {
        console.error('Error loading courses:', error);
        showError(error.message || 'Error loading courses');
      } finally {
        setIsLoadingCourses(false);
      }
    };

    fetchCourses();
  }, [isUser]);

  const showError = (text: string) => {
    setMessage({ type: 'error', text });
  };

  const showSuccess = (text: string) => {
    setMessage({ type: 'success', text });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!courseName || !courseDetails || !coursePrice) {
      showError('Please fill in course name, details and price.');
      return;
    }

    try {
      setIsCreatingCourse(true);

      // Create FormData for multipart request
      const formData = new FormData();
      formData.append('courseName', courseName);
      formData.append('details', courseDetails);
      formData.append('price', coursePrice);
      if (courseDuration) formData.append('courseDuration', courseDuration);
      if (originalPrice) formData.append('originalPrice', originalPrice);
      formData.append('status', status);

      if (keywordsInput.trim()) {
        keywordsInput
          .split(',')
          .map((k) => k.trim())
          .filter((k) => k.length > 0)
          .forEach((k) => formData.append('keywords', k));
      }
      
      // Only append image if one is selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${BACKEND_BASE_URL}/course/create-course-with-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to create course');
      }

      const data = (await response.json()) as CourseWithVideos;
      showSuccess(`Course created successfully with ID: ${data.courseId}`);

      // Reset form
      setCourseName('');
      setCourseDetails('');
      setCoursePrice('');
      setOriginalPrice('');
      setDiscountPercentage('');
      setStatus('ACTIVE');
      setCourseDuration('');
      setKeywordsInput('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Refresh courses list
      const coursesResponse = await fetch(`${BACKEND_BASE_URL}/course/all-courses`);
      if (coursesResponse.ok) {
        const coursesData = (await coursesResponse.json()) as Course[];
        setCourses(coursesData);
      }

      // Optionally pre-fill selected course for video management
      setSelectedCourseId(data.courseId ?? '');
      setLoadedCourse(null);
    } catch (error: any) {
      console.error('Error creating course:', error);
      showError(error.message || 'Error creating course');
    } finally {
      setIsCreatingCourse(false);
    }
  };

  const handleLoadCourse = async () => {
    if (!selectedCourseId) {
      showError('Please select a course before loading videos.');
      return;
    }

    try {
      setIsLoadingCourse(true);
      setMessage(null);

      const response = await fetch(`${BACKEND_BASE_URL}/api/videos/by-course/${selectedCourseId}`);

      if (response.status === 404) {
        setLoadedCourse(null);
        showError('Course not found for the provided ID.');
        return;
      }

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to load course and videos');
      }

      const data = (await response.json()) as CourseWithVideos;
      setLoadedCourse(data);
    } catch (error: any) {
      console.error('Error loading course:', error);
      showError(error.message || 'Error loading course');
    } finally {
      setIsLoadingCourse(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!selectedCourseId) {
      showError('Please select a course before uploading a video.');
      return;
    }

    if (!videoTitle || !selectedFile) {
      showError('Please fill in video title and select a video file.');
      return;
    }

    try {
      setIsUploadingVideo(true);

      const formData = new FormData();
      formData.append('title', videoTitle);
      formData.append('description', videoDescription);
      formData.append('video', selectedFile);

      const response = await fetch(`${BACKEND_BASE_URL}/videos/upload/${selectedCourseId}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to upload video');
      }

      showSuccess('Video uploaded successfully.');

      // Reset form
      setVideoTitle('');
      setVideoDescription('');
      setSelectedFile(null);
      const fileInput = document.getElementById('video-file') as HTMLInputElement | null;
      if (fileInput) {
        fileInput.value = '';
      }

      // Refresh loaded course videos
      await handleLoadCourse();
    } catch (error: any) {
      console.error('Error uploading video:', error);
      showError(error.message || 'Error uploading video');
    } finally {
      setIsUploadingVideo(false);
    }
  };

  const handleDeleteVideo = async (videoId: string) => {
    if (!window.confirm('Are you sure you want to delete this video?')) {
      return;
    }

    try {
      setMessage(null);
      const response = await fetch(`${BACKEND_BASE_URL}/videos/delete/${videoId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to delete video');
      }

      showSuccess('Video deleted successfully.');
      await handleLoadCourse();
    } catch (error: any) {
      console.error('Error deleting video:', error);
      showError(error.message || 'Error deleting video');
    }
  };

  const handleCourseSelect = async (courseId: string) => {
    setSelectedCourseId(courseId);
    setLoadedCourse(null);

    if (!courseId) {
      setSelectedCourseDetails(null);
      return;
    }

    try {
      setIsFetchingCourseDetails(true);
      setMessage(null);
      const response = await fetch(`${BACKEND_BASE_URL}/course/get-course/${courseId}`);
      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to fetch course details');
      }
      const data = (await response.json()) as Course;
      setSelectedCourseDetails(data);
    } catch (error: any) {
      console.error('Error fetching course details:', error);
      setSelectedCourseDetails(null);
      showError(error.message || 'Error fetching course details');
    } finally {
      setIsFetchingCourseDetails(false);
    }
  };

  if (!isUser) {
    return <div className="flex items-center justify-center min-h-screen bg-gradient-animated">
      <div className="animate-pulse-slow text-2xl font-bold text-white">Loading...</div>
    </div>;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2 text-gray-900 dark:text-white">Course & Video Management</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">Create courses and manage video content</p>

        {message && (
          <div
            className={`mb-6 p-4 rounded-xl shadow-lg animate-fade-in ${
              message.type === 'error' 
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
                : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
            }`}
          >
            <div className="flex items-center">
              {message.type === 'error' ? (
                <span className="mr-2 text-xl">⚠️</span>
              ) : (
                <span className="mr-2 text-xl">✅</span>
              )}
              {message.text}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Course Creation */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover-lift animate-slide-in-left">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create Course</h2>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                🎓
              </div>
            </div>
            <form onSubmit={handleCreateCourse} className="space-y-5">
              <div>
                <label htmlFor="course-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Name
                </label>
                <input
                  id="course-name"
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter course name"
                  required
                />
              </div>

              <div>
                <label htmlFor="course-details" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Details
                </label>
                <textarea
                  id="course-details"
                  value={courseDetails}
                  onChange={(e) => setCourseDetails(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Describe the course"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="course-duration" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Duration
                  </label>
                  <input
                    id="course-duration"
                    type="text"
                    value={courseDuration}
                    onChange={(e) => setCourseDuration(e.target.value)}
                    className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. 8 weeks"
                  />
                </div>

                <div>
                  <label htmlFor="course-keywords" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Keywords (comma separated)
                  </label>
                  <input
                    id="course-keywords"
                    type="text"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="e.g. Beginner, Guitar, Kids"
                  />
                </div>
              </div>

              {/* Pricing Section */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing</h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="original-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Original Price (₹) *
                    </label>
                    <input
                      id="original-price"
                      type="number"
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(e.target.value)}
                      className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter original price"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="course-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Price (₹)
                      </label>
                      <input
                        id="course-price"
                        type="number"
                        value={coursePrice}
                        onChange={(e) => setCoursePrice(e.target.value)}
                        className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter price"
                      />
                    </div>

                    <div>
                      <label htmlFor="discount-percentage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Discount (%)
                      </label>
                      <input
                        id="discount-percentage"
                        type="text"
                        value={discountPercentage ? `${discountPercentage}%` : ''}
                        readOnly
                        className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white bg-gray-100 dark:bg-gray-600"
                        placeholder="Discount %"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Status
                  </label>
                  <select
                    id="status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Image Upload Section */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Course Image (Optional)
                </label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-full max-w-xs">
                    <img 
                      src={imagePreview} 
                      alt="Course preview" 
                      className="w-full h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                )}
                
                {/* File Input */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-3 file:py-2 file:px-3
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gradient-to-r file:from-purple-500 file:to-indigo-500
                      file:text-white
                      hover:file:from-purple-600 hover:file:to-indigo-600
                      cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    JPG, PNG, or GIF (optional)
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={isCreatingCourse}
                className="w-full btn-vibrant rounded-xl flex justify-center py-3 px-4 shadow-lg disabled:opacity-50"
              >
                {isCreatingCourse ? (
                  <span className="flex items-center">
                    <span className="animate-spin mr-2">🌀</span> Creating...
                  </span>
                ) : (
                  'Create Course'
                )}
              </button>
            </form>
          </div>

          {/* Course Videos Management */}
          <div className="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-xl p-6 hover-lift animate-slide-in-left" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Course Videos</h2>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white">
                🎥
              </div>
            </div>

            {/* Course selection dropdown */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Select Course</h3>
                {isLoadingCourses && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <span className="animate-spin mr-1">🌀</span> Loading...
                  </span>
                )}
              </div>
              <select
                className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:bg-gray-700 dark:text-white"
                value={selectedCourseId}
                onChange={(e) => handleCourseSelect(e.target.value)}
              >
                <option value="">Select a course</option>
                {courses.map((course) => (
                  <option key={course.courseId} value={course.courseId}>
                    {course.courseName} {course.status === 'INACTIVE' && '(Inactive)'}
                  </option>
                ))}
              </select>

              {selectedCourseId && (
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/course-details/${selectedCourseId}`)}
                    className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                  >
                    <span className="mr-2">👁️</span> View Details
                  </button>
                  <button
                    type="button"
                    onClick={handleLoadCourse}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                  >
                    <span className="mr-2">➕</span> Add Video
                  </button>
                  <button
                    type="button"
                    onClick={() => router.push(`/dashboard/courses/${selectedCourseId}`)}
                    className="px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-800 text-white rounded-lg hover:from-gray-800 hover:to-gray-900 transition-all duration-300 shadow-md hover:shadow-lg flex items-center"
                  >
                    <span className="mr-2">✏️</span> Edit Course
                  </button>
                </div>
              )}
            </div>

            {selectedCourseDetails && (
              <div className="mb-6 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-700 dark:to-gray-800 animate-fade-in">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Selected Course Details</h3>
                  {isFetchingCourseDetails && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                      <span className="animate-spin mr-1">🌀</span> Refreshing…
                    </span>
                  )}
                </div>
                <p className="text-base font-bold text-gray-900 dark:text-white">{selectedCourseDetails.courseName}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">{selectedCourseDetails.details}</p>
                <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">ID:</span> <span className="font-mono">{selectedCourseDetails.courseId}</span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Price:</span> <span className="font-semibold text-gray-900 dark:text-white">₹{selectedCourseDetails.price}</span>
                  </p>
                  {selectedCourseDetails.originalPrice && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Original Price:</span> <span className="line-through">₹{selectedCourseDetails.originalPrice}</span>
                    </p>
                  )}
                  {selectedCourseDetails.discountPercentage && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Discount:</span> <span className="text-green-600 font-semibold">{selectedCourseDetails.discountPercentage}%</span>
                    </p>
                  )}
                  <p className="text-gray-600 dark:text-gray-400">
                    <span className="font-medium">Status:</span> 
                    <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                      selectedCourseDetails.status === 'ACTIVE' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {selectedCourseDetails.status}
                    </span>
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 col-span-2">
                    <span className="font-medium">Posted:</span> {selectedCourseDetails.postDate} at {selectedCourseDetails.postTime}
                  </p>
                  {selectedCourseDetails.courseDuration && (
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Duration:</span> {selectedCourseDetails.courseDuration}
                    </p>
                  )}
                  {selectedCourseDetails.keywords && (
                    (() => {
                      const kw = selectedCourseDetails.keywords;
                      let text = '';

                      if (Array.isArray(kw)) {
                        if (kw.length === 0) return null;
                        text = kw.join(', ');
                      } else if (typeof kw === 'string' && kw.trim().length > 0) {
                        text = kw;
                      } else {
                        return null;
                      }

                      return (
                        <p className="text-gray-600 dark:text-gray-400 col-span-2">
                          <span className="font-medium">Keywords:</span> {text}
                        </p>
                      );
                    })()
                  )}
                </div>
              </div>
            )}

            {/* Course details and videos */}
            {loadedCourse && (
              <div className="space-y-6 animate-fade-in">
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-gray-700 dark:to-gray-800">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{loadedCourse.courseName}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{loadedCourse.details}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">ID:</span> <span className="font-mono">{loadedCourse.courseId}</span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Price:</span> <span className="font-semibold">₹{loadedCourse.price}</span>
                    </p>
                    {loadedCourse.originalPrice && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Original Price:</span> <span className="line-through">₹{loadedCourse.originalPrice}</span>
                      </p>
                    )}
                    {loadedCourse.discountPercentage && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Discount:</span> <span className="text-green-600 font-semibold">{loadedCourse.discountPercentage}%</span>
                      </p>
                    )}
                    <p className="text-gray-600 dark:text-gray-400">
                      <span className="font-medium">Status:</span> 
                      <span className={`ml-1 px-2 py-0.5 rounded-full text-xs ${
                        loadedCourse.status === 'ACTIVE' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {loadedCourse.status}
                      </span>
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 col-span-2">
                      <span className="font-medium">Posted:</span> {loadedCourse.postDate} at {loadedCourse.postTime}
                    </p>
                    {loadedCourse.courseDuration && (
                      <p className="text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Duration:</span> {loadedCourse.courseDuration}
                      </p>
                    )}
                    {loadedCourse.keywords && (
                      (() => {
                        const kw = loadedCourse.keywords;
                        let text = '';

                        if (Array.isArray(kw)) {
                          if (kw.length === 0) return null;
                          text = kw.join(', ');
                        } else if (typeof kw === 'string' && kw.trim().length > 0) {
                          text = kw;
                        } else {
                          return null;
                        }

                        return (
                          <p className="text-gray-600 dark:text-gray-400 col-span-2">
                            <span className="font-medium">Keywords:</span> {text}
                          </p>
                        );
                      })()
                    )}
                  </div>
                </div>

                {/* Video upload form */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-white dark:bg-gray-800 shadow-md">
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-4">Upload New Video</h3>
                  <form onSubmit={handleUploadVideo} className="space-y-4">
                    <div>
                      <label htmlFor="video-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Video Title
                      </label>
                      <input
                        id="video-title"
                        type="text"
                        value={videoTitle}
                        onChange={(e) => setVideoTitle(e.target.value)}
                        className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter video title"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="video-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Description
                      </label>
                      <textarea
                        id="video-description"
                        value={videoDescription}
                        onChange={(e) => setVideoDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        placeholder="Enter video description"
                      />
                    </div>

                    <div>
                      <label htmlFor="video-file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Video File
                      </label>
                      <div className="relative">
                        <input
                          id="video-file"
                          type="file"
                          accept="video/*"
                          onChange={handleFileChange}
                          className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-blue-500 file:to-cyan-500 file:text-white hover:file:from-blue-600 hover:file:to-cyan-600"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploadingVideo}
                      className="w-full btn-vibrant rounded-xl flex justify-center py-3 px-4 shadow-lg disabled:opacity-50"
                    >
                      {isUploadingVideo ? (
                        <span className="flex items-center">
                          <span className="animate-spin mr-2">🌀</span> Uploading...
                        </span>
                      ) : (
                        'Upload Video'
                      )}
                    </button>
                  </form>
                </div>

                {/* Videos list */}
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white">Videos</h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {loadedCourse.vedios?.length || 0} videos
                    </span>
                  </div>
                  {loadedCourse.vedios && loadedCourse.vedios.length > 0 ? (
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                      {loadedCourse.vedios.map((video) => (
                        <div
                          key={video.videoId}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 hover-lift transition-all duration-300"
                        >
                          <div className="mb-3 sm:mb-0 sm:mr-4">
                            <h4 className="font-bold text-gray-900 dark:text-white flex items-center">
                              <span className="mr-2">🎬</span> {video.title}
                            </h4>
                            {video.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">{video.description}</p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                              {video.postDate} | {video.postTime}
                            </p>
                            <a
                              href={video.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 inline-block font-medium"
                            >
                              Open Video →
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteVideo(video.videoId)}
                            className="self-start sm:self-auto mt-2 sm:mt-0 px-3 py-1 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-medium hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow hover:shadow-md flex items-center"
                          >
                            <span className="mr-1">🗑️</span> Delete
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="text-4xl mb-3">📭</div>
                      <p className="text-gray-500 dark:text-gray-400">No videos found for this course.</p>
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Upload your first video above</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!loadedCourse && !isLoadingCourse && (
              <div className="text-center py-10 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl">
                <div className="text-5xl mb-4 animate-bounce">👆</div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">Load a course by ID to manage its videos.</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Select a course from the dropdown above</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}