// @flow
import type { Node } from 'react';
import React, { Fragment } from 'react';
import classnames from 'classnames';
import SideNavigation from 'component/sideNavigation';
import SettingsSideNavigation from 'component/settingsSideNavigation';
import Header from 'component/header';
/* @if TARGET='app' */
import StatusBar from 'component/common/status-bar';
/* @endif */
import usePersistedState from 'effects/use-persisted-state';
import { useHistory } from 'react-router';
import { useIsMobile, useIsMediumScreen } from 'effects/use-screensize';
import { parseURI } from 'util/lbryURI';

import { MAIN_CLASS } from 'constants/classnames';
type Props = {
  children: Node | Array<Node>,
  className: ?string,
  autoUpdateDownloaded: boolean,
  isUpgradeAvailable: boolean,
  authPage: boolean,
  filePage: boolean,
  settingsPage?: boolean,
  noHeader: boolean,
  noFooter: boolean,
  noSideNavigation: boolean,
  fullWidthPage: boolean,
  videoTheaterMode: boolean,
  isMarkdown?: boolean,
  chatDisabled: boolean,
  rightSide?: Node,
  backout: {
    backLabel?: string,
    backNavDefault?: string,
    title: string,
    simpleTitle: string, // Just use the same value as `title` if `title` is already short (~< 10 chars), unless you have a better idea for title overlfow on mobile
  },
};

function Page(props: Props) {
  const {
    children,
    className,
    filePage = false,
    settingsPage,
    authPage = false,
    fullWidthPage = false,
    noHeader = false,
    noSideNavigation = false,
    backout,
    videoTheaterMode,
    isMarkdown = false,
    rightSide,
  } = props;

  const {
    location: { pathname },
  } = useHistory();
  const [sidebarOpen, setSidebarOpen] = usePersistedState('sidebar', false);
  const isMediumScreen = useIsMediumScreen();
  const isMobile = useIsMobile();

  let isOnFilePage = false;
  try {
    const url = pathname.slice(1).replace(/:/g, '#');
    const { isChannel } = parseURI(url);
    if (!isChannel) {
      isOnFilePage = true;
    }
  } catch (e) {}

  const isAbsoluteSideNavHidden = (isOnFilePage || isMobile) && !sidebarOpen;

  function getSideNavElem() {
    if (!authPage) {
      if (settingsPage) {
        return <SettingsSideNavigation />;
      } else if (!noSideNavigation) {
        return (
          <SideNavigation
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            isMediumScreen={isMediumScreen}
            isOnFilePage={isOnFilePage}
          />
        );
      }
    }
    return null;
  }

  React.useEffect(() => {
    if (isOnFilePage || isMediumScreen) {
      setSidebarOpen(false);
    }
    // TODO: make sure setState callback for usePersistedState uses useCallback to it doesn't cause effect to re-run
  }, [isOnFilePage, isMediumScreen]);

  return (
    <Fragment>
      {!noHeader && (
        <Header
          authHeader={authPage}
          backout={backout}
          sidebarOpen={sidebarOpen}
          isAbsoluteSideNavHidden={isAbsoluteSideNavHidden}
          setSidebarOpen={setSidebarOpen}
        />
      )}
      <div
        className={classnames('main-wrapper__inner', {
          'main-wrapper__inner--filepage': isOnFilePage,
          'main-wrapper__inner--theater-mode': isOnFilePage && videoTheaterMode,
        })}
      >
        {getSideNavElem()}

        <main
          id={'main-content'}
          className={classnames(MAIN_CLASS, className, {
            'main--full-width': fullWidthPage,
            'main--auth-page': authPage,
            'main--file-page': filePage,
            'main--settings-page': settingsPage,
            'main--markdown': isMarkdown,
            'main--theater-mode': isOnFilePage && videoTheaterMode,
          })}
        >
          {children}

          {!isMobile && rightSide && <div className="main__right-side">{rightSide}</div>}
        </main>
        {/* @if TARGET='app' */}
        <StatusBar />
        {/* @endif */}
      </div>
    </Fragment>
  );
}

export default Page;
