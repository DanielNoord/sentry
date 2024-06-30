import Alert from 'sentry/components/alert';
import {Flex} from 'sentry/components/container/flex';
import {ReplaySideBySideImageDiff} from 'sentry/components/replays/diff/replaySideBySideImageDiff';
import {ReplayTextDiff} from 'sentry/components/replays/diff/replayTextDiff';
import {TabList, TabPanels, Tabs} from 'sentry/components/tabs';
import {t} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import type ReplayReader from 'sentry/utils/replays/replayReader';

interface Props {
  leftOffsetMs: number;
  replay: null | ReplayReader;
  rightOffsetMs: number;
  defaultTab?: DiffType;
}

export enum DiffType {
  VISUAL = 'visual',
  HTML = 'html',
}

export default function ReplayDiffChooser({
  defaultTab = DiffType.VISUAL,
  leftOffsetMs,
  replay,
  rightOffsetMs,
}: Props) {
  const isSameTimestamp = leftOffsetMs === rightOffsetMs;

  return (
    <Tabs<DiffType> defaultValue={defaultTab}>
      {isSameTimestamp ? (
        <Alert type="warning" showIcon>
          {t(
            "Sentry wasn't able to identify the correct event to display a diff for this hydration error."
          )}
        </Alert>
      ) : null}

      <Flex gap={space(1)} column>
        <TabList>
          <TabList.Item key={DiffType.VISUAL}>{t('Visual Diff')}</TabList.Item>
          <TabList.Item key={DiffType.HTML}>{t('Html Diff')}</TabList.Item>
        </TabList>

        <TabPanels>
          <TabPanels.Item key={DiffType.VISUAL}>
            <ReplaySideBySideImageDiff
              leftOffsetMs={leftOffsetMs}
              replay={replay}
              rightOffsetMs={rightOffsetMs}
            />
          </TabPanels.Item>
          <TabPanels.Item key={DiffType.HTML}>
            <ReplayTextDiff
              leftOffsetMs={leftOffsetMs}
              replay={replay}
              rightOffsetMs={rightOffsetMs}
            />
          </TabPanels.Item>
        </TabPanels>
      </Flex>
    </Tabs>
  );
}
