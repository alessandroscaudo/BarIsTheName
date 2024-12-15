import { Client } from "@notionhq/client";
import { NotionToMarkdown } from "notion-to-md";
import { markdownToReactElements } from "@/lib/markdown-to-react"; // Utility per convertire Markdown
import Image from "next/image";

// Configurazione Notion
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const n2m = new NotionToMarkdown({ notionClient: notion });

// Tipo per la struttura della pagina di Notion
interface NotionPage {
  id: string;
  properties: {
    Title: { title: { plain_text: string }[] };
    Slug: { formula: { string: string } };
    PublishedDate: { date: { start: string } };
    CoverImage: { files: [{ file: { url: string } }] };
    Description: { rich_text: { plain_text: string }[] };
  };
}

// Funzione per recuperare tutti gli slug
async function getPostSlugs(): Promise<string[]> {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_BLOG_DATABASE_ID!,
    filter: {
      property: "Status",
      status: { equals: "Published" }
    }
  });

  return response.results.map((page: NotionPage) => 
    page.properties.Slug?.formula?.string ?? page.id
  ).filter(Boolean);
}

// Funzione per recuperare i dettagli di un post specifico
async function getPostBySlug(slug: string): Promise<{
  id: string;
  title: string;
  publishedDate: string;
  coverImage?: string;
  content: string;
  description: string;
} | null> {
  try {
    // Recupera il post dal database Notion
    const response = await notion.databases.query({
      database_id: process.env.NOTION_BLOG_DATABASE_ID!,
      filter: {
        property: "Slug",
        rich_text: { equals: slug }
      }
    });

    const page = response.results[0] as NotionPage | undefined;
    if (!page) return null;

    // Converti il contenuto in Markdown
    const mdBlocks = await n2m.pageToMarkdown(page.id);
    const mdString = n2m.toMarkdownString(mdBlocks);

    return {
      id: page.id,
      title: page.properties.Title.title[0]?.plain_text || "Titolo non disponibile",
      publishedDate: page.properties.PublishedDate.date.start,
      coverImage: page.properties.CoverImage?.files[0]?.file?.url,
      content: mdString.parent,
      description: page.properties.Description.rich_text[0]?.plain_text || ""
    };
  } catch (error) {
    console.error("Errore nel recupero del post:", error);
    return null;
  }
}

// Generazione dei metadati dinamici
export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post non trovato",
      description: "Il post richiesto non esiste"
    };
  }

  return {
    title: post.title,
    description: post.description,
    openGraph: {
      title: post.title,
      description: post.description,
      images: post.coverImage ? [{ url: post.coverImage }] : []
    }
  };
}

// Generazione statica delle rotte
export async function generateStaticParams() {
  const slugs = await getPostSlugs();
  return slugs.map(slug => ({ slug }));
}

// Pagina del Post
export default async function BlogPostPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Post Non Trovato</h1>
        <p className="text-gray-600">
          Il post che stai cercando non esiste o è stato rimosso.
        </p>
      </div>
    );
  }

  return (
    <article className="container mx-auto max-w-3xl px-4 py-8">
      {/* Immagine di copertina */}
      {post.coverImage && (
        <Image
          src={post.coverImage}
          alt={post.title}
          width={1200}
          height={600}
          className="w-full h-auto rounded-lg mb-8 object-cover"
        />
      )}

      {/* Intestazione del post */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-4">
          {post.title}
        </h1>
        <div className="flex items-center text-gray-600">
          <span>
            Pubblicato il{' '}
            {new Date(post.publishedDate).toLocaleDateString('it-IT', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </span>
        </div>
      </header>

      {/* Contenuto del post */}
      <div className="prose lg:prose-xl mb-10">
        {markdownToReactElements(post.content)}
      </div>
    </article>
  );
}