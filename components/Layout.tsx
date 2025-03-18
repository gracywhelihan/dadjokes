import { ReactNode } from 'react';
import Image from 'next/image';
import Head from 'next/head';

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

export const Layout = ({ children, title = 'Dad Jokes Jeopardy' }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-blue-900 relative">
      <Head>
        <title>{title}</title>
        <meta name="description" content="A collection of dad jokes in Jeopardy style" />
        <link rel="icon" href="/dadjokes/favicon.ico" />
      </Head>

      {/* Background Image with Overlay */}
      <div className="fixed inset-0 z-0">
        <Image
          src="/dadjokes/jeopardy-background.jpg"
          alt="Jeopardy Background"
          layout="fill"
          objectFit="cover"
          priority
          className="opacity-20"
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-blue-800/80 backdrop-blur-sm shadow-lg">
          <div className="container mx-auto px-4 py-6">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-400 text-center font-serif">
              Dad Jokes Jeopardy
            </h1>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}; 