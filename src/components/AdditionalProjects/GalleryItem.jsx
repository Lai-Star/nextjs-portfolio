import ExpandSVG from '/src/assets/icons/maximize-2.svg';
import GithubSVG from '/src/assets/icons/github.svg';
import ExternalLinkSVG from '/src/assets/icons/external-link.svg';

import { useState, useRef, Fragment } from 'react';
import { useTranslation } from 'react-i18next';

import { StyledGalleryCard } from '../../styles/AdditionalProjects/GalleryCard/StyledGalleryCard';
import { StyledCardHeader } from '../../styles/AdditionalProjects/GalleryCard/StyledCardHeader';
import { StyledThumbnail } from '../../styles/AdditionalProjects/GalleryCard/StyledThumbnail';
import { StyledOpenCardBackground } from '../../styles/AdditionalProjects/ExpandedProjectCard/StyledOpenCardBackground';
import { StyledOpenCardDescription } from '../../styles/AdditionalProjects/ExpandedProjectCard/StyledOpenCardDescription';
import { StyledOpenContainer } from '../../styles/AdditionalProjects/ExpandedProjectCard/StyledOpenContainer';
import { StyledOpenTitleContainer } from '../../styles/AdditionalProjects/ExpandedProjectCard/StyledOpenTitleContainer';

import { childProjectVariants } from '../../utils/animations';

const GalleryItem = ({ project, description }) => {
  const { t } = useTranslation();
  const [isCardOpened, setIsCardOpened] = useState(false);
  const [cardDimensions, setCardDimensions] = useState({ width: 0, height: 0 });
  const cardRef = useRef(null);

  const handleCardOpen = () => {
    setIsCardOpened(true);
    document.body.style.overflow = 'hidden'; // Prevents background scrolling

    setCardDimensions({
      width: cardRef.current.clientWidth,
      height: cardRef.current.clientHeight,
    });
  };

  const handleCardClose = () => {
    setIsCardOpened(false);
    document.body.style.overflowY = 'auto'; // Restores background scrolling
  };

  return (
    <>
      <StyledGalleryCard
        key={crypto.randomUUID()}
        variants={childProjectVariants}
        ref={cardRef}
        isCardOpened={isCardOpened}
        layout
      >
        <StyledCardHeader isCardOpened={isCardOpened} layout='position'>
          <h4>{project.title}</h4>
          <button onClick={handleCardOpen}>
            {t('learn-more')}
            <ExpandSVG />
          </button>
        </StyledCardHeader>

        <StyledThumbnail layout='scale' isCardOpened={isCardOpened}>
          <picture>
            <source type='image/webp' srcSet={project.imageUrl} />
            <img src={project.imageUrl} alt={project.description} />
          </picture>
        </StyledThumbnail>

        {isCardOpened && (
          <StyledOpenContainer>
            <StyledOpenTitleContainer>
              <h3>{project.title}</h3>
              <ul>
                <li>
                  <a
                    href={project.livelink}
                    aria-label='Live website'
                    target='_blank'
                    rel='noreferrer noopener'
                  >
                    <ExternalLinkSVG />
                  </a>
                </li>
              </ul>
            </StyledOpenTitleContainer>
            <StyledOpenCardDescription initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <p>{description}</p>
              <ul>
                {project.technologies.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </StyledOpenCardDescription>
          </StyledOpenContainer>
        )}
      </StyledGalleryCard>

      {isCardOpened && (
        <Fragment>
          <div style={{ width: cardDimensions.width, height: cardDimensions.height }}></div>
          <StyledOpenCardBackground
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleCardClose}
          />
        </Fragment>
      )}
    </>
  );
};

export default GalleryItem;
