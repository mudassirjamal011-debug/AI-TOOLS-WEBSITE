import { Breadcrumbs } from '@/components/content/Breadcrumbs';
import { siteConfig } from '@/lib/site';

export interface LegalSection {
  heading: string;
  paragraphs?: string[];
  list?: string[];
}

export function LegalPage({
  title,
  description,
  updated,
  crumb,
  path,
  sections,
}: {
  title: string;
  description: string;
  updated: string;
  crumb: string;
  path: string;
  sections: LegalSection[];
}) {
  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={[{ name: crumb, href: path }]} />

      <header className="mb-8 max-w-3xl">
        <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted">{description}</p>
        <p className="mt-3 text-xs text-muted">
          Last updated: <time dateTime={updated}>{updated}</time> · {siteConfig.name}
        </p>
      </header>

      <div className="prose-nova max-w-3xl">
        {sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
            {section.list ? (
              <ul>
                {section.list.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
