import {Metadata, ResolvingMetadata} from "next";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Provide a default value

export default async function Page({params}: { params: {slug: string}}) {
    console.log("slug", params.slug)
  
    return(
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
    // read route params
    const slug = params.slug
    
    
    const images = ["hello", "world", "othercontent"]

    console.log(`${baseUrl}/api/image?slug=${slug}`)
    const fcMetadata: Record<string, string> = {
        "fc:frame": "vNext",
        "fc:frame:image": `${baseUrl}/api/image?slug=${slug}`,
        "fc:frame:post_url": `${baseUrl}/api/card?slug=${slug}`,
        //"fc:frame:image": `https://upload.wikimedia.org/wikipedia/commons/thumb/3/32/Googleplex_HQ_%28cropped%29.jpg/640px-Googleplex_HQ_%28cropped%29.jpg`,
        "fc:frame:button:1": 'Previous',
        "fc:frame:button:2": 'Next'
    };
    


    return {
        title: slug,
        openGraph: {
            title: slug,
            images: [`/api/image?slug=${slug}`],
        },
        other: {
            ...fcMetadata,
        },
        metadataBase: new URL(baseUrl)
    }
}