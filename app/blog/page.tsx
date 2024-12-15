import { Client } from "@notionhq/client";
import Link from "next/link";
import Image from "next/image";

// Configurazione del client Notion
const notion = new Client({ 
  auth: process.env.NOTION_TOKEN 
});

// Tipo per le proprietà specifiche di Notion
interface TitleProperty {
  title: { plain_text: string }[] | null | undefined;
}

interface SlugProperty {
  formula: { string: string } | null | undefined;
}

interface DescriptionProperty {
  rich_text: { plain_text: string }[] | null | undefined;
}

interface PublishedDateProperty {
  date: { start: string } | null | undefined;
}

interface CoverImageProperty {
  files: [{ file: { url: string } }] | null | undefined;
}

// Tipo per la struttura di una pagina di Notion
interface NotionPage {
  id: string;
  properties: {
    Title: TitleProperty;
    Slug: SlugProperty;
    Description: DescriptionProperty;
    PublishedDate: PublishedDateProperty;
    CoverImage: CoverImageProperty;
  };
}

// Tipo per i post del blog
interface BlogPost {
  id: string;
  title: string;
  description: string;
  publishedDate: string;
  coverImage?: string | null;
  slug: string;
}

// Funzione per recuperare i post dal database Notion
async function getBlogPosts(): Promise<BlogPost[]> {
  try {
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BLOG_DATABASE_ID!,
      filter: {
        property: "Status",
        status: {
          equals: "Published"
        }
      },
      sorts: [
        {
          property: "PublishedDate",
          direction: "descending"
        }
      ]
    });

    const posts = response.results.map((page: NotionPage) => {
      // Gestione delle proprietà con sicurezza
      const title = page.properties.Title?.title?.[0]?.plain_text ?? "Titolo non disponibile";
      const slug = page.properties.Slug?.formula?.string ?? page.id;
      const description = page.properties.Description?.rich_text?.[0]?.plain_text ?? "";
      const publishedDate = page.properties.PublishedDate?.date?.start ?? new Date().toISOString();
      const coverImage = page.properties.CoverImage?.files?.[0]?.file?.url ?? null;

      return {
        id: page.id,
        title,
        description,
        publishedDate,
        coverImage,
        slug
      };
    }).filter(post => post.title !== "Titolo non disponibile");

    return posts;
  } catch (error) {
    console.error("Errore nel recupero dei post da Notion:", error);
    return [];
  }
}

// Pagina del Blog
export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Il Nostro Blog
      </h1>

      {posts.length === 0 ? (
        <p className="text-center text-gray-500">
          Nessun post disponibile al momento
        </p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link 
              key={post.id} 
              href={`/blog/${post.slug}`}
              className="block bg-white shadow-md rounded-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {post.coverImage && (
                <Image
                  src={post.coverImage || '/images/default-image.jpeg'} // Percorso dell'immagine di default
                  alt={post.title}
                  width={400}
                  height={250}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-2">
                  {post.title}
                </h2>
                <p className="text-gray-600 mb-4">
                  {post.description}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {new Date(post.publishedDate).toLocaleDateString('it-IT', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                  <span className="text-blue-600 hover:underline">
                    Leggi di più
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Metadata per SEO
export async function generateMetadata() {
  return {
    title: 'Blog - Le Nostre Ultime Notizie',
    description: 'Scopri gli ultimi articoli e aggiornamenti dal nostro blog',
    openGraph: {
      title: 'Blog - Le Nostre Ultime Notizie',
      description: 'Scopri gli ultimi articoli e aggiornamenti dal nostro blog',
    }
  };
}