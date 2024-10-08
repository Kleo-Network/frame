import type { NextApiRequest, NextApiResponse } from 'next';

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://frame.kleo.network';
const HUB_URL = process.env.HUB_URL || 'https://api.kleo.network';
const kleoURL = process.env.KLEO_CONNECT || 'https://app.kleo.network/'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      console.log(req.body.untrustedData)
      const { slug } = req.query;
      const [username, date, current_card_id, previous_card_id, next_card_id] = (slug as string).split('-');
      console.log("date", date);
      const buttonId = req.body.untrustedData.buttonIndex;

      let targetCardId = current_card_id;
      if ((buttonId === 2 && previous_card_id) || (buttonId === 1 && !previous_card_id)) {
        targetCardId = next_card_id;
      } else if (buttonId === 1 && previous_card_id) {
        targetCardId = previous_card_id;
      }

      console.log("target card id", targetCardId)

      const apiUrl = `${HUB_URL}/api/v1/core/cards/published/${username}/adjacent?date=${date}&card_id=${targetCardId}`;

      const response = await fetch(apiUrl);
      const data = await response.json();
      console.log("read data", data);
      const { card, nextCard, prevCard } = data;
      console.log("card", card);
      console.log("nextcard", nextCard);
      console.log("prev card", prevCard);
      const imageUrl = `${baseUrl}/api/image?card_id=${card.id}&date=${date}`;
      const postUrl = `${baseUrl}/api/card?slug=${username}-${date}-${card.id}-${prevCard || null}-${nextCard || null}`;
      const profileUrl = `${kleoURL}/profileV2/${username}`;

      let buttonHtml = '';
      let buttonCount = 0;

      // Button 1: Previous (if exists) or Next (if prev doesn't exist)
      if (prevCard) {
        buttonHtml += `<meta name="fc:frame:button:1" content="Previous">`;
        buttonCount++;
      } else if (nextCard) {
        buttonHtml += `<meta name="fc:frame:button:1" content="Next">`;
        buttonCount++;
      }

      // Button 2: Next (only if prev exists and next exists)
      if (prevCard && nextCard) {
        buttonHtml += `<meta name="fc:frame:button:2" content="Next">`;
        buttonCount++;
      }

      // Last Button: Always View Profile
      buttonCount++;
      buttonHtml += `
        <meta name="fc:frame:button:${buttonCount}" content="View Profile">
        <meta name="fc:frame:button:${buttonCount}:action" content="link">
        <meta name="fc:frame:button:${buttonCount}:target" content="${profileUrl}">
      `;

      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>"Viewing Kleo Cards ${username}"</title>
          <meta property="og:title" content="${card.content}">
          <meta property="og:image" content="${imageUrl}">
          <meta name="fc:frame" content="vNext">
          <meta name="fc:frame:image" content="${imageUrl}">
          <meta name="fc:frame:post_url" content="${postUrl}">
          ${buttonHtml}
        </head>
        <body>
          ${card.content}
        </body>
      </html>
    `);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error processing request');
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}