'use client';

import { JobPostingSectionProps } from '@/app/[locale]/app/hr/(sidebar)/make-offering/form/form.types';

const Review = ({ form }: JobPostingSectionProps) => {
  const formData = form.getValues();

  return (
    <>
      <h2 className='text-2xl font-semibold mb-6'>Review Your Job Posting</h2>

      <div className='space-y-8 w-full'>
        <section className='border rounded-lg p-4'>
          <h3 className='text-xl font-medium mb-2'>Basic Information</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* <div>
              <p className='text-sm text-gray-500'>Email</p>
              <p className='font-medium'>{formData.basicInfo.email}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Company</p>
              <p className='font-medium'>{formData.basicInfo.company}</p>
            </div> */}
            <div>
              <p className='text-sm text-gray-500'>Division</p>
              <p className='font-medium'>{formData.basicInfo.division}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Department</p>
              <p className='font-medium'>
                {formData.basicInfo.department || 'N/A'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Location</p>
              <p className='font-medium'>
                {formData.basicInfo.location || 'N/A'}
              </p>
            </div>
          </div>
        </section>

        <section className='border rounded-lg p-4'>
          <h3 className='text-xl font-medium mb-2'>Job Details</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500'>Job Type</p>
              <p className='font-medium'>
                {formData.jobDetails.job_type?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Workplace Type</p>
              <p className='font-medium'>
                {formData.jobDetails.workplace_type?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Start Date</p>
              <p className='font-medium'>{formData.jobDetails.start_date}</p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>End Date</p>
              <p className='font-medium'>
                {formData.jobDetails.end_date || 'N/A'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Experience</p>
              <p className='font-medium'>
                {formData.jobDetails.experience || 'N/A'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Stage</p>
              <p className='font-medium'>
                {formData.jobDetails.stage || 'N/A'}
              </p>
            </div>
          </div>
        </section>

        <section className='border rounded-lg p-4'>
          <h3 className='text-xl font-medium mb-2'>Job Description</h3>
          <div className='space-y-4'>
            <div>
              <p className='text-sm text-gray-500'>Responsibilities</p>
              <p className='whitespace-pre-wrap'>
                {formData.jobDescription.responsibilities}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Qualifications</p>
              <p className='whitespace-pre-wrap'>
                {formData.jobDescription.qualification}
              </p>
            </div>
          </div>
        </section>

        <section className='border rounded-lg p-4'>
          <h3 className='text-xl font-medium mb-2'>
            Inclusivity & Accessibility
          </h3>
          <div className='space-y-4'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div>
                <p className='text-sm text-gray-500'>Accessibility Level</p>
                <p className='font-medium'>
                  {formData.inclusivity.accessibility_level || 'N/A'}
                </p>
              </div>
              <div>
                <p className='text-sm text-gray-500'>Disability Friendly</p>
                <p className='font-medium'>
                  {formData.inclusivity.disability_friendly ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
            <div>
              <p className='text-sm text-gray-500'>
                Inclusive Hiring Statement
              </p>
              <p className='whitespace-pre-wrap'>
                {formData.inclusivity.inclusive_hiring_statement || 'N/A'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Accommodations</p>
              {formData.inclusivity.accommodations?.length ? (
                <ul className='list-disc pl-5'>
                  {formData.inclusivity.accommodations.map((acc, index) => (
                    <li key={index}>
                      <span className='font-medium'>{acc.type}</span>:{' '}
                      {acc.description}
                    </li>
                  ))}
                </ul>
              ) : (
                <p>None specified</p>
              )}
            </div>
          </div>
        </section>

        <section className='border rounded-lg p-4'>
          <h3 className='text-xl font-medium mb-2'>Media</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div>
              <p className='text-sm text-gray-500'>Company Logo URL</p>
              <p className='font-medium truncate'>
                {formData.media.logo || 'N/A'}
              </p>
            </div>
            <div>
              <p className='text-sm text-gray-500'>Additional Image URL</p>
              <p className='font-medium truncate'>
                {formData.media.additional_image_url || 'N/A'}
              </p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Review;
