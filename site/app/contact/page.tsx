import type { Metadata } from 'next';
import { contact } from '../contact-data';
import { MotionRuntime, Reveal } from '../motion-elements';
import { PageFrame, PageIntro } from '../site-components';
import { buildPageMetadata } from '../site-metadata';

export const metadata: Metadata = buildPageMetadata({
  title: 'Contact',
  description: 'Contact product engineer Carl Welch by email, LinkedIn, or GitHub.',
  path: '/contact',
});

export default function ContactPage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content" tabIndex={-1} data-tone="red">
          <PageIntro
            eyebrow="Contact"
            title="Email Carl"
            summary="Have a role, product, or difficult problem in mind? Email Carl directly, or connect through LinkedIn and GitHub."
          />

          <section className="contact-panel" aria-labelledby="contact-email-title">
            <Reveal className="contact-email">
              <p className="eyebrow">Email</p>
              <h2 id="contact-email-title">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </h2>
            </Reveal>

            <div className="contact-routes" aria-label="Other contact routes">
              <a
                href={contact.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open Carl Welch’s LinkedIn profile (opens in a new tab)"
              >
                <span>Professional profile</span>
                <strong>LinkedIn</strong>
                <span className="contact-route-arrow" aria-hidden="true">↗</span>
              </a>
              <a
                href={contact.githubUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Open Carl Welch’s GitHub profile (opens in a new tab)"
              >
                <span>Public code</span>
                <strong>GitHub</strong>
                <span className="contact-route-arrow" aria-hidden="true">↗</span>
              </a>
              <a
                href={contact.resumeUrl}
                download
                type="application/pdf"
                aria-label="Download Carl Welch résumé (PDF)"
              >
                <span>Current document</span>
                <strong>Résumé</strong>
                <span className="contact-route-arrow" aria-hidden="true">↓</span>
              </a>
            </div>
          </section>
        </main>
      </PageFrame>
    </MotionRuntime>
  );
}
