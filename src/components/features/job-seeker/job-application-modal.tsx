// JobApplicationModal.tsx
import { AlertCircle, Download, FileText, Upload } from 'lucide-react';
import React, { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface JobApplicationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultResume: string;
  loading: boolean;
  onSubmit: (data: {
    resume: File | string | null;
    coverLetter: string;
    usingDefault: boolean;
  }) => void;
}

const JobApplicationModal: React.FC<JobApplicationModalProps> = ({
  open,
  onOpenChange,
  defaultResume,
  loading,
  onSubmit,
}) => {
  const [resume, setResume] = useState<File | null>(null);
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [usingDefault, setUsingDefault] = useState<boolean>(true);
  const [defaultResumeFile, setDefaultResumeFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch the default resume and convert it to a File object
  // useEffect(() => {
  //   console.log('flagged');
  //   console.log(defaultResume);
  //   console.log(open);
  //   if (defaultResume && open) {
  //     console.log('fetched');
  //     fetchDefaultResume();
  //   }
  // }, [defaultResume, open]);

  // const fetchDefaultResume = async () => {
  //   try {
  //     setIsLoading(true);
  //     console.log(defaultResume, 'ini result');
  //     const response = await api.get(defaultResume);
  //     console.log('ini result 2');
  //     if (!response.data) throw new Error('Failed to fetch default resume');
  //     console.log('ini result 3');

  //     const blob = await response.data;
  //     // Extract filename from URL or use a default name
  //     const fileName = defaultResume.split('/').pop() || 'default-resume.pdf';

  //     console.log('ini result 4');
  //     // Create a File object from the blob
  //     const file = new File([blob], fileName, { type: 'application/pdf' });
  //     setDefaultResumeFile(file);
  //   } catch (err) {
  //     setError('Could not load default resume');
  //     console.error(err);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check if file is PDF
      if (file.type !== 'application/pdf') {
        setError('Please upload a PDF file');
        return;
      }

      // Check file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size should be less than 5MB');
        return;
      }

      setResume(file);
      setUsingDefault(false);
      setError(null);
    }
  };

  const handleDownloadDefaultResume = () => {
    // Create a download link for the default resume
    const link = document.createElement('a');
    link.href = defaultResume;
    link.download = defaultResume.split('/').pop() || 'default-resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = () => {
    if (coverLetter.trim().length < 50) {
      setError('Cover letter must be at least 50 characters');
      return;
    }

    onSubmit({
      resume: usingDefault ? defaultResume : resume,
      coverLetter,
      usingDefault,
    });

    // Reset form after submission
    setCoverLetter('');
    setResume(null);
    setUsingDefault(true);
    setError(null);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form when canceled
    setCoverLetter('');
    setResume(null);
    setUsingDefault(true);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md md:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Job Application</DialogTitle>
          <DialogDescription>
            Upload your resume and write a cover letter to apply for this
            position.
          </DialogDescription>
        </DialogHeader>

        <div className='space-y-6 py-4'>
          {error && (
            <Alert variant='destructive'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className='space-y-2'>
            <Label htmlFor='resume' className='text-sm font-medium'>
              Resume
            </Label>

            <div className='space-y-2'>
              <div className='flex items-center space-x-2'>
                <FileText className='h-5 w-5 text-gray-500' />
                <span className='text-sm'>
                  {isLoading
                    ? 'Loading resume...'
                    : usingDefault
                    ? 'Using default resume'
                    : resume?.name || 'No file selected'}
                </span>
              </div>

              <div className='flex flex-wrap gap-2'>
                <Button
                  type='button'
                  variant='outline'
                  className='flex items-center space-x-2'
                  onClick={() => {
                    document.getElementById('resume-upload')?.click();
                  }}
                >
                  <Upload className='h-4 w-4' />
                  <span>Replace Resume</span>
                </Button>

                {usingDefault && (
                  <Button
                    type='button'
                    variant='outline'
                    className='flex items-center space-x-2'
                    onClick={handleDownloadDefaultResume}
                    disabled={isLoading}
                  >
                    <Download className='h-4 w-4' />
                    <span>View Default Resume</span>
                  </Button>
                )}

                {!usingDefault && (
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setResume(null);
                      setUsingDefault(true);
                    }}
                  >
                    Use Default Resume
                  </Button>
                )}

                <Input
                  id='resume-upload'
                  type='file'
                  accept='.pdf'
                  className='hidden'
                  onChange={handleFileChange}
                />
              </div>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='coverLetter' className='text-sm font-medium'>
              Cover Letter
            </Label>
            <Textarea
              id='coverLetter'
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className='min-h-32'
              placeholder='Write your cover letter here...'
            />
          </div>
        </div>

        <DialogFooter>
          <Button disabled={loading} variant='outline' onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || loading}>
            Submit Application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default JobApplicationModal;
