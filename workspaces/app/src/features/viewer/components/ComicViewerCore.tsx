import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useUpdate } from 'react-use';
import styled from 'styled-components';

import { addUnitIfNeeded } from '../../../lib/css/addUnitIfNeeded';
import { useEpisode } from '../../episode/hooks/useEpisode';

import { ComicViewerPage } from './ComicViewerPage';

const IMAGE_WIDTH = 1075;
const IMAGE_HEIGHT = 1518;


const _Container = styled.div`
  position: relative;
`;

const _Wrapper = styled.div<{
  $paddingInline: number;
  $pageWidth: number;
}>`
  background-color: black;
  cursor: grab;
  direction: rtl;
  display: grid;
  grid-auto-columns: ${({ $pageWidth }) => addUnitIfNeeded($pageWidth)};
  grid-auto-flow: column;
  grid-template-rows: minmax(auto, 100%);
  height: 100%;
  overflow-x: scroll;
  overflow-y: hidden;
  overscroll-behavior: none;
  padding-inline: ${({ $paddingInline }) => addUnitIfNeeded($paddingInline)};
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const _Page = styled.div`
  scroll-snap-align: center;
  scroll-snap-stop: always;
`;

type Props = {
  episodeId: string;
};

const ComicViewerCore: React.FC<Props> = ({ episodeId }) => {
  // 画面のリサイズに合わせて再描画する
  const rerender = useUpdate();

  const { data: episode } = useEpisode({ params: { episodeId } });

  const [container, containerRef] = useState<HTMLDivElement | null>(null);
  const [scrollView, scrollViewRef] = useState<HTMLDivElement | null>(null);

  // コンテナの幅
  const cqw = (container?.getBoundingClientRect().width ?? 0) / 100;
  // コンテナの高さ
  const cqh = (container?.getBoundingClientRect().height ?? 0) / 100;

  // 1画面に表示できるページ数（1 or 2）
  const pageCountParView = (100 * cqw) / (100 * cqh) < (2 * IMAGE_WIDTH) / IMAGE_HEIGHT ? 1 : 2;
  // ページの幅
  const pageWidth = ((100 * cqh) / IMAGE_HEIGHT) * IMAGE_WIDTH;
  // 画面にページを表示したときに余る左右の余白
  const viewerPaddingInline =
    (100 * cqw - pageWidth * pageCountParView) / 2 +
    // 2ページ表示のときは、奇数ページが左側にあるべきなので、ページの最初と最後に1ページの余白をいれる
    (pageCountParView === 2 ? pageWidth : 0);

  // リサイズ時のみ再レンダリング
  useEffect(() => {
    const abortController = new AbortController();

    let prevContentRect: DOMRectReadOnly | null = null;
    const handleResize = (entries: ResizeObserverEntry[]) => {
      if (prevContentRect != null && prevContentRect.width !== entries[0]?.contentRect.width) {
        rerender();
      }
      prevContentRect = entries[0]?.contentRect ?? null;
    };

    const resizeObserver = new ResizeObserver(handleResize);
    scrollView && resizeObserver.observe(scrollView);

    return () => {
      abortController.abort();
      resizeObserver.disconnect();
    };
  }, [rerender, scrollView]);

  return (
    <_Container ref={containerRef}>
      <_Wrapper ref={scrollViewRef} $paddingInline={viewerPaddingInline} $pageWidth={pageWidth}>
        {episode.pages.map((page) => {
          return (
            <_Page key={page.id}>
              <ComicViewerPage pageImageId={page.image.id} />
            </_Page>
          );
        })}
      </_Wrapper>
    </_Container>
  );
};

const ComicViewerCoreWithSuspense: React.FC<Props> = ({ episodeId }) => {
  return (
    <Suspense fallback={null}>
      <ComicViewerCore episodeId={episodeId} />
    </Suspense>
  );
};

export { ComicViewerCoreWithSuspense as ComicViewerCore };
