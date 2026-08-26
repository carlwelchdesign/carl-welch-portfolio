import type { Metadata } from 'next';
import { contact } from '../contact-data';
import { MotionRuntime, Reveal } from '../motion-elements';
import { PageFrame, PageIntro } from '../site-components';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contact product engineer Carl Welch by email, LinkedIn, or GitHub.',
};

export default function ContactPage() {
  return (
    <MotionRuntime>
      <PageFrame>
        <main id="main-content" data-tone="red">
          <PageIntro
            eyebrow="Contact"
            title="Email Carl"
            summary="Direct contact details from the current résumé. No form and no message collection on this site."
          />

          <section className="contact-panel" aria-labelledby="contact-email-title">
            <Reveal className="contact-email">
              <p className="eyebrow">Email</p>
              <h2 id="contact-email-title">
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </h2>
            </Reveal>

            <div className="contact-routes" aria-label="Other contact routes">
              <a href={contact.linkedinUrl}>
                <span>Professional profile</span>
                <strong>LinkedIn</strong>
                <span className="contact-route-arrow" aria-hidden="true">↗</span>
              </a>
              <a href={contact.githubUrl}>
                <span>Public code</span>
                <strong>GitHub</strong>
                <span className="contact-route-arrow" aria-hidden="true">↗</span>
              </a>
              <a href={contact.resumeUrl} download>
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
