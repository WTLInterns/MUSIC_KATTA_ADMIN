'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';

const BACKEND_BASE_URL = 'http://localhost:8085';

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
  courseImageUrl?: string;
};

type MessageState = { type: 'success' | 'error'; text: string } | null;

export default function EditCoursePage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const courseId = params?.courseId;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [course, setCourse] = useState<Course | null>(null);
  const [courseName, setCourseName] = useState('');
  const [details, setDetails] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  // Calculate discount percentage when prices change
  useEffect(() => {
    if (originalPrice && price) {
      const original = parseFloat(originalPrice);
      const discounted = parseFloat(price);
      
      if (!isNaN(original) && !isNaN(discounted) && original > 0) {
        const discount = ((original - discounted) / original) * 100;
        setDiscountPercentage(discount.toFixed(0));
      } else {
        setDiscountPercentage('');
      }
    } else {
      setDiscountPercentage('');
    }
  }, [originalPrice, price]);

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
        setOriginalPrice(data.originalPrice ?? '');
        setStatus(data.status ?? 'ACTIVE');
        
        // Calculate discount percentage if not provided
        if (data.originalPrice && data.price && !data.discountPercentage) {
          const original = parseFloat(data.originalPrice);
          const discounted = parseFloat(data.price);
          if (!isNaN(original) && !isNaN(discounted) && original > 0) {
            const discount = ((original - discounted) / original) * 100;
            setDiscountPercentage(discount.toFixed(0));
          }
        } else {
          setDiscountPercentage(data.discountPercentage ?? '');
        }
        
        if (data.courseImageUrl) {
          setImagePreview(data.courseImageUrl);
        }
      } catch (error: any) {
        console.error('Error fetching course:', error);
        setMessage({ type: 'error', text: error.message || 'Error loading course.' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [courseId]);

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

      // Create FormData for multipart request
      const formData = new FormData();
      formData.append('courseName', courseName);
      formData.append('details', details);
      formData.append('price', price);
      if (originalPrice) formData.append('originalPrice', originalPrice);
      formData.append('status', status);
      
      // Only append image if one is selected
      if (selectedImage) {
        formData.append('image', selectedImage);
      }

      const response = await fetch(`${BACKEND_BASE_URL}/course/update-course/${courseId}`, {
        method: 'PUT',
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Failed to update course');
      }

      const updatedCourse = await response.json();
      setCourse(updatedCourse);
      
      if (updatedCourse.courseImageUrl) {
        setImagePreview(updatedCourse.courseImageUrl);
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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-xs text-gray-500">Course ID: {courseId}</p>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Edit Course</h1>
        </div>
        <button
          type="button"
          onClick={() => router.push('/dashboard/video-management')}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Back to Management
        </button>
      </div>

      {message && (
        <div
          className={`mb-4 p-4 rounded-xl shadow-lg animate-fade-in ${
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

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : !course ? (
        <div className="text-center py-10 bg-gray-50 dark:bg-gray-800 rounded-xl">
          <div className="text-4xl mb-3">❌</div>
          <p className="text-gray-500 dark:text-gray-400">Course not found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Upload Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 h-full">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Course Image</h2>
              
              <div className="space-y-4">
                {/* Image Preview */}
                <div className="relative">
                  {imagePreview ? (
                    <div className="relative">
                      <img 
                        src={imagePreview} 
                        alt="Course preview" 
                        className="w-full h-48 object-cover rounded-xl border-2 border-gray-200 dark:border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
                      <div className="text-center">
                        <div className="text-3xl mb-2">🖼️</div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm">No image selected</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* File Input */}
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-lg file:border-0
                      file:text-sm file:font-semibold
                      file:bg-gradient-to-r file:from-purple-500 file:to-indigo-500
                      file:text-white
                      hover:file:from-purple-600 hover:file:to-indigo-600
                      cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    JPG, PNG, or GIF (max 5MB)
                  </p>
                </div>
                
                {/* Current Image Info */}
                {course.courseImageUrl && !selectedImage && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    <p>Currently using uploaded image from Cloudinary</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Course Details Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Course Details</h2>
              
              <div className="space-y-5">
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
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 input-enhanced rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Describe the course"
                    required
                  />
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
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
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

                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full btn-vibrant rounded-xl flex justify-center py-3 px-4 shadow-lg disabled:opacity-50"
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <span className="animate-spin mr-2">🌀</span> Saving...
                    </span>
                  ) : (
                    'Update Course'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}