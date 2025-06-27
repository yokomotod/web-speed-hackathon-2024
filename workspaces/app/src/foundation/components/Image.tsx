import type * as CSS from 'csstype';
import styled from 'styled-components';

import { addUnitIfNeeded } from '../../lib/css/addUnitIfNeeded';

const _Picture = styled.picture<{
  $height: number | string;
  $width: number | string;
}>`
  width: ${({ $width }) => addUnitIfNeeded($width)};
  height: ${({ $height }) => addUnitIfNeeded($height)};
  display: block;
`;

const _Image = styled.img<{
  $height: number | string;
  $objectFit: string;
  $width: number | string;
}>`
  object-fit: ${({ $objectFit }) => $objectFit};
  width: 100%;
  height: 100%;
  display: block;
`;

type Props = {
  height: number | string;
  objectFit: CSS.Property.ObjectFit;
  width: number | string;
} & JSX.IntrinsicElements['img'];

const getOptimizedSrc = (src: string) => {
  const baseSrc = src.replace(/\.(png|jpg|jpeg)$/i, '');
  const ext = src.match(/\.(png|jpg|jpeg)$/i)?.[0] || '';
  
  return {
    avif: `${baseSrc}.avif`,
    webp: `${baseSrc}.webp`,
    fallback: src,
  };
};

export const Image: React.FC<Props> = ({ height, loading = 'lazy', objectFit, width, src, ...rest }) => {
  if (!src) {
    return <_Image {...rest} $height={height} $objectFit={objectFit} $width={width} loading={loading} />;
  }

  const optimizedSrcs = getOptimizedSrc(src);

  return (
    <_Picture $height={height} $width={width}>
      <source srcSet={optimizedSrcs.avif} type="image/avif" />
      <source srcSet={optimizedSrcs.webp} type="image/webp" />
      <_Image {...rest} src={optimizedSrcs.fallback} $height={height} $objectFit={objectFit} $width={width} loading={loading} />
    </_Picture>
  );
};
