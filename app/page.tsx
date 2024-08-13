
import { getFrameMetadata } from '@coinbase/onchainkit/frame';
import type { Metadata } from 'next';
import Page from './card'


const frameMetadata = getFrameMetadata({
  buttons: [
    {
      label: `Begin for Vaibhavgeek`
    }
  ],
  image: `https://quotefancy.com/media/wallpaper/3840x2160/8151357-Hello-World-Wallpaper.jpg`,
  post_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/frame?id=1`,
});

export const metadata: Metadata = {
  title: 'Cosmic Cowboys',
  description: 'A frame telling the story of Cosmic Cowboys',
  openGraph: {
    title: 'Cosmic Cowboys',
    description: 'A frame telling the story of Cosmic Cowboys'
  },
  other: {
    ...frameMetadata,
  },
};

export default function Main() {
  
   

  return (
    <>
      <Page />
    </>
  );
}