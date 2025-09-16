'use client';
import Image from 'next/image';
import React from 'react';

import logo from '~/images/ADALogo.png';

const AdaLogo = ({
  width = 36,
  height = 36,
}: {
  width?: number;
  height?: number;
}) => {
  return <Image src={logo} alt='ADA Logo' width={width} height={height} />;
};

export default AdaLogo;
