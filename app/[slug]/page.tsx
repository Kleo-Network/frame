import { profile } from "console";
import { Metadata, ResolvingMetadata } from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://frame.kleo.network';
const HUB_URL = process.env.HUB_URL || 'https://api.kleo.network';
const kleoURL = process.env.KLEO_CONNECT || 'https://app.kleo.network/'

export default async function Page({ params }: { params: { slug: string } }) {
    console.log("slug", params.slug)

    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-screen py-2">
                <main className="flex flex-col items-center justify-center flex-1 px-4 sm:px-20 text-center">
                    {params.slug}
                </main>
            </div>
        </>
    );
}

type Props = {
    params: { slug: string }
    searchParams: { [key: string]: string | string[] | undefined }
}

export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = params.slug;
    const [username, date, cardId] = slug.split("-");
    console.log(params.slug)
    console.log("username", username)
    console.log("date", date)
    console.log("cardId", cardId)
    let apiUrl = `${HUB_URL}/api/v1/core/cards/published/${username}/adjacent?date=${date}`;
    if (cardId) {
        apiUrl += `&card_id=${cardId}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();
    console.log("data", data)
    const { card, nextCard, prevCard } = data;
    const profileUrl = `${kleoURL}/profileV2/${username}`
    const fcMetadata: Record<string, string> = {
        "fc:frame": "vNext",
        "fc:frame:image": `${baseUrl}/api/image?card_id=${card.id}&date=${date}`,
        "fc:frame:post_url": `${baseUrl}/api/card?slug=${username}-${date}-${card.id}-${prevCard || ''}-${nextCard || ''}`,
    };

    let buttonCount = 0;

    // Button 1: Previous (if exists) or Next (if prev doesn't exist)
    if (prevCard) {
        fcMetadata["fc:frame:button:1"] = 'Previous';
        buttonCount++;
    } else if (nextCard) {
        fcMetadata["fc:frame:button:1"] = 'Next';
        buttonCount++;
    }

    if (prevCard && nextCard) {
        fcMetadata["fc:frame:button:2"] = 'Next';
        buttonCount++;
    }

    buttonCount++;
    fcMetadata[`fc:frame:button:${buttonCount}`] = 'View Profile';
    fcMetadata[`fc:frame:button:${buttonCount}:action`] = 'link';
    fcMetadata[`fc:frame:button:${buttonCount}:target`] = profileUrl;

    return {
        title: card.content,
        openGraph: {
            title: card.content,
            images: [`${baseUrl}/api/image?card_id=${card.id}&date=${date}`],
        },
        other: {
            ...fcMetadata,
        },
        metadataBase: new URL(baseUrl)
    }
}