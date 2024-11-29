import { AnimatePresence, useReducedMotion, motion } from 'framer-motion';
import { useGlobalContext } from '../../Context/Context';
import { projectData } from '../../data/projectData';
import { StyledProjectButton } from '../../styles/UI/StyledProjectsButton';
import { StyledProjectGallery } from '../../styles/AdditionalProjects/AdditionalProjectsLayout/StyledProjectGallery';
import GalleryItem from './GalleryItem';
import { buttonVariant, parentProjectVariants } from '../../utils/animations';
import { CONSTANTS } from '../../constants';
import { useTranslation } from 'react-i18next';

const ProjectGallery = () => {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const { showMoreProjects, toggleMoreProjects } = useGlobalContext();

  const additionalProjects = projectData.slice(CONSTANTS.FEATURED_PROJECT_CUTOFF);

  return (
    <AnimatePresence>
      {showMoreProjects && (
        <StyledProjectGallery
          key={crypto.randomUUID()}
          initial={shouldReduceMotion ? 'noMotion' : 'hidden'}
          animate='visible'
          variants={parentProjectVariants}
          exit='exit'
        >
          {additionalProjects.map((project, index) => (
            <GalleryItem
              key={project.id}
              project={project}
              description={t(`projects.${index + CONSTANTS.FEATURED_PROJECT_CUTOFF}.description`)}
            />
          ))}
          <StyledProjectButton
            variants={buttonVariant}
            initial={shouldReduceMotion ? 'noMotion' : 'hidden'}
            animate='visible'
            exit={shouldReduceMotion ? 'noMotion' : 'exit'}
            onClick={toggleMoreProjects}
          >
            {t('show-less-btn')}
          </StyledProjectButton>
        </StyledProjectGallery>
      )}
    </AnimatePresence>
  );
};

export default ProjectGallery;
