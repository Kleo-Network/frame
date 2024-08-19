import type { NextApiRequest, NextApiResponse } from 'next';
import sharp from 'sharp';
import satori from "satori";
import { join } from 'path';
import * as fs from "fs";

const fontPath = join(process.cwd(), 'Roboto-Regular.ttf')
let fontData = fs.readFileSync(fontPath)

const HUB_URL = process.env['HUB_URL'] || 'http://0.0.0.0:5001';

const MILLISECONDS_IN_A_DAY = 1000 * 3600 * 24;

function getDaysAgo(date: string | number, currentTimestamp: number = Date.now()): string {
  const givenDate = new Date(date);
  const differenceInTime = currentTimestamp - givenDate.getTime(); // date is already a timestamp
  const differenceInDays = Math.floor(differenceInTime / MILLISECONDS_IN_A_DAY);

  if (differenceInDays === 0) {
    return 'Today';
  } else if (differenceInDays === 1) {
    return '1 day ago';
  } else if (differenceInDays <= 30) {
    return `${differenceInDays} days ago`;
  } else {
    return givenDate.toLocaleDateString('default', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const card_id = req.query['card_id'] as string | undefined
    const date = req.query['date'] as string | undefined

    if (!card_id || !date) {
      throw new Error('No card_id or date provided');
    }

    // Fetch card data
    const apiUrl = `${HUB_URL}/api/v1/core/cards/published/vaibhavgeek/adjacent?date=${date}&card_id=${card_id}`;
    const response = await fetch(apiUrl);
    const data = await response.json();
    const { card } = data;
    console.log("card data", card)
    const svg = await satori(
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '600px',
        height: '400px',
        backgroundColor: card.cardTypeToRender === 'PURPLE' ? 'purple' : 'white',
        padding: '20px',
        borderRadius: '8px',
        color: card.cardTypeToRender === 'PURPLE' ? 'white' : 'black',
        marginTop: '40px',
        paddingBottom: '100px'
      }}>
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div style={{ display: 'flex' }}>
            {Array.from(new Set(card.urls.map((url: any) => new URL(url.url).hostname)) as Set<string>).map((domain: string, index: number) => (
              <img
                key={domain}
                src={`https://www.google.com/s2/favicons?domain=${domain}&sz=40`}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  marginLeft: index > 0 ? '-10px' : '0',
                }}
              />
            ))}
          </div>
          <div style={{ fontSize: '14px' }}>
            {getDaysAgo(card.date)}
          </div>
        </header>

        <div style={{ fontSize: '26px', marginTop: '10px' }}>
          {card.content}
        </div>

        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          marginTop: '10px',
        }}>
          {card.urls.map((url: any) => (
            <div
              key={url.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 8px',
                backgroundColor: card.cardTypeToRender === 'PURPLE' ? 'rgba(255,255,255,0.2)' : '#f0f0f0',
                borderRadius: '15px',
              }}
            >
              <img
                src={`https://www.google.com/s2/favicons?domain=${url.url}&sz=16`}
                style={{ width: '16px', height: '16px' }}
              />
              <span style={{ fontSize: '12px' }}>
                {url.title.length > 25 ? url.title.slice(0, 25) + '...' : url.title}
              </span>
            </div>
          ))}
        </div>
      </div>,
      {
        width: 600,
        height: 400,
        fonts: [{
          data: fontData,
          name: 'Roboto',
          style: 'normal',
          weight: 400
        }]
      }
    );

    // Convert SVG to PNG using Sharp
    const pngBuffer = await sharp(Buffer.from(svg))
      .toFormat('png')
      .toBuffer();

    // Set the content type to PNG and send the response
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'max-age=10');
    res.send(pngBuffer);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error generating image');
  }
}