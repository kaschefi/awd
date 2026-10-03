import React from 'react';
import type { ViewKey } from '../../types/navigation.js';

interface HowToUsePortalProps {
  onNavigate: (view: ViewKey) => void;
}

export const HowToUsePortal: React.FC<HowToUsePortalProps> = ({ onNavigate }) => {
  return (
    <div className="intro-card">
      <h3 style={{ margin: '0 0 8px 0' }}>How to use this portal</h3>
      <p>
        Everything gathered on the case so far is organised into four working views. Use the
        navigation bar at the top to move between them at any time.
      </p>
      <div className="howto-grid">
        <div className="howto-item">
          <h4>1. Evidence Catalogue</h4>
          <p>
            Search, filter, and sort every evidence item. Open one for full details, related people
            and locations, and to add a private note.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => onNavigate('evidence')}
          >
            Go to Evidence
          </button>
        </div>
        <div className="howto-item">
          <h4>2. People &amp; Locations</h4>
          <p>
            Read profiles and statements from the six team members involved, and look up the six key
            locations in the investigation.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => onNavigate('people')}
          >
            Go to People &amp; Locations
          </button>
        </div>
        <div className="howto-item">
          <h4>3. Timeline</h4>
          <p>
            Walk through events in chronological order, filter by person, location, or type, and
            jump straight to the evidence behind any event.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => onNavigate('timeline')}
          >
            Go to Timeline
          </button>
        </div>
        <div className="howto-item">
          <h4>4. Investigator Workspace</h4>
          <p>
            Your bookmarked evidence and notes collect here. Draft a hypothesis &mdash; who you
            suspect, why, and how confident you are &mdash; it&apos;s saved automatically in your
            browser.
          </p>
          <button
            type="button"
            className="btn btn-secondary btn-small"
            onClick={() => onNavigate('workspace')}
          >
            Go to Workspace
          </button>
        </div>
      </div>
    </div>
  );
};
