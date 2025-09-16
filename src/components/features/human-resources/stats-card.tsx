import React from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  title: string;
  label?: string;
  value: number;
  icon: React.ReactNode;
};

const StatsCard = ({ title, label = 'Submitter', value, icon }: Props) => {
  return (
    <Card className='md:col-span-1'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <CardTitle className='text-sm font-medium'>{title}:</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className='text-2xl font-bold'>{value}</div>
        <p className='text-xs text-muted-foreground'>{label}</p>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
