'use client';

import { PDFDownloadLink, PDFViewer } from '@react-pdf/renderer';
import { useMutation, useQuery } from '@tanstack/react-query';
import { ArrowLeft, ArrowRight, Download, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl'; // Import useTranslations
import { useRef, useState } from 'react';

import api from '@/lib/axios';
import { getCookie } from '@/lib/cookies-action';

import CVDocument, { Resume } from '@/components/cv-document';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

import { API_AI_URL, API_BASE_URL } from '@/constant/config';

import { ApiReturn } from '@/types/api.types';
import { UserInterface } from '@/types/entities/user.types';

const blobToFile = (blob: Blob, fileName: string) => {
  return new File([blob], fileName, { type: 'application/pdf' });
};

const CVResult = () => {
  // Add translation hook
  const t = useTranslations('Onboarding.CVResult');

  const router = useRouter();
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const pdfLinkRef = useRef(null);

  const [suggestedRole, setSuggestedRole] = useState<string>('');

  const { data: userData, isPending } = useQuery<UserInterface>({
    queryKey: ['me'],
    queryFn: async () => {
      const meResponse = await api.get<ApiReturn<UserInterface>>(
        `${API_BASE_URL}/me`
      );
      return meResponse.data.data;
    },
  });

  const {
    data: resumeData,
    isPending: isLoadingResume,
    error,
  } = useQuery<Resume>({
    queryKey: ['resume'],
    queryFn: async () => {
      // console.log(userData, 'ini data');
      const response = await api.post(`${API_AI_URL}/resume`, {
        name: userData?.name,
        email: userData?.email,
        skills: userData?.job_seeker_data?.skill,
        experiences: userData?.job_seeker_data?.experiences,
        expectations: userData?.job_seeker_data?.expectations,
      });
      return response.data.resume_content;
    },
    enabled: userData != undefined,
  });

  const { data: roleMappingData, isPending: isLoadingRoleMapping } = useQuery<
    ApiReturn<string>
  >({
    queryKey: ['role-mapping'],
    queryFn: async () => {
      const email = (await getCookie('ada4career-email'))?.value;
      const response = await api.post(`${API_BASE_URL}/generate-role/${email}`);
      setSuggestedRole(response.data.data);
      return response.data;
    },
  });

  const { mutateAsync: saveCv, isPending: isPendingSaveCv } = useMutation({
    mutationFn: async () => {
      if (!pdfBlob) return;
      // console.log('masuk ini bos');
      const fileBlob = blobToFile(pdfBlob, 'my-accessible-resume.pdf');
      // console.log(pdfBlob);
      // console.log(fileBlob);
      const formData = new FormData();
      formData.append('file', fileBlob);

      const response = await api.post(
        `${API_BASE_URL}/user/resume/${userData?.email}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      router.replace('/app/home/jobs');
    },
  });

  // Function to capture PDF as Blob
  const handleCaptureBlob = async (blob: Blob) => {
    setPdfBlob(blob);
  };

  return (
    <div className='min-h-screen bg-gradient-to-b from-background to-muted/30 py-8 px-4'>
      <div className='max-w-6xl mx-auto'>
        <header className='mb-8 text-center'>
          <h1 className='text-3xl font-bold tracking-tight mb-2 text-gradient-ms'>
            {t('title')}
          </h1>
          <p className='text-muted-foreground'>{t('subtitle')}</p>
        </header>

        <div className='grid md:grid-cols-[1fr_300px] gap-8'>
          <div className='flex flex-col'>
            <Card className='mb-6'>
              <CardContent className='p-6'>
                {isPending || isLoadingResume || resumeData == undefined ? (
                  <div className='flex flex-col items-center justify-center space-y-4 py-12'>
                    <Loader2 className='h-12 w-12 animate-spin text-primary' />
                    <div className='text-center'>
                      <h3 className='font-medium text-lg'>{t('generating')}</h3>
                      <p className='text-muted-foreground'>
                        {t('generatingMessage')}
                      </p>
                    </div>
                    <div className='w-full max-w-md space-y-2'>
                      <Skeleton className='h-4 w-full' />
                      <Skeleton className='h-4 w-3/4' />
                      <Skeleton className='h-4 w-5/6' />
                    </div>
                  </div>
                ) : error ? (
                  <div className='flex flex-col items-center justify-center py-12'>
                    <div className='text-center text-destructive'>
                      <h3 className='font-medium text-lg'>{t('error')}</h3>
                      {/* <p>{error}</p> */}
                      <Button
                        variant='outline'
                        className='mt-4'
                        onClick={() => router.push('/onboard/cv/q/form')}
                      >
                        <ArrowLeft className='mr-2 h-4 w-4' />
                        {t('goBack')}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col items-center'>
                    <div className='w-full h-[600px] mb-4'>
                      <PDFViewer
                        width='100%'
                        height='600px'
                        className='border rounded-md'
                      >
                        <CVDocument resumeContent={resumeData} />
                      </PDFViewer>
                    </div>
                    <div className='flex justify-center mt-4 gap-4'>
                      <div style={{ display: 'none' }}>
                        <PDFDownloadLink
                          ref={pdfLinkRef}
                          document={<CVDocument resumeContent={resumeData} />}
                          fileName='my-accessible-resume.pdf'
                        >
                          {({ blob, url, loading }) => {
                            if (blob && !pdfBlob) {
                              handleCaptureBlob(blob);
                            }
                            return null;
                          }}
                        </PDFDownloadLink>
                      </div>
                      <PDFDownloadLink
                        document={<CVDocument resumeContent={resumeData} />}
                        fileName='my-accessible-resume.pdf'
                        className='inline-flex'
                      >
                        {({ loading }) => (
                          <Button variant='outline' disabled={loading}>
                            {loading ? (
                              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                            ) : (
                              <Download className='mr-2 h-4 w-4' />
                            )}
                            {t('download')}
                          </Button>
                        )}
                      </PDFDownloadLink>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className='flex items-center justify-between gap-4 mt-auto'>
              <Button
                onClick={async () => {
                  if (pdfBlob != null) {
                    await saveCv();
                  }
                }}
                size='lg'
                disabled={isPending || isPendingSaveCv}
                className='flex-1 py-8 w-full'
              >
                {t('continue')}
                <ArrowRight className='ml-2 h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='space-y-6'>
            <Card>
              <CardContent className='p-6'>
                <h2 className='text-xl font-semibold mb-4'>
                  {t('careerSuggestions')}
                </h2>
                {isPending || suggestedRole === '' ? (
                  <div className='space-y-2'>
                    <Skeleton className='h-6 w-full' />
                    <Skeleton className='h-6 w-3/4' />
                    <Skeleton className='h-6 w-5/6' />
                  </div>
                ) : (
                  <div>
                    <h6 className='font-semibold text-gradient-ms'>
                      {suggestedRole}
                    </h6>
                    <div className='text-xs font-medium text-muted-foreground mt-0.5'>
                      {t('bestMatch')}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CVResult;
