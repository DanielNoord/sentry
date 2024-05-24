import {Children, useRef, useState} from 'react';
import styled from '@emotion/styled';

import {useIssueDetailsColumnCount} from 'sentry/components/events/eventTags/util';
import {AnnotatedTextErrors} from 'sentry/components/events/meta/annotatedText/annotatedTextErrors';
import Link from 'sentry/components/links/link';
import Panel from 'sentry/components/panels/panel';
import {StructuredData} from 'sentry/components/structuredEventData';
import {t} from 'sentry/locale';
import {space} from 'sentry/styles/space';
import type {KeyValueListDataItem, MetaError} from 'sentry/types';
import {defined} from 'sentry/utils';

export interface ContentProps {
  /**
   * Specifies the item to display.
   * - If set, item.subjectNode will override displaying item.subject.
   * - If item.subjectNode is null, the value section will span the whole card.
   * - The only displayed action is item.action.link, not item.actionButton
   */
  item: KeyValueListDataItem;
  /**
   * Displays tag value as plain text, rather than a hyperlink if applicable.
   */
  disableRichValue?: boolean;
  /**
   * Errors pertaining to content item
   */
  errors?: MetaError[];
  /**
   * Metadata pertaining to content item
   */
  meta?: Record<string, any>;
}

export function Content({
  item,
  meta,
  errors = [],
  disableRichValue = false,
  ...props
}: ContentProps) {
  const {subject, subjectNode, value: contextValue, action = {}} = item;

  const hasErrors = errors.length > 0;

  const dataComponent = (
    <StructuredData
      value={contextValue}
      depth={0}
      maxDefaultDepth={0}
      meta={meta}
      withAnnotatedText
      withOnlyFormattedText
    />
  );

  return (
    <ContentWrapper hasErrors={hasErrors} {...props}>
      {subjectNode !== undefined ? subjectNode : <Subject>{subject}</Subject>}
      <ValueSection hasErrors={hasErrors} hasEmptySubject={subjectNode === null}>
        <ValueWrapper>
          {!disableRichValue && defined(action?.link) ? (
            <Link to={action.link}>{dataComponent}</Link>
          ) : (
            dataComponent
          )}
        </ValueWrapper>
        {hasErrors && (
          <div>
            <AnnotatedTextErrors errors={errors} />
          </div>
        )}
      </ValueSection>
    </ContentWrapper>
  );
}

export interface CardProps {
  /**
   * ContentProps items to be rendered in this card.
   */
  contentItems: ContentProps[];
  /**
   *  Flag to enable alphabetical sorting by item subject. Uses given item ordering if false.
   */
  sortAlphabetically?: boolean;
  /**
   * Title of the key value data grouping
   */
  title?: React.ReactNode;
  /**
   * Content item length which, when exceeded, displays a 'Show more' option
   */
  truncateLength?: number;
}

export function Card({
  contentItems,
  title,
  truncateLength = Infinity,
  sortAlphabetically = false,
}: CardProps) {
  const [isTruncated, setIsTruncated] = useState(contentItems.length > truncateLength);

  if (contentItems.length === 0) {
    return null;
  }

  const truncatedItems = isTruncated
    ? contentItems.slice(0, truncateLength)
    : [...contentItems];

  const orderedItems = sortAlphabetically
    ? truncatedItems.sort((a, b) => a.item.subject.localeCompare(b.item.subject))
    : truncatedItems;

  const componentItems = orderedItems.map((itemProps, i) => (
    <Content key={`content-card-${title}-${i}`} {...itemProps} />
  ));

  return (
    <CardPanel>
      {title && <Title>{title}</Title>}
      {componentItems}
      {contentItems.length > truncateLength && (
        <TruncateWrapper onClick={() => setIsTruncated(!isTruncated)}>
          {isTruncated ? t('Show more...') : t('Show less')}
        </TruncateWrapper>
      )}
    </CardPanel>
  );
}

export function Group({children}: {children: React.ReactNode}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const columnCount = useIssueDetailsColumnCount(containerRef);

  const columns: React.ReactNode[] = [];
  const cards = Children.toArray(children);

  // Evenly distributing the cards into columns.
  const columnSize = Math.ceil(cards.length / columnCount);
  for (let i = 0; i < cards.length; i += columnSize) {
    columns.push(<CardColumn key={i}>{cards.slice(i, i + columnSize)}</CardColumn>);
  }

  return (
    <CardWrapper columnCount={columnCount} ref={containerRef}>
      {columns}
    </CardWrapper>
  );
}

const CardPanel = styled(Panel)`
  padding: ${space(0.75)};
  display: grid;
  column-gap: ${space(1.5)};
  grid-template-columns: minmax(100px, auto) 1fr;
  font-size: ${p => p.theme.fontSizeSmall};
`;

const Title = styled('p')`
  grid-column: span 2;
  padding: ${space(0.25)} ${space(0.75)};
  margin: 0;
  color: ${p => p.theme.headingColor};
  font-weight: bold;
`;

const ContentWrapper = styled('div')<{hasErrors: boolean}>`
  display: grid;
  grid-template-columns: subgrid;
  grid-column: span 2;
  column-gap: ${space(1.5)};
  padding: ${space(0.25)} ${space(0.75)};
  border-radius: 4px;
  color: ${p => (p.hasErrors ? p.theme.alert.error.color : p.theme.subText)};
  border: 1px solid ${p => (p.hasErrors ? p.theme.alert.error.border : 'transparent')};
  background-color: ${p =>
    p.hasErrors ? p.theme.alert.error.backgroundLight : p.theme.background};
  &:nth-child(odd) {
    background-color: ${p =>
      p.hasErrors ? p.theme.alert.error.backgroundLight : p.theme.backgroundSecondary};
  }
`;

const Subject = styled('div')`
  grid-column: span 1;
  font-family: ${p => p.theme.text.familyMono};
  word-break: break-word;
`;

const ValueSection = styled(Subject)<{hasEmptySubject: boolean; hasErrors: boolean}>`
  color: ${p => (p.hasErrors ? 'inherit' : p.theme.textColor)};
  grid-column: ${p => (p.hasEmptySubject ? '1 / -1' : 'span 1')};
  display: grid;
  grid-template-columns: 1fr auto;
  grid-column-gap: ${space(0.5)};
`;

const ValueWrapper = styled('div')`
  word-break: break-word;
`;

const TruncateWrapper = styled('a')`
  display: flex;
  grid-column: 1 / -1;
  margin: ${space(0.5)} 0;
  justify-content: center;
  font-family: ${p => p.theme.text.family};
`;

const CardWrapper = styled('div')<{columnCount: number}>`
  display: grid;
  align-items: start;
  grid-template-columns: repeat(${p => p.columnCount}, 1fr);
  gap: 10px;
`;

const CardColumn = styled('div')`
  grid-column: span 1;
`;
