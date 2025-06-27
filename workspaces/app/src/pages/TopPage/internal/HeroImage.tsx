import styled from 'styled-components';

const _Picture = styled.picture`
  display: inline-block;
  aspect-ratio: 16 / 9;
  width: 100%;
`;

const _Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

export const HeroImage: React.FC = () => {
  return (
    <_Picture>
      <source srcSet="./assets/heroImage.avif" type="image/avif" />
      <source srcSet="./assets/heroImage.webp" type="image/webp" />
      <_Image alt="Cyber TOON" src="./assets/heroImage.png" loading="lazy" />
    </_Picture>
  );
};
