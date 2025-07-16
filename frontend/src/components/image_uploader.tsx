'use client';

import { createClient } from '@/utils/supabase/client';
import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { DEFAULT_PROFILE_PICTURE_URL } from '@/utils/constants';

type ImageType = 'profile' | 'hike-large' | 'hike-small' | 'restaurant-large' | 'restaurant-small';

interface Props {
  type: ImageType;
  onUpload?: (url: string) => void;
  initialUrl?: string;
  className?: string;
  imageWidth: number;
  imageHeight: number;
}

export default function ImageUploader({ 
  type, 
  onUpload, 
  initialUrl = '', 
  className, 
  imageWidth, 
  imageHeight 
}: Props) {
  console.log('ImageUploader received props:', { 
  initialUrl, 
  type,
  hasOnUpload: !!onUpload 
});

  const [url, setUrl] = useState(initialUrl || DEFAULT_PROFILE_PICTURE_URL);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Debug logging helper
  const debugLog = (message: string, data?: unknown) => {
    console.log(`[ImageUploader-${type}] ${message}`, data || '');
  };

  // Allow parent to provide an initial image
useEffect(() => {
  console.log('🔄 ImageUploader useEffect called with:', { initialUrl, currentUrl: url });
  if (initialUrl) {
    console.log('✅ Setting URL to:', initialUrl);
    setUrl(initialUrl);
  } else {
    console.log('❌ initialUrl is falsy, not updating');
  }
}, [initialUrl]);

  // Clean up local preview blob URL when component unmounts or new file is picked
  useEffect(() => {
    return () => {
      if (localPreview) {
        debugLog('Cleaning up local preview blob URL', localPreview);
        URL.revokeObjectURL(localPreview);
      }
    };
  }, [localPreview]);

  const handleClick = () => {
    debugLog('Image clicked - opening file dialog');
    fileInputRef.current?.click();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      debugLog('No file selected');
      return;
    }

    debugLog('File selected for upload', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    setIsUploading(true);

    try {
      // Show local preview immediately
      const tempUrl = URL.createObjectURL(file);
      setLocalPreview(tempUrl);
      debugLog('Local preview created', tempUrl);

      const form = new FormData();
      form.append('file', file);

      const supabase = createClient();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        debugLog('Error getting session', error);
        throw new Error(`Session error: ${error.message}`);
      }

      const token = session?.access_token;
      if (!token) {
        debugLog('No access token found');
        throw new Error('You must be logged in.');
      }

      debugLog('Starting upload to R2', { type, hasToken: !!token });

      const res = await fetch(`/api/upload?type=${type}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      debugLog('Upload response received', {
        status: res.status,
        statusText: res.statusText,
        ok: res.ok
      });

      if (!res.ok) {
        throw new Error(`Upload failed with status: ${res.status}`);
      }

      const data = await res.json();
      debugLog('Upload response data', data);

      if (data?.url) {
        setUrl(data.url);
        onUpload?.(data.url);
        debugLog('Upload successful, URL updated', data.url);

        // Clean up local preview
        URL.revokeObjectURL(tempUrl);
        setLocalPreview(null);
        debugLog('Local preview cleaned up');
      } else {
        throw new Error('Upload response missing URL');
      }
    } catch (error) {
      debugLog('Upload error', error);
      alert(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Clean up local preview on error
      if (localPreview) {
        URL.revokeObjectURL(localPreview);
        setLocalPreview(null);
      }
    } finally {
      setIsUploading(false);
      debugLog('Upload process completed');
    }
  };

  // Determine which image to display (priority: localPreview > url > default)
  const displayUrl = localPreview || url || DEFAULT_PROFILE_PICTURE_URL;

  debugLog('Rendering with displayUrl', { displayUrl, localPreview, url, isUploading });

  return (
    <div className={`relative ${className}`}>
      <div
        onClick={handleClick}
        className="cursor-pointer relative group"
        style={{ width: imageWidth, height: imageHeight }}
      >
        <Image
          src={displayUrl}
          alt="Profile picture"
          width={imageWidth}
          height={imageHeight}
          className="rounded-full object-cover"
          onError={(e) => {
            debugLog('Image load error, falling back to default', {
              src: displayUrl,
              error: e
            });
            setUrl(DEFAULT_PROFILE_PICTURE_URL);
          }}
        />
        
        {/* Loading overlay */}
        {isUploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        
        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center">
          <span className="text-white opacity-0 group-hover:opacity-100 text-sm font-medium">
            Change
          </span>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleUpload}
        className="hidden"
        style = {{display:'none'}}
      />
    </div>
  );
}